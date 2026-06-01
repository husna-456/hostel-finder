import { useEffect, useState } from "react";
import { getMessages } from "../api/message.api";
import { useSocketContext } from "../context/SocketContext";

export default function useChat(conversationId) {
  const socket = useSocketContext();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!conversationId) return;

    getMessages(conversationId)
      .then(setMessages)
      .catch(console.error);

    socket.emit("join_conversation", conversationId);

    socket.on("receive_message", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [conversationId]);

  return { messages, setMessages };
}
