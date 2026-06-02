import Blog from "../models/Blog.model.js";

export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({
      createdAt: -1,
    });

    res.status(200).json(blogs);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createBlog = async (req, res) => {
  try {
    const blog = await Blog.create(
      req.body
    );

    res.status(201).json(blog);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};