import { useState } from "react";
import { BookOpen, Calendar, Users, Shield, Search, Bell, Layers, X, CheckCircle2, AlertTriangle } from "lucide-react";
import React from "react";
import { Role, Button, Input } from "../components/common";

export interface LoginPageProps {
  onLogin: (role: Role, nama: string, id: number) => void;
  onGoRegister: () => void;
}

export function LoginPage({ onLogin, onGoRegister }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password }),
      });

      const result = await response.json();

      if (result.status === "sukses") {
        onLogin(result.role as Role, result.nama, result.id);
      } else {
        setError(
          result.pesan || "Invalid email or password. Please try again.",
        );
      }
    } catch (err) {
      setError("Unable to connect to server. Make sure Java is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#F5F7FA] flex"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="hidden lg:flex w-[480px] flex-shrink-0 bg-[#1C2B3A] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#4361EE] rounded-xl flex items-center justify-center">
            <Layers size={18} className="text-white" />
          </div>
          <span className="text-white text-lg font-bold tracking-tight">
            EduCAPY
          </span>
        </div>
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
              <Shield size={14} className="text-indigo-500" /> Private Tutoring Management
            </div>
            <h2 className="text-3xl font-bold text-white leading-snug">
              The smarter way to manage private lessons.
            </h2>
            <p className="text-white/50 text-sm leading-relaxed">
              Book lessons, track schedules, and manage students and teachers — all in one place.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: BookOpen,
                label: "Easy Booking",
                sub: "Step-by-step lesson booking",
              },
              {
                icon: Calendar,
                label: "Smart Scheduling",
                sub: "Overlap detection built-in",
              },
              {
                icon: Users,
                label: "Multi-role",
                sub: "Student, Teacher & Admin",
              },
              {
                icon: Shield,
                label: "Secure Access",
                sub: "Role-based permissions",
              },
            ].map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <Icon size={18} className="text-[#4361EE] mb-2" />
                <p className="text-white text-xs font-semibold">{label}</p>
                <p className="text-white/40 text-xs mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/20 text-xs">
          © 2026 EduCAPY. All rights reserved.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-[#4361EE] rounded-xl flex items-center justify-center">
              <Layers size={16} className="text-white" />
            </div>
            <span className="text-slate-800 text-base font-bold">EduCAPY</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Sign in to your account
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {"Don't have an account? "}
              <button
                onClick={onGoRegister}
                className="text-[#4361EE] font-medium hover:underline underline-offset-2"
              >
                Register here
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              required
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-3 py-2 pr-10 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertTriangle size={15} className="flex-shrink-0" />
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#4361EE] hover:bg-[#3451DB] text-white text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              ) : null}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}