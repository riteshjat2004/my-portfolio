import mongoose from "mongoose";
import DevVaultCategory from "../models/DevVaultCategory.model.js";
import DevVaultContent from "../models/DevVaultContent.model.js";
import DevVaultBrainTreasure from "../models/DevVaultBrainTreasure.model.js";
import { slugify } from "../utils/slugify.js";
import { saveToTrash } from "../utils/trash.js";
import { sendError } from "../utils/errorHandler.js";
import { uploadImageToCloudinary } from "../services/cloudinary.service.js";

// ==========================================
// IN-MEMORY RESPONSE CACHING & PERFORMANCE ACCELERATOR
// ==========================================
const devVaultMemoryCache = new Map();

export const getCachedData = (key) => {
  const item = devVaultMemoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    devVaultMemoryCache.delete(key);
    return null;
  }
  return item.data;
};

export const setCachedData = (key, data, ttlSeconds = 120) => {
  devVaultMemoryCache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  });
};

export const invalidateDevVaultCache = () => {
  devVaultMemoryCache.clear();
};

// ==========================================
// CATEGORY CONTROLLERS
// ==========================================

/**
 * Public: Consolidated Home Feed
 * Fetches categories (with counts), featured topics, recent topics, and brain treasure in ONE call.
 * Output is cached in memory for sub-10ms response times.
 */
