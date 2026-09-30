export interface ProjectArchitecture {
  client?: string;
  api?: string;
  database?: string;
  caching?: string;
  deployment?: string;
  notes?: string[];
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  github: string;
  demo: string;
  featured: boolean;
  category?: string;
  highlights?: string[];
  architecture?: ProjectArchitecture;
}