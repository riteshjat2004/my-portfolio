export type DevVaultVisibility = "visible" | "hidden";
export type DevVaultStatus = "draft" | "published";
export type DevVaultDifficulty = "beginner" | "intermediate" | "advanced";

// ==========================================
// BLOCK DEFINITIONS
// ==========================================

export type DevVaultBlockType =
  // Text
  | "heading"
  | "paragraph"
  | "quote"
  // Technical
  | "code"
  | "command"
  | "terminal"
  | "table"
  // Educational
  | "note"
  | "tip"
  | "warning"
  | "important"
  | "definition"
  | "concept"
  | "step"
  | "checklist"
  // Media
  | "image"
  | "gallery"
  // Navigation / Reference
  | "link"
  | "reference"
  | "related"
  // Markdown
  | "markdown";

export interface HeadingBlockData {
  level: 2 | 3 | 4;
  text: string;
}

export interface ParagraphBlockData {
  text: string;
}

export interface QuoteBlockData {
  text: string;
  author?: string;
  source?: string;
}

export interface CodeBlockData {
  language: string;
  code: string;
  title?: string;
  showLineNumbers?: boolean;
}

export interface CommandBlockData {
  command: string;
  description?: string;
  cwd?: string;
}

export interface TerminalBlockData {
  output: string;
  command?: string;
}

export interface TableBlockData {
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface CalloutBlockData {
  title?: string;
  text: string;
}

export interface DefinitionBlockData {
  term: string;
  definition: string;
  context?: string;
}

export interface ConceptBlockData {
  title: string;
  explanation: string;
  analogy?: string;
  keyPoints?: string[];
}

export interface StepBlockData {
  stepNumber: number;
  title: string;
  description: string;
  code?: string;
  language?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done?: boolean;
}

export interface ChecklistBlockData {
  items: ChecklistItem[];
}

export interface ImageBlockData {
  url: string;
  caption?: string;
  alt?: string;
  aspectRatio?: string;
}

export interface GalleryImageItem {
  id: string;
  url: string;
  caption?: string;
  alt?: string;
}

export interface GalleryBlockData {
  images: GalleryImageItem[];
}

export interface LinkBlockData {
  url: string;
  title: string;
  description?: string;
}

export interface ReferenceBlockData {
  title: string;
  citation: string;
  url?: string;
}

export interface RelatedBlockData {
  title: string;
  slug?: string;
  description?: string;
}

export interface MarkdownBlockData {
  markdown: string;
}

export interface DevVaultBlock {
  id: string;
  type: DevVaultBlockType;
  data:
    | HeadingBlockData
    | ParagraphBlockData
    | QuoteBlockData
    | CodeBlockData
    | CommandBlockData
    | TerminalBlockData
    | TableBlockData
    | CalloutBlockData
    | DefinitionBlockData
    | ConceptBlockData
    | StepBlockData
    | ChecklistBlockData
    | ImageBlockData
    | GalleryBlockData
    | LinkBlockData
    | ReferenceBlockData
    | RelatedBlockData
    | MarkdownBlockData
    | Record<string, unknown>;
}

// ==========================================
// CORE ENTITIES
// ==========================================

export interface DevVaultCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  coverImage?: string;
  displayOrder: number;
  visibility: DevVaultVisibility;
  contentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DevVaultContent {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  category: DevVaultCategory | string;
  tags: string[];
  contentType: string;
  difficulty?: DevVaultDifficulty;
  status: DevVaultStatus;
  visibility: DevVaultVisibility;
  featured: boolean;
  coverImage?: string;
  content: DevVaultBlock[] | string | Record<string, unknown> | null;
  ordering: number;
  readingTime?: number;
  author: string;
  hasDraft?: boolean;
  draft?: Partial<DevVaultContent> | null;
  createdAt: string;
  updatedAt: string;
}

export interface DevVaultContentFilterParams {
  category?: string;
  contentType?: string;
  difficulty?: string;
  status?: string;
  visibility?: string;
  tag?: string;
  featured?: boolean;
  search?: string;
  sort?: "newest" | "oldest" | "order" | "title";
  includeContent?: boolean;
  page?: number;
  limit?: number;
}

export interface DevVaultDetailResponse {
  content: DevVaultContent;
  prevTopic?: { title: string; slug: string; ordering: number; contentType: string } | null;
  nextTopic?: { title: string; slug: string; ordering: number; contentType: string } | null;
  related?: DevVaultContent[];
}

export interface DevVaultBrainTreasure {
  _id: string;
  questionNumber: number;
  question: string;
  answer: string;
  technicalBackground: string;
  difficulty: DevVaultDifficulty;
  status: DevVaultStatus;
  visibility: DevVaultVisibility;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DevVaultBrainTreasureFilterParams {
  technicalBackground?: string;
  difficulty?: string;
  status?: string;
  visibility?: string;
  search?: string;
  page?: number;
  limit?: number;
}


