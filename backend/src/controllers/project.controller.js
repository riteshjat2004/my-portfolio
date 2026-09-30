import Project from "../models/Project.model.js";
import { saveToTrash } from "../utils/trash.js";
import { sendError } from "../utils/errorHandler.js";

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ featured: -1, createdAt: -1 });

    res.status(200).json(projects);
  } catch (error) {
    sendError(res, error, "Failed to retrieve projects");
  }
};

export const createProject = async (req, res) => {
  try {
    const project = await Project.create(
      req.body
    );

    res.status(201).json(project);
  } catch (error) {
    sendError(res, error, "Failed to create project");
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
    sendError(res, error, "Failed to update project");
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
    sendError(res, error, "Failed to delete project");
  }
};

export const getFeaturedProjects =
  async (req, res) => {
    try {

      const projects =
        await Project.find({
          featured: true,
        }).sort({ createdAt: -1 });

      res.status(200).json(
        projects
      );

    } catch (error) {
      sendError(res, error, "Failed to retrieve featured projects");
    }
};