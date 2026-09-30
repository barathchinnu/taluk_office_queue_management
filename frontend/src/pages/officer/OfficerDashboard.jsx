import React, { useState, useEffect, useCallback } from "react";
import { officerService, tokenService } from "../../services/api";
import { getSocket, joinDepartment, leaveDepartment } from "../../services/socket";
import StatusBadge from "../../components/StatusBadge";
import {
  Briefcase,
  User,
  Building2,
  Ticket,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Check,
  SkipForward,
  PhoneCall,
  RefreshCw,
  AlertCircle,
  Users,
  Power,
} from "lucide-react";

const OfficerDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setRefreshing(true);
      const [dashRes, queueRes] = await Promise.all([
        officerService.getDashboard(),
        officerService.getQueue(),
      ]);

      if (dashRes.success) {
        setDashboard(dashRes.dashboard);
        if (dashRes.dashboard.officer?.department?._id) {
          joinDepartment(dashRes.dashboard.officer.department._id);
        }
      }

      if (queueRes.success) {
        setQueue(queueRes.queue);
      }
    } catch (err) {
      console.error("Error fetching officer dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    const socket = getSocket();
    const handleUpdate = () => fetchDashboard();

    socket.on("tokenCreated", handleUpdate);
    socket.on("tokenCalled", handleUpdate);
    socket.on("serviceStarted", handleUpdate);
    socket.on("serviceCompleted", handleUpdate);
    socket.on("tokenSkipped", handleUpdate);
    socket.on("queueUpdated", handleUpdate);

    const interval = setInterval(fetchDashboard, 6000);

    return () => {
      if (dashboard?.officer?.department?._id) {
        leaveDepartment(dashboard.officer.department._id);
      }
      socket.off("tokenCreated", handleUpdate);
      socket.off("tokenCalled", handleUpdate);
      socket.off("serviceStarted", handleUpdate);
      socket.off("serviceCompleted", handleUpdate);
      socket.off("tokenSkipped", handleUpdate);
      socket.off("queueUpdated", handleUpdate);
      clearInterval(interval);
    };
  }, [fetchDashboard, dashboard?.officer?.department?._id]);

  // Actions
  const handleCallNext = async () => {
    try {
      setActionLoading(true);
      setMessage(null);
      const res = await tokenService.callNextToken();
      if (res.success && res.token) {
        setMessage({
          type: "success",
          text: `Token ${res.token.tokenDisplay} called successfully to your counter!`,
        });
        fetchDashboard();
      } else {
        setMessage({
          type: "info",
          text: res.message || "No waiting tokens in your department right now.",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to call next token",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartService = async (tokenId) => {
    try {
      setActionLoading(true);
      setMessage(null);
      const res = await tokenService.startService(tokenId);
      if (res.success) {
        setMessage({
          type: "success",
          text: `Service started for token ${res.token.tokenDisplay}.`,
        });
        fetchDashboard();
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to start service",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteService = async (tokenId) => {
    try {
      setActionLoading(true);
      setMessage(null);
      const res = await tokenService.completeService(tokenId);
      if (res.success) {
        setMessage({
          type: "success",
          text: `Service completed successfully! Counter is ready for the next citizen.`,
        });
        fetchDashboard();
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to complete service",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkipToken = async (tokenId) => {
    if (!window.confirm("Are you sure you want to mark this citizen as skipped / no-show?")) {
      return;
    }
    try {
      setActionLoading(true);
      setMessage(null);
      const res = await tokenService.skipToken(tokenId);
      if (res.success) {
        setMessage({
          type: "info",
          text: `Token marked as skipped. You can now call the next citizen in line.`,
        });
        fetchDashboard();
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to skip token",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      setActionLoading(true);
      const newStatus = !dashboard?.officer?.isAvailable;
      const res = await officerService.updateAvailability(newStatus);
      if (res.success) {
        fetchDashboard();
      }
    } catch (err) {
      console.error("Availability error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-sm text-slate-500 font-medium">Loading officer desk...</p>
      </div>
    );
  }

  const officer = dashboard?.officer;
  const counter = dashboard?.counter;
  const currentToken = dashboard?.currentToken;
  const waitingCount = dashboard?.waitingCount || 0;
  const completedCount = dashboard?.completedCount || 0;

  // Button rules (Phase 22)
  const isAvailable = Boolean(officer?.isAvailable);
  const hasCounter = Boolean(counter);
  const isServing = currentToken?.status === "serving";
  const isCalled = currentToken?.status === "called";

  const canCallNext = hasCounter && isAvailable && !isServing && !isCalled && waitingCount > 0;
  const canStartService = isCalled;
  const canCompleteService = isServing;
  const canSkip = isCalled || isServing;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Officer Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Briefcase className="w-7 h-7 text-amber-300" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                {officer?.employeeId}
              </span>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {officer?.designation}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
              {officer?.user?.fullName}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Department: <strong>{officer?.department?.name}</strong></span>
              <span>•</span>
              <span>
                Desk: <strong>{counter ? `${counter.name} (Counter #${counter.counterNumber})` : "No Counter Assigned"}</strong>
              </span>
            </p>
          </div>
        </div>

        {/* Counter & Availability Control */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
          <button
            onClick={fetchDashboard}
            disabled={refreshing}
            className="p-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-purple-600" : ""}`} />
          </button>

          <button
            onClick={handleToggleAvailability}
            disabled={actionLoading}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isAvailable
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isAvailable ? "Status: AVAILABLE" : "Status: UNAVAILABLE"}</span>
          </button>
        </div>
      </div>

      {/* Warning if no counter assigned */}
      {!hasCounter && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <strong className="font-bold">No active counter currently assigned to you!</strong> You cannot call tokens until an Administrator assigns your profile to a Counter.
          </div>
        </div>
      )}

      {/* Alert banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : message.type === "info"
              ? "bg-blue-50 text-blue-800 border-blue-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
            Waiting in Department
          </span>
          <div className="text-4xl font-black text-amber-600 font-heading">{waitingCount}</div>
          <p className="text-xs text-slate-500">Citizens waiting for service</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
            Completed Today
          </span>
          <div className="text-4xl font-black text-emerald-600 font-heading">{completedCount}</div>
          <p className="text-xs text-slate-500">Tokens finished successfully</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
            Counter Assignment
          </span>
          <div className="text-2xl font-black text-slate-900 font-heading">
            {counter ? `Counter #${counter.counterNumber}` : "Unassigned"}
          </div>
          <p className="text-xs text-slate-500">
            {counter?.status ? `Counter Status: ${counter.status}` : "Contact administrator"}
          </p>
        </div>
      </div>

      {/* MAIN OFFICER WORKFLOW DESK */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            Current Active Token at Desk
          </h2>
          <span className="text-xs text-slate-500">Officer Action Controls</span>
        </div>

        {currentToken ? (
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                    Token #{currentToken.tokenNumber}
                  </span>
                  <StatusBadge status={currentToken.status} />
                </div>

                <div className="text-5xl font-black text-slate-900 font-heading">
                  {currentToken.tokenDisplay}
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    Citizen: <strong className="text-slate-900">{currentToken.citizen?.fullName}</strong> (Phone: {currentToken.citizen?.phone})
                  </p>
                  <p>
                    Service: <strong>{currentToken.service?.name}</strong> (~{currentToken.service?.averageServiceTime || 10} mins)
                  </p>
                </div>
              </div>

              {/* Status timer / message */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center min-w-[160px]">
                <Clock className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {currentToken.status === "called" ? "Called At" : "Serving Since"}
                </span>
                <div className="text-sm font-bold text-slate-800">
                  {currentToken.servingAt
                    ? new Date(currentToken.servingAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : currentToken.calledAt
                    ? new Date(currentToken.calledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "Just now"}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS (Phase 22 rules) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200">
              {/* Button 1: Start Service */}
              <button
                onClick={() => handleStartService(currentToken._id)}
                disabled={!canStartService || actionLoading}
                className="py-3 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>START SERVICE</span>
              </button>

              {/* Button 2: Complete Service */}
              <button
                onClick={() => handleCompleteService(currentToken._id)}
                disabled={!canCompleteService || actionLoading}
                className="py-3 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>COMPLETE SERVICE</span>
              </button>

              {/* Button 3: Skip / No-show */}
              <button
                onClick={() => handleSkipToken(currentToken._id)}
                disabled={!canSkip || actionLoading}
                className="py-3 px-4 rounded-xl font-bold text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <SkipForward className="w-4 h-4" />
                <span>SKIP TOKEN</span>
              </button>
            </div>
          </div>
        ) : (
          /* When no token is active at counter, Call Next button is prominent */
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 mx-auto flex items-center justify-center">
              <PhoneCall className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Desk Ready For Next Citizen</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {waitingCount > 0
                  ? `There are ${waitingCount} citizens waiting in line. Click below to announce the next token.`
                  : "No waiting tokens in your department right now."}
              </p>
            </div>

            <div>
              <button
                onClick={handleCallNext}
                disabled={!canCallNext || actionLoading}
                className="px-8 py-3.5 rounded-xl font-black text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2"
              >
                {actionLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <PhoneCall className="w-4 h-4" />
                    <span>CALL NEXT TOKEN ({waitingCount} WAITING)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Department Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            Department Waiting Queue ({officer?.department?.name})
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Total Active: {queue.length}
          </span>
        </div>

        {queue.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Queue is empty. No active tokens in department.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Token #</th>
                  <th className="py-3 px-3">Citizen</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Service</th>
                  <th className="py-3 px-3">Counter</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queue.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-3 font-extrabold text-sm text-slate-900">
                      {t.tokenDisplay}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-800">
                      {t.citizen?.fullName}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">{t.citizen?.phone}</td>
                    <td className="py-3.5 px-3 text-slate-700">{t.service?.name}</td>
                    <td className="py-3.5 px-3 text-slate-700">
                      {t.counter ? (
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {t.counter.name}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;
