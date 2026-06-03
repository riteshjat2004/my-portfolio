import api from "./axios";
import { Blog } from "@/types/blog";

export const getBlogs = async (): Promise<Blog[]> => {
  const response = await api.get("/blogs");
  return response.data;
};

export const getBlogBySlug = async (
  slug: string
): Promise<Blog> => {
  const response = await api.get(
    `/blogs/${slug}`
  );

  return response.data;
};