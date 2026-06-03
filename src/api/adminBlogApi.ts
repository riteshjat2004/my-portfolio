import api from "./axios";

export const getAdminBlogs =
  async () => {

    const response =
      await api.get("/blogs");

    return response.data;
  };

export const createBlog =
  async (blogData: any) => {

    const token =
      localStorage.getItem(
        "token"
      );

    const response =
      await api.post(
        "/blogs",
        blogData,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return response.data;
  };

export const updateBlog =
  async (
    id: string,
    blogData: any
  ) => {

    const token =
      localStorage.getItem(
        "token"
      );

    const response =
      await api.put(
        `/blogs/${id}`,
        blogData,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return response.data;
  };

export const deleteBlog =
  async (id: string) => {

    const token =
      localStorage.getItem(
        "token"
      );

    const response =
      await api.delete(
        `/blogs/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return response.data;
  };