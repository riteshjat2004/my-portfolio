// Re-export consolidated blog APIs for backwards compatibility
export {
  getBlogs,
  getAdminBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} from "./blogApi";