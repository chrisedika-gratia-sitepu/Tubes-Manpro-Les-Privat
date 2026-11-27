import com.sun.net.httpserver.HttpExchange;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.stream.Collectors;

public class ServerUtils {

    public static void aturCORS(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
    }

    public static String bacaBody(HttpExchange exchange) throws IOException {
        InputStreamReader isr = new InputStreamReader(exchange.getRequestBody(), "utf-8");
        BufferedReader br = new BufferedReader(isr);
        return br.lines().collect(Collectors.joining());
    }

    public static String ambilNilaiJSON(String json, String key) {
        try {
            String target = "\"" + key + "\":";
            int index = json.indexOf(target);
            if (index == -1)
                return "";

            String remainder = json.substring(index + target.length()).trim();
            if (remainder.startsWith("\"")) {
                return remainder.substring(1, remainder.indexOf("\"", 1));
            } else {
                int endDoc = remainder.indexOf(",");
                int endObj = remainder.indexOf("}");
                int end = (endDoc != -1 && endDoc < endObj) ? endDoc : endObj;
                if (end == -1)
                    end = remainder.length();
                return remainder.substring(0, end).trim();
            }
        } catch (Exception e) {
            return "";
        }
    }

    public static void kirimResponJSON(HttpExchange exchange, int statusCode, String response) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        byte[] bytes = response.getBytes("utf-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    public static String escapeJson(String s) {
        if (s == null)
            return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    public static String nullSafe(String s) {
        return s == null ? "" : s;
    }
}