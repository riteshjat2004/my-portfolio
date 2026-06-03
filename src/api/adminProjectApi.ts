import api from "./axios";

export const getAdminProjects =
  async () => {
    const response =
      await api.get("/projects");

    return response.data;
  };

export const deleteProject =
  async (id: string) => {

    const token =
      localStorage.getItem(
        "token"
      );

    const response =
      await api.delete(
        `/projects/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return response.data;
  };

  export const createProject = async (
  projectData: {
    title: string;
    description: string;
    technologies: string[];
    github: string;
    demo: string;
    featured: boolean;
  }
) => {
  const token =
    localStorage.getItem("token");

  const response =
    await api.post(
      "/projects",
      projectData,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

  return response.data;
};

export const updateProject = async (
  id: string,
  projectData: {
    title: string;
    description: string;
    technologies: string[];
    github: string;
    demo: string;
    featured: boolean;
  }
) => {

  const token =
    localStorage.getItem("token");

  const response =
    await api.put(
      `/projects/${id}`,
      projectData,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

  return response.data;
};