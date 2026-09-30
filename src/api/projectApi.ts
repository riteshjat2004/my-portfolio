import api from "./axios";
import { Project } from "@/types/project";

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get("/projects");
  return response.data;
};

export const getAdminProjects = getProjects;

export const createProject = async (
  projectData: Omit<Project, "_id">
): Promise<Project> => {
  const response = await api.post("/projects", projectData);
  return response.data;
};

export const updateProject = async (
  id: string,
  projectData: Partial<Omit<Project, "_id">>
): Promise<Project> => {
  const response = await api.put(`/projects/${id}`, projectData);
  return response.data;
};

export const deleteProject = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};