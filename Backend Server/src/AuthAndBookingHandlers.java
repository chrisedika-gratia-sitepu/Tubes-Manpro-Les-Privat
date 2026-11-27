import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.OutputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.stream.Collectors;

public class AuthAndBookingHandlers {

    public static class RegisterHandler implements HttpHandler {
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
                    String role = ServerUtils.ambilNilaiJSON(jsonInput, "role");
                    String nama = ServerUtils.ambilNilaiJSON(jsonInput, "nama");
                    String email = ServerUtils.ambilNilaiJSON(jsonInput, "email");
                    String noHp = ServerUtils.ambilNilaiJSON(jsonInput, "no_hp");
                    String password = ServerUtils.ambilNilaiJSON(jsonInput, "password");

                    int newId = (int) (System.currentTimeMillis() % 100000);

                    try (Connection conn = DatabaseConfig.getConnection()) {
                        String sql = "";
                        PreparedStatement pstmt = null;

                        if ("student".equals(role)) {
                            String idJenjangStr = ServerUtils.ambilNilaiJSON(jsonInput, "id_jenjang");
                            int idJenjang = idJenjangStr.isEmpty() ? 1 : Integer.parseInt(idJenjangStr);
                            String tglLahir = ServerUtils.ambilNilaiJSON(jsonInput, "tanggal_lahir");
                            if (tglLahir.isEmpty())
                                tglLahir = "2000-01-01";
                            String jenisKelamin = ServerUtils.ambilNilaiJSON(jsonInput, "jenis_kelamin");
                            if (jenisKelamin.isEmpty())
                                jenisKelamin = "L";

                            sql = "INSERT INTO Siswa (id_siswa, id_jenjang, nama, tgl_lahir, jenis_kelamin, no_hp, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                            pstmt = conn.prepareStatement(sql);
                            pstmt.setInt(1, newId);
                            pstmt.setInt(2, idJenjang);
                            pstmt.setString(3, nama);

                            java.sql.Date sqlDate = null;
                            try {
                                if (tglLahir.contains("-")) {
                                    sqlDate = java.sql.Date.valueOf(tglLahir);
                                } else if (tglLahir.contains("/")) {
                                    String[] parts = tglLahir.split("/");
                                    if (parts[2].length() == 4) {
                                        sqlDate = java.sql.Date.valueOf(parts[2] + "-" + parts[1] + "-" + parts[0]);
                                    }
                                }
                            } catch (Exception dateEx) {
                                sqlDate = java.sql.Date.valueOf("2000-01-01");
                            }

                            pstmt.setDate(4, sqlDate);
                            pstmt.setString(5, jenisKelamin);
                            pstmt.setString(6, noHp);
                            pstmt.setString(7, email);
                            pstmt.setString(8, password);
                            pstmt.executeUpdate();
                            pstmt.close();

                        } else if ("teacher".equals(role)) {
                            sql = "INSERT INTO Guru (id_guru, nama, email, no_hp, password) VALUES (?, ?, ?, ?, ?)";
                            pstmt = conn.prepareStatement(sql);
                            pstmt.setInt(1, newId);
                            pstmt.setString(2, nama);
                            pstmt.setString(3, email);
                            pstmt.setString(4, noHp);
                            pstmt.setString(5, password);
                            pstmt.executeUpdate();
                            pstmt.close();

                            String expertisesStr = ServerUtils.ambilNilaiJSON(jsonInput, "expertises");
                            if (!expertisesStr.isEmpty()) {
                                String[] expArr = expertisesStr.split(",");
                                String sqlKeahlian = "INSERT INTO Keahlian_Guru (id_keahlian, id_guru, id_mapel, id_jenjang) VALUES (?, ?, ?, ?)";
                                try (PreparedStatement pstmtKeahlian = conn.prepareStatement(sqlKeahlian)) {
                                    int counter = 1;
                                    for (String exp : expArr) {
                                        String[] parts = exp.split("-");
                                        if (parts.length == 2) {
                                            int idKeahlian = (int) (System.currentTimeMillis() % 100000)
                                                    + (int) (Math.random() * 50000) + counter;
                                            pstmtKeahlian.setInt(1, idKeahlian);
                                            pstmtKeahlian.setInt(2, newId);
                                            pstmtKeahlian.setInt(3, Integer.parseInt(parts[0]));
                                            pstmtKeahlian.setInt(4, Integer.parseInt(parts[1]));
                                            pstmtKeahlian.executeUpdate();
                                            counter++;
                                        }
                                    }
                                }
                            }

                        } else if ("admin".equals(role)) {
                            sql = "INSERT INTO Admin (id_admin, nama, email, no_hp, password) VALUES (?, ?, ?, ?, ?)";
                            pstmt = conn.prepareStatement(sql);
                            pstmt.setInt(1, newId);
                            pstmt.setString(2, nama);
                            pstmt.setString(3, email);
                            pstmt.setString(4, noHp);
                            pstmt.setString(5, password);
                            pstmt.executeUpdate();
                            pstmt.close();

                            String sqlUpdateGuru = "UPDATE Guru SET id_admin = ? WHERE email = ?";
                            try (PreparedStatement pstmtUpdateGuru = conn.prepareStatement(sqlUpdateGuru)) {
                                pstmtUpdateGuru.setInt(1, newId);
                                pstmtUpdateGuru.setString(2, email);
                                pstmtUpdateGuru.executeUpdate();
                            }
                        } else {
                            throw new Exception("Role tidak dikenali: " + role);
                        }

                        System.out.println("Berhasil registrasi: " + nama + " sebagai " + role);
                    }

