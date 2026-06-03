import api from "./axios";
import { ContactFormData } from "@/types/contact";

export const sendContactMessage = async (
  data: ContactFormData
) => {
  const response = await api.post(
    "/contact",
    data
  );

  return response.data;
};