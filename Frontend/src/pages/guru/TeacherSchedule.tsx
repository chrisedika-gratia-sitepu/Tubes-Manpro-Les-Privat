import { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Users,
  GraduationCap,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import React from "react";
import { HARI, toHHMM } from "../../components/common";

export function TeacherSchedule({ loggedInId, db }: any) {
  const guruId = loggedInId;
  const [selLesson, setSelLesson] = useState<any | null>(null);
  const [teacherLessons, setTeacherLessons] = useState<any[]>([]);
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  useEffect(() => {
    if (!loggedInId) return;

    fetch(`http://localhost:8080/api/les/guru?id_guru=${loggedInId}`)
      .then((res) => res.json())
      .then((data) => setTeacherLessons(data))
      .catch((err) => console.error("Gagal mengambil schedule guru:", err));
  }, [loggedInId]);

  const weekDates = HARI.map((hari, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return {
      hari,
      date: d,
      iso: d.toISOString().split("T")[0],
    };
  });

  function getLessonsForDay(date: Date, hari: string) {
    return teacherLessons.filter((l) => {
      if (l.hari !== hari) return false;

      const start = new Date(l.tanggal_mulai.split("T")[0]);
      const end = new Date(l.tanggal_selesai.split("T")[0]);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      return date >= start && date <= end;
    });
  }

  function prevWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  }

  function nextWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  }

  const weekLabel = weekStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const COLORS = [
    "bg-indigo-400",
    "bg-violet-400",
    "bg-sky-400",
    "bg-emerald-400",
    "bg-amber-400",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Schedule</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Weekly overview of your confirmed lesson bookings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<ChevronLeft size={14} />}
            onClick={prevWeek}
          >
            Prev
          </Button>

          <span className="text-sm font-medium text-slate-700 px-2">
            Week of {weekLabel}
          </span>

          <Button variant="secondary" size="sm" onClick={nextWeek}>
            Next <ChevronRight size={14} />
          </Button>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 divide-x divide-slate-100 border-b border-slate-200">
          {weekDates.map(({ hari, date }) => (
            <div key={hari} className="px-3 py-3 text-center">
              <p className="text-xs text-slate-400 font-medium">
                {hari.slice(0, 3).toUpperCase()}
              </p>
              <p className="text-base font-bold text-slate-700 mt-0.5">
                {date.getDate()}
              </p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[280px]">
          {weekDates.map(({ hari, date }, ci) => {
            const dayLessons = getLessonsForDay(date, hari);
            return (
              <div key={hari} className="p-2 space-y-1.5 min-h-[180px]">
                {dayLessons.length === 0 && (
                  <div className="text-xs text-slate-300 text-center mt-6">
                    —
                  </div>
                )}
                {dayLessons.map((les) => {
                  const mapel = db.mapel.find((m: any) => m.id === les.id_mapel);
                  const siswa = db.siswa.find((s: any) => s.id === les.id_siswa);
                  const start = toHHMM(les.tanggal_mulai);
                  const end = toHHMM(les.tanggal_selesai);
                  return (
                    <button
                      key={les.id}
                      onClick={() => setSelLesson(les)}
                      className={`w-full text-left rounded-lg px-2.5 py-2 text-white ${COLORS[ci % COLORS.length]} hover:opacity-90 transition-opacity`}
                    >
                      <p className="text-xs font-bold">
                        {start} – {end}
                      </p>
                      <p className="text-xs opacity-75 truncate mt-0.5">
                        {siswa?.nama}
                      </p>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {selLesson &&
        (() => {
          const mapel = db.mapel.find((m: any) => m.id === selLesson.id_mapel);
          const jenjang = db.jenjang.find((j: any) => j.id === selLesson.id_jenjang);
          const siswa = db.siswa.find((s: any) => s.id === selLesson.id_siswa);
          const start = toHHMM(selLesson.tanggal_mulai);
          const end = toHHMM(selLesson.tanggal_selesai);
          const formatDate = (iso: string) => {
            const date = new Date(iso);
            return date.toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            });
          };
          return (
            <div
              className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-6"
              onClick={() => setSelLesson(null)}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                      Lesson Detail
                    </p>
                    <h3 className="text-lg font-bold text-slate-800 mt-0.5">
                      {mapel?.nama}{" "}
                      <span className="text-slate-400 font-normal text-base">
                        ({jenjang?.nama})
                      </span>
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelLesson(null)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Student Info
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold flex-shrink-0`}
                    >
                      {siswa?.nama?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {siswa?.nama}
                      </p>
                      <p className="text-xs text-slate-400">{siswa?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <p className="text-xs text-slate-400">Phone</p>
                      <p className="text-sm font-medium text-slate-700">
                        {siswa?.no_hp}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Gender</p>
                      <p className="text-sm font-medium text-slate-700">
                        {siswa?.jenis_kelamin === "L" ? "Male" : "Female"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-indigo-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500">Date</p>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">
                      {formatDate(selLesson.tanggal_mulai)}
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500">Time</p>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">
                      {start} – {end}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}