import { useState, useEffect } from "react";
import { Users, GraduationCap, Shield, BookOpen } from "lucide-react";
import React from "react";

export function AdminDashboard() {
  const [stats, setStats] = useState({ total_siswa: 0, total_guru: 0, total_admin: 0, total_les: 0 });

  useEffect(() => {
    fetch("http://localhost:8080/api/admin/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Error fetching stats:", err));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#1E293B]">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Number of Students</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total_siswa}</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><GraduationCap size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Number of Teachers</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total_guru}</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Shield size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Number of Admins</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total_admin}</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><BookOpen size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Number of Tutoring Schedules</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total_les}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
