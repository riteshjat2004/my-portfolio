import api from "./axios";
import {
  DevVaultCategory,
  DevVaultContent,
  DevVaultContentFilterParams,
  DevVaultDetailResponse,
  DevVaultBrainTreasure,
  DevVaultBrainTreasureFilterParams,
} from "@/types/devvault";

// ==========================================
// PUBLIC API METHODS
// ==========================================

export const getDevVaultCategories = async (): Promise<DevVaultCategory[]> => {
  const response = await api.get("/devvault/categories");
  return response.data.categories || [];
};

export const getDevVaultCategoryBySlug = async (
  slug: string
): Promise<DevVaultCategory> => {
  const response = await api.get(`/devvault/categories/${slug}`);
  return response.data.category;
};

export const getDevVaultContent = async (
  params?: DevVaultContentFilterParams
): Promise<{
  total: number;
  content: DevVaultContent[];
}> => {
  const response = await api.get("/devvault/content", { params });
  return {
    total: response.data.total || 0,
    content: response.data.content || [],
  };
};

export const getDevVaultContentBySlug = async (
  slug: string
): Promise<DevVaultDetailResponse> => {
  const response = await api.get(`/devvault/content/${slug}`);
  return {
    content: response.data.content,
    prevTopic: response.data.prevTopic || null,
    nextTopic: response.data.nextTopic || null,
    related: response.data.related || [],
  };
};

// ==========================================
// ADMIN API METHODS
// ==========================================

export const getAdminDevVaultCategories = async (): Promise<
  DevVaultCategory[]
> => {
  const response = await api.get("/devvault/admin/categories");
  return response.data.categories || [];
};

export const createDevVaultCategory = async (
  data: Partial<DevVaultCategory>
): Promise<DevVaultCategory> => {
  const response = await api.post("/devvault/admin/categories", data);
  return response.data.category;
};

export const updateDevVaultCategory = async (
  id: string,
  data: Partial<DevVaultCategory>
): Promise<DevVaultCategory> => {
  const response = await api.put(`/devvault/admin/categories/${id}`, data);
  return response.data.category;
};

export const deleteDevVaultCategory = async (
  id: string,
  force = false
): Promise<{ message: string }> => {
  const response = await api.delete(`/devvault/admin/categories/${id}`, {
    params: { force: force ? "true" : "false" },
  });
  return response.data;
};

export const getAdminDevVaultContentList = async (
  params?: DevVaultContentFilterParams
): Promise<{
  total: number;
  content: DevVaultContent[];
}> => {
  const response = await api.get("/devvault/admin/content", { params });
  return {
    total: response.data.total || 0,
    content: response.data.content || [],
  };
};

export const getAdminDevVaultContentById = async (
  id: string
): Promise<DevVaultContent> => {
  const response = await api.get(`/devvault/admin/content/${id}`);
  return response.data.content;
};

export const createDevVaultContent = async (
  data: Partial<DevVaultContent>
): Promise<DevVaultContent> => {
  const response = await api.post("/devvault/admin/content", data);
  return response.data.content;
};

export const updateDevVaultContent = async (
  id: string,
  data: Partial<DevVaultContent> & { action?: string; isDraftSave?: boolean }
): Promise<DevVaultContent> => {
  const response = await api.put(`/devvault/admin/content/${id}`, data);
  return response.data.content;
};

export const discardDevVaultDraft = async (
  id: string
): Promise<DevVaultContent> => {
  const response = await api.put(`/devvault/admin/content/${id}`, {
    action: "discard_draft",
  });
  return response.data.content;
};

export const deleteDevVaultContent = async (
  id: string
): Promise<{ message: string }> => {
  const response = await api.delete(`/devvault/admin/content/${id}`);
  return response.data;
};

export const patchDevVaultContentStatus = async (
  id: string,
  data: {
    status?: "draft" | "published";
    visibility?: "visible" | "hidden";
    featured?: boolean;
  }
): Promise<DevVaultContent> => {
  const response = await api.patch(`/devvault/admin/content/${id}/status`, data);
  return response.data.content;
};

export const uploadDevVaultImage = async (
  file: File
): Promise<{ url: string; public_id: string; width?: number; height?: number }> => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.post("/devvault/admin/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// ==========================================
// BRAIN TREASURE API METHODS
// ==========================================

export const getDevVaultBrainTreasure = async (
  params?: DevVaultBrainTreasureFilterParams
): Promise<{
  total: number;
  items: DevVaultBrainTreasure[];
  technicalBackgrounds: string[];
}> => {
  const response = await api.get("/devvault/brain-treasure", { params });
  return {
    total: response.data.total || 0,
    items: response.data.items || [],
    technicalBackgrounds: response.data.technicalBackgrounds || [],
  };
};

export const getDevVaultBrainTreasureById = async (
  id: string
): Promise<DevVaultBrainTreasure> => {
  const response = await api.get(`/devvault/brain-treasure/${id}`);
  return response.data.item;
};

export const getAdminDevVaultBrainTreasure = async (
  params?: DevVaultBrainTreasureFilterParams
): Promise<{
  total: number;
  items: DevVaultBrainTreasure[];
  technicalBackgrounds: string[];
}> => {
  const response = await api.get("/devvault/admin/brain-treasure", { params });
  return {
    total: response.data.total || 0,
    items: response.data.items || [],
    technicalBackgrounds: response.data.technicalBackgrounds || [],
  };
};

export const createDevVaultBrainTreasure = async (
  data: Partial<DevVaultBrainTreasure>
): Promise<DevVaultBrainTreasure> => {
  const response = await api.post("/devvault/admin/brain-treasure", data);
  return response.data.item;
};

export const updateDevVaultBrainTreasure = async (
  id: string,
  data: Partial<DevVaultBrainTreasure>
): Promise<DevVaultBrainTreasure> => {
  const response = await api.put(`/devvault/admin/brain-treasure/${id}`, data);
  return response.data.item;
};

export const deleteDevVaultBrainTreasure = async (
  id: string
): Promise<{ message: string }> => {
  const response = await api.delete(`/devvault/admin/brain-treasure/${id}`);
  return response.data;
};

export const patchDevVaultBrainTreasureStatus = async (
  id: string,
  data: {
    status?: "draft" | "published";
    visibility?: "visible" | "hidden";
  }
): Promise<DevVaultBrainTreasure> => {
  const response = await api.patch(`/devvault/admin/brain-treasure/${id}/status`, data);
  return response.data.item;
};

// Aliases for dashboard and legacy naming
export const getAdminCategories = getAdminDevVaultCategories;
export const getCategories = getDevVaultCategories;

