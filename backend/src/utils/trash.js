import Trash from "../models/Trash.model.js";

export const saveToTrash = async (entityType, action, originalId, data) => {
  try {
    await Trash.create({
      entityType,
      action,
      originalId,
      data,
    });
  } catch (error) {
    console.error(`Failed to save ${entityType} to trash:`, error.message);
  }
};
