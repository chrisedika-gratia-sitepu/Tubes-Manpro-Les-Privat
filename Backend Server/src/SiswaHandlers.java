import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class SiswaHandlers {

    public static class GetSiswaHandler implements HttpHandler {
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
                String sql = "SELECT id_siswa, nama, email, no_hp, tgl_lahir, jenis_kelamin, id_jenjang "
                        + "FROM Siswa ORDER BY nama";
                PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery();

                StringBuilder json = new StringBuilder("[");
                boolean first = true;
                while (rs.next()) {
                    if (!first)
                        json.append(",");

                    String tglLahir = rs.getDate("tgl_lahir") != null
                            ? rs.getDate("tgl_lahir").toString()
                            : "";

                    json.append("{")
                            .append("\"id\":").append(rs.getInt("id_siswa")).append(",")
                            .append("\"nama\":\"").append(ServerUtils.escapeJson(rs.getString("nama"))).append("\",")
                            .append("\"email\":\"").append(ServerUtils.escapeJson(ServerUtils.nullSafe(rs.getString("email")))).append("\",")
                            .append("\"no_hp\":\"").append(ServerUtils.escapeJson(ServerUtils.nullSafe(rs.getString("no_hp")))).append("\",")
                            .append("\"tanggal_lahir\":\"").append(tglLahir).append("\",")
                            .append("\"jenis_kelamin\":\"").append(ServerUtils.escapeJson(ServerUtils.nullSafe(rs.getString("jenis_kelamin"))))
                            .append("\",")
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

    public static class GetStudentLessonsHandler implements HttpHandler {
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
                    String idSiswaStr = query.split("id_siswa=")[1].split("&")[0];
                    int idSiswa = Integer.parseInt(idSiswaStr);

                    String sql = "SELECT l.id_les, l.id_siswa, " +
                            "l.tgl_mulai, " +
                            "l.tgl_selesai, " +
                            "ddl.id_jadwal, ddl.id_mapel, ddl.id_jenjang, " +
                            "j.hari, " +
                            "j.jam_mulai, " +
                            "j.jam_selesai " +
                            "FROM Les l " +
                            "JOIN Detail_Daftar_Les ddl ON l.id_les = ddl.id_les " +
                            "JOIN Jadwal_Kesediaan_Guru j ON ddl.id_jadwal = j.id_jadwal " +
                            "WHERE l.id_siswa = ?";

                    StringBuilder jsonResult = new StringBuilder("[");
                    try (Connection conn = DatabaseConfig.getConnection();
                            PreparedStatement pstmt = conn.prepareStatement(sql)) {
                        pstmt.setInt(1, idSiswa);
                        ResultSet rs = pstmt.executeQuery();
                        boolean first = true;
                        while (rs.next()) {
                            if (!first)
                                jsonResult.append(",");
                            jsonResult.append("{")
                                    .append("\"id\":").append(rs.getInt("id_les")).append(",")
                                    .append("\"id_siswa\":").append(rs.getInt("id_siswa")).append(",")
                                    .append("\"id_jadwal\":").append(rs.getInt("id_jadwal")).append(",")
                                    .append("\"id_mapel\":").append(rs.getInt("id_mapel")).append(",")
                                    .append("\"id_jenjang\":").append(rs.getInt("id_jenjang")).append(",")
                                    .append("\"hari\":\"").append(ServerUtils.escapeJson(rs.getString("hari"))).append("\",")
                                    .append("\"jam_mulai\":\"").append(rs.getString("jam_mulai")).append("\",")
                                    .append("\"jam_selesai\":\"").append(rs.getString("jam_selesai")).append("\",")
                                    .append("\"tanggal_mulai\":\"").append(rs.getString("tgl_mulai")).append("T")
                                    .append(rs.getString("jam_mulai")).append("\",")
                                    .append("\"tanggal_selesai\":\"").append(rs.getString("tgl_selesai"))
                                    .append("T")
                                    .append(rs.getString("jam_selesai")).append("\"")
                                    .append("}");
                            first = false;
                        }
                    }
                    jsonResult.append("]");
                    ServerUtils.kirimResponJSON(exchange, 200, jsonResult.toString());

                } catch (Exception e) {
                    e.printStackTrace();
                    ServerUtils.kirimResponJSON(exchange, 500, "[]");
                }
            }
        }
    }

    public static class GetMapelHandler implements HttpHandler {
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
                String sql = "SELECT id_mapel, nama_mapel AS nama FROM Mata_pelajaran ORDER BY id_mapel";
                PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery();

                StringBuilder json = new StringBuilder("[");
                boolean first = true;
                while (rs.next()) {
                    if (!first)
                        json.append(",");
                    json.append("{")
                            .append("\"id\":").append(rs.getInt("id_mapel")).append(",")
                            .append("\"nama\":\"").append(ServerUtils.escapeJson(rs.getString("nama"))).append("\"")
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

    public static class GetJenjangHandler implements HttpHandler {
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
                String sql = "SELECT id_jenjang, nama_jenjang AS nama FROM Jenjang ORDER BY id_jenjang";
                PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery();

                StringBuilder json = new StringBuilder("[");
                boolean first = true;
                while (rs.next()) {
                    if (!first)
                        json.append(",");
                    json.append("{")
                            .append("\"id\":").append(rs.getInt("id_jenjang")).append(",")
                            .append("\"nama\":\"").append(ServerUtils.escapeJson(rs.getString("nama"))).append("\"")
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
}