import api from "./axios";
import { Contact } from "@/types/contact";

export const sendContactMessage = async (
  data: Contact
) => {
  const response = await api.post(
    "/contact",
    data
  );

  return response.data;
};

export const getContacts = async (): Promise<
  Contact[]
> => {
  const response = await api.get("/contact");

  return response.data.contacts;
};

export const deleteContact = async (
  id: string
) => {
  const response = await api.delete(
    `/contact/${id}`
  );

  return response.data;
};