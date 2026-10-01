import React, { useState, useEffect, useCallback } from "react";
import { departmentService, tokenService } from "../../services/api";
import { getSocket, joinDepartment, leaveDepartment } from "../../services/socket";
import StatusBadge from "../../components/StatusBadge";
import { useLanguage } from "../../context/LanguageContext";
import {
  Building2,
  Users,
  Clock,
  RefreshCw,
  Monitor,
  CheckCircle2,
} from "lucide-react";

const LiveQueue = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { t, tDeptName, tServiceName, language } = useLanguage();

  useEffect(() => {
    departmentService.getAll().then((data) => {
      if (data.success && data.departments.length > 0) {
        setDepartments(data.departments);
        setSelectedDeptId(data.departments[0]._id);
      }
    });
  }, []);

  const fetchQueue = useCallback(async () => {
    if (!selectedDeptId) return;

    try {
      setRefreshing(true);
      const res = await tokenService.getQueue(selectedDeptId);
      if (res.success) {
        setQueueData(res);
      }
    } catch (err) {
      console.error("Error fetching queue:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDeptId]);

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

    const interval = setInterval(fetchQueue, 6000);

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

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
            {t("liveQueue", "pageTitle")}
          </h1>
          <p className="text-xs text-slate-500">
            {t("liveQueue", "pageSubtitle")}
          </p>
        </div>

        {/* Department Dropdown & Refresh */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:outline-none focus:border-gov-500"
          >
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {tDeptName(dept.name)} ({dept.code})
              </option>
            ))}
          </select>

          <button
            onClick={fetchQueue}
            disabled={refreshing}
            className="p-2 text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-xs"
            title={language === "ta" ? "புதுப்பிக்க" : "Refresh queue"}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
            {t("liveQueue", "currentlyServing")}
          </span>
          <div className="text-4xl font-black text-purple-700 font-heading">
            {queueData?.currentlyServing?.tokenDisplay || "—"}
          </div>
          <p className="text-xs text-slate-500">
            {queueData?.currentlyServing?.counter
              ? `${queueData.currentlyServing.counter.name}`
              : t("liveQueue", "noServingToken")}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
            {t("liveQueue", "nowCalled")}
          </span>
          <div className="text-4xl font-black text-blue-600 font-heading">
            {queueData?.currentlyCalled?.tokenDisplay || "—"}
          </div>
          <p className="text-xs text-slate-500">
            {queueData?.currentlyCalled?.counter
              ? `${t("liveQueue", "proceedToPrefix")} ${queueData.currentlyCalled.counter.name}`
              : t("liveQueue", "noCalledToken")}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
            {t("liveQueue", "waitingQueue")}
          </span>
          <div className="text-4xl font-black text-slate-900 font-heading">
            {queueData?.waitingCount || 0}
          </div>
          <p className="text-xs text-slate-500">{t("liveQueue", "activeCitizensWaiting")}</p>
        </div>
      </div>

      {/* Queue List Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 font-heading">
            {t("liveQueue", "activeTokensList")} ({tDeptName(selectedDept?.name)})
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {t("liveQueue", "liveStreamConnected")}
          </span>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : !queueData?.queue || queueData.queue.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            {t("liveQueue", "noWaiting")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">{t("liveQueue", "colToken")}</th>
                  <th className="py-3 px-3">{t("liveQueue", "colService")}</th>
                  <th className="py-3 px-3">{t("liveQueue", "colCounter")}</th>
                  <th className="py-3 px-3">{t("liveQueue", "colStatus")}</th>
                  <th className="py-3 px-3">{t("liveQueue", "colCitizenName")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queueData.queue.map((tokenItem) => (
                  <tr key={tokenItem._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-3 font-extrabold text-sm text-slate-900">
                      {tokenItem.tokenDisplay}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-medium">
                      {tServiceName(tokenItem.service?.name)}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700">
                      {tokenItem.counter ? (
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {tokenItem.counter.name}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={tokenItem.status} />
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">
                      {tokenItem.citizen?.fullName || (language === "ta" ? "குடிமகன்" : "Citizen")}
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
