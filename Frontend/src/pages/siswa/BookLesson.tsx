import { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Check,
  Clock,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import React from "react";
import {
  HARI,
  DAY_SHORT,
  timeToMinutes,
  formatDate,
  Avatar,
  Button,
  Input,
  Select,
  Toast,
  SummaryRow,
} from "../../components/common";

export function BookLesson({ loggedInId, setActiveLessons, db, setPage }: any) {
  const [step, setStep] = useState(1);
  const [selJenjang, setSelJenjang] = useState("");
  const [selMapel, setSelMapel] = useState("");
  const [selGurus, setSelGurus] = useState<number[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [booked, setBooked] = useState(false);

  const [selSlots, setSelSlots] = useState<any[]>([]);
  const [selPickedDays, setSelPickedDays] = useState<string[]>([]);

  const [localJadwal, setLocalJadwal] = useState<any[]>(db?.jadwal || []);
  const [bookedLessons, setBookedLessons] = useState<any[]>([]);

  useEffect(() => {
    fetch(`http://localhost:8080/api/jadwal?t=${new Date().getTime()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLocalJadwal(data);
      })
      .catch(err => console.error("Gagal load jadwal:", err));
  }, []);

  useEffect(() => {
    if (selGurus.length === 0) {
      setBookedLessons([]);
      return;
    }
    Promise.all(
      selGurus.map(id => fetch(`http://localhost:8080/api/les/guru?id_guru=${id}`).then(r => r.json()))
    ).then(results => {
      setBookedLessons(results.flat());
    }).catch(err => console.error("Gagal load jadwal aktif guru", err));
  }, [selGurus]);

  const bookedSlotIds = useMemo(() => {
    if (!startDate || !endDate) return new Set<number>();
    const ids = new Set<number>();

    const startReq = new Date(startDate);
    const endReq = new Date(endDate);
    startReq.setHours(0, 0, 0, 0);
    endReq.setHours(23, 59, 59, 999);

    bookedLessons.forEach(les => {
      if (!les.tanggal_mulai || !les.tanggal_selesai) return;

      const startDB = new Date(les.tanggal_mulai.split("T")[0]);
      const endDB = new Date(les.tanggal_selesai.split("T")[0]);
      startDB.setHours(0, 0, 0, 0);
      endDB.setHours(23, 59, 59, 999);

      if (startDB <= endReq && endDB >= startReq) {
        ids.add(les.id_jadwal);
      }
    });
    return ids;
  }, [startDate, endDate, bookedLessons]);

  const filteredGuru = useMemo(() => {
    if (!selJenjang || !selMapel) return [];
    const validGuruIds = (db?.keahlian || []).filter(
      (k: any) =>
        k.id_jenjang === Number(selJenjang) && k.id_mapel === Number(selMapel),
    ).map((k: any) => k.id_guru);
    return (db?.guru || []).filter((g: any) => validGuruIds.includes(g.id));
  }, [selJenjang, selMapel, db]);

  const guruJadwal = useMemo<any[]>(() => {
    if (selGurus.length === 0) return [];
    return localJadwal.filter((j: any) => selGurus.includes(j.id_guru));
  }, [selGurus, localJadwal]);

  const availableDays = useMemo(
    () => [...new Set(guruJadwal.map((j) => j.hari))],
    [guruJadwal],
  );

  const slotsForPickedDays = useMemo<any[]>(() => {
    return guruJadwal.filter((j) => selPickedDays.includes(j.hari));
  }, [selPickedDays, guruJadwal]);

  function togglePickedDay(day: string) {
    setSelPickedDays((prev) => {
      const next = prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day];
      setSelSlots((s) => s.filter((sl) => next.includes(sl.hari)));
      return next;
    });
  }

  function toggleSlot(slot: any) {
    setSelSlots((prev) => {
      const exists = prev.find((s) => s.id === slot.id);
      if (exists) return prev.filter((s) => s.id !== slot.id);
      return [...prev, slot];
    });
  }

  const selMapelObj = (db?.mapel || []).find((m: any) => m.id === Number(selMapel));
  const selJenjangObj = (db?.jenjang || []).find((j: any) => j.id === Number(selJenjang));

  async function handleBook() {
    if (selSlots.length === 0 || !startDate || !endDate) return;

    try {
      for (const slot of selSlots) {
        const startMins = timeToMinutes(slot.jam_mulai);
        const endMins = timeToMinutes(slot.jam_selesai);
        const durasiMenit = endMins - startMins;

        const payload = {
          id_siswa: loggedInId,
          id_jadwal: slot.id,
          id_mapel: Number(selMapel),
          id_jenjang: Number(selJenjang),
          tanggal_mulai: `${startDate}T${slot.jam_mulai}`,
          tanggal_selesai: `${endDate}T${slot.jam_selesai}`,
          durasi: durasiMenit,
        };

        const response = await fetch("http://localhost:8080/api/les", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (result.status !== "sukses") {
          setToast({ msg: "Gagal booking: " + result.pesan, type: "error" });
          return;
        }
      }

      setBooked(true);
      setToast({
        msg: "Recurring lessons booked successfully!",
        type: "success",
      });

      if (loggedInId) {
        fetch(`http://localhost:8080/api/les/siswa?id_siswa=${loggedInId}`)
          .then((res) => res.json())
          .then((data) => setActiveLessons(data));
      }

      setTimeout(() => {
        setPage("mylessons");
      }, 1500);

    } catch {
      setToast({
        msg: "Server tidak merespon. Pastikan Backend Java berjalan.",
        type: "error",
      });
    }
  }

  const summaryComplete =
    selJenjang &&
    selMapel &&
    selGurus.length > 0 &&
    selSlots.length > 0 &&
    startDate &&
    endDate;

  return (
    <div className="flex gap-0 h-full relative">
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="flex-[3] pr-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)] pb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Book a Lesson</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Follow the steps below to schedule your private tutoring session.
          </p>
        </div>
        <div className="flex items-center gap-0">
          {[
            "Education Level & Subject",
            "Choose Teacher",
            "Schedule Details",
            "Availability",
          ].map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => setStep(i + 1)}
                className="flex items-center gap-2 group"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${step > i + 1 ? "bg-emerald-500 text-white" : step === i + 1 ? "bg-[#4361EE] text-white" : "bg-slate-200 text-slate-500"}`}
                >
                  {step > i + 1 ? <Check size={12} /> : i + 1}
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap ${step === i + 1 ? "text-[#4361EE]" : "text-slate-400"}`}
                >
                  {s}
                </span>
              </button>
              {i < 3 && (
                <div
                  className={`flex-1 h-px mx-3 ${step > i + 1 ? "bg-emerald-400" : "bg-slate-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <span className="w-5 h-5 bg-[#4361EE] text-white rounded-full flex items-center justify-center text-xs">
              1
            </span>{" "}
            Education Level &amp; Subject
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Education Level"
              value={selJenjang}
              onChange={(v: string) => {
                setSelJenjang(v);
                setSelMapel("");
                setSelGurus([]);
                setSelSlots([]);
              }}
              options={(db?.jenjang || []).map((j: any) => ({
                value: String(j.id),
                label: j.nama,
              }))}
              placeholder="Select level"
              required
            />
            <Select
              label="Subject"
              value={selMapel}
              onChange={(v: string) => {
                setSelMapel(v);
                setSelGurus([]);
                setSelSlots([]);
              }}
              options={(db?.mapel || []).map((m: any) => ({
                value: String(m.id),
                label: m.nama,
              }))}
              placeholder={selJenjang ? "Select subject" : "Select level first"}
              required
            />
          </div>
          {selJenjang && selMapel && (
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} size="sm">
                Next: Choose Teacher <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </div>

        {/* Step 2 */}
        {selMapel && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-5 h-5 bg-[#4361EE] text-white rounded-full flex items-center justify-center text-xs">
                2
              </span>{" "}
              Choose Teachers
            </h2>
            {filteredGuru.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                No teachers available for this criteria.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredGuru.map((g: any) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setSelGurus((prev) =>
                        prev.includes(g.id)
                          ? prev.filter((id) => id !== g.id)
                          : [...prev, g.id],
                      );
                      setSelPickedDays([]);
                      setSelSlots([]);
                    }}
                    className={`text-left p-4 border rounded-xl flex items-start gap-3 transition-all ${selGurus.includes(g.id) ? "border-[#4361EE] bg-indigo-50 ring-1 ring-[#4361EE]/20" : "border-slate-200 hover:bg-slate-50"}`}
                  >
                    <Avatar name={g.nama} size="lg" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800 leading-tight">
                        {g.nama}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{g.email}</p>
                    </div>
                    {selGurus.includes(g.id) && (
                      <Check size={16} className="ml-auto text-[#4361EE]" />
                    )}
                  </button>
                ))}
              </div>
            )}
            {selGurus.length > 0 && (
              <div className="flex justify-end pt-2">
                <Button onClick={() => setStep(3)} size="sm">
                  Next: Schedule Details <ChevronRight size={14} />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 3 */}
        {selGurus.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-5 h-5 bg-[#4361EE] text-white rounded-full flex items-center justify-center text-xs">
                3
              </span>{" "}
              Schedule Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={setStartDate}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={setEndDate}
                min={startDate}
                required
              />
            </div>
            {startDate && endDate && (
              <div className="flex justify-end pt-2">
                <Button onClick={() => setStep(4)} size="sm">
                  Next: Availability <ChevronRight size={14} />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 4 */}
        {startDate && endDate && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-5 h-5 bg-[#4361EE] text-white rounded-full flex items-center justify-center text-xs">
                4
              </span>{" "}
              Teacher Availability
            </h2>
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">
                Pilih Hari <span className="text-red-400">*</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {HARI.map((day) => {
                  const isAvail = availableDays.includes(day);
                  const sel = selPickedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => isAvail && togglePickedDay(day)}
                      disabled={!isAvail}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${!isAvail ? "border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed" : sel ? "border-[#4361EE] bg-[#4361EE] text-white" : "border-slate-300 text-slate-600 hover:border-[#4361EE] hover:text-[#4361EE]"}`}
                    >
                      {DAY_SHORT[day]}
                    </button>
                  );
                })}
              </div>
            </div>
            {selPickedDays.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs font-medium text-slate-600">
                  Pilih Slot (1 jam) <span className="text-red-400">*</span>
                </p>
                {selPickedDays.map((day) => {
                  const daySlots = slotsForPickedDays.filter((s) => s.hari === day);
                  return (
                    <div key={day} className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {day}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {daySlots.map((slot) => {
                          const isSel = selSlots.some((s) => s.id === slot.id);
                          const isBooked = bookedSlotIds.has(slot.id);
                          const slotGuru = (db?.guru || []).find((g: any) => g.id === slot.id_guru);

                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => !isBooked && toggleSlot(slot)}
                              disabled={isBooked}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${isBooked ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" : isSel ? "bg-[#4361EE] border-[#4361EE] text-white" : "bg-white border-slate-200 text-slate-600 hover:border-[#4361EE] hover:text-[#4361EE]"}`}
                            >
                              <Clock size={11} />
                              {slot.jam_mulai?.substring(0, 5)} – {slot.jam_selesai?.substring(0, 5)} ({slotGuru?.nama.split(" ")[0] || "Guru"})
                              {isBooked && <span className="ml-1 text-red-400">(Full)</span>}
                              {isSel && <Check size={11} className="ml-1" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {selSlots.length > 0 && (
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <Button onClick={handleBook} disabled={booked} icon={<BookOpen size={15} />}>
                      {booked ? "Booked!" : "Confirm Recurring Booking"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right — Summary */}
      <div className="flex-[2] pl-6 border-l border-slate-200">
        <div className="sticky top-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">
            Booking Summary
          </h2>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-[#4361EE] px-5 py-4">
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
                Recurring Tutoring Session
              </p>
              <p className="text-white text-lg font-bold mt-1">
                {selMapelObj ? selMapelObj.nama : "—"}{" "}
                {selJenjangObj && (
                  <span className="text-white/70 text-sm font-normal ml-1">
                    ({selJenjangObj.nama})
                  </span>
                )}
              </p>
            </div>
            <div className="p-5 space-y-4">
              <SummaryRow
                icon={<Clock size={14} />}
                label="Time Slots"
                value={
                  selSlots.length > 0
                    ? selSlots.map((s) => `${s.hari} ${s.jam_mulai?.substring(0, 5)}`).join(", ")
                    : "Not selected"
                }
              />
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <SummaryRow
                  icon={<Calendar size={14} />}
                  label="Start Date"
                  value={
                    startDate ? formatDate(startDate + "T00:00") : "Not set"
                  }
                />
                <SummaryRow
                  icon={<Calendar size={14} />}
                  label="End Date"
                  value={endDate ? formatDate(endDate + "T00:00") : "Not set"}
                />
              </div>
              {summaryComplete && (
                <div
                  className={`rounded-lg p-3 text-xs font-medium flex items-center gap-2 ${booked ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-[#4361EE]"}`}
                >
                  {booked ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <AlertTriangle size={14} />
                  )}
                  {booked
                    ? "Your lessons have been confirmed!"
                    : "Ready to book. Review and confirm."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
