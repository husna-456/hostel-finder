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

export const markAllRead = () =>
  fetchClient("/conversations/mark-all-read", { method: "POST" });

export const archiveAllConversations = () =>
  fetchClient("/conversations/archive-all", { method: "POST" });

export const unarchiveAllConversations = () =>
  fetchClient("/conversations/unarchive-all", { method: "POST" });
