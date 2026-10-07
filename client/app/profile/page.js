"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../../services/authService";
import { getAvatarColor, getInitials } from "../../lib/utils";
import { ChevronLeft, Mail, AtSign, User, Shield, Sparkles } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data.user || data);
      } catch (error) {
        console.error("Failed to load profile:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-violet-400">
        <p className="text-sm">Loading profile...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <p className="text-sm">Unable to load profile.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 flex items-center justify-center font-sans">
      <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/chat"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors p-2 -ml-2 rounded-xl hover:bg-zinc-800"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Chat</span>
          </Link>
          <span className="text-xs text-zinc-500 font-mono">ID: {user._id?.slice(-6)}</span>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-violet-500/30"
              />
            ) : (
              <div
                className={`w-24 h-24 rounded-3xl bg-gradient-to-tr ${getAvatarColor(
                  user._id || "me"
                )} flex items-center justify-center text-white text-3xl font-bold shadow-xl ring-4 ring-violet-500/30`}
              >
                {getInitials(user.name)}
              </div>
            )}
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-zinc-900" />
          </div>

          <h1 className="mt-4 text-xl font-bold text-zinc-100">{user.name}</h1>
          <p className="text-xs text-zinc-400">@{user.username}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
            <User className="w-5 h-5 text-violet-400" />
            <div>
              <p className="text-[11px] text-zinc-400 font-semibold uppercase">Full Name</p>
              <p className="text-sm font-medium text-zinc-200">{user.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
            <AtSign className="w-5 h-5 text-violet-400" />
            <div>
              <p className="text-[11px] text-zinc-400 font-semibold uppercase">Username</p>
              <p className="text-sm font-medium text-zinc-200">@{user.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
            <Mail className="w-5 h-5 text-violet-400" />
            <div>
              <p className="text-[11px] text-zinc-400 font-semibold uppercase">Email</p>
              <p className="text-sm font-medium text-zinc-200">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-zinc-800 flex justify-end">
          <Link
            href="/chat"
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all"
          >
            Open Chat
          </Link>
        </div>
      </div>
    </main>
  );
}
