import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConfig {

    private static final String URL = "jdbc:postgresql://localhost:5432/les-privat"; // sesuaikan dengan SQL kalian
    private static final String USER = "les-privat";
    private static final String PASSWORD = "1234567890"; 

    public static Connection getConnection() throws SQLException {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            throw new SQLException("PostgreSQL JDBC Driver not found", e);
        }
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    public static void main(String[] args) {
        try (Connection connection = getConnection()) {
            System.out.println("Berhasil terhubung ke PostgreSQL!");
            System.out.println("Database: " + connection.getCatalog());
        } catch (SQLException e) {
            System.out.println("Gagal terhubung ke PostgreSQL!");
            System.out.println("Error: " + e.getMessage());
        }
    }
}
