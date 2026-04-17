import dotenv from "dotenv";
import app from "./app";
import pool from "./config/db";

dotenv.config();

// Test DB connection
pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.error("Database connection error:", err);
    } else {
        console.log("Connected to Neon DB:", res.rows[0]);
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});