import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import React from "react";
import { Badge, Button, Input, Select, HARI } from "../../components/common";

export function AdminManageSchedule({ search, db }: any) {
  const [drawer, setDrawer] = useState<"add" | "edit" | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    setLoading(true);
    fetch("http://localhost:8080/api/admin/slots")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSlots(data);
        else setSlots([]);
      })
      .catch(err => {
        console.error("Backend offline:", err);
        alert("Gagal terhubung ke Backend Java. Pastikan server sudah jalan.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const filtered = Array.isArray(slots) ? slots.filter(s =>
    (s.nama_guru || "").toLowerCase().includes((search || "").toLowerCase()) ||
    (s.hari || "").toLowerCase().includes((search || "").toLowerCase())
  ) : [];

  const handleSave = () => {
    if (!form.hari || !form.jam_mulai || !form.jam_selesai || (drawer === "add" && !form.id_guru)) {
      alert("Mohon lengkapi semua data!");
      return;
    }

    const url = drawer === "add" ? "http://localhost:8080/api/jadwal/add" : "http://localhost:8080/api/admin/slots/update";
    const payload = {
      ...form,
      id: drawer === "add" ? Math.floor(Math.random() * 100000) : undefined
    };

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "sukses" || data.message) {
          alert(data.message || "Berhasil menyimpan slot!");
          setDrawer(null);
          loadData();
        } else {
          alert("Gagal: " + (data.pesan || data.error));
        }
      })
      .catch(() => alert("Gagal terhubung ke Backend Java!"));
  };

  const handleDelete = (id_jadwal: number) => {
    if (!window.confirm("Are you sure you want to delete this availability slot?")) return;
    fetch("http://localhost:8080/api/admin/slots/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_jadwal })
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message || "Slot deleted!");
        loadData();
      })
      .catch(() => alert("Failed to connect to Backend Java!"));
  };

  return (
    <div className="space-y-5 relative p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manage Teacher Slots</h1>
          <p className="text-sm text-slate-500">Atur ketersediaan waktu guru. Slot yang sudah dibooking akan terkunci.</p>
        </div>
        <Button onClick={() => { setForm({}); setDrawer("add"); }} icon={<Plus size={15} />}>Add New Slot</Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-5 py-3 font-semibold text-slate-500">Guru</th>
              <th className="px-5 py-3 font-semibold text-slate-500">Hari & Waktu</th>
              <th className="px-5 py-3 font-semibold text-slate-500">Status</th>
              <th className="px-5 py-3 font-semibold text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-5 text-slate-400">Loading data...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-5 text-slate-400">Belum ada slot available.</td></tr>
            ) : filtered.map((s) => (
              <tr key={s.id_jadwal} className="border-b hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 font-medium text-slate-800">{s.nama_guru}</td>
                <td className="px-5 py-3 text-slate-600">{s.hari}, {s.jam_mulai?.substring(0, 5)} - {s.jam_selesai?.substring(0, 5)}</td>
                <td className="px-5 py-3">
                  {s.is_booked === 1 ? <Badge label="Booked" variant="danger" /> : <Badge label="Available" variant="success" />}
                </td>
                <td className="px-5 py-3 flex gap-2">
                  {s.is_booked === 1 ? (
                    <span className="text-xs text-slate-400 italic">Locked (Active Lesson)</span>
                  ) : (
                    <>
                      <Button size="sm" onClick={() => { setForm(s); setDrawer("edit"); }}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(s.id_jadwal)}>Delete</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white p-6 rounded-xl w-96 shadow-xl space-y-4">
            <h2 className="font-bold text-lg">{drawer === "add" ? "Add Teacher Slot" : "Edit Slot: " + form.nama_guru}</h2>

            {drawer === "add" && (
              <Select
                label="Choose Teacher"
                value={String(form.id_guru ?? "")}
                onChange={(v) => setForm({ ...form, id_guru: Number(v) })}
                options={(db?.guru || []).map((g: any) => ({ value: String(g.id), label: g.nama }))}
                required
              />
            )}

            <Select
              label="Day"
              value={form.hari ?? ""}
              onChange={(v) => setForm({ ...form, hari: v })}
              options={HARI.map((h: string) => ({ value: h, label: h }))}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Jam Mulai" type="time" value={form.jam_mulai?.substring(0, 5) ?? ""} onChange={(v) => setForm({ ...form, jam_mulai: v })} required />
              <Input label="Jam Selesai" type="time" value={form.jam_selesai?.substring(0, 5) ?? ""} onChange={(v) => setForm({ ...form, jam_selesai: v })} required />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" onClick={() => setDrawer(null)} className="flex-1">Batal</Button>
              <Button onClick={handleSave} className="flex-1">Simpan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
