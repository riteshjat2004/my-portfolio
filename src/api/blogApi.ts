import api from "./axios";
import { Blog } from "@/types/blog";

export interface GetBlogsParams {
  all?: boolean;
  status?: string;
  includeContent?: boolean;
}

export const getBlogs = async (params?: GetBlogsParams): Promise<Blog[]> => {
  const response = await api.get("/blogs", { params });
  return response.data;
};

export const getAdminBlogs = async (): Promise<Blog[]> => {
  return getBlogs({ all: true, includeContent: true });
};

export const getBlogBySlug = async (
  slug: string
): Promise<Blog> => {
  const response = await api.get(
    `/blogs/${slug}`
  );

  return response.data;
};

export const createBlog = async (
  data: Omit<Blog, "_id">
) => {
  const response = await api.post(
    "/blogs",
    data
  );

  return response.data;
};

export const updateBlog = async (
  id: string,
  data: Partial<Omit<Blog, "_id">>
) => {
  const response = await api.put(
    `/blogs/${id}`,
    data
  );

  return response.data;
};

export const deleteBlog = async (
  id: string
) => {
  const response = await api.delete(
    `/blogs/${id}`
  );

  return response.data;
};