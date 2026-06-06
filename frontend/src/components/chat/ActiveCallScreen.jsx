import { useEffect, useRef } from "react";
import { PhoneOff, Mic, MicOff, Volume2 } from "lucide-react";
import { useCallContext } from "../../context/CallContext";

function formatDuration(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function ActiveCallScreen() {
  const {
    callStatus,
    callerInfo,
    isMuted,
    callDuration,
    remoteAudioRef,
    endCall,
    toggleMute,
  } = useCallContext();

  const audioElRef = useRef(null);

  // Wire remote audio element to context ref so CallContext can set srcObject
  useEffect(() => {
    remoteAudioRef.current = audioElRef.current;
  }, [remoteAudioRef]);

  const visible =
    callStatus === "calling" ||
    callStatus === "connecting" ||
    callStatus === "connected";

  if (!visible) return null;

  const name = callerInfo?.callerName || "Unknown";
  const avatar = callerInfo?.callerAvatar || "";
  const initial = name.charAt(0).toUpperCase();

  const statusText =
    callStatus === "calling"    ? "Calling…" :
    callStatus === "connecting" ? "Connecting…" :
                                  formatDuration(callDuration);

  return (
    <>
      {/* Hidden audio for remote stream */}
      <audio ref={audioElRef} autoPlay playsInline className="hidden" />

      <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-gradient-to-b from-purple-900/95 to-gray-900/95 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-80 md:rounded-3xl md:shadow-2xl">
        <div className="flex flex-col items-center gap-6 px-8 w-full">

          {/* Avatar */}
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-white/20 mt-8 md:mt-6"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white/20 mt-8 md:mt-6">
              {initial}
            </div>
          )}

          {/* Name + status */}
          <div className="text-center">
            <p className="text-white text-xl font-semibold">{name}</p>
            <p className="text-white/60 text-sm mt-1 tabular-nums">{statusText}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-8 mt-4 mb-8 md:mb-6">
            {/* Mute */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                  isMuted
                    ? "bg-white text-gray-900"
                    : "bg-white/20 hover:bg-white/30 text-white"
                }`}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
              <span className="text-white/60 text-xs">{isMuted ? "Unmute" : "Mute"}</span>
            </div>

            {/* End call */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={endCall}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg"
                aria-label="End call"
              >
                <PhoneOff size={26} className="text-white" />
              </button>
              <span className="text-white/60 text-xs">End</span>
            </div>

            {/* Speaker placeholder */}
            <div className="flex flex-col items-center gap-1">
              <button
                className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                aria-label="Speaker"
              >
                <Volume2 size={22} />
              </button>
              <span className="text-white/60 text-xs">Speaker</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
