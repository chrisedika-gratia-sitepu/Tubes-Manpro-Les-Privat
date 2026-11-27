import { BookOpen, Calendar, CheckCircle2, ChevronRight } from "lucide-react";
import React from "react";
import { Avatar } from "../../components/common";

export function StudentDashboard({ setPage, loggedInName, activeLessons, db }: any) {
  const myLes = activeLessons;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Welcome back, {loggedInName || "Siswa"}!
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Here is an overview of your tutoring activity.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: "Total Lessons", value: String(myLes.length), sub: "All time", color: "bg-indigo-50", iconColor: "text-[#4361EE]", Icon: BookOpen },
          { label: "Upcoming", value: String(myLes.filter((l: any) => new Date(l.tanggal_mulai) > new Date()).length), sub: "Scheduled", color: "bg-sky-50", iconColor: "text-sky-500", Icon: Calendar },
          { label: "Completed", value: String(myLes.filter((l: any) => new Date(l.tanggal_mulai) <= new Date()).length), sub: "Finished", color: "bg-emerald-50", iconColor: "text-emerald-500", Icon: CheckCircle2 },
        ].map(({ label, value, color, iconColor, Icon }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
            <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon size={20} className={iconColor} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700">Quick Actions</h2>
          <div className="space-y-2">
            <button onClick={() => setPage("book")} className="w-full flex items-center justify-between px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors text-[#4361EE] font-medium text-sm">
              <span className="flex items-center gap-2"><BookOpen size={16} />Book a New Lesson</span><ChevronRight size={16} />
            </button>
            <button onClick={() => setPage("mylessons")} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-slate-700 font-medium text-sm">
              <span className="flex items-center gap-2"><Calendar size={16} />View All My Lessons</span><ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700">Recent Lessons</h2>
          {myLes.slice(0, 2).map((les: any) => {
            const jadwal = (db?.jadwal || []).find((j: any) => j.id === les.id_jadwal);
            const guru = (db?.guru || []).find((g: any) => g.id === jadwal?.id_guru);
            const mapel = (db?.mapel || []).find((m: any) => m.id === les.id_mapel);

            const dateStr = les.tanggal_mulai ? new Date(les.tanggal_mulai).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "long", year: "numeric" }) : "-";

            return (
              <div key={les.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl">
                <Avatar name={guru?.nama ?? "?"} size="sm" />
                <div>
                  <p className="text-sm font-medium text-slate-700">{mapel?.nama}</p>
                  <p className="text-xs text-slate-400">{guru?.nama} · {dateStr}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
