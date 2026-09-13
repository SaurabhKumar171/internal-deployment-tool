"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ServerList } from "../../components/ServerList";
import api from "../../lib/api";

type Server = {
  id: string;
  name: string;
};

type Deployment = {
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  branch: string;
  logs: string | null;
};

const terminalStatusStyles = {
  PENDING: "border-amber-400/50 bg-amber-400/10 text-amber-300",
  IN_PROGRESS: "border-sky-400/50 bg-sky-400/10 text-sky-300",
  COMPLETED: "border-emerald-400/50 bg-emerald-400/10 text-emerald-300",
  FAILED: "border-red-400/50 bg-red-400/10 text-red-300",
};

export default function DashboardPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [serverId, setServerId] = useState("");
  const [branch, setBranch] = useState("main");
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [error, setError] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const fetchServers = useCallback(async () => {
    try {
      const response = await api.get<Server[]>("/servers");
      setServers(response.data);
      setServerId((currentServerId) => currentServerId || response.data[0]?.id || "");
    } catch (_error) {
      setError("Unable to load servers for deployment.");
    }
  }, []);

  useEffect(() => {
    void fetchServers();
    return stopPolling;
  }, [fetchServers, stopPolling]);

  async function pollDeployment(eventId: string) {
    try {
      const response = await api.get<Deployment>(`/deploy/${eventId}`);
      setDeployment(response.data);

      if (response.data.status === "COMPLETED" || response.data.status === "FAILED") {
        stopPolling();
        setIsDeploying(false);
        return true;
      }

      return false;
    } catch (_error) {
      stopPolling();
      setIsDeploying(false);
      setError("Unable to retrieve the deployment status.");
      return true;
    }
  }

  async function handleDeploy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!serverId || !branch.trim()) {
      setError("Select a server and provide a branch name.");
      return;
    }

    setError("");
    setDeployment({ status: "PENDING", branch: branch.trim(), logs: null });
    setIsDeploying(true);
    stopPolling();

    try {
      const response = await api.post<{ deploymentId: string }>("/deploy", {
        server_id: serverId,
        branch: branch.trim(),
      });
      const eventId = response.data.deploymentId;

      const isTerminal = await pollDeployment(eventId);
      if (!isTerminal) {
        intervalRef.current = setInterval(() => {
          void pollDeployment(eventId);
        }, 2000);
      }
    } catch (_error) {
      setIsDeploying(false);
      setError("Unable to start the deployment.");
    }
  }

  return (
    <main className="bg-slate-50 pb-12">
      <section className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">New Deployment</h1>
          <p className="mt-1 text-sm text-slate-600">Choose a server and branch to deploy.</p>

          <form onSubmit={handleDeploy} className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="block text-sm font-medium text-slate-700">
              Server
              <select
                value={serverId}
                onChange={(event) => setServerId(event.target.value)}
                required
                disabled={isDeploying || servers.length === 0}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              >
                {servers.length === 0 ? (
                  <option value="">No servers available</option>
                ) : (
                  servers.map((server) => (
                    <option key={server.id} value={server.id}>
                      {server.name}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Branch
              <input
                value={branch}
                onChange={(event) => setBranch(event.target.value)}
                required
                disabled={isDeploying}
                placeholder="main"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              />
            </label>

            <button
              type="submit"
              disabled={isDeploying || servers.length === 0}
              className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeploying ? "Deploying..." : "Deploy"}
            </button>
          </form>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <section className="mt-6 overflow-hidden rounded-lg border border-slate-800 bg-black shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <span className="font-mono text-xs text-slate-400">deployment.log</span>
              {deployment && (
                <span
                  className={`rounded-full border px-2 py-1 font-mono text-xs font-semibold ${terminalStatusStyles[deployment.status]}`}
                >
                  {deployment.status}
                </span>
              )}
            </div>
            <pre className="min-h-40 whitespace-pre-wrap p-4 font-mono text-sm leading-6 text-emerald-400">
              {deployment?.logs ||
                (deployment
                  ? `Deployment for branch ${deployment.branch} is ${deployment.status.toLowerCase()}...`
                  : "Waiting for a deployment to start...")}
            </pre>
          </section>
        </div>
      </section>

      <ServerList />
    </main>
  );
}
