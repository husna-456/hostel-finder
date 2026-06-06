import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { useSocketContext } from "./SocketContext";
import { getUserId } from "../utils/auth";
import { toast } from "react-toastify";

const CallContext = createContext(null);

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function CallProvider({ children }) {
  const socket       = useSocketContext();
  const currentUserId = getUserId();

  const [callStatus,   setCallStatus]   = useState("idle");  // idle | calling | receiving | connecting | connected
  const [callerInfo,   setCallerInfo]   = useState(null);    // { from, callerName, callerAvatar, offer }
  const [isMuted,      setIsMuted]      = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const peerRef                = useRef(null);
  const localStreamRef         = useRef(null);
  const remoteAudioRef         = useRef(null);   // set by ActiveCallScreen
  const calleeIdRef            = useRef(null);
  const timerRef               = useRef(null);
  const pendingCandidates      = useRef([]);
  const callStatusRef          = useRef("idle");

  // Keep ref in sync for socket callbacks
  useEffect(() => { callStatusRef.current = callStatus; }, [callStatus]);

  const startTimer = () => {
    clearInterval(timerRef.current);
    setCallDuration(0);
    timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
  };

  const cleanup = useCallback(() => {
    clearInterval(timerRef.current);
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    calleeIdRef.current = null;
    pendingCandidates.current = [];
    setCallStatus("idle");
    setCallerInfo(null);
    setCallDuration(0);
    setIsMuted(false);
  }, []);

  const createPeer = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate && socket && calleeIdRef.current) {
        socket.emit("call:ice-candidate", {
          to: calleeIdRef.current,
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = (e) => {
      if (remoteAudioRef.current && e.streams[0]) {
        remoteAudioRef.current.srcObject = e.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setCallStatus("connected");
        startTimer();
      } else if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        cleanup();
      }
    };

    return pc;
  }, [socket, cleanup]);

  const startCall = useCallback(
    async (toUserId, toName, toAvatar = "") => {
      if (callStatusRef.current !== "idle" || !socket) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStreamRef.current = stream;

        const pc = createPeer();
        peerRef.current = pc;
        calleeIdRef.current = toUserId;

        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const myUser = (() => {
          try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
        })();

        socket.emit("call:initiate", {
          to: toUserId,
          callerName: myUser.name || "Unknown",
          callerAvatar: myUser.profilePicture || "",
          offer: pc.localDescription,
        });

        setCallStatus("calling");
        setCallerInfo({ from: toUserId, callerName: toName, callerAvatar: toAvatar });
      } catch (err) {
        console.error("startCall error:", err);
        toast.error("Microphone access required for voice calls");
        cleanup();
      }
    },
    [socket, createPeer, cleanup]
  );

  const acceptCall = useCallback(async () => {
    if (!callerInfo || !socket) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      const pc = createPeer();
      peerRef.current = pc;
      calleeIdRef.current = callerInfo.from;

      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(callerInfo.offer));

      // Apply any ICE candidates that arrived before remote description was set
      for (const c of pendingCandidates.current) {
        try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (_) {}
      }
      pendingCandidates.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("call:accepted", {
        to: callerInfo.from,
        answer: pc.localDescription,
      });

      setCallStatus("connecting");
    } catch (err) {
      console.error("acceptCall error:", err);
      toast.error("Microphone access required for voice calls");
      rejectCall();
    }
  }, [callerInfo, socket, createPeer]);

  const rejectCall = useCallback(() => {
    if (socket && callerInfo) {
      socket.emit("call:rejected", { to: callerInfo.from });
    }
    cleanup();
  }, [socket, callerInfo, cleanup]);

  const endCall = useCallback(() => {
    const to = calleeIdRef.current;
    if (socket && to) {
      socket.emit("call:ended", { to });
    }
    cleanup();
  }, [socket, cleanup]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsMuted((p) => !p);
    }
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const onIncoming = ({ from, callerName, callerAvatar, offer }) => {
      if (callStatusRef.current !== "idle") return;
      setCallerInfo({ from, callerName, callerAvatar, offer });
      setCallStatus("receiving");
    };

    const onAccepted = async ({ from, answer }) => {
      if (!peerRef.current) return;
      try {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        // Apply pending ICE candidates
        for (const c of pendingCandidates.current) {
          try { await peerRef.current.addIceCandidate(new RTCIceCandidate(c)); } catch (_) {}
        }
        pendingCandidates.current = [];
      } catch (err) {
        console.error("onAccepted error:", err);
      }
    };

    const onRejected = () => {
      toast.info("Call was declined");
      cleanup();
    };

    const onEnded = () => {
      toast.info("Call ended");
      cleanup();
    };

    const onIceCandidate = async ({ candidate }) => {
      if (!peerRef.current) {
        pendingCandidates.current.push(candidate);
        return;
      }
      if (peerRef.current.remoteDescription) {
        try { await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch (_) {}
      } else {
        pendingCandidates.current.push(candidate);
      }
    };

    socket.on("call:incoming",      onIncoming);
    socket.on("call:accepted",      onAccepted);
    socket.on("call:rejected",      onRejected);
    socket.on("call:ended",         onEnded);
    socket.on("call:ice-candidate", onIceCandidate);

    return () => {
      socket.off("call:incoming",      onIncoming);
      socket.off("call:accepted",      onAccepted);
      socket.off("call:rejected",      onRejected);
      socket.off("call:ended",         onEnded);
      socket.off("call:ice-candidate", onIceCandidate);
    };
  }, [socket, cleanup]);

  return (
    <CallContext.Provider
      value={{
        callStatus,
        callerInfo,
        isMuted,
        callDuration,
        remoteAudioRef,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export const useCallContext = () => useContext(CallContext);
