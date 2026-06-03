export interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  github: string;
  demo: string;
  featured: boolean;
}