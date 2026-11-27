import { useState, useMemo, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Users,
  GraduationCap,
  Bell,
  Search,
  ChevronDown,
  Plus,
  X,
  Check,
  Clock,
  LogOut,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Shield,
  Trash2,
  Edit2,
  UserCheck,
  LayoutDashboard
} from "lucide-react";
import React from "react";

export type Role = "student" | "teacher" | "admin";

export interface Jenjang {
  id: number;
  nama: string;
}
export interface Mapel {
  id: number;
  nama: string;
}
export interface Guru {
  id: number;
  nama: string;
  email: string;
  no_hp: string;
  password?: string;
  id_admin: number;
  avatar?: string;
}
export interface Siswa {
  id: number;
  nama: string;
  email: string;
  no_hp: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  password?: string;
  id_jenjang: number;
  alamat?: string;
}
export interface Admin {
  id: number;
  nama: string;
  email: string;
  no_hp: string;
  password?: string;
}
export interface KeahlianGuru {
  id: number;
  id_guru: number;
  id_mapel: number;
  id_jenjang: number;
}
export interface JadwalKesediaan {
  id: number;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  status: string;
  id_guru: number;
  id_admin: number;
}
export interface Les {
  id: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  id_siswa: number;
  id_jadwal: number;
  id_mapel: number;
  id_jenjang: number;
  jam_mulai?: string;
  jam_selesai?: string;
  hari?: string;
}

export const HARI = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
export const DAY_SHORT: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

export function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function toHHMM(date: string) {
  return date.split("T")[1]?.slice(0, 5) ?? "";
}

export function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const AVATAR_COLORS = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
];

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  const sz =
    size === "sm"
      ? "w-7 h-7 text-xs"
      : size === "lg"
        ? "w-10 h-10 text-sm"
        : "w-8 h-8 text-xs";
  return (
    <div
      className={`${AVATAR_COLORS[idx]} ${sz} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
    >
      {initials(name)}
    </div>
  );
}

export function Badge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const styles = {
    default: "bg-slate-100 text-slate-600",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-red-50 text-red-600 border border-red-200",
    info: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[variant]}`}
    >
      {label}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  icon,
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex items-center gap-1.5 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary:
      "bg-[#4361EE] text-white hover:bg-[#3451DB] focus:ring-[#4361EE]/50 shadow-sm",
    secondary:
      "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-200 shadow-sm",
    ghost: "text-slate-600 hover:bg-slate-100 focus:ring-slate-200",
    danger:
      "bg-red-500 text-white hover:bg-red-600 focus:ring-red-300 shadow-sm",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

export function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  min,
  max,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-slate-600">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE] transition-all"
      />
    </div>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-slate-600">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE] transition-all pr-8"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
    </div>
  );
}

export function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  const styles =
    type === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : "bg-red-50 border-red-200 text-red-800";
  const Icon = type === "success" ? CheckCircle2 : AlertTriangle;
  const iconColor = type === "success" ? "text-emerald-500" : "text-red-500";
  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-start gap-3 px-4 py-3 border rounded-xl shadow-xl max-w-sm ${styles}`}
    >
      <Icon size={18} className={`flex-shrink-0 mt-0.5 ${iconColor}`} />
      <p className="text-sm font-medium leading-snug">{message}</p>
      <button
        onClick={onClose}
        className="ml-auto flex-shrink-0 hover:opacity-70"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function SummaryRow({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-slate-400 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 leading-tight">{label}</p>
        <p className="text-sm font-medium text-slate-700 truncate">{value}</p>
      </div>
    </div>
  );
}

const NAV: Record<
  Role,
  { icon: React.ElementType; label: string; page: string }[]
> = {
  student: [
    { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" },
    { icon: BookOpen, label: "Book a Lesson", page: "book" },
    { icon: Calendar, label: "My Lessons", page: "mylessons" },
  ],
  teacher: [
    { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" },
    { icon: Clock, label: "Availability", page: "availability" },
    { icon: Calendar, label: "My Schedule", page: "schedule" },
  ],
  admin: [
    { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" },
    { icon: GraduationCap, label: "Students", page: "students" },
    { icon: UserCheck, label: "Teachers", page: "teachers" },
    { icon: Shield, label: "Admins", page: "admins" },
    { icon: Calendar, label: "Manage Schedules", page: "schedules" },
  ],
};

export function Sidebar({
  role,
  page,
  setPage,
  onLogout,
}: {
  role: Role;
  page: string;
  setPage: (p: string) => void;
  onLogout: () => void;
}) {
  const items = NAV[role];
  const roleLabel = {
    student: "Student Portal",
    teacher: "Teacher Portal",
    admin: "Admin Console",
  }[role];
  const roleColor = {
    student: "bg-sky-500",
    teacher: "bg-violet-500",
    admin: "bg-indigo-600",
  }[role];
  return (
    <aside className="w-56 flex-shrink-0 h-screen flex flex-col bg-[#1C2B3A] fixed left-0 top-0 z-20">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg ${roleColor} flex items-center justify-center flex-shrink-0`}
          >
            <Layers size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-tight">
              EduCAPY
            </p>
            <p className="text-white/40 text-xs leading-tight">{roleLabel}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {items.map(({ icon: Icon, label, page: p }) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${page === p
              ? "bg-white/10 text-white"
              : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
          >
            <Icon size={16} className="flex-shrink-0" />
            {label}
          </button>
        ))}
      </nav>
      <div className="px-3 pb-4 border-t border-white/10 pt-3">
        <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

export function TopBar({
  role,
  globalSearch,
  setGlobalSearch,
  onLogout,
  loggedInName,
}: {
  role: Role;
  setRole: (r: Role) => void;
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
  onLogout: () => void;
  loggedInName: string;
}) {
  const roleUser = {
    student: { name: loggedInName || "Rani Kusuma", badge: "Student" },
    teacher: { name: loggedInName || "Dr. Ayu Rahmawati", badge: "Teacher" },
    admin: { name: loggedInName || "Reza Firmansyah", badge: "Admin" },
  }[role];
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4 sticky top-0 z-10">
      <div className="flex items-center gap-2 flex-1 max-w-sm">
        <Search size={15} className="text-slate-400 flex-shrink-0" />
        <input
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          placeholder="Search students, teachers, schedules..."
          className="w-full text-sm text-slate-700 placeholder:text-slate-400 bg-transparent outline-none"
        />
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all">
          <Bell size={16} className="text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#4361EE] rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <Avatar name={roleUser.name} size="sm" />
          <div className="hidden xl:block">
            <p className="text-xs font-semibold text-slate-700 leading-tight">
              {roleUser.name}
            </p>
            <p className="text-xs text-slate-400 leading-tight">
              {roleUser.badge}
            </p>
          </div>
          <button
            onClick={onLogout}
            title="Sign out"
            className="ml-1 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
