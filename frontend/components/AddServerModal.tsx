"use client";

import { useState, type FormEvent } from "react";
import api from "../lib/api";

type AddServerModalProps = {
  onClose: () => void;
  onServerAdded: () => Promise<void> | void;
};

export function AddServerModal({ onClose, onServerAdded }: AddServerModalProps) {
  const [name, setName] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [path, setPath] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await api.post("/servers", {
        name,
        ip_address: ipAddress,
        path,
      });
      await onServerAdded();
      onClose();
    } catch (_error) {
      setError("Unable to add the server. Please check the details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-server-title"
    >
      <section className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="add-server-title" className="text-xl font-bold text-slate-900">
              Add server
            </h2>
            <p className="mt-1 text-sm text-slate-600">Connect a server for deployments.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-slate-500 hover:text-slate-900"
            aria-label="Close add server dialog"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Server name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder="production-web-1"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            IP address
            <input
              value={ipAddress}
              onChange={(event) => setIpAddress(event.target.value)}
              required
              placeholder="192.0.2.10"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Deployment path
            <input
              value={path}
              onChange={(event) => setPath(event.target.value)}
              required
              placeholder="/var/www/app"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Adding..." : "Add server"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
