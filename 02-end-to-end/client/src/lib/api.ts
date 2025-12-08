import axios from "axios";
import { SessionMetadata } from "../types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function createSession(): Promise<{ sessionId: string }> {
  const response = await api.post("/sessions");
  return response.data;
}

export async function getSession(sessionId: string): Promise<SessionMetadata> {
  const response = await api.get(`/sessions/${sessionId}`);
  return response.data;
}
