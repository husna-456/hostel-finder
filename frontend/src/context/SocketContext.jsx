import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token } = useAuth(); // 🔥 reactive token
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        console.log("🔴 Token removed → disconnect socket");
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    console.log("🟢 Creating socket with NEW token");

    const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api$/, "");
    const  socketConnection = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

     socketConnection.on("connect", () => {
      console.log("✅ Socket connected:",  socketConnection.id);
    });

    socketRef.current =  socketConnection;
    setSocket( socketConnection);

    return () => {
      console.log("🧹 Cleanup socket");
       socketConnection.disconnect();
    };
  }, [token]); // ✅ now ACTUALLY works

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
