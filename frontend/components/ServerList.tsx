"use client";

import { useCallback, useEffect, useState } from "react";
import api from "../lib/api";
import { AddServerModal } from "./AddServerModal";

type Server = {
  id: string;
  name: string;
  ip_address: string;
  path: string;
};

export function ServerList() {
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchServers = useCallback(async () => {
    setError("");

    try {
      const response = await api.get<Server[]>("/servers");
      setServers(response.data);
    } catch (_error) {
      setError("Unable to load servers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchServers();
  }, [fetchServers]);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your servers</h1>
          <p className="mt-1 text-sm text-slate-600">Servers available for deployment.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Add server
        </button>
      </div>

      {isLoading ? (
        <p className="mt-8 text-sm text-slate-600">Loading servers...</p>
      ) : error ? (
        <div className="mt-8 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button type="button" onClick={fetchServers} className="ml-3 font-medium underline">
            Retry
          </button>
        </div>
      ) : servers.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No servers yet. Add one to create your first deployment.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {servers.map((server) => (
            <article key={server.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="truncate text-lg font-semibold text-slate-900">{server.name}</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-slate-500">IP address</dt>
                  <dd className="mt-1 font-mono text-slate-800">{server.ip_address}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Path</dt>
                  <dd className="mt-1 break-all font-mono text-slate-800">{server.path}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}

      {isAddModalOpen && (
        <AddServerModal
          onClose={() => setIsAddModalOpen(false)}
          onServerAdded={fetchServers}
        />
      )}
    </section>
  );
}
