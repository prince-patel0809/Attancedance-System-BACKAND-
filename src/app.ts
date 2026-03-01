import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import studentRoutes from "./routes/student.routes";

const app = express();

// ===============================
// MIDDLEWARES
// ===============================
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(cookieParser());

// ===============================
// ROUTES
// ===============================
app.use("/student", studentRoutes);

// ===============================
// HEALTH CHECK ROUTE
// ===============================
app.get("/", (req, res) => {
    res.send("Attendance Backend Running 🚀");
});

export default app;