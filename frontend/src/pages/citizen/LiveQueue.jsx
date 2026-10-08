import React, { useState, useEffect, useCallback } from "react";
import { departmentService, tokenService } from "../../services/api";
import { getSocket, joinDepartment, leaveDepartment } from "../../services/socket";
import { useLanguage } from "../../context/LanguageContext";
import { useLocation as useGeoLocation } from "../../context/LocationContext";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  Building2,
  Users,
  Clock,
  RefreshCw,
  Monitor,
  CheckCircle2,
  Ticket,
  MapPin,
  ArrowRight,
  Shield,
  Radio,
} from "lucide-react";

const LiveQueue = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [queueData, setQueueData] = useState(null);
  const [myToken, setMyToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { t, tDeptName, tServiceName, language } = useLanguage();
  const { officeName, selectedLocation } = useGeoLocation();

  // Load departments
  useEffect(() => {
    departmentService.getAll().then((data) => {
      if (data.success && data.departments?.length > 0) {
        setDepartments(data.departments);
        setSelectedDeptId(data.departments[0]._id);
      }
    });
  }, []);

  // Fetch my token
  const fetchMyToken = useCallback(async () => {
    try {
      const res = await tokenService.getMyToken();
      if (res.success && res.token) {
        setMyToken(res.token);
      } else {
        setMyToken(null);
      }
    } catch (e) {
      setMyToken(null);
    }
  }, []);

  // Fetch queue
  const fetchQueue = useCallback(async () => {
    if (!selectedDeptId) return;

    try {
      setRefreshing(true);
      const res = await tokenService.getQueue(selectedDeptId);
      if (res.success) {
        setQueueData(res);
      }
      fetchMyToken();
    } catch (err) {
      console.error("Error fetching queue:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDeptId, fetchMyToken]);

  useEffect(() => {
    if (!selectedDeptId) return;

    setLoading(true);
    fetchQueue();
    joinDepartment(selectedDeptId);

    const socket = getSocket();
    const handleUpdate = () => fetchQueue();

    socket.on("tokenCreated", handleUpdate);
    socket.on("tokenCalled", handleUpdate);
    socket.on("serviceStarted", handleUpdate);
    socket.on("serviceCompleted", handleUpdate);
    socket.on("queueUpdated", handleUpdate);

    const interval = setInterval(fetchQueue, 8000);

    return () => {
      leaveDepartment(selectedDeptId);
      socket.off("tokenCreated", handleUpdate);
      socket.off("tokenCalled", handleUpdate);
      socket.off("serviceStarted", handleUpdate);
      socket.off("serviceCompleted", handleUpdate);
      socket.off("queueUpdated", handleUpdate);
      clearInterval(interval);
    };
  }, [selectedDeptId, fetchQueue]);

  const selectedDept = departments.find((d) => d._id === selectedDeptId);

  // Status timeline helper (Requirement 19)
  const timelineSteps = [
    { key: "generated", labelEn: "Token Generated", labelTa: "டோக்கன் உருவாக்கப்பட்டது" },
    { key: "waiting", labelEn: "Waiting in Queue", labelTa: "வரிசையில் காத்திருப்பு" },
    { key: "called", labelEn: "Counter Called", labelTa: "கவுண்டரில் அழைக்கப்பட்டது" },
    { key: "serving", labelEn: "In Service", labelTa: "சேவை நடைபெறுகிறது" },
    { key: "completed", labelEn: "Completed", labelTa: "நிறைவு செய்யப்பட்டது" },
  ];

  const getTimelineStatus = (tokenStatus, stepKey) => {
    if (!tokenStatus) return "pending";
    const statusOrder = ["waiting", "called", "serving", "completed"];
    if (stepKey === "generated") return "completed";

    const curIdx = statusOrder.indexOf(tokenStatus);
    const stepIdx = statusOrder.indexOf(stepKey);

    if (curIdx >= stepIdx) return "completed";
    if (curIdx === stepIdx - 1) return "current";
    return "pending";
  };

  return (
    <div className="space-y-8">
      {/* ==========================================
          HEADER & OFFICE CONTEXT (Requirement 19)
      ========================================== */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs uppercase font-extrabold tracking-wider text-[#0b3b60]">
              {language === "ta" ? "நேரலை வரிசை காட்சிப்பலகை" : "Live Queue Monitor"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-1">
            {language === "ta" ? "தாலுகா நேரலை வரிசை நிலை" : "Taluk Office Live Queue"}
          </h1>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-[#0b3b60]" />
            <strong className="text-slate-900">{officeName}</strong>
            <span>•</span>
            <span>{selectedDept ? tDeptName(selectedDept.name) : "Government Wing"}</span>
          </div>
        </div>

        {/* Department Switcher & Refresh */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:border-[#0b3b60]"
          >
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {tDeptName(dept.name)} ({dept.code || "DEPT"})
              </option>
            ))}
          </select>

          <button
            onClick={fetchQueue}
            disabled={refreshing}
            className="p-2.5 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Refresh queue"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#0b3b60]" : ""}`} />
          </button>
        </div>
      </div>

      {/* ==========================================
          LIVE SERVING & CITIZEN TICKET HIGHLIGHT (Requirement 19)
      ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Now Serving Card */}
        <div className="bg-[#07243b] text-white p-6 sm:p-7 rounded-xl border border-[#0d3b60] shadow-md flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
              {language === "ta" ? "தற்போது சேவை பெறுபவர்" : "Now Serving at Counter"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <Radio className="w-3 h-3 animate-ping" />
              Live Desk
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-5xl sm:text-6xl font-black font-heading tracking-tight text-white">
              {queueData?.currentlyServing?.tokenDisplay ||
                queueData?.currentlyCalled?.tokenDisplay ||
                "—"}
            </div>
            <div className="text-sm font-semibold text-amber-300">
              {queueData?.currentlyServing?.counter
                ? `Counter: ${queueData.currentlyServing.counter.name}`
                : queueData?.currentlyCalled?.counter
                ? `Proceed to: ${queueData.currentlyCalled.counter.name}`
                : "No active token being served currently"}
            </div>
          </div>

          <div className="pt-3 border-t border-[#0f436d] flex items-center justify-between text-xs text-slate-300">
            <span>
              {language === "ta" ? "வரிசையில் உள்ளவர்கள்:" : "Total Waiting:"}{" "}
              <strong className="text-white font-bold">{queueData?.waitingCount || 0}</strong>
            </span>
            <span className="text-[11px] text-slate-400">
              Real-time Taluk Display
            </span>
          </div>
        </div>

        {/* Right: Citizen's Own Token Status */}
        <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-[#0b3b60]">
              {language === "ta" ? "உங்கள் டோக்கன்" : "Your Token Ticket"}
            </span>
            {myToken ? (
              <StatusBadge status={myToken.status} />
            ) : (
              <span className="text-xs text-slate-400 font-semibold">No Active Token</span>
            )}
          </div>

          {myToken ? (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <div className="text-4xl sm:text-5xl font-black text-[#0b3b60] font-heading">
                  {myToken.tokenDisplay}
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">People Ahead:</div>
                  <div className="text-xl font-extrabold text-slate-900">
                    {myToken.peopleAhead ?? 0}
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-600">
                Service: <strong>{tServiceName(myToken.service?.name)}</strong> • Estimated wait:{" "}
                <strong className="text-emerald-700">~{myToken.estimatedWaitTime ?? 15} mins</strong>
              </div>
            </div>
          ) : (
            <div className="py-2 space-y-2">
              <p className="text-xs text-slate-600">
                You do not currently have an active queue ticket in this taluk department.
              </p>
              <a
                href="/citizen/take-token"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b3b60] hover:underline"
              >
                <Ticket className="w-3.5 h-3.5 text-amber-500" />
                Generate Walk-in Token →
              </a>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Taluk Office Jurisdiction</span>
            <span className="font-semibold text-slate-700">{officeName}</span>
          </div>
        </div>
      </div>

      {/* ==========================================
          STATUS TIMELINE (Requirement 19)
          Token Generated → Waiting → Called → Serving → Completed
      ========================================== */}
      {myToken && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-heading">
            {language === "ta" ? "டோக்கன் நிலை காலவரிசை" : "Token Progress Timeline"}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {timelineSteps.map((step, idx) => {
              const status = getTimelineStatus(myToken.status, step.key);
              const isCompleted = status === "completed";
              const isCurrent = status === "current";

              return (
                <div
                  key={step.key}
                  className={`p-3.5 rounded-lg border text-center transition-all ${
                    isCurrent
                      ? "border-[#0b3b60] bg-blue-50/70 shadow-2xs"
                      : isCompleted
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-slate-200 bg-slate-50/50 opacity-60"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-[#0b3b60] text-white ring-2 ring-blue-300"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isCompleted ? "✓" : idx + 1}
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-snug">
                    {language === "ta" ? step.labelTa : step.labelEn}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 capitalize">
                    {status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==========================================
          ACTIVE QUEUE TABLE (Requirement 26 Privacy Compliant)
          Shows: Token Number, Service, Counter, Status (No citizen PII)
      ========================================== */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-heading">
              {language === "ta" ? "தற்போதைய வரிசை பட்டியல்" : "Active Waiting Queue"}
            </h2>
            <p className="text-xs text-slate-500">
              Department: {selectedDept ? tDeptName(selectedDept.name) : "Operational Wing"}
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {queueData?.waitingCount || 0} Citizens in line
          </span>
        </div>

        {loading ? (
          <LoadingSpinner text="Connecting to taluk queue monitor..." />
        ) : !queueData?.queue || queueData.queue.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No citizens currently waiting in this department queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Token #</th>
                  <th className="py-3 px-3">Service</th>
                  <th className="py-3 px-3">Assigned Counter</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Approx. Wait</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queueData.queue.map((tokenItem) => (
                  <tr
                    key={tokenItem._id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      myToken?._id === tokenItem._id ? "bg-amber-50/70 font-semibold" : ""
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-extrabold text-sm text-slate-900">
                      {tokenItem.tokenDisplay}
                      {myToken?._id === tokenItem._id && (
                        <span className="ml-2 text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                          You
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {tServiceName(tokenItem.service?.name)}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {tokenItem.counter ? (
                        <span className="font-bold text-[#0b3b60] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {tokenItem.counter.name}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={tokenItem.status} />
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      ~{tokenItem.estimatedWaitTime ?? 10} mins
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

export default LiveQueue;
