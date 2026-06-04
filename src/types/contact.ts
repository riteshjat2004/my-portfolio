// Contact form submission data
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

// Contact document from MongoDB
export interface Contact extends ContactFormData {
  _id: string;
  createdAt: string;
  updatedAt: string;
}