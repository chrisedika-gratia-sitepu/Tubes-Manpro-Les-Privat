import { useState, useEffect } from "react";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Badge,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";
import React from "react";
import {
  HARI,
  timeToMinutes,
  Button,
  Input,
  Select,
  Toast,
} from "../../components/common";

interface JadwalKesediaan {
  id: number;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  status: string;
  id_guru: number;
  id_admin: number;
}

export function TeacherAvailability({ loggedInId, db }: any) {
  const guruId = loggedInId;
  const [availList, setAvailList] = useState<JadwalKesediaan[]>([]);
  const [hari, setHari] = useState("");
  const [jamMulai, setJamMulai] = useState("");
  const [jamSelesai, setJamSelesai] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/admin/slots?_=${new Date().getTime()}`)
      .then((res) => res.json())
      .then((data) => {
        const mappedData = data
          .filter((s: any) => s.id_guru === guruId)
          .map((s: any) => ({
            id: s.id_jadwal,
            hari: s.hari,
            jam_mulai: s.jam_mulai,
            jam_selesai: s.jam_selesai,
            id_guru: s.id_guru,
            status: s.is_booked === 1 ? "booked" : "available"
          }));
        setAvailList(mappedData);
      })
      .catch((err) => console.error("Gagal mengambil jadwal:", err));
  }, [guruId]);

  async function handleAdd() {
    if (!hari || !jamMulai || !jamSelesai) return;

    let start = timeToMinutes(jamMulai);
    const end = timeToMinutes(jamSelesai);
    const newSlots: JadwalKesediaan[] = [];

    while (start + 60 <= end) {
      const slotStart = `${String(Math.floor(start / 60)).padStart(2, "0")}:${String(start % 60).padStart(2, "0")}`;
      const slotEnd = `${String(Math.floor((start + 60) / 60)).padStart(2, "0")}:${String((start + 60) % 60).padStart(2, "0")}`;

      newSlots.push({
        id: Math.floor(Math.random() * 1000000) + start,
        hari,
        jam_mulai: slotStart,
        jam_selesai: slotEnd,
        id_guru: guruId,
        id_admin: 1,
        status: "available",
      });
      start += 60;
    }

    try {
      let allSuccess = true;
      for (const slot of newSlots) {
        const response = await fetch("http://localhost:8080/api/jadwal/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(slot),
        });
        const data = await response.json();
        if (data.status !== "sukses") {
          allSuccess = false;
          setToast("Gagal menyimpan: " + data.pesan);
          break;
        }
      }

      if (allSuccess) {
        setAvailList((p) => [...p, ...newSlots]);
        setToast("Availability slots added successfully to Database!");
      }
    } catch (e) {
      setToast("Gagal terhubung ke server Java.");
    }

    setHari("");
    setJamMulai("");
    setJamSelesai("");
  }

  function handleRemove(id: number) {
    if (!window.confirm("Yakin ingin menghapus slot waktu ini?")) return;

    fetch("http://localhost:8080/api/admin/slots/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_jadwal: id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "sukses" || data.message) {
          setToast("Slot waktu berhasil dihapus dari database!");
          setAvailList((p) => p.filter((j) => j.id !== id));
        } else {
          alert("Gagal menghapus. Mungkin slot ini sedang di-booking oleh siswa!");
        }
      })
      .catch(() => alert("Gagal terhubung ke server!"));
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast message={toast} type="success" onClose={() => setToast(null)} />
      )}
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Manage Availability
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Set the days and time windows when you are available to teach.
        </p>
      </div>
      <div className="flex gap-6 items-start">
        <div className="w-80 flex-shrink-0 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">
            Add Open Slots
          </h2>
          <Select
            label="Day"
            value={hari}
            onChange={setHari}
            options={HARI.map((h) => ({ value: h, label: h }))}
            placeholder="Select day"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time"
              type="time"
              value={jamMulai}
              onChange={setJamMulai}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={jamSelesai}
              onChange={setJamSelesai}
              required
            />
          </div>
          <Button
            onClick={handleAdd}
            icon={<Plus size={15} />}
            className="w-full justify-center"
          >
            Add Time Slots
          </Button>
        </div>
        <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700">
              Current Open Slots
            </p>
          </div>
          <div className="divide-y divide-slate-50">
            {availList.map((j) => (
              <div
                key={j.id}
                className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-[#4361EE]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {j.hari}
                    </p>
                    <p className="text-xs text-slate-400">
                      {j.jam_mulai?.substring(0, 5)} – {j.jam_selesai?.substring(0, 5)}
                    </p>
                  </div>
                  <Badge
                    label={j.status}
                    variant={j.status === "available" ? "success" : "warning"}
                  />
                </div>
                {j.status === "available" ? (
                  <button
                    onClick={() => handleRemove(j.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 italic mt-1">Locked</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}