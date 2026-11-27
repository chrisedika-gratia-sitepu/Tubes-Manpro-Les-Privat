import { BookOpen, Calendar, Users, GraduationCap, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import React from "react";
import { Avatar } from "../../components/common";

export function TeacherDashboard({ loggedInId, loggedInName, db }: any) {
  const guruId = loggedInId;
  const [myLessons, setMyLessons] = useState<any[]>([]);

  useEffect(() => {
    if (!guruId) return;
    fetch(`http://localhost:8080/api/les/guru?id_guru=${guruId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMyLessons(data);
      })
      .catch((err) => console.error("Gagal mengambil data les guru:", err));
  }, [guruId]);

  const totalLessons = myLessons.length;
  const uniqueStudents = new Set(myLessons.map((l) => l.id_siswa)).size;
  const availabilitySlots = (db?.jadwal || []).filter((j: any) => j.id_guru === guruId).length;
  const expertiseAreas = (db?.keahlian || []).filter((k: any) => k.id_guru === guruId).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Welcome, {loggedInName}!
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Overview of your teaching schedule and students.
        </p>
      </div>
      <div className="grid grid-cols-4 gap-5">
        {[
          {
            label: "Total Lessons",
            value: String(totalLessons),
            Icon: BookOpen,
            color: "bg-indigo-50 text-[#4361EE]",
          },
          {
            label: "Availability Slots",
            value: String(availabilitySlots),
            Icon: Clock,
            color: "bg-violet-50 text-violet-500",
          },
          {
            label: "Unique Students",
            value: String(uniqueStudents),
            Icon: Users,
            color: "bg-sky-50 text-sky-500",
          },
          {
            label: "Expertise Areas",
            value: String(expertiseAreas),
            Icon: GraduationCap,
            color: "bg-emerald-50 text-emerald-500",
          },
        ].map(({ label, value, Icon, color }) => (
          <div
            key={label}
            className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color.split(" ")[0]}`}
            >
              <Icon size={20} className={color.split(" ")[1]} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}