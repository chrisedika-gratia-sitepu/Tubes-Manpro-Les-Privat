import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class LesJadwalHandler {

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
}