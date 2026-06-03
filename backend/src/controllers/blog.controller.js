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

export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
    });

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    res.status(200).json(blog);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    res.status(200).json(blog);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteBlog = async (req, res) => {
  try {

    const blog =
      await Blog.findByIdAndDelete(
        req.params.id
      );

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    res.status(200).json({
      message: "Blog deleted",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};