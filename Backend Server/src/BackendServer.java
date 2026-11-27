import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;

public class BackendServer {

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        server.createContext("/api/register", new AuthAndBookingHandlers.RegisterHandler());
        server.createContext("/api/login", new AuthAndBookingHandlers.LoginHandler());
        server.createContext("/api/les/siswa", new SiswaHandlers.GetStudentLessonsHandler());
        server.createContext("/api/les", new AuthAndBookingHandlers.BookingHandler());
        server.createContext("/api/guru", new GuruHandlers.GetGuruHandler());
        server.createContext("/api/siswa", new SiswaHandlers.GetSiswaHandler());
        server.createContext("/api/mapel", new SiswaHandlers.GetMapelHandler());
        server.createContext("/api/jenjang", new SiswaHandlers.GetJenjangHandler());
        server.createContext("/api/jadwal", new GuruHandlers.GetJadwalHandler());
        server.createContext("/api/admin", new AdminHandlers.GetAdminHandler());
        server.createContext("/api/les/guru", new GuruHandlers.GetTeacherLessonsHandler());
        server.createContext("/api/les/jenjang/keahlian", new LesJadwalHandler.GetKeahlianHandler());
        server.createContext("/api/keahlian", new LesJadwalHandler.GetKeahlianHandler());
        server.createContext("/api/jadwal/add", new LesJadwalHandler.PostJadwalHandler());

        // Admin Endpoints
        server.createContext("/api/admin/stats", new AdminHandlers.AdminStatsHandler());
        server.createContext("/api/admin/students", new AdminHandlers.AdminStudentsHandler());
        server.createContext("/api/admin/teachers", new AdminHandlers.AdminTeachersHandler());
        server.createContext("/api/admin/admins", new AdminHandlers.AdminAdminsHandler());
        server.createContext("/api/admin/schedules", new AdminHandlers.AdminScheduleHandler());
        server.createContext("/api/admin/schedules/update", new AdminHandlers.UpdateScheduleHandler());
        server.createContext("/api/admin/schedules/delete", new AdminHandlers.DeleteScheduleHandler());
        server.createContext("/api/admin/options", new AdminHandlers.AdminOptionsHandler());
        server.createContext("/api/admin/teachers/delete", new GuruHandlers.DeleteTeacherHandler());
        server.createContext("/api/admin/teachers/update", new GuruHandlers.UpdateTeacherHandler());
        server.createContext("/api/admin/students/delete", new AdminHandlers.DeleteStudentHandler());
        server.createContext("/api/admin/students/update", new AdminHandlers.UpdateStudentHandler());
        server.createContext("/api/admin/admins/delete", new AdminHandlers.DeleteAdminHandler());
        server.createContext("/api/admin/admins/update", new AdminHandlers.UpdateAdminHandler());
        server.createContext("/api/admin/slots", new AdminHandlers.AdminSlotGuruHandler());
        server.createContext("/api/admin/slots/update", new AdminHandlers.AdminUpdateSlotHandler());
        server.createContext("/api/admin/slots/delete", new AdminHandlers.AdminDeleteSlotHandler());
        server.setExecutor(null);
        System.out.println("Server Back-End Java jalan di: http://localhost:8080");
        server.start();
    }
}