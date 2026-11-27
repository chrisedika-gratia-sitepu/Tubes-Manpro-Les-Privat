import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class GuruHandlers {

    public static class GetGuruHandler implements HttpHandler {
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
                String sql = "SELECT id_guru, nama, email, no_hp, id_admin FROM Guru ORDER BY nama";
                PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery();

                StringBuilder json = new StringBuilder("[");
                boolean first = true;
                while (rs.next()) {
                    if (!first)
                        json.append(",");
                    json.append("{")
                            .append("\"id\":").append(rs.getInt("id_guru")).append(",")
                            .append("\"nama\":\"").append(ServerUtils.escapeJson(rs.getString("nama"))).append("\",")
                            .append("\"email\":\"").append(ServerUtils.escapeJson(ServerUtils.nullSafe(rs.getString("email")))).append("\",")
                            .append("\"no_hp\":\"").append(ServerUtils.escapeJson(ServerUtils.nullSafe(rs.getString("no_hp")))).append("\",")
                            .append("\"id_admin\":")
                            .append(rs.getObject("id_admin") != null ? rs.getInt("id_admin") : "null")
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

    public static class GetTeacherLessonsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            ServerUtils.aturCORS(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                try {
                    String query = exchange.getRequestURI().getQuery();
                    String idGuruStr = query.split("id_guru=")[1].split("&")[0];
                    int idGuru = Integer.parseInt(idGuruStr);

                    String sql = "SELECT l.id_les, l.id_siswa, s.nama AS nama_siswa, " +
                            "l.tgl_mulai, " +
                            "l.tgl_selesai, " +
                            "ddl.id_jadwal, ddl.id_mapel, ddl.id_jenjang, " +
                            "j.hari, " +
                            "j.jam_mulai, " +
                            "j.jam_selesai " +
                            "FROM Les l " +
                            "JOIN Siswa s ON l.id_siswa = s.id_siswa " +
                            "JOIN Detail_Daftar_Les ddl ON l.id_les = ddl.id_les " +
                            "JOIN Jadwal_Kesediaan_Guru j ON ddl.id_jadwal = j.id_jadwal " +
                            "WHERE j.id_guru = ?";

                    StringBuilder json = new StringBuilder("[");
                    try (Connection conn = DatabaseConfig.getConnection();
                            PreparedStatement ps = conn.prepareStatement(sql)) {

                        ps.setInt(1, idGuru);
                        ResultSet rs = ps.executeQuery();

                        boolean first = true;
                        while (rs.next()) {
                            if (!first)
                                json.append(",");

                            json.append("{")
                                    .append("\"id\":").append(rs.getInt("id_les")).append(",")
                                    .append("\"id_siswa\":").append(rs.getInt("id_siswa")).append(",")
                                    .append("\"nama_siswa\":\"").append(ServerUtils.escapeJson(rs.getString("nama_siswa")))
                                    .append("\",")
                                    .append("\"id_jadwal\":").append(rs.getInt("id_jadwal")).append(",")
                                    .append("\"id_mapel\":").append(rs.getInt("id_mapel")).append(",")
                                    .append("\"id_jenjang\":").append(rs.getInt("id_jenjang")).append(",")
                                    .append("\"hari\":\"").append(ServerUtils.escapeJson(rs.getString("hari"))).append("\",")
                                    .append("\"jam_mulai\":\"").append(rs.getString("jam_mulai")).append("\",")
                                    .append("\"jam_selesai\":\"").append(rs.getString("jam_selesai")).append("\",")
                                    .append("\"tanggal_mulai\":\"").append(rs.getString("tgl_mulai")).append("T")
                                    .append(rs.getString("jam_mulai")).append("\",")
                                    .append("\"tanggal_selesai\":\"").append(rs.getString("tgl_selesai")).append("T")
                                    .append(rs.getString("jam_selesai")).append("\"")
                                    .append("}");

                            first = false;
                        }
                    }

                    json.append("]");
                    ServerUtils.kirimResponJSON(exchange, 200, json.toString());

                } catch (Exception e) {
                    e.printStackTrace();
                    ServerUtils.kirimResponJSON(exchange, 500, "[]");
                }
            }
        }
    }

    public static class PostJadwalHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            ServerUtils.aturCORS(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String jsonInput = ServerUtils.bacaBody(exchange);
                try (Connection conn = DatabaseConfig.getConnection()) {
                    int idJadwal = Integer.parseInt(ServerUtils.ambilNilaiJSON(jsonInput, "id"));
                    String hari = ServerUtils.ambilNilaiJSON(jsonInput, "hari");
                    String jamMulai = ServerUtils.ambilNilaiJSON(jsonInput, "jam_mulai");
                    String jamSelesai = ServerUtils.ambilNilaiJSON(jsonInput, "jam_selesai");
                    int idGuru = Integer.parseInt(ServerUtils.ambilNilaiJSON(jsonInput, "id_guru"));

                    String sql = "INSERT INTO Jadwal_Kesediaan_Guru (id_jadwal, hari, jam_mulai, jam_selesai, id_guru, id_admin) VALUES (?, ?, ?, ?, ?, 1)";
                    PreparedStatement ps = conn.prepareStatement(sql);
                    ps.setInt(1, idJadwal);
                    ps.setString(2, hari);
                    ps.setString(3, jamMulai);
                    ps.setString(4, jamSelesai);
                    ps.setInt(5, idGuru);
                    ps.executeUpdate();

                    ServerUtils.kirimResponJSON(exchange, 200, "{\"status\":\"sukses\"}");
                } catch (Exception e) {
                    e.printStackTrace();
                    ServerUtils.kirimResponJSON(exchange, 400, "{\"status\":\"gagal\", \"pesan\":\"" + e.getMessage() + "\"}");
                }
            }
        }
    }

    public static class DeleteTeacherHandler implements HttpHandler {
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
                    int idGuru = Integer.parseInt(ServerUtils.ambilNilaiJSON(jsonInput, "id_guru"));
                    try (Connection conn = DatabaseConfig.getConnection()) {
                        try (PreparedStatement ps = conn.prepareStatement("DELETE FROM Keahlian_Guru WHERE id_guru = ?")) {
                            ps.setInt(1, idGuru);
                            ps.executeUpdate();
                        }
                        try (PreparedStatement ps = conn.prepareStatement("DELETE FROM Jadwal_Kesediaan_Guru WHERE id_guru = ?")) {
                            ps.setInt(1, idGuru);
                            ps.executeUpdate();
                        }
                        try (PreparedStatement ps = conn.prepareStatement("DELETE FROM Guru WHERE id_guru = ?")) {
                            ps.setInt(1, idGuru);
                            ps.executeUpdate();
                        }
                        ServerUtils.kirimResponJSON(exchange, 200, "{\"status\":\"sukses\", \"message\":\"Teacher successfully removed from Database!\"}");
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    String errMsg = e.getMessage();
                    if (errMsg.contains("REFERENCE") || errMsg.contains("FOREIGN KEY")) {
                        ServerUtils.kirimResponJSON(exchange, 400, "{\"status\":\"gagal\", \"pesan\":\"Cannot delete: This teacher is still tied to the student's tutoring history.\"}");
                    } else {
                        ServerUtils.kirimResponJSON(exchange, 500, "{\"status\":\"gagal\", \"pesan\":\"A server error occurred.\"}");
                    }
                }
            }
        }
    }

    public static class UpdateTeacherHandler implements HttpHandler {
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
                    int idGuru = Integer.parseInt(ServerUtils.ambilNilaiJSON(jsonInput, "id_guru"));
                    String nama = ServerUtils.ambilNilaiJSON(jsonInput, "nama");
                    String email = ServerUtils.ambilNilaiJSON(jsonInput, "email");
                    String noHp = ServerUtils.ambilNilaiJSON(jsonInput, "no_hp");
                    String expertisesStr = ServerUtils.ambilNilaiJSON(jsonInput, "expertises");

                    try (Connection conn = DatabaseConfig.getConnection()) {
                        String sqlUpdateGuru = "UPDATE Guru SET nama = ?, email = ?, no_hp = ? WHERE id_guru = ?";
                        try (PreparedStatement ps = conn.prepareStatement(sqlUpdateGuru)) {
                            ps.setString(1, nama);
                            ps.setString(2, email);
                            ps.setString(3, noHp);
                            ps.setInt(4, idGuru);
                            ps.executeUpdate();
                        }
                        String sqlDeleteKeahlian = "DELETE FROM Keahlian_Guru WHERE id_guru = ?";
                        try (PreparedStatement ps = conn.prepareStatement(sqlDeleteKeahlian)) {
                            ps.setInt(1, idGuru);
                            ps.executeUpdate();
                        }
                        if (!expertisesStr.isEmpty()) {
                            String[] expArr = expertisesStr.split(",");
                            String sqlKeahlian = "INSERT INTO Keahlian_Guru (id_keahlian, id_guru, id_mapel, id_jenjang) VALUES (?, ?, ?, ?)";
                            try (PreparedStatement pstmtKeahlian = conn.prepareStatement(sqlKeahlian)) {
                                int counter = 1;
                                for (String exp : expArr) {
                                    String[] parts = exp.split("-");
                                    if (parts.length == 2) {
                                        int idKeahlian = (int) (System.currentTimeMillis() % 100000) + (int) (Math.random() * 50000) + counter;
                                        pstmtKeahlian.setInt(1, idKeahlian);
                                        pstmtKeahlian.setInt(2, idGuru);
                                        pstmtKeahlian.setInt(3, Integer.parseInt(parts[0]));
                                        pstmtKeahlian.setInt(4, Integer.parseInt(parts[1]));
                                        pstmtKeahlian.executeUpdate();
                                        counter++;
                                    }
                                }
                            }
                        }
                        ServerUtils.kirimResponJSON(exchange, 200, "{\"status\":\"sukses\", \"message\":\"Teacher data has been updated successfully!\"}");
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    ServerUtils.kirimResponJSON(exchange, 500, "{\"status\":\"gagal\", \"message\":\"Error: " + ServerUtils.escapeJson(e.getMessage()) + "\"}");
                }
            }
        }
    }

    public static class GetKeahlianHandler implements HttpHandler {
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
                String sql = "SELECT id_keahlian, id_guru, id_mapel, id_jenjang FROM Keahlian_Guru";
                PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery();

                StringBuilder json = new StringBuilder("[");
                boolean first = true;
                while (rs.next()) {
                    if (!first)
                        json.append(",");
                    json.append("{")
                            .append("\"id\":").append(rs.getInt("id_keahlian")).append(",")
                            .append("\"id_guru\":")
                            .append(rs.getObject("id_guru") != null ? rs.getInt("id_guru") : "null").append(",")
                            .append("\"id_mapel\":")
                            .append(rs.getObject("id_mapel") != null ? rs.getInt("id_mapel") : "null").append(",")
                            .append("\"id_jenjang\":")
                            .append(rs.getObject("id_jenjang") != null ? rs.getInt("id_jenjang") : "null")
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

    public static class GetJadwalHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, OPTIONS");

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String sql = "SELECT id_jadwal, hari, jam_mulai, jam_selesai, id_guru, 'available' AS status FROM Jadwal_Kesediaan_Guru";

            try (Connection conn = DatabaseConfig.getConnection();
                 PreparedStatement ps = conn.prepareStatement(sql);
                 ResultSet rs = ps.executeQuery()) {

                StringBuilder sb = new StringBuilder("[");
                while (rs.next()) {
                    if (sb.length() > 1) sb.append(",");
                    sb.append(String.format(
                        "{\"id\":%d,\"hari\":\"%s\",\"jam_mulai\":\"%s\",\"jam_selesai\":\"%s\",\"id_guru\":%d,\"status\":\"%s\"}",
                        rs.getInt("id_jadwal"), rs.getString("hari"), rs.getString("jam_mulai"),
                        rs.getString("jam_selesai"), rs.getInt("id_guru"), rs.getString("status")));
                }
                sb.append("]");

                String response = sb.toString();
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, response.length());
                java.io.OutputStream os = exchange.getResponseBody();
                os.write(response.getBytes());
                os.close();
            } catch (Exception e) {
                e.printStackTrace();
                String error = "{\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}";
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(500, error.length());
                java.io.OutputStream os = exchange.getResponseBody();
                os.write(error.getBytes());
                os.close();
            }
        }
    }
}