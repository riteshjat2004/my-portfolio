"use client";

import { useEffect, useState } from "react";
import {
  getContacts,
  deleteContact,
} from "@/api/contactApi";
import { Contact } from "@/types/contact";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function ContactPage() {
  useProtectedRoute();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchContacts = async () => {
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteContact(id);
      setContacts((prev) =>
        prev.filter((contact) => contact._id !== id)
      );
      setDeleteConfirm(null);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p>Loading messages...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <h1 className="mb-10 text-4xl font-bold">
        Contact Messages
      </h1>

      {contacts.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div
              key={contact._id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 p-5"
            >
              <div>
                <h2 className="font-semibold">
                  {contact.name}
                </h2>

                <p className="text-zinc-400">
                  {contact.email}
                </p>

                <p className="mt-2 text-zinc-400">
                  {contact.message.length > 100
                    ? contact.message.slice(0, 100) + "..."
                    : contact.message}
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  {new Date(contact.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedContact(contact)}
                  className="rounded-lg bg-cyan-500 px-4 py-2"
                >
                  View
                </button>

                <button
                  onClick={() => setDeleteConfirm(contact._id)}
                  className="rounded-lg bg-red-500 px-4 py-2"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl border border-zinc-800 p-6 max-w-sm w-full bg-black">
            <h2 className="text-2xl font-bold mb-2">Delete Message</h2>
            <p className="text-zinc-400 mb-6">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 rounded-lg border border-zinc-800 px-4 py-2 font-medium transition hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl border border-zinc-800 p-6 max-w-sm w-full bg-black">
            <h2 className="text-2xl font-bold mb-4">Message Details</h2>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-zinc-400 mb-1">Name</p>
                <p className="text-white">
                  {selectedContact.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-400 mb-1">Email</p>
                <a
                  href={`mailto:${selectedContact.email}`}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  {selectedContact.email}
                </a>
              </div>

              <div>
                <p className="text-sm text-zinc-400 mb-1">Message</p>
                <p className="text-zinc-300 whitespace-pre-wrap">
                  {selectedContact.message}
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-400 mb-1">Date</p>
                <p className="text-zinc-300">
                  {new Date(selectedContact.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedContact(null)}
                className="flex-1 rounded-lg border border-zinc-800 px-4 py-2 font-medium transition hover:bg-zinc-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedContact(null);
                  setDeleteConfirm(selectedContact._id);
                }}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}