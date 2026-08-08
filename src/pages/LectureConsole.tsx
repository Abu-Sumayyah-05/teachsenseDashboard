import { useEffect, useRef, useState } from "react";
import { Mic, Volume2, RotateCcw, Radio } from "lucide-react";

type Phase = "idle" | "recording" | "processing" | "results";

const MOCK_RESULT = {
  overall: 78,
  comprehension: 82,
  scope: 68,
  revisit: [
    { topic: "Kirchhoff's Voltage Law", note: "Students paused on sign conventions — walk the loop direction explicitly next time." },
    { topic: "Series vs. Parallel Resistance", note: "Fewer questions here — comprehension was strong, keep pace." },
  ],
  topActions: [
    "Recap Ohm's Law with a worked numeric example before moving to KVL.",
    "Pause for a comprehension check every ~8 minutes — gaps clustered mid-lecture.",
    "Use a circuit diagram on-screen when introducing loop direction; verbal-only explanation lost several students.",
  ],
};

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function RadialGauge({ value }: { value: number }) {
  const size = 168;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const sweep = 0.75;
  const arcLength = circumference * sweep;
  const filled = arcLength * (value / 100);
  const rotation = 135;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3FD6C0" />
            <stop offset="100%" stopColor="#5EEBD6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-bold tabular-nums"
          style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#3FD6C0" }}
        >
          {value}
        </span>
        <span className="text-[10px] tracking-[0.2em] uppercase text-[#FFFFFF] mt-0.5">Overall</span>
      </div>
    </div>
  );
}

