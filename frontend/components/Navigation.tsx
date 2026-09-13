"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function Navigation() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <Link href="/" className="text-lg font-semibold text-slate-900">
        Deployment Dashboard
      </Link>

      {isAuthenticated && user ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{user.email}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link
            href="/login"
            className="text-slate-700 transition hover:text-slate-950"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-700"
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}
