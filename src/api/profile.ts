import api from "./axios";

const getApiBaseUrl = () => {
  const baseUrl =
    api.defaults.baseURL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api";

  return baseUrl.replace(/\/$/, "");
};

export const getResumeApiUrl = () => {
  return `${getApiBaseUrl()}/profile/resume`;
};

export const getResumeDownloadUrl = () => {
  return `${getResumeApiUrl()}?download=1`;
};

export const getCurrentResume = async () => {
  const response = await api.get("/profile/resume", {
    headers: {
      Accept: "application/json",
    },
  });

  return response.data;
};

export const openResumeInNewTab = async () => {
  try {
    await getCurrentResume();
    window.open(getResumeApiUrl(), "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error("Failed to open resume", error);
  }
};

export const uploadResumeFile = async (file: File) => {
  const formData = new FormData();
  formData.append("resume", file);

  const token = localStorage.getItem("token");

  const response = await api.put("/profile/resume", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
