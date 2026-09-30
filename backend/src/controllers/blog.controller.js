import Blog from "../models/Blog.model.js";
import { saveToTrash } from "../utils/trash.js";
import { sendError } from "../utils/errorHandler.js";

export const getBlogs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status !== "all" && req.query.all !== "true") {
      filter.published = true;
    }

    const query = Blog.find(filter).sort({ createdAt: -1 });

    if (req.query.includeContent !== "true") {
      query.select("-content");
    }

    const blogs = await query;
    res.status(200).json(blogs);
  } catch (error) {
    sendError(res, error, "Failed to retrieve blogs");
  }
};

export const createBlog = async (req, res) => {
  try {
    const blog = await Blog.create(req.body);
    res.status(201).json(blog);
  } catch (error) {
    sendError(res, error, "Failed to create blog");
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const filter = { slug: req.params.slug };
    if (req.query.preview !== "true") {
      filter.published = true;
    }

    const blog = await Blog.findOne(filter);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    res.status(200).json(blog);
  } catch (error) {
    sendError(res, error, "Failed to retrieve blog");
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    // Save original document to trash before updating
    await saveToTrash("blog", "edit", blog._id, blog.toObject());

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json(updatedBlog);
  } catch (error) {
    sendError(res, error, "Failed to update blog");
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    await saveToTrash("blog", "delete", blog._id, blog.toObject());

    await Blog.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Blog deleted",
    });
  } catch (error) {
    sendError(res, error, "Failed to delete blog");
  }
};