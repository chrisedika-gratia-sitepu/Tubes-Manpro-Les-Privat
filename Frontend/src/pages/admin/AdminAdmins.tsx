import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import React from "react";
import { Avatar, Badge, Button, Input } from "../../components/common";

export function AdminAdmins({ search }: any) {
  const [drawer, setDrawer] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});

  const loadData = () => {
    fetch("http://localhost:8080/api/admin/admins")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAdmins(data);
      })
      .catch((err) => console.error("Gagal memuat admin:", err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = admins.filter((a) =>
    [a.nama, a.email, a.no_hp]
      .join(" ")
      .toLowerCase()
      .includes((search || "").toLowerCase())
  );

  function openAdd() {
    setForm({ nama: "", email: "", no_hp: "" });
    setEditItem(null);
    setDrawer("add");
  }

  function openEdit(a: any) {
    setForm({ ...a });
    setEditItem(a);
    setDrawer("edit");
  }

  function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this Admin?")) return;

    fetch("http://localhost:8080/api/admin/admins/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_admin: id }),
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
          role: "admin",
          nama: form.nama,
          email: form.email,
          no_hp: form.no_hp,
          password: "admin123",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "sukses") {
            alert("Admin successfully added to Database!");
            loadData();
          } else {
            alert("Failed to add admin: " + data.pesan);
          }
        })
        .catch(() => alert("Failed to contact server."));

    } else if (drawer === "edit") {
      fetch("http://localhost:8080/api/admin/admins/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_admin: editItem.id,
          nama: form.nama,
          email: form.email,
          no_hp: form.no_hp,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "sukses") {
            alert("Admin data successfully updated!");
            loadData();
          } else {
            alert("Failed to update admin: " + data.message);
          }
        })
        .catch(() => alert("Failed to contact server."));
    }
    setDrawer(null);
  }

  return (
    <div className="space-y-5 relative p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Admins</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage admin accounts with platform access.</p>
        </div>
        <Button onClick={openAdd} icon={<Plus size={15} />}>Add Admin</Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-sm text-slate-500 font-medium">{filtered.length} admins found</p>
        </div>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase text-xs">
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="px-5 py-3 font-semibold">Phone</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-5 py-3.5 flex items-center gap-3">
                  <Avatar name={a.nama || "?"} size="sm" />
                  <span className="font-medium text-slate-800">{a.nama}</span>
                </td>
                <td className="px-5 py-3.5 text-slate-600">{a.email}</td>
                <td className="px-5 py-3.5 text-slate-600">{a.no_hp}</td>
                <td className="px-5 py-3.5">
                  <Badge label="Administrator" variant="warning" />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(a)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(a.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {drawer && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30" onClick={() => setDrawer(null)} />
          <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-40 flex flex-col animate-in slide-in-from-right-8 duration-200">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-800">{drawer === "add" ? "Add New Admin" : "Edit Admin"}</h2>
              <button onClick={() => setDrawer(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              <Input label="Full Name" value={form.nama ?? ""} onChange={(v: string) => setForm((p: any) => ({ ...p, nama: v }))} required />
              <Input label="Email Address" type="email" value={form.email ?? ""} onChange={(v: string) => setForm((p: any) => ({ ...p, email: v }))} required />
              <Input label="Phone Number" value={form.no_hp ?? ""} onChange={(v: string) => setForm((p: any) => ({ ...p, no_hp: v }))} required />
            </div>
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-3">
              <Button variant="secondary" onClick={() => setDrawer(null)} className="flex-1 justify-center">Cancel</Button>
              <Button onClick={handleSave} className="flex-1 justify-center">{drawer === "add" ? "Add Admin" : "Save Changes"}</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