export const getPublicHomeFeed = async (req, res) => {
  try {
    const cacheKey = "devvault_home_feed";
    const cached = getCachedData(cacheKey);
    if (cached) {
      res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
      return res.status(200).json(cached);
    }

    // 1. Fetch categories
    const categoriesPromise = DevVaultCategory.find({ visibility: "visible" })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    // 2. Fetch featured topics (strip heavy content/draft payload)
    const featuredTopicsPromise = DevVaultContent.find({
      status: "published",
      visibility: "visible",
      featured: true,
    })
      .populate("category", "name slug icon")
      .select("-content -draft")
      .sort({ ordering: 1, createdAt: -1 })
      .limit(4)
      .lean();

    // 3. Fetch recent topics (strip heavy content/draft payload)
    const recentTopicsPromise = DevVaultContent.find({
      status: "published",
      visibility: "visible",
    })
      .populate("category", "name slug icon")
      .select("-content -draft")
      .sort({ createdAt: -1, _id: -1 })
      .limit(5)
      .lean();

    // 4. Fetch brain treasure preview + total count
    const brainTreasurePromise = DevVaultBrainTreasure.find({
      status: "published",
      visibility: "visible",
    })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(5)
      .lean();

    const totalBrainTreasurePromise = DevVaultBrainTreasure.countDocuments({
      status: "published",
      visibility: "visible",
    });

    // Execute queries in parallel
    const [categories, featuredTopics, recentTopics, brainTreasure, totalBrainTreasure] =
      await Promise.all([
        categoriesPromise,
        featuredTopicsPromise,
        recentTopicsPromise,
        brainTreasurePromise,
        totalBrainTreasurePromise,
      ]);

    // Attach published content counts to each category using indexed aggregate
    const categoryIds = categories.map((c) => c._id);
    const counts = await DevVaultContent.aggregate([
      {
        $match: {
          category: { $in: categoryIds },
          status: "published",
          visibility: "visible",
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = counts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    const enrichedCategories = categories.map((cat) => ({
      ...cat,
      contentCount: countMap[cat._id.toString()] || 0,
    }));

    const responsePayload = {
      success: true,
      categories: enrichedCategories,
      featuredTopics,
      recentTopics,
      brainTreasure: {
        items: brainTreasure,
        total: totalBrainTreasure,
      },
    };

    // Cache in memory for 2 minutes
    setCachedData(cacheKey, responsePayload, 120);

    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json(responsePayload);
  } catch (error) {
    sendError(res, error, "Failed to retrieve DevVault home feed");
  }
};

/**
 * Public: Get all visible categories with published content counts
 */
export const getPublicCategories = async (req, res) => {
  try {
    const cacheKey = "devvault_categories";
    const cached = getCachedData(cacheKey);
    if (cached) {
      res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
      return res.status(200).json(cached);
    }

    const categories = await DevVaultCategory.find({ visibility: "visible" })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    // Attach published content count to each category
    const categoryIds = categories.map((c) => c._id);
    const counts = await DevVaultContent.aggregate([
      {
        $match: {
          category: { $in: categoryIds },
          status: "published",
          visibility: "visible",
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = counts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    const enrichedCategories = categories.map((cat) => ({
      ...cat,
      contentCount: countMap[cat._id.toString()] || 0,
    }));

    const responsePayload = {
      success: true,
      categories: enrichedCategories,
    };

    setCachedData(cacheKey, responsePayload, 120);
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    res.status(200).json(responsePayload);
  } catch (error) {
    sendError(res, error, "Failed to retrieve categories");
  }
};

/**
 * Public: Get single category by slug
 */
export const getPublicCategoryBySlug = async (req, res) => {
  try {
    const category = await DevVaultCategory.findOne({
      slug: req.params.slug.toLowerCase().trim(),
      visibility: "visible",
    }).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const contentCount = await DevVaultContent.countDocuments({
      category: category._id,
      status: "published",
      visibility: "visible",
    });

    res.status(200).json({
      success: true,
      category: {
        ...category,
        contentCount,
      },
    });
  } catch (error) {
    sendError(res, error, "Failed to retrieve category");
  }
};

/**
 * Admin: Get all categories (visible & hidden)
 */
export const getAdminCategories = async (req, res) => {
  try {
    const categories = await DevVaultCategory.find()
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    const categoryIds = categories.map((c) => c._id);
    const counts = await DevVaultContent.aggregate([
      {
        $match: {
          category: { $in: categoryIds },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = counts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    const enrichedCategories = categories.map((cat) => ({
      ...cat,
      contentCount: countMap[cat._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      categories: enrichedCategories,
    });
  } catch (error) {
    sendError(res, error, "Failed to retrieve admin categories");
  }
};

/**
 * Admin: Create a new category
 */
export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, icon, coverImage, displayOrder, visibility } =
      req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const generatedSlug = slugify(slug || name);
    if (!generatedSlug) {
      return res.status(400).json({
        success: false,
        message: "A valid slug could not be generated for this category",
      });
    }

    // Check duplicate slug
    const existing = await DevVaultCategory.findOne({ slug: generatedSlug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A category with slug '${generatedSlug}' already exists`,
      });
    }

    const category = await DevVaultCategory.create({
      name: name.trim(),
      slug: generatedSlug,
      description: description?.trim() || "",
      icon: icon?.trim() || "",
      coverImage: coverImage?.trim() || "",
      displayOrder: typeof displayOrder === "number" ? displayOrder : 0,
      visibility: visibility === "hidden" ? "hidden" : "visible",
    });

    invalidateDevVaultCache();

    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    sendError(res, error, "Failed to create category");
  }
};

/**
 * Admin: Update an existing category
 */
export const updateCategory = async (req, res) => {
  try {
    const category = await DevVaultCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Save previous state to trash
    await saveToTrash("devvault-category", "edit", category._id, category.toObject());

    const { name, slug, description, icon, coverImage, displayOrder, visibility } =
      req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (icon !== undefined) updates.icon = icon.trim();
    if (coverImage !== undefined) updates.coverImage = coverImage.trim();
    if (displayOrder !== undefined) updates.displayOrder = Number(displayOrder) || 0;
    if (visibility !== undefined) {
      updates.visibility = visibility === "hidden" ? "hidden" : "visible";
    }

    if (slug) {
      const newSlug = slugify(slug);
      if (newSlug !== category.slug) {
        const existing = await DevVaultCategory.findOne({
          slug: newSlug,
          _id: { $ne: category._id },
        });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: `A category with slug '${newSlug}' already exists`,
          });
        }
        updates.slug = newSlug;
      }
    }

    const updated = await DevVaultCategory.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    invalidateDevVaultCache();

    res.status(200).json({
      success: true,
      category: updated,
    });
  } catch (error) {
    sendError(res, error, "Failed to update category");
  }
};

/**
 * Admin: Delete a category (checks for active content items first)
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await DevVaultCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if category has associated content
    const contentCount = await DevVaultContent.countDocuments({
      category: category._id,
    });

    if (contentCount > 0 && req.query.force !== "true") {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It currently contains ${contentCount} content item(s). Reassign or delete them first.`,
        contentCount,
      });
    }

    await saveToTrash("devvault-category", "delete", category._id, category.toObject());

    await DevVaultCategory.findByIdAndDelete(category._id);

    invalidateDevVaultCache();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    sendError(res, error, "Failed to delete category");
  }
};

// ==========================================
// CONTENT CONTROLLERS
// ==========================================

/**
 * Public: List published, visible content items
 */
export const getPublicContent = async (req, res) => {
  try {
    const filter = {
      status: "published",
      visibility: "visible",
    };

    // Category filter: support slug or ObjectId
    if (req.query.category) {
      const catParam = String(req.query.category).trim();
      if (mongoose.Types.ObjectId.isValid(catParam)) {
        const catDoc = await DevVaultCategory.findOne({
          _id: catParam,
          visibility: "visible",
        }).select("_id");
        if (catDoc) {
          filter.category = catDoc._id;
        } else {
          return res.status(200).json({
            success: true,
            total: 0,
            content: [],
          });
        }
      } else {
        const catDoc = await DevVaultCategory.findOne({
          slug: catParam.toLowerCase(),
          visibility: "visible",
        }).select("_id");
        if (catDoc) {
          filter.category = catDoc._id;
        } else {
          return res.status(200).json({
            success: true,
            total: 0,
            content: [],
          });
        }
      }
    } else {
      // Restrict to visible categories only
      const visibleCategories = await DevVaultCategory.find({
        visibility: "visible",
      })
        .select("_id")
        .lean();
      const visibleCategoryIds = visibleCategories.map((c) => c._id);
      filter.category = { $in: visibleCategoryIds };
    }

    // ContentType filter
    if (req.query.contentType) {
      filter.contentType = String(req.query.contentType).trim().toLowerCase();
    }

    // Tag filter
    if (req.query.tag) {
      filter.tags = String(req.query.tag).trim().toLowerCase();
    }

    // Difficulty filter
    if (req.query.difficulty) {
      filter.difficulty = String(req.query.difficulty).trim().toLowerCase();
    }

    // Featured filter
    if (req.query.featured === "true") {
      filter.featured = true;
    }

    // Search query
    if (req.query.search) {
      const q = String(req.query.search).trim();
      if (q) {
        filter.$or = [
          { title: { $regex: q, $options: "i" } },
          { shortDescription: { $regex: q, $options: "i" } },
          { tags: { $in: [new RegExp(q, "i")] } },
        ];
      }
    }

    let sortObj = { featured: -1, ordering: 1, createdAt: -1 };
    if (req.query.sort === "newest") {
      sortObj = { createdAt: -1, _id: -1 };
    } else if (req.query.sort === "oldest") {
      sortObj = { createdAt: 1, _id: 1 };
    } else if (req.query.sort === "updated") {
      sortObj = { updatedAt: -1, _id: -1 };
    }

    const query = DevVaultContent.find(filter)
      .populate("category", "name slug icon")
      .sort(sortObj);

    // Exclude large body payload unless explicitly requested
    if (req.query.includeContent !== "true") {
      query.select("-content");
    }

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const [content, total] = await Promise.all([
      query.skip(skip).limit(limit).lean(),
      DevVaultContent.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      content,
    });
  } catch (error) {
    sendError(res, error, "Failed to retrieve DevVault content");
  }
};

/**
 * Public: Get single content item by slug
 */
export const getPublicContentBySlug = async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase().trim();
    const content = await DevVaultContent.findOne({
      slug,
      status: "published",
      visibility: "visible",
    })
      .populate("category", "name slug icon coverImage visibility")
      .lean();

    if (!content || !content.category || content.category.visibility === "hidden") {
      return res.status(404).json({
        success: false,
        message: "Content not found or not published",
      });
    }

    // Fetch previous, next, and related topics in same category
    const [prevTopic, nextTopic, related] = await Promise.all([
      DevVaultContent.findOne({
        category: content.category._id,
        status: "published",
        visibility: "visible",
        $or: [
          { ordering: { $lt: content.ordering } },
          { ordering: content.ordering, createdAt: { $lt: content.createdAt } },
        ],
      })
        .sort({ ordering: -1, createdAt: -1 })
        .select("title slug ordering contentType")
        .lean(),

      DevVaultContent.findOne({
        category: content.category._id,
        status: "published",
        visibility: "visible",
        $or: [
          { ordering: { $gt: content.ordering } },
          { ordering: content.ordering, createdAt: { $gt: content.createdAt } },
        ],
      })
        .sort({ ordering: 1, createdAt: 1 })
        .select("title slug ordering contentType")
        .lean(),

      DevVaultContent.find({
        _id: { $ne: content._id },
        category: content.category._id,
        status: "published",
        visibility: "visible",
      })
        .sort({ featured: -1, createdAt: -1 })
        .limit(4)
        .select("title slug shortDescription coverImage difficulty tags contentType readingTime")
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      content,
      prevTopic,
      nextTopic,
      related,
    });
  } catch (error) {
    sendError(res, error, "Failed to retrieve content item");
  }
};

/**
 * Admin: List all content items (including drafts and hidden items)
 */
export const getAdminContentList = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category && mongoose.Types.ObjectId.isValid(req.query.category)) {
      filter.category = req.query.category;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.visibility) {
      filter.visibility = req.query.visibility;
    }
    if (req.query.contentType) {
      filter.contentType = String(req.query.contentType).trim();
    }
    if (req.query.difficulty) {
      filter.difficulty = String(req.query.difficulty).trim();
    }
    if (req.query.featured === "true") {
      filter.featured = true;
    } else if (req.query.featured === "false") {
      filter.featured = false;
    }
    if (req.query.search) {
      const q = String(req.query.search).trim();
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { shortDescription: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ];
    }

    let sortObj = { createdAt: -1 };
    if (req.query.sort === "oldest") sortObj = { createdAt: 1 };
    else if (req.query.sort === "order") sortObj = { ordering: 1, createdAt: -1 };
    else if (req.query.sort === "title") sortObj = { title: 1 };
    else if (req.query.sort === "newest") sortObj = { createdAt: -1 };

    const content = await DevVaultContent.find(filter)
      .populate("category", "name slug icon")
      .select("-content")
      .sort(sortObj)
      .lean();

    res.status(200).json({
      success: true,
      total: content.length,
      content,
    });
  } catch (error) {
    sendError(res, error, "Failed to retrieve admin content list");
  }
};

/**
 * Admin: Get single content item by ID for editing
 */
export const getAdminContentById = async (req, res) => {
  try {
    const content = await DevVaultContent.findById(req.params.id)
      .populate("category", "name slug icon")
      .lean();

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    res.status(200).json({
      success: true,
      content,
    });
  } catch (error) {
    sendError(res, error, "Failed to retrieve content item");
  }
};

/**
 * Admin: Create new content item
 */
export const createContent = async (req, res) => {
  try {
    const {
      title,
      slug,
      shortDescription,
      category,
      tags,
      contentType,
      difficulty,
      status,
      visibility,
      featured,
      coverImage,
      content,
      ordering,
      readingTime,
      author,
    } = req.body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!category || !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "A valid category ID is required",
      });
    }

    // Verify category exists
    const categoryExists = await DevVaultCategory.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Referenced category does not exist",
      });
    }

    const generatedSlug = slugify(slug || title);
    if (!generatedSlug) {
      return res.status(400).json({
        success: false,
        message: "A valid slug could not be generated for this content item",
      });
    }

    // Check duplicate slug
    const existing = await DevVaultContent.findOne({ slug: generatedSlug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Content with slug '${generatedSlug}' already exists`,
      });
    }

    const validDifficulty = ["beginner", "intermediate", "advanced"].includes(
      String(difficulty).toLowerCase()
    )
      ? String(difficulty).toLowerCase()
      : "intermediate";

    const parsedReadingTime =
      Number(readingTime) >= 1 ? Math.round(Number(readingTime)) : 5;

    const newContent = await DevVaultContent.create({
      title: title.trim(),
      slug: generatedSlug,
      shortDescription: shortDescription?.trim() || "",
      category,
      tags: Array.isArray(tags)
        ? tags.map((t) => t.trim().toLowerCase()).filter(Boolean)
        : [],
      contentType: contentType?.trim() || "article",
      difficulty: validDifficulty,
      status: status === "published" ? "published" : "draft",
      visibility: visibility === "hidden" ? "hidden" : "visible",
      featured: Boolean(featured),
      coverImage: coverImage?.trim() || "",
      content: content || [],
      ordering: Number(ordering) || 0,
      readingTime: parsedReadingTime,
      author: author?.trim() || "Ritesh Jat",
    });

    invalidateDevVaultCache();

    res.status(201).json({
      success: true,
      content: newContent,
    });
  } catch (error) {
    sendError(res, error, "Failed to create DevVault content");
  }
};

/**
 * Admin: Update existing content item
 */
export const updateContent = async (req, res) => {
  try {
    const existingContent = await DevVaultContent.findById(req.params.id);
    if (!existingContent) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    const {
      title,
      slug,
      shortDescription,
      category,
      tags,
      contentType,
      difficulty,
      status,
      visibility,
      featured,
      coverImage,
      content,
      ordering,
      readingTime,
      author,
      action,
      isDraftSave,
    } = req.body;

    // 1. Action: Discard draft edits
    if (action === "discard_draft") {
      existingContent.hasDraft = false;
      existingContent.draft = null;
      await existingContent.save();
      const updated = await DevVaultContent.findById(req.params.id)
        .populate("category", "name slug icon")
        .lean();
      return res.status(200).json({
        success: true,
        message: "Draft edits discarded successfully",
        content: updated,
      });
    }

    // 2. Action: Save draft on an already-published topic
    // If the topic is currently published and the user intends to save a working draft
    const isSavingWorkingDraft =
      existingContent.status === "published" &&
      (isDraftSave === true ||
        action === "save_draft" ||
        (status === "draft" && action !== "unpublish"));

    if (isSavingWorkingDraft) {
      // Validate category if provided
      let targetCategory = existingContent.category;
      if (category) {
        if (!mongoose.Types.ObjectId.isValid(category)) {
          return res.status(400).json({
            success: false,
            message: "Invalid category ID format",
          });
        }
        const catDoc = await DevVaultCategory.findById(category);
        if (!catDoc) {
          return res.status(400).json({
            success: false,
            message: "Referenced category does not exist",
          });
        }
        targetCategory = category;
      }

      // Validate slug if provided
      let targetSlug = existingContent.slug;
      if (slug) {
        const newSlug = slugify(slug);
        if (newSlug !== existingContent.slug) {
          const duplicate = await DevVaultContent.findOne({
            slug: newSlug,
            _id: { $ne: existingContent._id },
          });
          if (duplicate) {
            return res.status(400).json({
              success: false,
              message: `Content with slug '${newSlug}' already exists`,
            });
          }
          targetSlug = newSlug;
        }
      }

      const draftPayload = {
        title: title !== undefined ? title.trim() : existingContent.title,
        slug: targetSlug,
        shortDescription:
          shortDescription !== undefined
            ? shortDescription.trim()
            : existingContent.shortDescription,
        category: targetCategory,
        tags:
          tags !== undefined
            ? Array.isArray(tags)
              ? tags.map((t) => t.trim().toLowerCase()).filter(Boolean)
              : []
            : existingContent.tags,
        contentType:
          contentType !== undefined
            ? contentType.trim()
            : existingContent.contentType,
        difficulty:
          difficulty !== undefined
            ? ["beginner", "intermediate", "advanced"].includes(
                String(difficulty).toLowerCase()
              )
              ? String(difficulty).toLowerCase()
              : "intermediate"
            : existingContent.difficulty,
        visibility:
          visibility !== undefined
            ? visibility === "hidden"
              ? "hidden"
              : "visible"
            : existingContent.visibility,
        featured:
          featured !== undefined ? Boolean(featured) : existingContent.featured,
        coverImage:
          coverImage !== undefined
            ? coverImage.trim()
            : existingContent.coverImage,
        content: content !== undefined ? content : existingContent.content,
        ordering:
          ordering !== undefined
            ? Number(ordering) || 0
            : existingContent.ordering,
        readingTime:
          readingTime !== undefined
            ? Math.max(1, Number(readingTime) || 5)
            : existingContent.readingTime,
        author: author !== undefined ? author.trim() : existingContent.author,
        updatedAt: new Date(),
      };

      existingContent.hasDraft = true;
      existingContent.draft = draftPayload;
      await existingContent.save();

      const updated = await DevVaultContent.findById(req.params.id)
        .populate("category", "name slug icon")
        .lean();

      return res.status(200).json({
        success: true,
        message: "Draft saved. Published version remains live on the website.",
        content: updated,
      });
    }

    // 3. Publishing or standard update
    // Save previous version to trash before applying live updates
    await saveToTrash(
      "devvault-content",
      "edit",
      existingContent._id,
      existingContent.toObject()
    );

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (shortDescription !== undefined) updates.shortDescription = shortDescription.trim();
    if (contentType !== undefined) updates.contentType = contentType.trim();
    if (difficulty !== undefined) {
      updates.difficulty = ["beginner", "intermediate", "advanced"].includes(
        String(difficulty).toLowerCase()
      )
        ? String(difficulty).toLowerCase()
        : "intermediate";
    }
    if (action === "unpublish") {
      updates.status = "draft";
    } else if (action === "publish_draft" || status === "published") {
      updates.status = "published";
      updates.hasDraft = false;
      updates.draft = null;
    } else if (status !== undefined) {
      updates.status = status === "published" ? "published" : "draft";
      updates.hasDraft = false;
      updates.draft = null;
    }

    if (visibility !== undefined) updates.visibility = visibility === "hidden" ? "hidden" : "visible";
    if (featured !== undefined) updates.featured = Boolean(featured);
    if (coverImage !== undefined) updates.coverImage = coverImage.trim();
    if (content !== undefined) updates.content = content;
    if (ordering !== undefined) updates.ordering = Number(ordering) || 0;
    if (readingTime !== undefined) {
      updates.readingTime = Math.max(1, Number(readingTime) || 5);
    }
    if (author !== undefined) updates.author = author.trim();

    if (tags !== undefined) {
      updates.tags = Array.isArray(tags)
        ? tags.map((t) => t.trim().toLowerCase()).filter(Boolean)
        : [];
    }

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID format",
        });
      }
      const catDoc = await DevVaultCategory.findById(category);
      if (!catDoc) {
        return res.status(400).json({
          success: false,
          message: "Referenced category does not exist",
        });
      }
      updates.category = category;
    }

    if (slug) {
      const newSlug = slugify(slug);
      if (newSlug !== existingContent.slug) {
        const duplicate = await DevVaultContent.findOne({
          slug: newSlug,
          _id: { $ne: existingContent._id },
        });
        if (duplicate) {
          return res.status(400).json({
            success: false,
            message: `Content with slug '${newSlug}' already exists`,
          });
        }
        updates.slug = newSlug;
      }
    }

    const updated = await DevVaultContent.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("category", "name slug icon");

    invalidateDevVaultCache();

    res.status(200).json({
      success: true,
      message: updates.status === "published" ? "Published successfully!" : "Updated successfully!",
      content: updated,
    });
  } catch (error) {
    sendError(res, error, "Failed to update content item");
  }
};

/**
 * Admin: Delete a content item
 */
export const deleteContent = async (req, res) => {
  try {
    const content = await DevVaultContent.findById(req.params.id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    await saveToTrash("devvault-content", "delete", content._id, content.toObject());

    await DevVaultContent.findByIdAndDelete(content._id);

    invalidateDevVaultCache();

    res.status(200).json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    sendError(res, error, "Failed to delete content item");
  }
};

/**
 * Admin: Quick status / visibility toggle
 */
export const patchContentStatus = async (req, res) => {
  try {
    const { status, visibility, featured } = req.body;
    const updates = {};
    if (status !== undefined) updates.status = status === "published" ? "published" : "draft";
    if (visibility !== undefined) updates.visibility = visibility === "hidden" ? "hidden" : "visible";
    if (featured !== undefined) updates.featured = Boolean(featured);

    const updated = await DevVaultContent.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    invalidateDevVaultCache();

    res.status(200).json({
      success: true,
      content: updated,
    });
  } catch (error) {
    sendError(res, error, "Failed to patch content status");
  }
};

/**
 * Admin: Upload image to Cloudinary for DevVault
 */
export const uploadDevVaultImage = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "No image file provided in upload request",
      });
    }

    const uploadResult = await uploadImageToCloudinary(
      req.file.buffer,
      "portfolio/devvault"
    );

    res.status(200).json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    });
  } catch (error) {
    sendError(res, error, "Failed to upload image to Cloudinary");
  }
};

// ==========================================
// BRAIN TREASURE CONTROLLERS
// ==========================================

/**
 * Public: Get published and visible Brain Treasure questions
 * Enforces server-side status='published' AND visibility='visible'
 */
export const getPublicBrainTreasure = async (req, res) => {
  try {
    const filter = {
      status: "published",
      visibility: "visible",
    };

    if (req.query.technicalBackground && req.query.technicalBackground !== "all") {
      filter.technicalBackground = {
        $regex: new RegExp(`^${String(req.query.technicalBackground).trim()}$`, "i"),
      };
    }

    if (req.query.difficulty && req.query.difficulty !== "all") {
      filter.difficulty = String(req.query.difficulty).toLowerCase().trim();
    }

    if (req.query.search) {
      const q = String(req.query.search).trim();
      if (q) {
        filter.$or = [
          { question: { $regex: q, $options: "i" } },
          { technicalBackground: { $regex: q, $options: "i" } },
          { answer: { $regex: q, $options: "i" } },
        ];
      }
    }

    const limit = Math.min(Number(req.query.limit) || 100, 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const [items, total, technicalBackgrounds] = await Promise.all([
      DevVaultBrainTreasure.find(filter)
        .sort({ displayOrder: 1, createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DevVaultBrainTreasure.countDocuments(filter),
      DevVaultBrainTreasure.distinct("technicalBackground", {
        status: "published",
        visibility: "visible",
      }),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      items,
      technicalBackgrounds: technicalBackgrounds.filter(Boolean).sort(),
    });
  } catch (error) {
    sendError(res, error, "Failed to retrieve Brain Treasure questions");
  }
};

/**
 * Public: Get single Brain Treasure question by ID
 */
export const getPublicBrainTreasureById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const item = await DevVaultBrainTreasure.findOne({
      _id: req.params.id,
      status: "published",
      visibility: "visible",
    }).lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Question not found or not published",
      });
    }

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    sendError(res, error, "Failed to retrieve Brain Treasure question");
  }
};

/**
 * Admin: Get all Brain Treasure questions (includes drafts/hidden)
 */
export const getAdminBrainTreasureList = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }
    if (req.query.visibility && req.query.visibility !== "all") {
      filter.visibility = req.query.visibility;
    }
    if (req.query.difficulty && req.query.difficulty !== "all") {
      filter.difficulty = req.query.difficulty;
    }
    if (req.query.technicalBackground && req.query.technicalBackground !== "all") {
      filter.technicalBackground = {
        $regex: new RegExp(`^${String(req.query.technicalBackground).trim()}$`, "i"),
      };
    }

    if (req.query.search) {
      const q = String(req.query.search).trim();
      if (q) {
        filter.$or = [
          { question: { $regex: q, $options: "i" } },
          { technicalBackground: { $regex: q, $options: "i" } },
          { answer: { $regex: q, $options: "i" } },
        ];
      }
    }

    const [items, total, technicalBackgrounds] = await Promise.all([
      DevVaultBrainTreasure.find(filter)
        .sort({ displayOrder: 1, createdAt: -1, _id: -1 })
        .lean(),
      DevVaultBrainTreasure.countDocuments(filter),
      DevVaultBrainTreasure.distinct("technicalBackground"),
    ]);

    res.status(200).json({
      success: true,
      total,
      items,
      technicalBackgrounds: technicalBackgrounds.filter(Boolean).sort(),
    });
  } catch (error) {
    sendError(res, error, "Failed to retrieve admin Brain Treasure questions");
  }
};

/**
 * Admin: Create a new Brain Treasure question
 */
export const createBrainTreasure = async (req, res) => {
  try {
    const {
      questionNumber,
      question,
      answer,
      technicalBackground,
      difficulty,
      status,
      visibility,
      displayOrder,
    } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question text is required",
      });
    }

    if (!answer || typeof answer !== "string" || !answer.trim()) {
      return res.status(400).json({
        success: false,
        message: "Answer text is required",
      });
    }

    if (!technicalBackground || typeof technicalBackground !== "string" || !technicalBackground.trim()) {
      return res.status(400).json({
        success: false,
        message: "Technical background is required",
      });
    }

    const num = Number(questionNumber);
    if (isNaN(num) || num < 1) {
      return res.status(400).json({
        success: false,
        message: "A valid question number (>= 1) is required",
      });
    }

    const newItem = await DevVaultBrainTreasure.create({
      questionNumber: Math.round(num),
      question: question.trim(),
      answer: answer.trim(),
      technicalBackground: technicalBackground.trim(),
      difficulty: ["beginner", "intermediate", "advanced"].includes(difficulty)
        ? difficulty
        : "intermediate",
      status: status === "published" ? "published" : "draft",
      visibility: visibility === "hidden" ? "hidden" : "visible",
      displayOrder: Number(displayOrder) || 0,
    });

    invalidateDevVaultCache();

    res.status(201).json({
      success: true,
      item: newItem,
    });
  } catch (error) {
    sendError(res, error, "Failed to create Brain Treasure question");
  }
};

/**
 * Admin: Update an existing Brain Treasure question
 */
export const updateBrainTreasure = async (req, res) => {
  try {
    const item = await DevVaultBrainTreasure.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Brain Treasure question not found",
      });
    }

    // Save previous state to trash
    await saveToTrash("devvault-brain-treasure", "edit", item._id, item.toObject());

    const {
      questionNumber,
      question,
      answer,
      technicalBackground,
      difficulty,
      status,
      visibility,
      displayOrder,
    } = req.body;

    const updates = {};
    if (question !== undefined) updates.question = question.trim();
    if (answer !== undefined) updates.answer = answer.trim();
    if (technicalBackground !== undefined) updates.technicalBackground = technicalBackground.trim();
    if (difficulty !== undefined && ["beginner", "intermediate", "advanced"].includes(difficulty)) {
      updates.difficulty = difficulty;
    }
    if (status !== undefined) {
      updates.status = status === "published" ? "published" : "draft";
    }
    if (visibility !== undefined) {
      updates.visibility = visibility === "hidden" ? "hidden" : "visible";
    }
    if (questionNumber !== undefined) {
      const num = Number(questionNumber);
      if (!isNaN(num) && num >= 1) {
        updates.questionNumber = Math.round(num);
      }
    }
    if (displayOrder !== undefined) {
      updates.displayOrder = Number(displayOrder) || 0;
    }

    const updated = await DevVaultBrainTreasure.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    invalidateDevVaultCache();

    res.status(200).json({
      success: true,
      item: updated,
    });
  } catch (error) {
    sendError(res, error, "Failed to update Brain Treasure question");
  }
};

/**
 * Admin: Delete a Brain Treasure question
 */
export const deleteBrainTreasure = async (req, res) => {
  try {
    const item = await DevVaultBrainTreasure.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Brain Treasure question not found",
      });
    }

    // Save to trash
    await saveToTrash("devvault-brain-treasure", "delete", item._id, item.toObject());

    await DevVaultBrainTreasure.findByIdAndDelete(req.params.id);

    invalidateDevVaultCache();

    res.status(200).json({
      success: true,
      message: "Brain Treasure question deleted successfully",
    });
  } catch (error) {
    sendError(res, error, "Failed to delete Brain Treasure question");
  }
};

/**
 * Admin: Quick status / visibility patch for Brain Treasure
 */
export const patchBrainTreasureStatus = async (req, res) => {
  try {
    const { status, visibility } = req.body;
    const updates = {};
    if (status !== undefined) updates.status = status === "published" ? "published" : "draft";
    if (visibility !== undefined) updates.visibility = visibility === "hidden" ? "hidden" : "visible";

    const updated = await DevVaultBrainTreasure.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Brain Treasure question not found",
      });
    }

    invalidateDevVaultCache();

    res.status(200).json({
      success: true,
      item: updated,
    });
  } catch (error) {
    sendError(res, error, "Failed to patch Brain Treasure status");
  }
};

