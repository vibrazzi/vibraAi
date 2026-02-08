import axios from "axios";

interface MusicPayload {
  model: string;
  instrumental: boolean;
  customMode?: boolean;
  prompt?: string;
  title?: string;
  style?: string;
}

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export const generateMusic = async (params: MusicPayload) => {
  try {
    const response = await api.post("/generate-music", params);
    return response.data;
  } catch (error) {
    console.warn("Backend unavailable or error", error);
    throw error;
  }
};

export const getMusicStatus = async (taskId: string) => {
  try {
    const response = await api.get("/generate/record-info", {
      params: { taskId },
    });
    return response.data;
  } catch (error) {
    console.warn("Status check failed", error);
    throw error;
  }
};

export default api;
