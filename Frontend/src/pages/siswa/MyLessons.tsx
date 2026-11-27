import { timeToMinutes, Avatar } from "../../components/common";
import React from "react";

export function MyLessons({ activeLessons, db }: any) {
  const myLes = activeLessons;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">My Lessons</h1>
      </div>
      <div className="flex gap-6 items-start">
        <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Subject", "Teacher", "Date", "Time", "Duration"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.isArray(myLes) &&
                myLes.map((les: any) => {
                  const mapel = db.mapel.find((m: any) => m.id === les.id_mapel);
                  const jadwal = db.jadwal.find((j: any) => j.id === les.id_jadwal);
                  const guru = db.guru.find((g: any) => g.id === jadwal?.id_guru);

                  const dayName = jadwal ? jadwal.hari : "-";
                  const start = (les.jam_mulai || jadwal?.jam_mulai || "00:00").substring(0, 5);
                  const end = (les.jam_selesai || jadwal?.jam_selesai || "00:00").substring(0, 5);

                  const startMins = timeToMinutes(start);
                  const endMins = timeToMinutes(end);
                  const dur = startMins > 0 ? ((endMins - startMins) / 60).toFixed(1) : "0.0";

                  return (
                    <tr key={les.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-800">{mapel?.nama || "Unknown"}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Avatar name={guru?.nama ?? "?"} size="sm" />
                          <span className="text-slate-600">{guru?.nama || "-"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-medium">{dayName}</td>
                      <td className="px-5 py-3.5 text-slate-600">{start} - {end}</td>
                      <td className="px-5 py-3.5 text-slate-600">{dur} hrs</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
