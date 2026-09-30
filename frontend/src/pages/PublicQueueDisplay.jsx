import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { departmentService, tokenService } from "../services/api";
import { getSocket, joinDepartment, leaveDepartment } from "../services/socket";
import {
  Building2,
  Monitor,
  Clock,
  Users,
  Volume2,
  VolumeX,
  Maximize2,
  RefreshCw,
  Bell,
} from "lucide-react";

const PublicQueueDisplay = () => {
  const { departmentId: paramDeptId } = useParams();
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState(paramDeptId || "");
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [lastAnnouncedToken, setLastAnnouncedToken] = useState(null);

  // Load departments
  useEffect(() => {
    departmentService.getAll().then((data) => {
      if (data.success && data.departments.length > 0) {
        setDepartments(data.departments);
        if (!selectedDeptId) {
          setSelectedDeptId(data.departments[0]._id);
        }
      }
    });
  }, []);

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      // Audio autoplay policy
    }
  };

  const fetchPublicQueue = useCallback(async () => {
    if (!selectedDeptId) return;

    try {
      const res = await tokenService.getPublicQueue(selectedDeptId);
      if (res.success) {
        setQueueData(res);

        // If a new token is called, trigger chime
        if (res.nowCalled && res.nowCalled.length > 0) {
          const latestCalled = res.nowCalled[0].tokenDisplay;
          if (latestCalled !== lastAnnouncedToken) {
            setLastAnnouncedToken(latestCalled);
            if (audioEnabled) {
              playChime();
            }
          }
        }
      }
    } catch (err) {
      console.error("Error loading public queue:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDeptId, lastAnnouncedToken, audioEnabled]);

  useEffect(() => {
    if (!selectedDeptId) return;

    setLoading(true);
    fetchPublicQueue();
    joinDepartment(selectedDeptId);

    const socket = getSocket();
    const handleUpdate = () => fetchPublicQueue();

    socket.on("tokenCalled", handleUpdate);
    socket.on("serviceStarted", handleUpdate);
    socket.on("serviceCompleted", handleUpdate);
    socket.on("tokenSkipped", handleUpdate);
    socket.on("queueUpdated", handleUpdate);

    const interval = setInterval(fetchPublicQueue, 5000);

    return () => {
      leaveDepartment(selectedDeptId);
      socket.off("tokenCalled", handleUpdate);
      socket.off("serviceStarted", handleUpdate);
      socket.off("serviceCompleted", handleUpdate);
      socket.off("tokenSkipped", handleUpdate);
      socket.off("queueUpdated", handleUpdate);
      clearInterval(interval);
    };
  }, [selectedDeptId, fetchPublicQueue]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const currentServing = queueData?.nowServing?.[0] || null;
  const currentCalled = queueData?.nowCalled?.[0] || null;
  const nextTokens = queueData?.nextTokens || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header Bar */}
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight font-heading">
              TALUK OFFICE QUEUE DISPLAY SCREEN
            </h1>
            <p className="text-xs text-slate-400">
              Department: <strong className="text-amber-400">{queueData?.department?.name || "All Counters"}</strong>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Department selector */}
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 rounded-xl px-3 py-2 focus:outline-none"
          >
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>

          {/* Sound Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              audioEnabled
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
            title={audioEnabled ? "Audio Chime ON" : "Audio Chime OFF"}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors"
            title="Toggle TV Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Big Stage */}
      <main className="my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* BIG STAGE 1: NOW SERVING (Col 7) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 to-slate-900/60 rounded-3xl border-2 border-slate-800 p-8 sm:p-12 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-widest font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              NOW SERVING AT COUNTER
            </span>
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
          </div>

          <div className="py-8 text-center space-y-4">
            <div className="text-7xl sm:text-9xl font-black font-heading text-white tracking-tight drop-shadow-lg">
              {currentServing?.tokenDisplay || currentCalled?.tokenDisplay || "—"}
            </div>
            <div className="inline-block px-8 py-3 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl sm:text-3xl tracking-wide shadow-xl">
              {currentServing ? `COUNTER ${currentServing.counterNumber}` : currentCalled ? `COUNTER ${currentCalled.counterNumber}` : "WAITING FOR OFFICER"}
            </div>
            {currentServing?.serviceName && (
              <p className="text-sm text-slate-400 font-medium">
                Service: {currentServing.serviceName}
              </p>
            )}
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-400">
            <span>Status: <strong className="text-white">Active Service</strong></span>
            <span>Live Sync Active 🟢</span>
          </div>
        </div>

        {/* BIG STAGE 2: NOW CALLED & NEXT (Col 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* NOW CALLED CARD */}
          <div className="bg-slate-900/80 rounded-3xl border border-blue-500/40 p-6 shadow-xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-widest font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-0.5 rounded-full flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 animate-bounce" />
                NOW CALLED
              </span>
              <span className="text-xs text-slate-400">Proceed to Counter</span>
            </div>

            <div className="flex items-baseline justify-between pt-2">
              <div className="text-5xl font-black text-blue-400 font-heading">
                {currentCalled ? currentCalled.tokenDisplay : "—"}
              </div>
              <div className="text-xl font-bold text-slate-200">
                {currentCalled ? `Counter #${currentCalled.counterNumber}` : "None"}
              </div>
            </div>
          </div>

          {/* NEXT IN LINE QUEUE */}
          <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-6 flex-1 shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[11px] uppercase tracking-widest font-bold text-slate-400">
                NEXT IN LINE
              </span>
              <span className="text-xs font-semibold text-amber-400">
                {queueData?.waitingCount || 0} Citizens Waiting
              </span>
            </div>

            {nextTokens.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No citizens currently in queue.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {nextTokens.slice(0, 6).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-lg font-black text-white">{item.tokenDisplay}</span>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{item.serviceName}</p>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">#{idx + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Wait Time Bar */}
      <footer className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>
            Estimated Average Wait Time: <strong className="text-white text-sm">~{queueData?.estimatedWaitMinutes || 0} minutes</strong>
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span>Smart Government Queue System</span>
          <span>•</span>
          <span>Please retain your mobile token number until served</span>
        </div>
      </footer>
    </div>
  );
};

export default PublicQueueDisplay;
