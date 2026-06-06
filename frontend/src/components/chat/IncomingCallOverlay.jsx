import { useEffect, useRef } from "react";
import { Phone, PhoneOff } from "lucide-react";
import { useCallContext } from "../../context/CallContext";

export default function IncomingCallOverlay() {
  const { callStatus, callerInfo, acceptCall, rejectCall } = useCallContext();
  const audioCtxRef = useRef(null);
  const timeoutRef  = useRef(null);

  // Ringtone using Web Audio API
  useEffect(() => {
    if (callStatus !== "receiving") return;

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    let stopped = false;

    const playBeep = () => {
      if (stopped || ctx.state === "closed") return;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.2);
      timeoutRef.current = setTimeout(playBeep, 2500);
    };

    playBeep();

    return () => {
      stopped = true;
      clearTimeout(timeoutRef.current);
      ctx.close().catch(() => {});
    };
  }, [callStatus]);

  if (callStatus !== "receiving") return null;

  const initial = (callerInfo?.callerName || "?").charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-b from-gray-900/95 to-black/95">
      <div className="flex flex-col items-center gap-6 px-8">

        {/* Avatar */}
        {callerInfo?.callerAvatar ? (
          <img
            src={callerInfo.callerAvatar}
            alt={callerInfo.callerName}
            className="w-28 h-28 rounded-full object-cover ring-4 ring-white/20"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-purple-600 flex items-center justify-center text-white text-4xl font-bold ring-4 ring-white/20">
            {initial}
          </div>
        )}

        {/* Name */}
        <div className="text-center">
          <p className="text-white text-2xl font-semibold">{callerInfo?.callerName || "Unknown"}</p>
          <p className="text-white/60 text-sm mt-1 animate-pulse">Incoming voice call…</p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-16 mt-4">
          {/* Reject */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={rejectCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg"
              aria-label="Reject"
            >
              <PhoneOff size={26} className="text-white" />
            </button>
            <span className="text-white/70 text-xs">Decline</span>
          </div>

          {/* Accept */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={acceptCall}
              className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors shadow-lg animate-bounce"
              aria-label="Accept"
            >
              <Phone size={26} className="text-white" />
            </button>
            <span className="text-white/70 text-xs">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
}
