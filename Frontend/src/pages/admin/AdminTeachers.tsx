import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import React from "react";
import { Avatar, Badge, Button, Input, Select } from "../../components/common";

export function AdminTeachers({ search, db }: any) {
  const [drawer, setDrawer] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [localKeahlian, setLocalKeahlian] = useState<any[]>([]);
  const [expertises, setExpertises] = useState<{ mapel: string; jenjang: string }[]>([]);
  const [tempMapel, setTempMapel] = useState("");
  const [tempJenjang, setTempJenjang] = useState("");

  const loadData = () => {
    fetch("http://localhost:8080/api/admin/teachers")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setTeachers(data); })
      .catch((err) => console.error("Gagal memuat guru:", err));

    fetch("http://localhost:8080/api/keahlian")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setLocalKeahlian(data); })
      .catch((err) => console.error("Gagal memuat keahlian:", err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentKeahlian = localKeahlian.length > 0 ? localKeahlian : (db?.keahlian || []);

  const filtered = teachers.filter((t) =>
    [t.nama, t.email, t.no_hp]
      .join(" ")
      .toLowerCase()
      .includes((search || "").toLowerCase())
  );

  function openAdd() {
    setForm({});
    setExpertises([]);
    setTempMapel("");
    setTempJenjang("");
    setEditItem(null);
    setDrawer("add");
  }

  function openEdit(g: any) {
    setForm(g);
    const guruKeahlianLama = currentKeahlian
      .filter((k: any) => k.id_guru === g.id)
      .map((k: any) => ({
        mapel: String(k.id_mapel),
        jenjang: String(k.id_jenjang)
      }));

    setExpertises(guruKeahlianLama);
    setTempMapel("");
    setTempJenjang("");
    setEditItem(g);
    setDrawer("edit");
  }

  function addExpertise() {
    if (tempMapel && tempJenjang) {
      if (!expertises.some((e) => e.mapel === tempMapel && e.jenjang === tempJenjang)) {
        setExpertises((prev) => [...prev, { mapel: tempMapel, jenjang: tempJenjang }]);
      }
      setTempMapel("");
      setTempJenjang("");
    }
  }

  function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this Teacher?")) return;

    fetch("http://localhost:8080/api/admin/teachers/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_guru: id }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || data.pesan);
        loadData();
      })
      .catch(() => alert("Gagal menghubungi server."));
  }

  function handleSave() {
    let finalExp = [...expertises];
    if (tempMapel && tempJenjang) {
      if (!finalExp.some((exp) => exp.mapel === tempMapel && exp.jenjang === tempJenjang)) {
        finalExp.push({ mapel: tempMapel, jenjang: tempJenjang });
      }
    }
    const expertiseStr = finalExp.map((exp) => `${exp.mapel}-${exp.jenjang}`).join(",");

    if (drawer === "add") {
      fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "teacher",
          nama: form.nama,
          email: form.email,
          no_hp: form.no_hp,
          password: "teacher123",
          expertises: expertiseStr,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "sukses") {
            alert("Teacher successfully added to Database along with his/her Skills!");
            loadData();
          } else {
            alert("Failed to add teacher: " + data.pesan);
          }
        })
        .catch(() => alert("Failed to contact server."));

    } else if (drawer === "edit") {
      fetch("http://localhost:8080/api/admin/teachers/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_guru: editItem.id,
          nama: form.nama,
          email: form.email,
          no_hp: form.no_hp,
          expertises: expertiseStr,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "sukses") {
            alert("Teacher data has been updated successfully!");
            loadData();
          } else {
            alert("Failed to update teacher: " + data.message);
          }
        })
        .catch(() => alert("Failed to contact server."));
    }
    setDrawer(null);
  }

  return (
    <div className="space-y-5 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Teachers</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage all registered tutors and their expertise.
          </p>
        </div>
        <Button onClick={openAdd} icon={<Plus size={15} />}>
          Add Teacher
        </Button>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <p className="text-sm text-slate-500">{filtered.length} teachers</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["Name", "Email", "Phone", "Expertise", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => {
              const guruExpertise = currentKeahlian
                .filter((k: any) => k.id_guru === g.id)
                .map((k: any) => {
                  const mp = (db?.mapel || []).find((m: any) => m.id === k.id_mapel);
                  const jj = (db?.jenjang || []).find((j: any) => j.id === k.id_jenjang);
                  return `${mp?.nama || "Unknown"} (${jj?.nama || "?"})`;
                });

              return (
                <tr key={g.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={g.nama || "?"} size="sm" />
                      <span className="font-medium text-slate-800">{g.nama}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{g.email}</td>
                  <td className="px-5 py-3.5 text-slate-600">{g.no_hp}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1 flex-wrap">
                      {guruExpertise.length > 0 ? (
                        guruExpertise.map((e: string, i: number) => (
                          <Badge key={i} label={e} variant="info" />
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No expertise set</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(g)} className="p-1.5 text-slate-400 hover:text-[#4361EE] hover:bg-indigo-50 rounded-lg transition-all">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(g.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={13} />
                      </button>
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
          <div className="fixed inset-0 bg-black/25 z-30" onClick={() => setDrawer(null)} />
          <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-40 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">
                {drawer === "add" ? "Add New Teacher" : "Edit Teacher"}
              </h2>
              <button onClick={() => setDrawer(null)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <Input label="Full Name" value={form.nama ?? ""} onChange={(v: string) => setForm((p: any) => ({ ...p, nama: v }))} required />
              <Input label="Email" type="email" value={form.email ?? ""} onChange={(v: string) => setForm((p: any) => ({ ...p, email: v }))} required />
              <Input label="Phone Number" value={form.no_hp ?? ""} onChange={(v: string) => setForm((p: any) => ({ ...p, no_hp: v }))} required />

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Expertise (Can Add &gt; 1)</p>
                <div className="space-y-3">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select
                        label="Subject"
                        value={tempMapel}
                        onChange={setTempMapel}
                        options={(db?.mapel || []).map((m: any) => ({ value: String(m.id), label: m.nama }))}
                        placeholder="Select subject"
                      />
                    </div>
                    <div className="flex-1">
                      <Select
                        label="Education Level"
                        value={tempJenjang}
                        onChange={setTempJenjang}
                        options={(db?.jenjang || []).map((j: any) => ({ value: String(j.id), label: j.nama }))}
                        placeholder="Select level"
                      />
                    </div>
                    <Button type="button" onClick={addExpertise} size="md" className="mb-0.5" variant="primary"><Plus size={16} /></Button>
                  </div>

                  {expertises.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      {expertises.map((e, idx) => {
                        const mName = (db?.mapel || []).find((m: any) => String(m.id) === e.mapel)?.nama;
                        const jName = (db?.jenjang || []).find((j: any) => String(j.id) === e.jenjang)?.nama;
                        return (
                          <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600 shadow-sm">
                            {mName} ({jName})
                            <button type="button" onClick={() => setExpertises(expertises.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><X size={12} /></button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
              <Button variant="secondary" onClick={() => setDrawer(null)} className="flex-1 justify-center">Cancel</Button>
              <Button onClick={handleSave} className="flex-1 justify-center">
                {drawer === "add" ? "Add Teacher" : "Save Changes"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
