import { useState } from "react";
import {
  BookOpen,
  Calendar,
  Users,
  Shield,
  Search,
  Bell,
  Layers,
  X,
  CheckCircle2,
  AlertTriangle,
  Check,
  GraduationCap, Edit2, Plus
} from "lucide-react";
import React from "react";
import { Role, Button, Input, Select, Jenjang, Mapel } from "../components/common";

export interface RegisterPageProps {
  onGoLogin: () => void;
  db: {
    jenjang: Jenjang[];
    mapel: Mapel[];
  };
}

export function RegisterPage({ onGoLogin, db }: RegisterPageProps) {
  const [role, setRegRole] = useState<Role>("student");
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ nama: "", email: "", no_hp: "", password: "", confirm: "", tanggal_lahir: "", jenis_kelamin: "", id_jenjang: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const [expertises, setExpertises] = useState<{ mapel: string, jenjang: string }[]>([]);
  const [tempMapel, setTempMapel] = useState("");
  const [tempJenjang, setTempJenjang] = useState("");

  function f(k: keyof typeof form) {
    return (v: string) => setForm((p) => ({ ...p, [k]: v }));
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setStep(2);
  }

  function addExpertise() {
    if (tempMapel && tempJenjang) {
      if (!expertises.some(e => e.mapel === tempMapel && e.jenjang === tempJenjang)) {
        setExpertises(prev => [...prev, { mapel: tempMapel, jenjang: tempJenjang }]);
      }
      setTempMapel("");
      setTempJenjang("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    let finalExp = [...expertises];
    if (role === "teacher" && tempMapel && tempJenjang) {
      if (!finalExp.some(exp => exp.mapel === tempMapel && exp.jenjang === tempJenjang)) {
        finalExp.push({ mapel: tempMapel, jenjang: tempJenjang });
      }
    }

    const dataRegistrasi = {
      role: role,
      nama: form.nama,
      email: form.email,
      password: form.password,
      no_hp: form.no_hp,
      tanggal_lahir: form.tanggal_lahir,
      jenis_kelamin: form.jenis_kelamin,
      id_jenjang: form.id_jenjang,
      expertises: finalExp.map(exp => `${exp.mapel}-${exp.jenjang}`).join(",")
    };

    try {
      const response = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataRegistrasi),
      });

      const result = await response.json();

      if (result.status === "sukses") {
        setDone(true);
      } else {
        setError("Gagal menyimpan ke database: " + result.pesan);
      }
    } catch (err) {
      setError("Tidak bisa terhubung ke server. Pastikan Java sudah jalan.");
    }
  }

  const roleColors: Record<Role, string> = {
    student: "border-sky-400 bg-sky-50 text-sky-700",
    teacher: "border-violet-400 bg-violet-50 text-violet-700",
    admin: "border-indigo-400 bg-indigo-50 text-indigo-700",
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="text-center space-y-5 max-w-sm">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Account Created!</h2>
            <p className="text-sm text-slate-500 mt-1">Your {role} account for <strong>{form.email}</strong> has been registered.</p>
          </div>
          <Button onClick={onGoLogin} className="mx-auto">Go to Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="hidden lg:flex w-[480px] flex-shrink-0 bg-[#1C2B3A] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#4361EE] rounded-xl flex items-center justify-center"><Layers size={18} className="text-white" /></div>
          <span className="text-white text-lg font-bold">EduCAPY</span>
        </div>
        <div className="space-y-5">
          <h2 className="text-3xl font-bold text-white leading-snug">Join EduCAPY today.</h2>
          <p className="text-white/50 text-sm leading-relaxed">Create your account and start managing your learning or teaching journey with ease.</p>
          <div className="space-y-3">
            {[
              { step: "1", label: "Choose your role", sub: "Student, Teacher, or Admin" },
              { step: "2", label: "Fill in your details", sub: "Basic info and credentials" },
              { step: "3", label: "Start using Educapy", sub: "Book lessons or manage schedules" },
            ].map(({ step: s, label, sub }) => (
              <div key={s} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#4361EE]/20 border border-[#4361EE]/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold text-[#4361EE]">{s}</span></div>
                <div><p className="text-white text-sm font-semibold">{label}</p><p className="text-white/40 text-xs">{sub}</p></div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/20 text-xs">© 2026 Educapy. All rights reserved.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
            <p className="text-sm text-slate-500 mt-1">Already have an account? <button onClick={onGoLogin} className="text-[#4361EE] font-medium hover:underline underline-offset-2">Sign in</button></p>
          </div>

          <div className="flex items-center gap-3">
            {["Account Type & Credentials", "Profile Details"].map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step > i + 1 ? "bg-emerald-500 text-white" : step === i + 1 ? "bg-[#4361EE] text-white" : "bg-slate-200 text-slate-400"}`}>{step > i + 1 ? <Check size={11} /> : i + 1}</div>
                <span className={`text-xs font-medium hidden sm:block ${step === i + 1 ? "text-[#4361EE]" : "text-slate-400"}`}>{s}</span>
                {i === 0 && <div className={`flex-1 h-px ${step > 1 ? "bg-emerald-400" : "bg-slate-200"}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">Register as <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {(["student", "teacher", "admin"] as Role[]).map((r) => {
                    const icons = { student: GraduationCap, teacher: Edit2, admin: Shield };
                    const Icon = icons[r];
                    return (
                      <button key={r} type="button" onClick={() => setRegRole(r)} className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all ${role === r ? roleColors[r] + " border-current" : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"}`}>
                        <Icon size={18} /><span className="text-xs font-semibold capitalize">{r}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <Input label="Full Name" value={form.nama} onChange={f("nama")} placeholder="Your full name" required />
              <Input label="Email Address" type="email" value={form.email} onChange={f("email")} placeholder="you@example.com" required />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Password" type="password" value={form.password} onChange={f("password")} placeholder="Min. 6 characters" required />
                <Input label="Confirm Password" type="password" value={form.confirm} onChange={f("confirm")} placeholder="Repeat password" required />
              </div>
              {error && <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3"><AlertTriangle size={15} className="flex-shrink-0" />{error}</div>}
              <button type="submit" className="w-full py-2.5 bg-[#4361EE] hover:bg-[#3451DB] text-white text-sm font-semibold rounded-xl transition-all shadow-sm">Continue</button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Phone Number" value={form.no_hp} onChange={f("no_hp")} placeholder="e.g. 08123456789" required />
              {role === "student" && (
                <>
                  <Input label="Date of Birth" type="date" value={form.tanggal_lahir} onChange={f("tanggal_lahir")} required />
                  <Select label="Gender" value={form.jenis_kelamin} onChange={f("jenis_kelamin")} options={[{ value: "L", label: "Male" }, { value: "P", label: "Female" }]} placeholder="Select gender" required />
                  <Select
                    label="Education Level"
                    value={form.id_jenjang}
                    onChange={f("id_jenjang")}
                    options={db.jenjang.map((j: any) => ({ value: String(j.id), label: j.nama }))}
                    placeholder="Select level"
                    required
                  />
                </>
              )}
              {role === "teacher" && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Expertise (Can Add &gt; 1)</p>
                  <div className="space-y-3">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Select
                          label="Subject"
                          value={tempMapel}
                          onChange={setTempMapel}
                          options={db.mapel.map((m: any) => ({ value: String(m.id), label: m.nama }))}
                          placeholder="Select subject"
                        />
                      </div>
                      <div className="flex-1">
                        <Select
                          label="Education Level"
                          value={tempJenjang}
                          onChange={setTempJenjang}
                          options={db.jenjang.map((j: any) => ({ value: String(j.id), label: j.nama }))}
                          placeholder="Select level"
                        />
                      </div>
                      <Button type="button" onClick={addExpertise} size="md" className="mb-0.5" variant="primary"><Plus size={16} /></Button>
                    </div>

                    {expertises.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        {expertises.map((e, idx) => {
                          const mName = db.mapel.find((m: any) => String(m.id) === e.mapel)?.nama;
                          const jName = db.jenjang.find((j: any) => String(j.id) === e.jenjang)?.nama;
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
              )}
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1 justify-center">Back</Button>
                <button type="submit" className="flex-1 py-2.5 bg-[#4361EE] hover:bg-[#3451DB] text-white text-sm font-semibold rounded-xl transition-all shadow-sm">Create Account</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}