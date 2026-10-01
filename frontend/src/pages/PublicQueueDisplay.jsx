import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { departmentService, tokenService } from "../services/api";
import { getSocket, joinDepartment, leaveDepartment } from "../services/socket";
import { useLanguage } from "../context/LanguageContext";
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Radio,
  Clock,
  Bell,
  CheckCircle2,
  Users,
  Layers,
  ArrowRight,
  ShieldAlert,
  FileCheck,
  Building,
  Sparkles,
  Sliders,
  ChevronRight,
  Tv,
  Globe,
} from "lucide-react";

const PublicQueueDisplay = () => {
  const { departmentId: paramDeptId } = useParams();
  const { language, setLanguage, cycleLanguage, tDeptName } = useLanguage();
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState(paramDeptId || "all");
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Audio & Announcement states
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [voices, setVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load and cache browser voices for SpeechSynthesis
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) setVoices(v);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Display Themes: "realistic-dark" (modern airport/bank LED), "tamil-govt" (secretariat navy & gold), "amber-led" (classic 7-segment dot matrix)
  const [displayTheme, setDisplayTheme] = useState("realistic-dark");
  const [viewLayout, setViewLayout] = useState("split"); // "split" (Hero + Counters + Next), "grid" (Full Wall of Desks)

  // Live Clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Last announced token tracker to avoid redundant speech loops
  const lastAnnouncedIdRef = useRef(null);
  const [activeCallAlert, setActiveCallAlert] = useState(null);
  const [simulatedCall, setSimulatedCall] = useState(null);

  // Live ticking clock with 1-second refresh
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all departments
  useEffect(() => {
    departmentService.getAll().then((data) => {
      if (data.success && data.departments.length > 0) {
        setDepartments(data.departments);
      }
    });
  }, []);

  // Professional Dual-Tone Airport/Bank Chime (E5 -> C5)
  const playDingDongChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // First chime tone: 659.25 Hz (E5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.35, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.55);

      // Second chime tone: 523.25 Hz (C5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(523.25, ctx.currentTime + 0.38);
      gain2.gain.setValueAtTime(0.4, ctx.currentTime + 0.38);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.25);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.38);
      osc2.stop(ctx.currentTime + 1.25);
    } catch (e) {
      console.warn("Chime AudioContext error:", e);
    }
  };

  // Text-To-Speech announcement in English & Tamil
  const speakAnnouncement = (tokenText, counterNumber, departmentName) => {
    if (!window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      setIsSpeaking(true);

      const spacedToken = tokenText.split("").join(" ");
      const deptEn = departmentName || "";
      const deptTa = tDeptName(departmentName) || "";
      const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();

      const indianVoice = currentVoices.find(
        (v) => (v.lang.includes("en-IN") || v.lang.includes("en-GB") || v.lang.includes("en-US")) && !v.name.includes("Google")
      ) || currentVoices.find((v) => v.lang.startsWith("en")) || currentVoices[0];

      const tamilVoice = currentVoices.find(
        (v) => v.lang.includes("ta") || v.lang.toLowerCase().includes("ta-in") || v.name.toLowerCase().includes("tamil")
      );

      // Helper to generate Tamil speech utterance
      const playTamil = (onDone) => {
        const tamilPhrase = `கவனிக்கவும், டோக்கன் எண் ${spacedToken}, தயவுசெய்து ${deptTa ? deptTa + " " : ""}கவுண்டர் ${counterNumber}க்கு செல்லவும்.`;
        const taUtterance = new SpeechSynthesisUtterance(tamilPhrase);
        taUtterance.lang = "ta-IN";
        taUtterance.rate = 0.85;
        if (tamilVoice) {
          taUtterance.voice = tamilVoice;
        }
        taUtterance.onend = () => {
          setIsSpeaking(false);
          if (onDone) onDone();
        };
        taUtterance.onerror = () => {
          setIsSpeaking(false);
          if (onDone) onDone();
        };
        window.speechSynthesis.speak(taUtterance);
      };

      // Helper to generate English speech utterance
      const playEnglish = (onDone) => {
        const englishPhrase = `Attention please. Token number ${spacedToken}, please proceed to Counter ${counterNumber}. ${deptEn}`;
        const enUtterance = new SpeechSynthesisUtterance(englishPhrase);
        enUtterance.rate = 0.88;
        enUtterance.pitch = 1.05;
        if (indianVoice) {
          enUtterance.voice = indianVoice;
        }
        enUtterance.onend = () => {
          if (onDone) onDone();
          else setIsSpeaking(false);
        };
        enUtterance.onerror = () => {
          if (onDone) onDone();
          else setIsSpeaking(false);
        };
        window.speechSynthesis.speak(enUtterance);
      };

      if (language === "ta") {
        // Pure Tamil mode
        playTamil();
      } else if (language === "en") {
        // Pure English mode
        playEnglish();
      } else {
        // "both" Mode: Play English announcement first, followed immediately by Tamil announcement
        playEnglish(() => {
          setTimeout(() => {
            playTamil();
          }, 300);
        });
      }
    } catch (err) {
      console.warn("Speech synthesis error:", err);
      setIsSpeaking(false);
    }
  };

  // Announce Token
  const triggerAnnouncement = useCallback(
    (tokenDisplay, counterNumber, departmentName) => {
      if (audioEnabled) {
        playDingDongChime();
      }
      if (speechEnabled) {
        setTimeout(() => {
          speakAnnouncement(tokenDisplay, counterNumber, departmentName);
        }, 750);
      }

      const alertData = {
        tokenDisplay,
        counterNumber,
        departmentName,
        timestamp: new Date(),
      };

      // Show high-priority Flash Callout Banner for 20 seconds
      setActiveCallAlert(alertData);
      setSimulatedCall(alertData);

      setTimeout(() => {
        setActiveCallAlert(null);
      }, 20000);
    },
    [audioEnabled, speechEnabled, language, voices]
  );

  // Fetch Public Queue data from backend
  const fetchPublicQueue = useCallback(async () => {
    try {
      const deptParam = selectedDeptId === "all" ? "" : selectedDeptId;
      const res = await tokenService.getPublicQueue(deptParam || "all");

      if (res && res.success) {
        setQueueData(res);

        // Detect newly called token to trigger audio chime and voice broadcast
        if (res.latestCalled) {
          const callKey = `${res.latestCalled.tokenDisplay}_C${res.latestCalled.counterNumber}`;
          if (callKey !== lastAnnouncedIdRef.current) {
            lastAnnouncedIdRef.current = callKey;
            triggerAnnouncement(
              res.latestCalled.tokenDisplay,
              res.latestCalled.counterNumber,
              res.latestCalled.departmentName
            );
          }
        }
      }
    } catch (err) {
      console.error("Error loading public queue data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDeptId, triggerAnnouncement]);

  useEffect(() => {
    setLoading(true);
    fetchPublicQueue();

    if (selectedDeptId && selectedDeptId !== "all") {
      joinDepartment(selectedDeptId);
    }

    const socket = getSocket();
    const handleUpdate = () => fetchPublicQueue();

    socket.on("tokenCalled", (token) => {
      fetchPublicQueue();
      if (token && token.tokenDisplay) {
        triggerAnnouncement(
          token.tokenDisplay,
          token.counter?.counterNumber || "1",
          token.department?.name || ""
        );
      }
    });

    socket.on("serviceStarted", handleUpdate);
    socket.on("serviceCompleted", handleUpdate);
    socket.on("tokenSkipped", handleUpdate);
    socket.on("queueUpdated", handleUpdate);

    // Reliable 4-second poll interval
    const interval = setInterval(fetchPublicQueue, 4000);

    return () => {
      if (selectedDeptId && selectedDeptId !== "all") {
        leaveDepartment(selectedDeptId);
      }
      socket.off("tokenCalled");
      socket.off("serviceStarted", handleUpdate);
      socket.off("serviceCompleted", handleUpdate);
      socket.off("tokenSkipped", handleUpdate);
      socket.off("queueUpdated", handleUpdate);
      clearInterval(interval);
    };
  }, [selectedDeptId, fetchPublicQueue, triggerAnnouncement]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const rawCounters = queueData?.counters || [];
  const nextTokens = queueData?.nextTokens || [];

  // Map simulated call or live called token into the counters list
  const counters = rawCounters.map((c) => {
    if (simulatedCall && Number(simulatedCall.counterNumber) === Number(c.counterNumber)) {
      return {
        ...c,
        status: "called",
        currentToken: {
          tokenDisplay: simulatedCall.tokenDisplay,
          status: "called",
          serviceName: simulatedCall.departmentName || "Revenue Certificate Service",
        },
      };
    }
    return c;
  });

  // Find the currently called or currently serving hero token for spotlight display
  const heroCalledCounter =
    counters.find((c) => c.currentToken?.status === "called") ||
    counters.find((c) => c.currentToken?.status === "serving") ||
    counters[0];

  const heroToken = heroCalledCounter?.currentToken;

  // Theme styling definitions
  const themeStyles = {
    "realistic-dark": {
      bg: "bg-[#050811]",
      headerBg: "bg-[#090f1d] border-b-2 border-slate-800",
      cardBg: "bg-[#0b1324] border-slate-800/90",
      ledTokenBg: "bg-[#03060c] border border-slate-800/80 shadow-inner",
      accent: "text-amber-400",
      goldBadge: "bg-amber-400 text-slate-950",
    },
    "tamil-govt": {
      bg: "bg-[#061226]",
      headerBg: "bg-[#0a1b38] border-b-2 border-amber-500/40",
      cardBg: "bg-[#0c2145] border-slate-700/80",
      ledTokenBg: "bg-[#040b18] border border-amber-500/30 shadow-inner",
      accent: "text-yellow-300",
      goldBadge: "bg-yellow-400 text-slate-950",
    },
    "amber-led": {
      bg: "bg-[#0a0a0a]",
      headerBg: "bg-[#141414] border-b-2 border-amber-500/50",
      cardBg: "bg-[#171717] border-neutral-800",
      ledTokenBg: "bg-[#050505] border border-amber-500/40 shadow-inner",
      accent: "text-amber-500",
      goldBadge: "bg-amber-500 text-black",
    },
  }[displayTheme];

  return (
    <div
      className={`min-h-screen ${themeStyles.bg} text-slate-100 flex flex-col justify-between font-sans selection:bg-amber-500 selection:text-black led-screen-pattern select-none relative`}
    >
      {/* Authentic Commercial TV Signage Bezel Rivets */}
      <div className="absolute top-2 left-2 w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-600 shadow-inner flex items-center justify-center opacity-70 z-50 pointer-events-none">
        <div className="w-2 h-0.5 bg-slate-400 transform rotate-45"></div>
      </div>
      <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-600 shadow-inner flex items-center justify-center opacity-70 z-50 pointer-events-none">
        <div className="w-2 h-0.5 bg-slate-400 transform -rotate-45"></div>
      </div>
      <div className="absolute bottom-2 left-2 w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-600 shadow-inner flex items-center justify-center opacity-70 z-50 pointer-events-none">
        <div className="w-2 h-0.5 bg-slate-400 transform -rotate-45"></div>
      </div>
      <div className="absolute bottom-2 right-2 w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-600 shadow-inner flex items-center justify-center opacity-70 z-50 pointer-events-none">
        <div className="w-2 h-0.5 bg-slate-400 transform rotate-45"></div>
      </div>

      {/* ============================================================== */}
      {/* 1. TOP COMMERCIAL SIGNAGE HEADER BAR                           */}
      {/* ============================================================== */}
      <header className={`${themeStyles.headerBg} px-4 sm:px-8 py-3.5 shadow-2xl relative z-20`}>
        <div className="max-w-[1920px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
          {/* Official Emblem & Bilingual Seal */}
          <div className="flex items-center gap-4 w-full lg:w-auto">
            {/* Tamil Nadu State Emblem SVG Badge */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center p-1.5 shadow-lg ring-2 ring-amber-400/50 shrink-0">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full text-slate-950 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Temple Gopuram & Ashoka Capital Silhouette */}
                <path d="M50 8 L54 18 L60 18 L56 26 L62 26 L58 35 L64 35 L50 48 L36 35 L42 35 L38 26 L44 26 L40 18 L46 18 Z" />
                <rect x="35" y="48" width="30" height="20" rx="3" />
                <circle cx="50" cy="58" r="6" fill="#f59e0b" />
                <path d="M20 72 Q50 65 80 72 L82 82 Q50 76 18 82 Z" />
                <path d="M25 84 Q50 80 75 84 L77 92 Q50 88 23 92 Z" />
              </svg>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 px-2 py-0.5 rounded shadow-sm">
                  {language === "ta"
                    ? "தமிழ்நாடு அரசு"
                    : language === "en"
                    ? "GOVERNMENT OF TAMIL NADU"
                    : "GOVERNMENT OF TAMIL NADU • தமிழ்நாடு அரசு"}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {language === "ta"
                    ? "வருவாய் மற்றும் பேரிடர் மேலாண்மைத் துறை"
                    : language === "en"
                    ? "DEPARTMENT OF REVENUE & DISASTER MANAGEMENT"
                    : "DEPARTMENT OF REVENUE & DISASTER MANAGEMENT • வருவாய்த்துறை"}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white font-chakra flex items-center gap-2">
                {language === "ta"
                  ? "வட்டார வட்டாட்சியர் அலுவலகம் • மத்திய மின்னணு வரிசை பலகை"
                  : language === "en"
                  ? "TALUK ADMINISTRATIVE HEADQUARTERS • DIGITAL QUEUE DISPLAY"
                  : "TALUK ADMINISTRATIVE HEADQUARTERS • DIGITAL QUEUE DISPLAY"}
              </h1>
              <p className="text-[11px] sm:text-xs text-amber-300/90 font-medium tracking-wide">
                {language === "ta"
                  ? "தலைமை நிர்வாக அலுவலகம் • நேரலை வரிசை அழைப்பு மேலாண்மை"
                  : language === "en"
                  ? "Taluk Administrative Office • Real-time Electronic Queue Signage"
                  : "வட்டாட்சியர் அலுவலகம் • மத்திய மின்னணு வரிசை அறிவிப்பு பலகை"}
              </p>
            </div>
          </div>

          {/* Right Live Clock & TV Signage Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            {/* High-Precision LED Digital Clock */}
            <div className="bg-[#03060c] border border-slate-700/80 rounded-2xl px-5 py-2 text-right shadow-inner flex items-center gap-4">
              <div>
                <div className="text-2xl sm:text-3xl font-led font-black tracking-widest text-amber-400 led-glow-amber">
                  {currentTime.toLocaleTimeString("en-IN", {
                    hour12: true,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </div>
                <div className="text-[10px] sm:text-[11px] font-chakra font-bold text-slate-400 uppercase tracking-wider">
                  {currentTime.toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  <span className="text-amber-400/80 ml-2 font-normal">
                    {currentTime.toLocaleDateString("ta-IN", { weekday: "short", day: "2-digit", month: "short" })}
                  </span>
                </div>
              </div>

              {/* Live WebSocket Status Dot */}
              <div className="flex flex-col items-center pl-3 border-l border-slate-800">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping mb-1" title="Real-time Stream Active"></span>
                <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold tracking-tighter">
                  LIVE
                </span>
              </div>
            </div>

            {/* Department Filter */}
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="bg-[#0c1527] border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="all">
                {language === "ta"
                  ? "🏢 அனைத்து கவுண்டர்கள் & மேஜைகள்"
                  : language === "en"
                  ? "🏢 All Counters & Desks"
                  : "🏢 All Counters • அனைத்து கவுண்டர்கள்"}
              </option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {tDeptName(d.name)} ({d.code})
                </option>
              ))}
            </select>

            {/* Layout Toggle (Split vs Full Grid) */}
            <div className="bg-[#0c1527] border border-slate-700 rounded-xl p-1 flex items-center gap-1">
              <button
                onClick={() => setViewLayout("split")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewLayout === "split"
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Split Hero & Counter View"
              >
                Split
              </button>
              <button
                onClick={() => setViewLayout("grid")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewLayout === "grid"
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Full Counter Matrix View"
              >
                Grid
              </button>
            </div>

            {/* Display & Voice Language Mode Switcher */}
            <div className="bg-[#0c1527] border border-slate-700 rounded-xl p-1 flex items-center gap-1 shadow-sm" title="Language: Both (Tamil + Eng) / தமிழ் / English">
              <button
                type="button"
                onClick={() => setLanguage("both")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  language === "both"
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Both Tamil and English (Bilingual Display & Announcements)"
              >
                🌐 Eng + தமிழ்
              </button>
              <button
                type="button"
                onClick={() => setLanguage("ta")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  language === "ta"
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Tamil Only"
              >
                🇮🇳 தமிழ்
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  language === "en"
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="English Only"
              >
                🇬🇧 English
              </button>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => {
                setAudioEnabled(!audioEnabled);
                setSpeechEnabled(!speechEnabled);
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                audioEnabled
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-md"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
              title={audioEnabled ? "Audio Broadcast Active" : "Audio Muted"}
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Audio Voice Test & Interactive Call Next */}
            <button
              id="test-call-button"
              onClick={() => {
                const tokenToCall = nextTokens[0]?.tokenDisplay || "REV007";
                triggerAnnouncement(tokenToCall, "1", "Revenue Department");
              }}
              className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform shadow-xs"
              title="Test Public Chime & Voice Announcement"
            >
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Call Next ({nextTokens[0]?.tokenDisplay || "REV007"})</span>
            </button>

            {simulatedCall && (
              <button
                onClick={() => {
                  setSimulatedCall(null);
                  setActiveCallAlert(null);
                }}
                className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold"
                title="Reset to Standby"
              >
                Reset
              </button>
            )}

            {/* Theme Selector */}
            <button
              onClick={() => {
                const themes = ["realistic-dark", "tamil-govt", "amber-led"];
                const nextTheme = themes[(themes.indexOf(displayTheme) + 1) % themes.length];
                setDisplayTheme(nextTheme);
              }}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold"
              title="Toggle Display Color Theme"
            >
              <Sliders className="w-5 h-5 text-amber-400" />
            </button>

            {/* Fullscreen TV Mode */}
            <button
              onClick={toggleFullscreen}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-colors"
              title="Toggle Fullscreen TV Signage Mode"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. EMERGENCY / INSTANT TOKEN CALL HERO BANNER                  */}
      {/* ============================================================== */}
      {activeCallAlert && (
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 px-6 py-4 border-y-4 border-amber-300 shadow-2xl animate-pulse z-30">
          <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="p-3 bg-slate-950 text-amber-400 rounded-2xl shadow-xl">
                <Bell className="w-8 h-8 animate-bounce" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest bg-slate-950 text-amber-300 px-2.5 py-0.5 rounded">
                    NOW CALLING • உடனடி அழைப்பு
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {activeCallAlert.departmentName || "Taluk Office"}
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-black text-slate-950 tracking-tight font-chakra mt-0.5">
                  CITIZEN PLEASE PROCEED TO COUNTER DESK • தயவுசெய்து கவுண்டருக்கு வரவும்
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-center">
              <div className="flex items-baseline gap-2 bg-slate-950/90 text-amber-300 px-6 py-2 rounded-2xl shadow-xl border border-amber-400/40">
                <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                  TOKEN NO.
                </span>
                <span className="text-4xl sm:text-6xl font-black font-led tracking-tight text-amber-400 led-glow-amber">
                  {activeCallAlert.tokenDisplay}
                </span>
              </div>

              <div className="text-3xl text-slate-950 font-black hidden sm:block animate-pulse">
                ➔ ➔ ➔
              </div>

              <div className="bg-slate-950 text-white px-6 py-2 rounded-2xl shadow-xl border border-amber-400/50 text-center sm:text-left">
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase block">
                  SERVICE DESK
                </span>
                <span className="text-2xl sm:text-4xl font-black font-chakra tracking-tight text-white">
                  COUNTER {activeCallAlert.counterNumber}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MAIN SIGNAGE BOARD                                          */}
      {/* ============================================================== */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* TOP STATUS BAR: Active Counters, Waiting Count, Service Time */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`${themeStyles.cardBg} border-2 rounded-2xl p-4 flex items-center justify-between shadow-xl`}>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {language === "ta"
                  ? "காத்திருக்கும் குடிமக்கள்"
                  : language === "en"
                  ? "WAITING CITIZENS"
                  : "WAITING CITIZENS • காத்திருப்போர்"}
              </span>
              <div className="text-3xl sm:text-4xl font-black font-led text-amber-400 led-glow-amber mt-1">
                {queueData?.waitingCount ?? 0}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className={`${themeStyles.cardBg} border-2 rounded-2xl p-4 flex items-center justify-between shadow-xl`}>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {language === "ta"
                  ? "உத்தேச காத்திருப்பு நேரம்"
                  : language === "en"
                  ? "AVG. WAIT TIME"
                  : "AVG. WAIT TIME • உத்தேச நேரம்"}
              </span>
              <div className="text-3xl sm:text-4xl font-black font-led text-emerald-400 led-glow-emerald mt-1">
                ~{queueData?.estimatedWaitMinutes ?? 0}{" "}
                <span className="text-xs font-semibold text-emerald-300">
                  {language === "ta" ? "நிமிடம்" : "MINS"}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className={`${themeStyles.cardBg} border-2 rounded-2xl p-4 flex items-center justify-between shadow-xl`}>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {language === "ta"
                  ? "செயல்படும் கவுண்டர்கள்"
                  : language === "en"
                  ? "ACTIVE DESKS"
                  : "ACTIVE DESKS • செயல்படும் மேஜைகள்"}
              </span>
              <div className="text-3xl sm:text-4xl font-black font-led text-blue-400 mt-1">
                {counters.filter((c) => c.status !== "closed").length} / {counters.length || 4}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className={`${themeStyles.cardBg} border-2 rounded-2xl p-4 flex items-center justify-between shadow-xl`}>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {language === "ta"
                  ? "மத்திய அமைப்பு நிலை"
                  : language === "en"
                  ? "CENTRAL SYSTEM"
                  : "CENTRAL SYSTEM • அமைப்பு நிலை"}
              </span>
              <div className="text-xs sm:text-sm font-black text-emerald-400 flex items-center gap-2 mt-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>{language === "ta" ? "நேரலை இணைப்பு இயங்குகிறது" : "SYNC STREAM 100% OK"}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Radio className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. HERO SPOTLIGHT DISPLAY (When not in full grid mode)         */}
        {/* ============================================================== */}
        {viewLayout === "split" && heroCalledCounter && (
          <div className="hardware-bezel bg-gradient-to-b from-[#091122] via-[#070d1a] to-[#040813] rounded-3xl p-6 sm:p-8 border-2 border-slate-700/80 shadow-2xl relative overflow-hidden">
            {/* Top Corner LED Status Indicators */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 mb-6 gap-3">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-ping"></span>
                <span className="text-xs font-black uppercase tracking-widest text-amber-400 font-chakra">
                  {language === "ta"
                    ? "தலைமை மின்னணு அழைப்பு பலகை"
                    : language === "en"
                    ? "OFFICIAL QUEUE BOARD"
                    : "OFFICIAL QUEUE BOARD • தலைமை மின்னணு அழைப்பு பலகை"}
                </span>
              </div>

              {/* Sound Wave Equalizer Indicator */}
              <div className="flex items-center gap-3 bg-[#03060c] px-4 py-1.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 uppercase">
                  {isSpeaking
                    ? language === "ta"
                      ? "ஒலி அறிவிப்பு இயங்குகிறது"
                      : "VOICE BROADCAST ACTIVE"
                    : language === "ta"
                    ? "ஒலி அமைப்பு தயார்"
                    : "AUDIO SYSTEM READY"}
                </span>
                <div className="flex items-end gap-1 h-5">
                  <span className={`w-1 bg-amber-400 rounded-full ${isSpeaking ? "sound-bar-1" : "h-2"}`}></span>
                  <span className={`w-1 bg-amber-400 rounded-full ${isSpeaking ? "sound-bar-2" : "h-3"}`}></span>
                  <span className={`w-1 bg-amber-400 rounded-full ${isSpeaking ? "sound-bar-3" : "h-1"}`}></span>
                  <span className={`w-1 bg-amber-400 rounded-full ${isSpeaking ? "sound-bar-4" : "h-2"}`}></span>
                </div>
              </div>
            </div>

            {/* Split Hero Display: Giant Token Left, Counter Station Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left 7 Cols: Giant Digital LED Token Display */}
              <div className="lg:col-span-7 flex flex-col justify-center items-center text-center p-6 sm:p-10 rounded-3xl bg-[#02050a] border-2 border-slate-800/90 shadow-2xl relative">
                <span className="text-xs sm:text-sm font-mono tracking-widest uppercase text-slate-400 block mb-2 font-bold">
                  {heroToken
                    ? language === "ta"
                      ? "தற்போது அழைக்கப்படும் டோக்கன்"
                      : language === "en"
                      ? "CURRENTLY ACTIVE TOKEN"
                      : "CURRENTLY ACTIVE TOKEN • தற்போதைய டோக்கன்"
                    : language === "ta"
                    ? "அதிகாரியின் அழைப்பிற்காக காத்திருப்பு"
                    : language === "en"
                    ? "WAITING FOR OFFICER CALL"
                    : "WAITING FOR OFFICER CALL • காத்திருப்பு"}
                </span>

                {heroToken ? (
                  <div className="space-y-3">
                    <div
                      className={`text-6xl sm:text-8xl md:text-9xl font-led font-black tracking-tight ${
                        heroToken.status === "called"
                          ? "text-amber-400 led-glow-amber blink-led"
                          : "text-emerald-400 led-glow-emerald"
                      }`}
                    >
                      {heroToken.tokenDisplay}
                    </div>

                    <div className="inline-block bg-slate-900 border border-slate-700/80 px-4 py-1 rounded-full text-xs font-semibold text-slate-300">
                      {heroToken.serviceName || "Public Administrative Service"}
                    </div>
                  </div>
                ) : (
                  <div className="py-8">
                    <div className="text-4xl sm:text-6xl font-led font-black text-slate-600 tracking-wider">
                      {language === "ta" ? "காத்திருப்பு" : "STANDBY"}
                    </div>
                    <p className="text-xs text-slate-500 mt-2 font-chakra">
                      {language === "ta"
                        ? "அதிகாரிகள் அடுத்த டோக்கனை அழைக்க தயாராகின்றனர்"
                        : "Desk officers are preparing next citizen call"}
                    </p>
                  </div>
                )}
              </div>

              {/* Right 5 Cols: Counter Station Direction Board */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-5 p-6 sm:p-8 rounded-3xl bg-[#081021] border-2 border-amber-500/30 shadow-xl">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                      {language === "ta"
                        ? "செல்ல வேண்டிய இடம்"
                        : language === "en"
                        ? "SERVICE DESTINATION"
                        : "SERVICE DESTINATION • செல்ல வேண்டிய இடம்"}
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        heroToken?.status === "called"
                          ? "bg-amber-400 text-slate-950 animate-pulse"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      }`}
                    >
                      {heroToken?.status === "called"
                        ? language === "ta"
                          ? "அழைக்கப்படுகிறது"
                          : "CALLING"
                        : language === "ta"
                        ? "சேவையில்"
                        : "SERVING"}
                    </span>
                  </div>

                  <h3 className="text-3xl sm:text-5xl font-black text-white font-chakra tracking-tight">
                    {language === "ta"
                      ? `கவுண்டர் ${heroCalledCounter.counterNumber}`
                      : language === "en"
                      ? `COUNTER ${heroCalledCounter.counterNumber}`
                      : `COUNTER ${heroCalledCounter.counterNumber} • கவுண்டர் ${heroCalledCounter.counterNumber}`}
                  </h3>
                  <p className="text-sm font-bold text-slate-300 mt-1">
                    {heroCalledCounter.name || "Taluk General Counter"}
                  </p>
                  <p className="text-xs text-amber-300/80 font-medium">
                    {tDeptName(heroCalledCounter.department?.name) || (language === "ta" ? "வருவாய்த்துறை" : "Revenue Department")}
                  </p>
                </div>

                <div className="p-4 bg-[#03060c] rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Officer in Charge:</span>
                    <span className="font-bold text-slate-200">
                      {heroCalledCounter.officer?.designation || "Revenue Inspector"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Employee ID:</span>
                    <span className="font-mono text-amber-400">
                      {heroCalledCounter.officer?.employeeId || "OFF-001"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Bring original Aadhaar</span>
                  </span>
                  <span className="font-mono text-slate-500">ID: #{heroCalledCounter._id.slice(-6)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. MULTI-COUNTER ELECTRONIC SIGNBOARD MATRIX + NEXT IN LINE    */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 8 COLS (or 12 in Grid mode): Multi-Desk Signboards */}
          <div className={viewLayout === "split" ? "lg:col-span-8 space-y-4" : "lg:col-span-12 space-y-4"}>
            <div className="flex justify-between items-center bg-[#090f1d] px-5 py-3 rounded-2xl border border-slate-800 shadow-md">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-400 font-chakra flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                {language === "ta"
                  ? "செயல்படும் கவுண்டர்கள் நிலவரம்"
                  : language === "en"
                  ? "ACTIVE SERVICE DESKS MATRIX"
                  : "ACTIVE SERVICE DESKS MATRIX • அனைத்து கவுண்டர் நிலவரம்"}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {counters.length} {language === "ta" ? "கவுண்டர்கள்" : "Counters Registered"}
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-60 bg-slate-900 rounded-3xl animate-pulse"></div>
                ))}
              </div>
            ) : counters.length === 0 ? (
              <div className="bg-[#090f1d] p-12 text-center rounded-3xl border border-slate-800 text-slate-400">
                {language === "ta" ? "கவுண்டர்கள் எதுவும் பதிவு செய்யப்படவில்லை." : "No active counters registered."}
              </div>
            ) : (
              <div
                className={`grid gap-4 ${
                  viewLayout === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                    : "grid-cols-1 sm:grid-cols-2"
                }`}
              >
                {counters.map((c) => {
                  const hasToken = Boolean(c.currentToken);
                  const isCalled = c.currentToken?.status === "called";
                  const isServing = c.currentToken?.status === "serving";
                  const isClosed = c.status === "closed";

                  return (
                    <div
                      key={c._id}
                      className={`hardware-bezel rounded-3xl border-2 p-5 flex flex-col justify-between transition-all relative overflow-hidden shadow-2xl ${
                        isCalled
                          ? "bg-[#0f1b33] border-amber-400 ring-4 ring-amber-400/20"
                          : isServing
                          ? "bg-[#09182b] border-emerald-500/70"
                          : isClosed
                          ? "bg-[#090d18] border-slate-800/80 opacity-75"
                          : "bg-[#0b1324] border-slate-800"
                      }`}
                    >
                      {/* Physical Counter Station Header */}
                      <div className="flex justify-between items-start border-b border-slate-800/80 pb-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-chakra">
                              {language === "ta"
                                ? `கவுண்டர் #${c.counterNumber}`
                                : `DESK #${c.counterNumber}`}
                            </span>
                            <span className="text-[10px] text-slate-400">•</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {c.department?.code || "TALUK"}
                            </span>
                          </div>
                          <h4 className="text-lg sm:text-xl font-black text-white font-chakra tracking-tight">
                            {c.name}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {tDeptName(c.department?.name) || (language === "ta" ? "பொது பிரிவு" : "General Division")}
                          </p>
                        </div>

                        {/* Status Indicator LED Lamp */}
                        <div
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md ${
                            isCalled
                              ? "bg-amber-400 text-slate-950 animate-pulse"
                              : isServing
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : isClosed
                              ? "bg-rose-950/40 text-rose-400 border border-rose-900/40"
                              : "bg-slate-800 text-slate-300 border border-slate-700"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isCalled
                                ? "bg-slate-950"
                                : isServing
                                ? "bg-emerald-400"
                                : isClosed
                                ? "bg-rose-500"
                                : "bg-cyan-400"
                            }`}
                          ></span>
                          <span>
                            {isCalled
                              ? language === "ta" ? "அழைப்பில்" : language === "both" ? "CALLED • அழைப்பில்" : "CALLED"
                              : isServing
                              ? language === "ta" ? "சேவையில்" : language === "both" ? "SERVING • சேவையில்" : "SERVING"
                              : isClosed
                              ? language === "ta" ? "மூடப்பட்டது" : language === "both" ? "CLOSED • மூடப்பட்டது" : "CLOSED"
                              : language === "ta" ? "தயார்" : language === "both" ? "READY • தயார்" : "READY"}
                          </span>
                        </div>
                      </div>

                      {/* Giant Digital LED Screen Box inside the Desk Card */}
                      <div className="my-4 text-center bg-[#02050a] py-5 px-3 rounded-2xl border-2 border-slate-800/90 shadow-inner">
                        <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase block mb-1">
                          {hasToken
                            ? language === "ta"
                              ? "அழைக்கப்படும் டோக்கன்"
                              : language === "en"
                              ? "SERVING TOKEN NUMBER"
                              : "SERVING TOKEN • டோக்கன் எண்"
                            : language === "ta"
                            ? "மேஜை நிலை"
                            : "STATION STATUS"}
                        </span>

                        {hasToken ? (
                          <div
                            className={`text-5xl sm:text-6xl font-led font-black tracking-tight ${
                              isCalled
                                ? "text-amber-400 led-glow-amber blink-led"
                                : "text-emerald-400 led-glow-emerald"
                            }`}
                          >
                            {c.currentToken.tokenDisplay}
                          </div>
                        ) : (
                          <div className="text-2xl sm:text-3xl font-led font-bold text-slate-500 py-3">
                            {isClosed
                              ? language === "ta" ? "மூடப்பட்டது" : "DESK CLOSED"
                              : language === "ta" ? "தயார்" : "READY"}
                          </div>
                        )}

                        {c.currentToken?.serviceName && (
                          <p className="text-[11px] text-slate-300 font-medium mt-2 line-clamp-1">
                            {c.currentToken.serviceName}
                          </p>
                        )}
                      </div>

                      {/* Officer & Personnel Footer */}
                      <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                          <span className="truncate max-w-[140px] text-slate-300 font-semibold">
                            {c.officer?.designation || "Revenue Staff"}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-amber-400/90">
                          {c.officer?.employeeId || "OFF001"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT 4 COLS (Split layout): Split-Flap Waiting Hall Queue */}
          {viewLayout === "split" && (
            <div className="lg:col-span-4 bg-[#090f1d] border-2 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-5">
              <div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500 animate-ping"></span>
                    <h3 className="text-sm font-black uppercase tracking-wider text-white font-chakra">
                      {language === "ta"
                        ? "அடுத்த வரிசை டோக்கன்கள்"
                        : language === "en"
                        ? "NEXT IN LINE"
                        : "NEXT IN LINE • அடுத்த வரிசை"}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                    {queueData?.waitingCount || 0} {language === "ta" ? "நபர்கள்" : "Citizens"}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4">
                  {language === "ta"
                    ? "கீழ்க்கண்ட டோக்கன் எண் கொண்ட குடிமக்கள் தங்கள் அசல் ஆவணங்களை தயாராக வைத்திருக்கவும்:"
                    : language === "en"
                    ? "Citizens with the following token numbers are requested to keep original documents ready:"
                    : "Citizens with the following tokens keep original documents ready • அசல் ஆவணங்களை தயாராக வைத்திருக்கவும்:"}
                </p>

                {nextTokens.length === 0 ? (
                  <div className="text-center py-14 text-slate-500 text-xs font-chakra">
                    {language === "ta" ? "வரிசையில் அடுத்து டோக்கன்கள் இல்லை." : "No upcoming tokens in queue."}
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                    {nextTokens.slice(0, 8).map((token, idx) => (
                      <div
                        key={idx}
                        className="bg-[#040813] border border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between hover:border-amber-400/50 transition-colors shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-slate-800 text-amber-400 font-led font-bold text-xs flex items-center justify-center border border-slate-700">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="text-2xl font-led font-black text-amber-300 led-glow-amber">
                              {token.tokenDisplay}
                            </div>
                            <span className="text-[11px] text-slate-400 line-clamp-1">
                              {token.serviceName || tDeptName(token.departmentName)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-black uppercase text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 block">
                            {token.departmentCode || "DEPT"}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                            ~{(idx + 1) * 10}m
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Citizen Checklist Callout */}
              <div className="bg-[#040813] border border-slate-700/80 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold font-chakra">
                  <FileCheck className="w-4 h-4" />
                  <span>
                    {language === "ta"
                      ? "தேவையான அசல் ஆவணங்கள் சரிபார்ப்பு"
                      : language === "en"
                      ? "CITIZEN DOCUMENT CHECKLIST"
                      : "CITIZEN DOCUMENT CHECKLIST • ஆவணங்கள்"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {language === "ta"
                    ? "தயவுசெய்து உங்கள் அசல் ஆதார் அட்டை, ஸ்மார்ட் குடும்ப அட்டை, மற்றும் பட்டா/சிட்டா நகல்களை தயாராக வைத்திருக்கவும்."
                    : language === "en"
                    ? "Please keep your original Aadhaar Card, Smart Family Ration Card, and Patta/Chitta copies ready."
                    : "தயவுசெய்து உங்கள் அசல் ஆதார் அட்டை, குடும்ப அட்டை, மற்றும் பட்டா நகல்களை தயாராக வைக்கவும் • Please keep Aadhaar & Patta ready."}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    {language === "ta" ? "ஆதார் அட்டை" : "Aadhaar Card"}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    {language === "ta" ? "குடும்ப அட்டை" : "Ration Card"}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    {language === "ta" ? "பட்டா/சிட்டா நகல்" : "Patta Copy"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ============================================================== */}
      {/* 6. RUNNING CITIZEN ADVISORY & ANTI-CORRUPTION MARQUEE TICKER   */}
      {/* ============================================================== */}
      <footer className="bg-[#03060c] border-t-2 border-slate-800 text-amber-300 py-3 shadow-2xl relative z-20">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 flex items-center gap-4">
          <div className="flex items-center gap-2 bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-lg shrink-0 uppercase tracking-widest shadow-md">
            <ShieldAlert className="w-4 h-4" />
            <span>OFFICIAL NOTICES</span>
          </div>

          <div className="overflow-hidden whitespace-nowrap w-full">
            <div className="animate-marquee-smooth text-xs sm:text-sm font-semibold tracking-wide text-slate-200">
              <span className="text-amber-400 font-bold">📢 அறிவிப்பு:</span> தயவுசெய்து உங்கள் டோக்கன் எண்ணை கவனமாக கேட்டு குறித்த கவுண்டருக்கு செல்லவும் •{" "}
              <span className="text-red-400 font-bold">🚫 லஞ்சம் தவிர்ப்பீர்! நெஞ்சம் நிமிர்த்தீர்!</span> லஞ்ச ஒழிப்புத் துறை கட்டணமில்லா உதவி எண்: <strong className="text-white bg-red-950 px-1.5 py-0.5 rounded border border-red-800">1064</strong> •{" "}
              <span className="text-blue-400 font-bold">📞 முதலமைச்சரின் உதவி மையம் (CM Helpline):</span> <strong className="text-white">1100</strong> •{" "}
              <span>🕒 அலுவலக வேலை நேரம்: திங்கள் முதல் வெள்ளி வரை காலை 10:00 மணி முதல் மாலை 5:45 வரை</span> •{" "}
              <span>🎫 புதிய டோக்கன் வழங்கல் மாலை 4:30 மணிக்கு நிறைவடையும்</span> •{" "}
              <span>♿ மூத்த குடிமக்கள் மற்றும் மாற்றுத்திறனாளிகளுக்கு கவுண்டர் 1ல் முன்னுரிமை வழங்கப்படும்</span> •{" "}
              <span>🏛️ வட்டார வட்டாட்சியர் அலுவலகம், தமிழ்நாடு அரசு • Taluk Administrative Office, Government of Tamil Nadu</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicQueueDisplay;
