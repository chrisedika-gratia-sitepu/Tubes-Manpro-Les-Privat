import { useState, useEffect } from "react";
import { LayoutDashboard, Users, UserCheck, Shield, Calendar } from "lucide-react";
import React from "react";
import { Role } from "./components/common";

import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { StudentDashboard } from "./pages/siswa/StudentDashboard";
import { BookLesson } from "./pages/siswa/BookLesson";
import { MyLessons } from "./pages/siswa/MyLessons";
import { TeacherDashboard } from "./pages/guru/TeacherDashboard";
import { TeacherAvailability } from "./pages/guru/TeacherAvailability";
import { TeacherSchedule } from "./pages/guru/TeacherSchedule";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminStudents } from "./pages/admin/AdminStudents";
import { AdminTeachers } from "./pages/admin/AdminTeachers";
import { AdminAdmins } from "./pages/admin/AdminAdmins";
import { AdminManageSchedule } from "./pages/admin/AdminManageSchedule";

import { Sidebar, TopBar } from "./components/common";
import { HARI, DAY_SHORT, Badge, Button } from "./components/common";

interface Jenjang {
  id: number;
  nama: string;
}
interface Mapel {
  id: number;
  nama: string;
}
interface Guru {
  id: number;
  nama: string;
  email: string;
  no_hp: string;
  password?: string;
  id_admin: number;
  avatar?: string;
}
interface Siswa {
  id: number;
  nama: string;
  email: string;
  no_hp: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  password?: string;
  id_jenjang: number;
  alamat?: string;
}
interface Admin {
  id: number;
  nama: string;
  email: string;
  no_hp: string;
  password?: string;
}
interface KeahlianGuru {
  id: number;
  id_guru: number;
  id_mapel: number;
  id_jenjang: number;
}
interface JadwalKesediaan {
  id: number;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  status: string;
  id_guru: number;
  id_admin: number;
}
interface Les {
  id: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  id_siswa: number;
  id_jadwal: number;
  id_mapel: number;
  id_jenjang: number;
  jam_mulai?: string;
  jam_selesai?: string;
}

const NAV: Record<
  Role,
  { icon: React.ElementType; label: string; page: string }[]
> = {
  student: [
    { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" },
    { icon: Calendar, label: "Book a Lesson", page: "book" },
    { icon: Calendar, label: "My Lessons", page: "mylessons" },
  ],
  teacher: [
    { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" },
    { icon: Calendar, label: "Availability", page: "availability" },
    { icon: Calendar, label: "My Schedule", page: "schedule" },
  ],
  admin: [
    { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" },
    { icon: Users, label: "Students", page: "students" },
    { icon: UserCheck, label: "Teachers", page: "teachers" },
    { icon: Shield, label: "Admins", page: "admins" },
    { icon: Calendar, label: "Manage Schedules", page: "schedules" },
  ],
};

export default function App() {
  const [authScreen, setAuthScreen] = useState<"login" | "register" | null>(
    "login",
  );
  const [loggedInRole, setLoggedInRole] = useState<Role>("student");
  const [loggedInName, setLoggedInName] = useState("");
  const [page, setPage] = useState("dashboard");
  const [globalSearch, setGlobalSearch] = useState("");
  const [loggedInId, setLoggedInId] = useState<number | null>(null);
  const [activeLessons, setActiveLessons] = useState<Les[]>([]);
  const [db, setDb] = useState({
    guru: [] as Guru[],
    siswa: [] as Siswa[],
    mapel: [] as Mapel[],
    jenjang: [] as Jenjang[],
    keahlian: [] as KeahlianGuru[],
    jadwal: [] as JadwalKesediaan[],
    admins: [] as Admin[]
  });

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8080/api/guru").then(r => r.json()).catch(() => []),
      fetch("http://localhost:8080/api/siswa").then(r => r.json()).catch(() => []),
      fetch("http://localhost:8080/api/mapel").then(r => r.json()).catch(() => []),
      fetch("http://localhost:8080/api/jenjang").then(r => r.json()).catch(() => []),
      fetch("http://localhost:8080/api/keahlian").then(r => r.json()).catch(() => []),
      fetch("http://localhost:8080/api/jadwal").then(r => r.json()).catch(() => []),
      fetch("http://localhost:8080/api/admin").then(r => r.json()).catch(() => []),
    ]).then(([guru, siswa, mapel, jenjang, keahlian, jadwal, admins]) => {
      setDb({ guru, siswa, mapel, jenjang, keahlian, jadwal, admins });
    });
  }, []);

  useEffect(() => {
    if (loggedInRole === "student" && loggedInId) {
      fetch(`http://localhost:8080/api/les/siswa?id_siswa=${loggedInId}`)
        .then((res) => res.json())
        .then((data) => setActiveLessons(data));
    }
  }, [loggedInId, loggedInRole]);

  function handleLogin(role: Role, nama: string, id: number) {
    setLoggedInRole(role);
    setLoggedInName(nama);
    setLoggedInId(id);
    setAuthScreen(null);
    setPage("dashboard");
  }

  function handleLogout() {
    setAuthScreen("login");
    setPage("dashboard");
    setGlobalSearch("");
  }

  function handleRoleSwitch(r: Role) {
    setLoggedInRole(r);
    setPage("dashboard");
  }

  if (authScreen === "login")
    return <LoginPage onLogin={handleLogin} onGoRegister={() => setAuthScreen("register")} />;
  if (authScreen === "register")
    return <RegisterPage onGoLogin={() => setAuthScreen("login")} db={db} />;

  return (
    <div
      className="min-h-screen bg-[#F5F7FA]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Sidebar role={loggedInRole} page={page} setPage={setPage} onLogout={handleLogout} />
      <div className="pl-56 flex flex-col min-h-screen">
        <TopBar
          role={loggedInRole}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          onLogout={handleLogout}
          loggedInName={loggedInName}
        />
        <main className="flex-1 p-8 max-w-[1280px] w-full">{renderPage()}</main>
      </div>
    </div>
  );

  function renderPage() {
    if (loggedInRole === "student") {
      if (page === "book")
        return <BookLesson loggedInId={loggedInId} setActiveLessons={setActiveLessons} db={db} setPage={setPage} />;
      if (page === "mylessons")
        return <MyLessons loggedInId={loggedInId} activeLessons={activeLessons} db={db} />;
      return (
        <StudentDashboard
          setPage={setPage}
          loggedInName={loggedInName}
          loggedInId={loggedInId}
          activeLessons={activeLessons}
          db={db}
        />
      );
    }
    if (loggedInRole === "teacher") {
      if (page === "availability") return <TeacherAvailability loggedInId={loggedInId} db={db} />;
      if (page === "schedule") return <TeacherSchedule loggedInId={loggedInId} db={db} />;
      return <TeacherDashboard loggedInId={loggedInId} loggedInName={loggedInName} db={db} />;
    }
    if (page === "students") return <AdminStudents search={globalSearch} db={db} />;
    if (page === "teachers") return <AdminTeachers search={globalSearch} db={db} />;
    if (page === "admins") return <AdminAdmins search={globalSearch} db={db} />;
    if (page === "schedules") {
      return <AdminManageSchedule search={globalSearch} db={db} />;
    }
    return <AdminDashboard />;
  }
}