import Project from "../models/Project.model.js";
import { saveToTrash } from "../utils/trash.js";

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find();

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createProject = async (req, res) => {
  try {
    const project = await Project.create(
      req.body
    );

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Save original document to trash before updating
    await saveToTrash("project", "edit", project._id, project.toObject());

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json(updatedProject);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Save original document to trash before deleting
    await saveToTrash("project", "delete", project._id, project.toObject());

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Project deleted",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getFeaturedProjects =
  async (req, res) => {
    try {

      const projects =
        await Project.find({
          featured: true,
        });

      res.status(200).json(
        projects
      );

    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
};