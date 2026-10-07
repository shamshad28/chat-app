"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "../../services/authService";
import useAuthStore from "../../store/authStore";
import { MessageSquare, User, AtSign, Mail, Lock, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.username.trim() || !form.email.trim() || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const data = await registerUser({
        name: form.name.trim(),
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      setUser(data.user);
      router.push("/chat");
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      if (serverMsg) {
        setError(serverMsg);
      } else if (err.code === "ECONNABORTED" || !err.response) {
        setError("Cannot connect to server. Please make sure the backend server is running.");
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-screen flex flex-col items-center justify-center p-4 bg-[#eae6df] text-[#111b21] overflow-hidden font-sans">
      {/* WhatsApp Signature Top Green Banner */}
      <div className="absolute top-0 left-0 right-0 h-56 bg-[#00a884] shadow-sm pointer-events-none" />

      {/* Brand Top Header */}
      <div className="relative z-10 flex items-center gap-3 mb-6 text-white select-none">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-xs">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">PULSECHAT FOR WEB</span>
      </div>

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white border border-[#e9edef] shadow-xl p-8 backdrop-blur-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-[#111b21]">Create Account</h1>
          <p className="text-xs text-[#667781] mt-1">
            Join PulseChat today with real-time last seen and calling
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#54656f] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8696a0]" />
              <input
                type="text"
                name="name"
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#f0f2f5] border border-[#e9edef] text-sm text-[#111b21] placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#54656f] mb-1.5">
              Username
            </label>
            <div className="relative">
              <AtSign className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8696a0]" />
              <input
                type="text"
                name="username"
                placeholder="janedoe"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#f0f2f5] border border-[#e9edef] text-sm text-[#111b21] placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#54656f] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8696a0]" />
              <input
                type="email"
                name="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#f0f2f5] border border-[#e9edef] text-sm text-[#111b21] placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#54656f] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8696a0]" />
              <input
                type="password"
                name="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#f0f2f5] border border-[#e9edef] text-sm text-[#111b21] placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#008069] hover:bg-[#00a884] text-white font-medium text-sm shadow-xs active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#667781]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#008069] hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}