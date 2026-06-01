import { fetchClient } from "./fetchClient";

export const getMessages = (conversationId) =>
  fetchClient(`/messages/${conversationId}`);

export const sendMessage = (data) =>
  fetchClient("/messages", {
    method: "POST",
    body: JSON.stringify(data),
  });