                    ServerUtils.kirimResponJSON(exchange, 200, "{\"status\":\"sukses\"}");

                } catch (Exception e) {
                    e.printStackTrace();
                    ServerUtils.kirimResponJSON(exchange, 400, "{\"status\":\"gagal\", \"pesan\":\"" + e.getMessage() + "\"}");
                }
            }
        }
    }

    public static class LoginHandler implements HttpHandler {
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
                    String email = ServerUtils.ambilNilaiJSON(jsonInput, "email");
                    String password = ServerUtils.ambilNilaiJSON(jsonInput, "password");

                    String roleDitemukan = "";
                    String namaDitemukan = "";
                    int idDitemukan = 0;

                    try (Connection conn = DatabaseConfig.getConnection()) {

                        String sqlSiswa = "SELECT id_siswa, nama FROM Siswa WHERE email = ? AND password = ?";
                        try (PreparedStatement pstmt = conn.prepareStatement(sqlSiswa)) {
                            pstmt.setString(1, email);
                            pstmt.setString(2, password);
                            ResultSet rs = pstmt.executeQuery();
                            if (rs.next()) {
                                roleDitemukan = "student";
                                namaDitemukan = rs.getString("nama");
                                idDitemukan = rs.getInt("id_siswa");
                            }
                        }

                        if (roleDitemukan.isEmpty()) {
                            String sqlGuru = "SELECT id_guru, nama FROM Guru WHERE email = ? AND password = ?";
                            try (PreparedStatement pstmt = conn.prepareStatement(sqlGuru)) {
                                pstmt.setString(1, email);
                                pstmt.setString(2, password);
                                ResultSet rs = pstmt.executeQuery();
                                if (rs.next()) {
                                    roleDitemukan = "teacher";
                                    namaDitemukan = rs.getString("nama");
                                    idDitemukan = rs.getInt("id_guru");
                                }
                            }
                        }

                        if (roleDitemukan.isEmpty()) {
                            String sqlAdmin = "SELECT id_admin, nama FROM Admin WHERE email = ? AND password = ?";
                            try (PreparedStatement pstmt = conn.prepareStatement(sqlAdmin)) {
                                pstmt.setString(1, email);
                                pstmt.setString(2, password);
                                ResultSet rs = pstmt.executeQuery();
                                if (rs.next()) {
                                    roleDitemukan = "admin";
                                    namaDitemukan = rs.getString("nama");
                                    idDitemukan = rs.getInt("id_admin");
                                }
                            }
                        }
                    }

                    if (!roleDitemukan.isEmpty()) {
                        String responSukses = "{\"status\":\"sukses\", \"role\":\"" + roleDitemukan +
                                "\", \"nama\":\"" + namaDitemukan +
                                "\", \"id\":" + idDitemukan + "}";
                        ServerUtils.kirimResponJSON(exchange, 200, responSukses);
                    } else {
                        ServerUtils.kirimResponJSON(exchange, 401,
                                "{\"status\":\"gagal\", \"pesan\":\"Email atau password salah.\"}");
                    }

                } catch (Exception e) {
                    e.printStackTrace();
                    ServerUtils.kirimResponJSON(exchange, 500,
                            "{\"status\":\"gagal\", \"pesan\":\"Terjadi kesalahan di server.\"}");
                }
            }
        }
    }

    public static class BookingHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "POST, OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String body = ServerUtils.bacaBody(exchange);

                try {
                    String idSiswaStr = ServerUtils.ambilNilaiJSON(body, "id_siswa").replaceAll("[^0-9]", "");
                    int idSiswa = Integer.parseInt(idSiswaStr.isEmpty() ? "0" : idSiswaStr);
                    String idJadwalStr = ServerUtils.ambilNilaiJSON(body, "id_jadwal").replaceAll("[^0-9]", "");
                    int idJadwal = Integer.parseInt(idJadwalStr.isEmpty() ? "0" : idJadwalStr);
                    String idMapelStr = ServerUtils.ambilNilaiJSON(body, "id_mapel").replaceAll("[^0-9]", "");
                    int idMapel = Integer.parseInt(idMapelStr.isEmpty() ? "0" : idMapelStr);
                    String idJenjangStr = ServerUtils.ambilNilaiJSON(body, "id_jenjang").replaceAll("[^0-9]", "");
                    int idJenjang = Integer.parseInt(idJenjangStr.isEmpty() ? "0" : idJenjangStr);

                    String tglMulaiRaw = ServerUtils.ambilNilaiJSON(body, "tanggal_mulai");
                    String tglMulai = tglMulaiRaw.contains("T") ? tglMulaiRaw.split("T")[0] : tglMulaiRaw;
                    String tglSelesaiRaw = ServerUtils.ambilNilaiJSON(body, "tanggal_selesai");
                    String tglSelesai = tglSelesaiRaw.contains("T") ? tglSelesaiRaw.split("T")[0] : tglSelesaiRaw;

                    try(Connection conn = DatabaseConfig.getConnection()) {
                        String cekSql = "SELECT COUNT(*) AS bentrok FROM Detail_Daftar_Les d " +
                                        "JOIN Les l ON d.id_les = l.id_les " +
                                        "WHERE d.id_jadwal = ? AND (l.tgl_mulai <= CAST(? AS DATE) AND l.tgl_selesai >= CAST(? AS DATE))";
                        PreparedStatement cekPs = conn.prepareStatement(cekSql);
                        cekPs.setInt(1, idJadwal);
                        cekPs.setString(2, tglSelesai);
                        cekPs.setString(3, tglMulai);
                        ResultSet rsCek = cekPs.executeQuery();

                        if (rsCek.next() && rsCek.getInt("bentrok") > 0) {
                            String errorResp = "{\"status\":\"gagal\",\"pesan\":\"Slot waktu ini sudah di-booking orang lain pada rentang tanggal tersebut. Silakan pilih jadwal lain.\"}";
                            ServerUtils.kirimResponJSON(exchange, 400, errorResp);
                            return;
                        }

                        int idLes = (int) (System.currentTimeMillis() % 1000000);
                        String insertLes = "INSERT INTO Les (id_les, tgl_mulai, tgl_selesai, id_siswa) VALUES (?, CAST(? AS DATE), CAST(? AS DATE), ?)";
                        PreparedStatement psLes = conn.prepareStatement(insertLes);
                        psLes.setInt(1, idLes);
                        psLes.setString(2, tglMulai);
                        psLes.setString(3, tglSelesai);
                        psLes.setInt(4, idSiswa);
                        psLes.executeUpdate();

                        int idDetail = (int) (System.currentTimeMillis() % 1000000) + 1;
                        String insertDetail = "INSERT INTO Detail_Daftar_Les (id_detail, id_les, id_jadwal, id_mapel, id_jenjang) VALUES (?, ?, ?, ?, ?)";
                        PreparedStatement psDetail = conn.prepareStatement(insertDetail);
                        psDetail.setInt(1, idDetail);
                        psDetail.setInt(2, idLes);
                        psDetail.setInt(3, idJadwal);
                        psDetail.setInt(4, idMapel);
                        psDetail.setInt(5, idJenjang);
                        psDetail.executeUpdate();

                        ServerUtils.kirimResponJSON(exchange, 200, "{\"status\":\"sukses\",\"pesan\":\"Berhasil booking les!\"}");
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    ServerUtils.kirimResponJSON(exchange, 500, "{\"status\":\"gagal\",\"pesan\":\"" + ServerUtils.escapeJson(e.getMessage()) + "\"}");
                }
            }
        }

        private void kirimRespon(HttpExchange exchange, int statusCode, String response) throws IOException {
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(statusCode, response.length());
            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }
}