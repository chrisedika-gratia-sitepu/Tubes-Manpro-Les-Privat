import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import React from "react";
import { Avatar, Badge, Button, Input, Select } from "../../components/common";

export function AdminStudents({ search, db }: any) {
  const [drawer, setDrawer] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});

  const loadData = () => {
    fetch("http://localhost:8080/api/siswa")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStudents(data);
      })
      .catch((err) => console.error("Failed to load students:", err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = students.filter((s) =>
    [s.nama, s.email, s.no_hp]
      .join(" ")
      .toLowerCase()
      .includes((search || "").toLowerCase())
  );

  function openAdd() {
    setForm({
      nama: "", email: "", no_hp: "", tanggal_lahir: "", jenis_kelamin: "", id_jenjang: ""
    });
    setEditItem(null);
    setDrawer("add");
  }

  function openEdit(item: any) {
    setForm({
      nama: item.nama,
      email: item.email,
      no_hp: item.no_hp,
      tanggal_lahir: item.tanggal_lahir,
      jenis_kelamin: item.jenis_kelamin,
      id_jenjang: item.id_jenjang,
    });
    setEditItem(item);
    setDrawer("edit");
  }

  function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this Student?")) return;

    fetch("http://localhost:8080/api/admin/students/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_siswa: id }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || data.pesan);
        if (data.status === "sukses") loadData();
      })
      .catch(() => alert("Gagal menghubungi server."));
  }

  function handleSave() {
    if (drawer === "add") {
      fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "student",
          nama: form.nama,
          email: form.email,
          no_hp: form.no_hp,
          password: "student123",
          tanggal_lahir: form.tanggal_lahir,
          jenis_kelamin: form.jenis_kelamin,
          id_jenjang: form.id_jenjang,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "sukses") {
            alert("Student successfully added to Database!");
            loadData();
          } else {
            alert("Failed to add student: " + data.pesan);
          }
        })
        .catch(() => alert("Failed to contact server."));

    } else if (drawer === "edit") {
      fetch("http://localhost:8080/api/admin/students/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_siswa: editItem.id,
          nama: form.nama,
          email: form.email,
          no_hp: form.no_hp,
          tanggal_lahir: form.tanggal_lahir,
          jenis_kelamin: form.jenis_kelamin,
          id_jenjang: form.id_jenjang,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "sukses") {
            alert("Data Siswa berhasil diperbarui!");
            loadData();
          } else {
            alert("Gagal update siswa: " + data.message);
          }
        })
        .catch(() => alert("Gagal menghubungi server."));
    }
    setDrawer(null);
  }

  return (
    <div className="space-y-5 relative p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Students</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage all registered students.</p>
        </div>
        <Button onClick={openAdd} icon={<Plus size={15} />}>Add Student</Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-sm text-slate-500 font-medium">{filtered.length} students found</p>
        </div>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase text-xs">
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="px-5 py-3 font-semibold">Phone</th>
              <th className="px-5 py-3 font-semibold">Level</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((s) => {
              const jenjang = (db?.jenjang || []).find((j: any) => String(j.id) === String(s.id_jenjang));
              return (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-3.5 flex items-center gap-3">
                    <Avatar name={s.nama || "?"} size="sm" />
                    <span className="font-medium text-slate-800">{s.nama}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{s.email}</td>
                  <td className="px-5 py-3.5 text-slate-600">{s.no_hp}</td>
                  <td className="px-5 py-3.5">
                    <Badge label={jenjang?.nama || "Unknown"} variant="default" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {drawer && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30" onClick={() => setDrawer(null)} />
          <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-40 flex flex-col animate-in slide-in-from-right-8 duration-200">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-800">{drawer === "add" ? "Add New Student" : "Edit Student"}</h2>
              <button onClick={() => setDrawer(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              <Input label="Full Name" value={form.nama ?? ""} onChange={(v: string) => setForm((p: any) => ({ ...p, nama: v }))} required />
              <Input label="Email" type="email" value={form.email ?? ""} onChange={(v: string) => setForm((p: any) => ({ ...p, email: v }))} required />
              <Input label="Phone Number" value={form.no_hp ?? ""} onChange={(v: string) => setForm((p: any) => ({ ...p, no_hp: v }))} required />

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Input label="Date of Birth" type="date" value={form.tanggal_lahir ?? ""} onChange={(v: string) => setForm((p: any) => ({ ...p, tanggal_lahir: v }))} required />
                <Select
                  label="Gender"
                  value={form.jenis_kelamin ?? ""}
                  onChange={(v: string) => setForm((p: any) => ({ ...p, jenis_kelamin: v }))}
                  options={[{ value: "L", label: "Male" }, { value: "P", label: "Female" }]}
                  placeholder="Select"
                  required
                />
              </div>

              <div className="pt-2">
                <Select
                  label="Education Level"
                  value={String(form.id_jenjang ?? "")}
                  onChange={(v: string) => setForm((p: any) => ({ ...p, id_jenjang: v }))}
                  options={(db?.jenjang || []).map((j: any) => ({ value: String(j.id), label: j.nama }))}
                  placeholder="Select educational level"
                  required
                />
              </div>

            </div>
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-3">
              <Button variant="secondary" onClick={() => setDrawer(null)} className="flex-1 justify-center">Cancel</Button>
              <Button onClick={handleSave} className="flex-1 justify-center">{drawer === "add" ? "Add Student" : "Save Changes"}</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
