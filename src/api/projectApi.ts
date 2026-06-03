import api from "./axios";
import { Project } from "@/types/project";

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get("/projects");

  return response.data;
};