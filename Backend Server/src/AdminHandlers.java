import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class AdminHandlers {

    public static class GetAdminHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            ServerUtils.aturCORS(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(405, -1);
                return;
            }

            try (Connection conn = DatabaseConfig.getConnection()) {
                String sql = "SELECT id_admin, nama, email, no_hp FROM Admin ORDER BY nama";
                PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery();

                StringBuilder json = new StringBuilder("[");
                boolean first = true;
                while (rs.next()) {
                    if (!first)
                        json.append(",");
                    json.append("{")
                            .append("\"id\":").append(rs.getInt("id_admin")).append(",")
                            .append("\"nama\":\"").append(ServerUtils.escapeJson(rs.getString("nama"))).append("\",")
                            .append("\"email\":\"").append(ServerUtils.escapeJson(ServerUtils.nullSafe(rs.getString("email")))).append("\",")
                            .append("\"no_hp\":\"").append(ServerUtils.escapeJson(ServerUtils.nullSafe(rs.getString("no_hp")))).append("\"")
                            .append("}");
                    first = false;
                }
                json.append("]");
                ServerUtils.kirimResponJSON(exchange, 200, json.toString());

            } catch (Exception e) {
                e.printStackTrace();
                ServerUtils.kirimResponJSON(exchange, 500, "[]");
            }
        }
    }

    public static class AdminStatsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            try (Connection conn = DatabaseConfig.getConnection()) {
                String sql = "SELECT " +
                        "(SELECT COUNT(*) FROM Siswa) as total_siswa, " +
                        "(SELECT COUNT(*) FROM Guru) as total_guru, " +
                        "(SELECT COUNT(*) FROM Admin) as total_admin, " +
                        "(SELECT COUNT(*) FROM Detail_Daftar_Les) as total_les";
                try (PreparedStatement ps = conn.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        String json = String.format(
                                "{\"total_siswa\":%d,\"total_guru\":%d,\"total_admin\":%d,\"total_les\":%d}",
                                rs.getInt("total_siswa"), rs.getInt("total_guru"), rs.getInt("total_admin"),
                                rs.getInt("total_les"));
                        ServerUtils.kirimResponJSON(exchange, 200, json);
                    }
                }
            } catch (Exception e) {
                ServerUtils.kirimResponJSON(exchange, 500, "{\"error\":\"" + ServerUtils.escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    public static class AdminStudentsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            try (Connection conn = DatabaseConfig.getConnection();
                    PreparedStatement ps = conn.prepareStatement("SELECT id_siswa, nama, email, no_hp FROM Siswa");
                    ResultSet rs = ps.executeQuery()) {
                StringBuilder sb = new StringBuilder("[");
                while (rs.next()) {
                    if (sb.length() > 1)
                        sb.append(",");
                    sb.append(String.format("{\"id\":%d,\"nama\":\"%s\",\"email\":\"%s\",\"no_hp\":\"%s\"}",
                            rs.getInt("id_siswa"), ServerUtils.escapeJson(rs.getString("nama")), ServerUtils.escapeJson(rs.getString("email")),
                            ServerUtils.escapeJson(rs.getString("no_hp"))));
                }
                sb.append("]");
                ServerUtils.kirimResponJSON(exchange, 200, sb.toString());
            } catch (Exception e) {
                ServerUtils.kirimResponJSON(exchange, 500, "{\"error\":\"" + ServerUtils.escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    public static class AdminTeachersHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            try (Connection conn = DatabaseConfig.getConnection();
                    PreparedStatement ps = conn.prepareStatement("SELECT id_guru, nama, email, no_hp FROM Guru");
                    ResultSet rs = ps.executeQuery()) {
                StringBuilder sb = new StringBuilder("[");
                while (rs.next()) {
                    if (sb.length() > 1)
                        sb.append(",");
                    sb.append(String.format("{\"id\":%d,\"nama\":\"%s\",\"email\":\"%s\",\"no_hp\":\"%s\"}",
                            rs.getInt("id_guru"), ServerUtils.escapeJson(rs.getString("nama")), ServerUtils.escapeJson(rs.getString("email")),
                            ServerUtils.escapeJson(rs.getString("no_hp"))));
                }
                sb.append("]");
                ServerUtils.kirimResponJSON(exchange, 200, sb.toString());
            } catch (Exception e) {
                ServerUtils.kirimResponJSON(exchange, 500, "{\"error\":\"" + ServerUtils.escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    public static class AdminAdminsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            try (Connection conn = DatabaseConfig.getConnection();
                    PreparedStatement ps = conn.prepareStatement("SELECT id_admin, nama, email, no_hp FROM Admin");
                    ResultSet rs = ps.executeQuery()) {
                StringBuilder sb = new StringBuilder("[");
                while (rs.next()) {
                    if (sb.length() > 1)
                        sb.append(",");
                    sb.append(String.format("{\"id\":%d,\"nama\":\"%s\",\"email\":\"%s\",\"no_hp\":\"%s\"}",
                            rs.getInt("id_admin"), ServerUtils.escapeJson(rs.getString("nama")), ServerUtils.escapeJson(rs.getString("email")),
                            ServerUtils.escapeJson(rs.getString("no_hp"))));
                }
                sb.append("]");
                ServerUtils.kirimResponJSON(exchange, 200, sb.toString());
            } catch (Exception e) {
                ServerUtils.kirimResponJSON(exchange, 500, "{\"error\":\"" + ServerUtils.escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    public static class AdminScheduleHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            ServerUtils.aturCORS(exchange);
            String sql = "SELECT j.id_jadwal, j.hari, j.jam_mulai, j.jam_selesai, g.nama AS nama_guru, " +
                    "s.nama AS nama_siswa, m.nama_mapel, jn.nama_jenjang, d.id_detail " +
                    "FROM Jadwal_Kesediaan_Guru j " +
                    "JOIN Guru g ON j.id_guru = g.id_guru " +
                    "LEFT JOIN Detail_Daftar_Les d ON j.id_jadwal = d.id_jadwal " +
                    "LEFT JOIN Les l ON d.id_les = l.id_les " +
                    "LEFT JOIN Siswa s ON l.id_siswa = s.id_siswa " +
                    "LEFT JOIN Mata_pelajaran m ON d.id_mapel = m.id_mapel " +
                    "LEFT JOIN Jenjang jn ON d.id_jenjang = jn.id_jenjang";
            try (Connection conn = DatabaseConfig.getConnection();
                    PreparedStatement ps = conn.prepareStatement(sql);
                    ResultSet rs = ps.executeQuery()) {
                StringBuilder sb = new StringBuilder("[");
                while (rs.next()) {
                    if (sb.length() > 1)
                        sb.append(",");
                    sb.append(String.format(
                            "{\"id_detail\":%d,\"id_les\":%d,\"id_jadwal\":%d,\"id_mapel\":%d,\"id_jenjang\":%d," +
                                    "\"nama_siswa\":\"%s\",\"nama_guru\":\"%s\",\"nama_mapel\":\"%s\",\"nama_jenjang\":\"%s\","
                                    +
                                    "\"hari\":\"%s\",\"jam_mulai\":\"%s\",\"jam_selesai\":\"%s\"}",
                            rs.getInt("id_detail"), rs.getInt("id_les"), rs.getInt("id_jadwal"), rs.getInt("id_mapel"),
                            rs.getInt("id_jenjang"),
                            ServerUtils.escapeJson(rs.getString("nama_siswa")), ServerUtils.escapeJson(rs.getString("nama_guru")),
                            ServerUtils.escapeJson(rs.getString("nama_mapel")),
                            ServerUtils.escapeJson(rs.getString("nama_jenjang")), ServerUtils.escapeJson(rs.getString("hari")),
                            rs.getString("jam_mulai"), rs.getString("jam_selesai")));
                }
                sb.append("]");
                ServerUtils.kirimResponJSON(exchange, 200, sb.toString());
            } catch (Exception e) {
                ServerUtils.kirimResponJSON(exchange, 500, "{\"error\":\"" + ServerUtils.escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    public static class UpdateScheduleHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            ServerUtils.aturCORS(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            try {
                String body = ServerUtils.bacaBody(exchange);
                int idDetail = Integer.parseInt(ServerUtils.ambilNilaiJSON(body, "id_detail"));
                int idJadwal = Integer.parseInt(ServerUtils.ambilNilaiJSON(body, "id_jadwal"));
                int idMapel = Integer.parseInt(ServerUtils.ambilNilaiJSON(body, "id_mapel"));
                int idJenjang = Integer.parseInt(ServerUtils.ambilNilaiJSON(body, "id_jenjang"));
                String hari = ServerUtils.ambilNilaiJSON(body, "hari");
                String jamMulai = ServerUtils.ambilNilaiJSON(body, "jam_mulai");
                String jamSelesai = ServerUtils.ambilNilaiJSON(body, "jam_selesai");

                try (Connection conn = DatabaseConfig.getConnection()) {
                    String sqlDetail = "UPDATE Detail_Daftar_Les SET id_mapel = ?, id_jenjang = ? WHERE id_detail = ?";
                    try (PreparedStatement ps = conn.prepareStatement(sqlDetail)) {
                        ps.setInt(1, idMapel);
                        ps.setInt(2, idJenjang);
                        ps.setInt(3, idDetail);
                        ps.executeUpdate();
                    }
                    String sqlJadwal = "UPDATE Jadwal_Kesediaan_Guru SET hari = ?, jam_mulai = ?, jam_selesai = ? WHERE id_jadwal = ?";
                    try (PreparedStatement ps = conn.prepareStatement(sqlJadwal)) {
                        ps.setString(1, hari);
                        ps.setString(2, jamMulai);
                        ps.setString(3, jamSelesai);
                        ps.setInt(4, idJadwal);
                        ps.executeUpdate();
                    }
                    ServerUtils.kirimResponJSON(exchange, 200, "{\"message\":\"Jadwal berhasil diatur ulang!\"}");
                }
            } catch (Exception e) {
                ServerUtils.kirimResponJSON(exchange, 500, "{\"error\":\"" + ServerUtils.escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    public static class DeleteScheduleHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            try {
                String body = ServerUtils.bacaBody(exchange);
                int idDetail = Integer.parseInt(ServerUtils.ambilNilaiJSON(body, "id_detail"));

                try (Connection conn = DatabaseConfig.getConnection();
                        PreparedStatement ps = conn.prepareStatement("DELETE FROM Detail_Daftar_Les WHERE id_detail = ?")) {
                    ps.setInt(1, idDetail);
                    ps.executeUpdate();
                    ServerUtils.kirimResponJSON(exchange, 200, "{\"message\":\"Jadwal les berhasil dihapus!\"}");
                }
            } catch (Exception e) {
                ServerUtils.kirimResponJSON(exchange, 500, "{\"error\":\"" + ServerUtils.escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    public static class AdminOptionsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            try (Connection conn = DatabaseConfig.getConnection()) {
                StringBuilder mapelSb = new StringBuilder("[");
                try (PreparedStatement ps = conn.prepareStatement("SELECT id_mapel, nama_mapel FROM Mata_pelajaran");
                        ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        if (mapelSb.length() > 1) mapelSb.append(",");
                        mapelSb.append(String.format("{\"id\":%d,\"nama\":\"%s\"}", rs.getInt("id_mapel"),
                                ServerUtils.escapeJson(rs.getString("nama_mapel"))));
                    }
                }
                mapelSb.append("]");

                StringBuilder jenjangSb = new StringBuilder("[");
                try (PreparedStatement ps = conn.prepareStatement("SELECT id_jenjang, nama_jenjang FROM Jenjang");
                        ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        if (jenjangSb.length() > 1) jenjangSb.append(",");
                        jenjangSb.append(String.format("{\"id\":%d,\"nama\":\"%s\"}", rs.getInt("id_jenjang"),
                                ServerUtils.escapeJson(rs.getString("nama_jenjang"))));
                    }
                }
                jenjangSb.append("]");

                StringBuilder jadwalSb = new StringBuilder("[");
                String jSql = "SELECT j.id_jadwal, j.hari, j.jam_mulai, j.jam_selesai, g.nama FROM Jadwal_Kesediaan_Guru j JOIN Guru g ON j.id_guru = g.id_guru";
                try (PreparedStatement ps = conn.prepareStatement(jSql); ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        if (jadwalSb.length() > 1) jadwalSb.append(",");
                        jadwalSb.append(String.format(
                                "{\"id_jadwal\":%d,\"hari\":\"%s\",\"jam_mulai\":\"%s\",\"jam_selesai\":\"%s\",\"nama_guru\":\"%s\"}",
                                rs.getInt("id_jadwal"), rs.getString("hari"), rs.getString("jam_mulai"),
                                rs.getString("jam_selesai"), ServerUtils.escapeJson(rs.getString("nama"))));
                    }
                }
                jadwalSb.append("]");

                String fullJson = String.format("{\"mapel\":%s,\"jenjang\":%s,\"jadwal_guru\":%s}", mapelSb.toString(),
                        jenjangSb.toString(), jadwalSb.toString());
                ServerUtils.kirimResponJSON(exchange, 200, fullJson);
            } catch (Exception e) {
                ServerUtils.kirimResponJSON(exchange, 500, "{\"error\":\"" + ServerUtils.escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    public static class DeleteAdminHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            ServerUtils.aturCORS(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String jsonInput = ServerUtils.bacaBody(exchange);
                try {
                    int idAdmin = Integer.parseInt(ServerUtils.ambilNilaiJSON(jsonInput, "id_admin"));
                    try (Connection conn = DatabaseConfig.getConnection()) {
                        String sql = "DELETE FROM Admin WHERE id_admin = ?";
                        try (PreparedStatement ps = conn.prepareStatement(sql)) {
                            ps.setInt(1, idAdmin);
                            ps.executeUpdate();
                        }
                        ServerUtils.kirimResponJSON(exchange, 200, "{\"status\":\"sukses\", \"message\":\"Admin successfully removed from Database!\"}");
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    String errMsg = e.getMessage();
                    if (errMsg.contains("REFERENCE") || errMsg.contains("FOREIGN KEY")) {
                        ServerUtils.kirimResponJSON(exchange, 400, "{\"status\":\"gagal\", \"pesan\":\"Cannot delete: This admin is still bound to schedule or teacher data.\"}");
                    } else {
                        ServerUtils.kirimResponJSON(exchange, 500, "{\"status\":\"gagal\", \"pesan\":\"A server error occurred.\"}");
                    }
                }
            }
        }
    }

    public static class UpdateAdminHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            ServerUtils.aturCORS(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String jsonInput = ServerUtils.bacaBody(exchange);
                try {
                    int idAdmin = Integer.parseInt(ServerUtils.ambilNilaiJSON(jsonInput, "id_admin"));
                    String nama = ServerUtils.ambilNilaiJSON(jsonInput, "nama");
                    String email = ServerUtils.ambilNilaiJSON(jsonInput, "email");
                    String noHp = ServerUtils.ambilNilaiJSON(jsonInput, "no_hp");

                    try (Connection conn = DatabaseConfig.getConnection()) {
                        String sql = "UPDATE Admin SET nama = ?, email = ?, no_hp = ? WHERE id_admin = ?";
                        try (PreparedStatement ps = conn.prepareStatement(sql)) {
                            ps.setString(1, nama);
                            ps.setString(2, email);
                            ps.setString(3, noHp);
                            ps.setInt(4, idAdmin);
                            ps.executeUpdate();
                        }
                        ServerUtils.kirimResponJSON(exchange, 200, "{\"status\":\"sukses\", \"message\":\"Admin data successfully updated!\"}");
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    ServerUtils.kirimResponJSON(exchange, 500, "{\"status\":\"gagal\", \"message\":\"Error: " + ServerUtils.escapeJson(e.getMessage()) + "\"}");
                }
            }
        }
    }

    public static class AdminSlotGuruHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            ServerUtils.aturCORS(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String sql = "SELECT j.id_jadwal, j.hari, j.jam_mulai, j.jam_selesai, j.id_guru, g.nama AS nama_guru, " +
                    "CASE WHEN l.id_les IS NOT NULL THEN 1 ELSE 0 END AS is_booked " +
                    "FROM Jadwal_Kesediaan_Guru j " +
                    "JOIN Guru g ON j.id_guru = g.id_guru " +
                    "LEFT JOIN Detail_Daftar_Les d ON j.id_jadwal = d.id_jadwal " +
                    "LEFT JOIN Les l ON d.id_les = l.id_les";

            try (Connection conn = DatabaseConfig.getConnection();
                    PreparedStatement ps = conn.prepareStatement(sql);
                    ResultSet rs = ps.executeQuery()) {
                StringBuilder sb = new StringBuilder("[");
                while (rs.next()) {
                    if (sb.length() > 1) sb.append(",");
                    sb.append(String.format(
                            "{\"id_jadwal\":%d,\"hari\":\"%s\",\"jam_mulai\":\"%s\",\"jam_selesai\":\"%s\",\"id_guru\":%d,\"nama_guru\":\"%s\",\"is_booked\":%d}",
                            rs.getInt("id_jadwal"), rs.getString("hari"), rs.getString("jam_mulai"),
                            rs.getString("jam_selesai"), rs.getInt("id_guru"), ServerUtils.escapeJson(rs.getString("nama_guru")),
                            rs.getInt("is_booked")));
                }
                sb.append("]");
                ServerUtils.kirimResponJSON(exchange, 200, sb.toString());
            } catch (Exception e) {
                ServerUtils.kirimResponJSON(exchange, 500, "{\"error\":\"" + ServerUtils.escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    public static class AdminUpdateSlotHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            ServerUtils.aturCORS(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String body = ServerUtils.bacaBody(exchange);
                try {
                    int idJadwal = Integer.parseInt(ServerUtils.ambilNilaiJSON(body, "id_jadwal"));
                    String hari = ServerUtils.ambilNilaiJSON(body, "hari");
                    String jamMulai = ServerUtils.ambilNilaiJSON(body, "jam_mulai");
                    String jamSelesai = ServerUtils.ambilNilaiJSON(body, "jam_selesai");

                    try (Connection conn = DatabaseConfig.getConnection()) {
                        String sql = "UPDATE Jadwal_Kesediaan_Guru SET hari = ?, jam_mulai = ?, jam_selesai = ? WHERE id_jadwal = ?";
                        PreparedStatement ps = conn.prepareStatement(sql);
                        ps.setString(1, hari);
                        ps.setString(2, jamMulai);
                        ps.setString(3, jamSelesai);
                        ps.setInt(4, idJadwal);
                        ps.executeUpdate();
                        ServerUtils.kirimResponJSON(exchange, 200, "{\"status\":\"sukses\",\"message\":\"Time slot changed successfully!\"}");
                    }
                } catch (Exception e) {
                    ServerUtils.kirimResponJSON(exchange, 500, "{\"error\":\"" + ServerUtils.escapeJson(e.getMessage()) + "\"}");
                }
            }
        }
    }

    public static class AdminDeleteSlotHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            ServerUtils.aturCORS(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String body = ServerUtils.bacaBody(exchange);
                try {
                    int idJadwal = Integer.parseInt(ServerUtils.ambilNilaiJSON(body, "id_jadwal"));
                    try (Connection conn = DatabaseConfig.getConnection()) {
                        String sql = "DELETE FROM Jadwal_Kesediaan_Guru WHERE id_jadwal = ?";
                        PreparedStatement ps = conn.prepareStatement(sql);
                        ps.setInt(1, idJadwal);
                        ps.executeUpdate();
                        ServerUtils.kirimResponJSON(exchange, 200, "{\"status\":\"sukses\",\"message\":\"Time slot successfully deleted!\"}");
                    }
                } catch (Exception e) {
                    ServerUtils.kirimResponJSON(exchange, 500, "{\"error\":\"" + ServerUtils.escapeJson(e.getMessage()) + "\"}");
                }
            }
        }
    }

    public static class DeleteStudentHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            ServerUtils.aturCORS(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String jsonInput = ServerUtils.bacaBody(exchange);
                try {
                    int idSiswa = Integer.parseInt(ServerUtils.ambilNilaiJSON(jsonInput, "id_siswa"));
                    try (Connection conn = DatabaseConfig.getConnection()) {
                        String sql = "DELETE FROM Siswa WHERE id_siswa = ?";
                        try (PreparedStatement ps = conn.prepareStatement(sql)) {
                            ps.setInt(1, idSiswa);
                            ps.executeUpdate();
                        }
                        ServerUtils.kirimResponJSON(exchange, 200, "{\"status\":\"sukses\", \"message\":\"Student successfully removed from Database!\"}");
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    String errMsg = e.getMessage();
                    if (errMsg.contains("REFERENCE") || errMsg.contains("FOREIGN KEY")) {
                        ServerUtils.kirimResponJSON(exchange, 400, "{\"status\":\"gagal\", \"pesan\":\"Cannot delete: This student has an active tutoring schedule or history.\"}");
                    } else {
                        ServerUtils.kirimResponJSON(exchange, 500, "{\"status\":\"gagal\", \"pesan\":\"A server error occurred.\"}");
                    }
                }
            }
        }
    }

    public static class UpdateStudentHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            ServerUtils.aturCORS(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String jsonInput = ServerUtils.bacaBody(exchange);
                try {
                    int idSiswa = Integer.parseInt(ServerUtils.ambilNilaiJSON(jsonInput, "id_siswa"));
                    String nama = ServerUtils.ambilNilaiJSON(jsonInput, "nama");
                    String email = ServerUtils.ambilNilaiJSON(jsonInput, "email");
                    String noHp = ServerUtils.ambilNilaiJSON(jsonInput, "no_hp");
                    String idJenjangStr = ServerUtils.ambilNilaiJSON(jsonInput, "id_jenjang");
                    String tglLahir = ServerUtils.ambilNilaiJSON(jsonInput, "tanggal_lahir");
                    String jenisKelamin = ServerUtils.ambilNilaiJSON(jsonInput, "jenis_kelamin");
                    int idJenjang = idJenjangStr.isEmpty() ? 1 : Integer.parseInt(idJenjangStr);

                    try (Connection conn = DatabaseConfig.getConnection()) {
                        String sql = "UPDATE Siswa SET nama = ?, email = ?, no_hp = ?, id_jenjang = ?, tgl_lahir = ?, jenis_kelamin = ? WHERE id_siswa = ?";
                        try (PreparedStatement ps = conn.prepareStatement(sql)) {
                            ps.setString(1, nama);
                            ps.setString(2, email);
                            ps.setString(3, noHp);
                            ps.setInt(4, idJenjang);
                            java.sql.Date sqlDate = null;
                            try { if (tglLahir.contains("-")) sqlDate = java.sql.Date.valueOf(tglLahir); } 
                            catch (Exception dateEx) { sqlDate = java.sql.Date.valueOf("2000-01-01"); }
                            ps.setDate(5, sqlDate);
                            ps.setString(6, jenisKelamin);
                            ps.setInt(7, idSiswa);
                            ps.executeUpdate();
                        }
                        ServerUtils.kirimResponJSON(exchange, 200, "{\"status\":\"sukses\", \"message\":\"Student Data successfully updated!\"}");
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    ServerUtils.kirimResponJSON(exchange, 500, "{\"status\":\"gagal\", \"message\":\"Error: " + ServerUtils.escapeJson(e.getMessage()) + "\"}");
                }
            }
        }
    }
}