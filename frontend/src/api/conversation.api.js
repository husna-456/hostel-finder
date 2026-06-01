import { fetchClient } from "./fetchClient";

/* 🔹 CLIENT (USER) INBOX */
export const getUserConversations = () =>
  fetchClient("/conversations/user");

/* 🔹 OWNER INBOX */
export const getOwnerConversations = (ownerId) =>
  fetchClient(`/conversations/owner/${ownerId}`);

/* 🔹 CREATE OR GET CONVERSATION */
export const createConversation = (data) =>
  fetchClient("/conversations", {
    method: "POST",
    body: JSON.stringify(data),
  });