const LectureConsole = () => {
  const [topic, setTopic] = useState("");
  const [className, setClassName] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canStart = topic.trim().length > 0 && className.trim().length > 0;

  useEffect(() => {
    if (phase === "recording") {
      intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  const handleToggleRecording = () => {
    if (phase === "idle") {
      setElapsed(0);
      setPhase("recording");
    } else if (phase === "recording") {
      setPhase("processing");
      setTimeout(() => setPhase("results"), 2600);
    }
  };

  const handleReset = () => {
    setPhase("idle");
    setElapsed(0);
    setTopic("");
    setClassName("");
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#0E1013", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');
        @keyframes pulse-0 { 0%,100% { opacity: 0.7; } 50% { opacity: 1; } }
        @keyframes pulse-1 { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes pulse-2 { 0%,100% { opacity: 0.8; } 50% { opacity: 1; } }
        @keyframes pulse-3 { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(63,214,192,0.08) 0%, transparent 70%), radial-gradient(40% 35% at 85% 15%, rgba(255,91,57,0.05) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-2xl mx-auto px-5 py-10 sm:py-14 text-[#E8EAED]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p
              className="text-[11px] tracking-[0.25em] uppercase text-[#FFFFFF] mb-1.5 flex items-center gap-1.5"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              <Radio size={11} />
              Channel 01 · Mic In
            </p>
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Lecture Console
            </h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3FD6C0]" style={{ boxShadow: "0 0 8px #3FD6C0" }} />
            <span className="text-[10px] tracking-[0.15em] uppercase text-[#FFFFFF]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              System Online
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div>
            <label
              className="block text-[10px] tracking-[0.2em] uppercase text-[#FFFFFF] mb-2"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Lecture Topic
            </label>
            <input
              type="text"
              disabled={phase !== "idle"}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Introduction to Ohm's Law"
              className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3.5 text-sm outline-none focus:border-[#3FD6C0]/50 focus:bg-white/[0.05] transition-all disabled:opacity-40 placeholder:text-[#D0D0D0]"
              style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)" }}
            />
          </div>
          <div>
            <label
              className="block text-[10px] tracking-[0.2em] uppercase text-[#FFFFFF] mb-2"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Class Taught
            </label>
            <input
              type="text"
              disabled={phase !== "idle"}
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. SS2 Physics"
              className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3.5 text-sm outline-none focus:border-[#3FD6C0]/50 focus:bg-white/[0.05] transition-all disabled:opacity-40 placeholder:text-[#D0D0D0]"
              style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)" }}
            />
          </div>
        </div>

        <div
          className="rounded-3xl p-8 sm:p-10 flex flex-col items-center mb-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 20px 60px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <button
            onClick={handleToggleRecording}
            disabled={!canStart && phase === "idle"}
            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed active:scale-95"
            style={{
              background:
                phase === "recording"
                  ? "radial-gradient(circle at 35% 30%, #FF7A5C, #FF5B39)"
                  : "linear-gradient(180deg, #2A3138, #1D2228)",
              boxShadow:
                phase === "recording"
                  ? "0 0 0 10px rgba(255,91,57,0.10), 0 0 50px rgba(255,91,57,0.4), inset 0 2px 4px rgba(255,255,255,0.15)"
                  : "0 8px 24px -8px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.06)",
            }}
          >
            {phase === "recording" && (
              <span className="absolute inset-0 rounded-full animate-ping bg-[#FF5B39]/25" />
            )}
            <Mic
              size={36}
              className={phase === "recording" ? "text-white" : "text-[#FFFFFF]"}
              strokeWidth={1.75}
            />
          </button>

          <p
            className="mt-6 text-3xl tabular-nums tracking-wide"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {formatTime(elapsed)}
          </p>

          <div className="flex items-end gap-[3px] h-6 mt-3">
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                className="w-[3px] rounded-full"
                style={{
                  height: phase === "recording" ? `${18 + Math.abs(Math.sin(i * 1.3)) * 82}%` : "12%",
                  background: phase === "recording" ? "linear-gradient(180deg, #FF9A82, #FF5B39)" : "#2A2F35",
                  transition: "height 0.2s ease, background 0.3s ease",
                  animation: phase === "recording" ? `pulse-${i % 4} 0.9s ease-in-out infinite` : "none",
                }}
              />
            ))}
          </div>

          <p
            className="mt-6 text-xs uppercase tracking-[0.25em] font-medium"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: phase === "recording" ? "#FF5B39" : "#F0F0F0",
            }}
          >
            {phase === "idle" && (canStart ? "Ready" : "Enter topic & class to begin")}
            {phase === "recording" && "● On Air"}
            {phase === "processing" && "Generating questions…"}
            {phase === "results" && "Session complete"}
          </p>

          {(phase === "idle" || phase === "recording") && (
            <button
              onClick={handleToggleRecording}
              disabled={!canStart}
              className="mt-6 px-7 py-3 rounded-full text-sm font-semibold transition-all disabled:opacity-25 disabled:cursor-not-allowed hover:scale-[1.03] active:scale-95"
              style={{
                background: phase === "recording" ? "rgba(255,255,255,0.06)" : "linear-gradient(180deg, #4FE3CE, #3FD6C0)",
                color: phase === "recording" ? "#E8EAED" : "#0E1013",
                border: phase === "recording" ? "1px solid rgba(255,255,255,0.1)" : "none",
                boxShadow: phase === "recording" ? "none" : "0 8px 20px -6px rgba(63,214,192,0.5)",
              }}
            >
              {phase === "recording" ? "Stop Recording" : "Start Recording"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#F0F0F0] mb-10 px-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          <Volume2 size={13} />
          <span>Channel 02 · Speaker Out — questions relay after processing</span>
        </div>

        {phase === "processing" && (
          <div
            className="rounded-3xl p-10 text-center fade-up"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="w-9 h-9 mx-auto mb-4 border-[3px] border-[#3FD6C0]/20 border-t-[#3FD6C0] rounded-full animate-spin" />
            <p className="text-sm text-[#FFFFFF]">Scoring comprehension and lecture scope…</p>
          </div>
        )}

        {phase === "results" && (
          <div className="space-y-4">
            <div
              className="rounded-3xl p-6 sm:p-8 fade-up"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 20px 60px -25px rgba(0,0,0,0.5)",
              }}
            >
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#FFFFFF] mb-5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                Teaching Effectiveness
              </p>

              <div className="flex items-center gap-8 mb-2">
                <RadialGauge value={MOCK_RESULT.overall} />
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#FFFFFF]">Comprehension</span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-[#E8EAED]">
                        {MOCK_RESULT.comprehension}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${MOCK_RESULT.comprehension}%`, background: "linear-gradient(90deg, #3FD6C0, #5EEBD6)" }}
                      />
                    </div>
                    <p className="text-[10px] text-[#F0F0F0] mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      weight 70%
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#FFFFFF]">Teaching Scope</span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-[#E8EAED]">
                        {MOCK_RESULT.scope}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${MOCK_RESULT.scope}%`, background: "linear-gradient(90deg, #FF5B39, #FF9A82)" }}
                      />
                    </div>
                    <p className="text-[10px] text-[#F0F0F0] mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      weight 30%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-3xl p-6 sm:p-8 fade-up"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
                animationDelay: "0.08s",
              }}
            >
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#FFFFFF] mb-4" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                Topics To Revisit
              </p>
              <div className="space-y-4 mb-7">
                {MOCK_RESULT.revisit.map((r, i) => (
                  <div key={i} className="pl-4 relative">
                    <span
                      className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full"
                      style={{ background: "linear-gradient(180deg, #3FD6C0, transparent)" }}
                    />
                    <p className="text-sm font-medium text-[#E8EAED]">{r.topic}</p>
                    <p className="text-xs text-[#FFFFFF] mt-1 leading-relaxed">{r.note}</p>
                  </div>
                ))}
              </div>

              <p className="text-[10px] tracking-[0.2em] uppercase text-[#FFFFFF] mb-4" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                Top 3 Actions
              </p>
              <ol className="space-y-3">
                {MOCK_RESULT.topActions.map((action, i) => (
                  <li key={i} className="flex gap-3.5 text-sm">
                    <span
                      className="shrink-0 w-6 h-6 rounded-full text-[11px] flex items-center justify-center mt-0.5 font-semibold"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", background: "rgba(63,214,192,0.12)", color: "#3FD6C0" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[#E8EAED] leading-relaxed pt-0.5">{action}</span>
                  </li>
                ))}
              </ol>
            </div>

            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm text-[#FFFFFF] border border-white/[0.06] hover:border-white/[0.15] hover:text-[#E8EAED] hover:bg-white/[0.02] transition-all fade-up"
              style={{ animationDelay: "0.16s" }}
            >
              <RotateCcw size={14} />
              Start New Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LectureConsole;