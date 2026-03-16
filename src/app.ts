import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import studentRoutes from "./routes/student.routes";
import FacultyRoutes from "./routes/facualty.routes";
import Subjectrouter from "./routes/subjects.routes";
import Lecturerouter from "./routes/lecture.routes";
import Attandancerouter from "./routes/attendance.routes";

const app = express();


// MIDDLEWARES

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(cookieParser());


// ROUTES

//Students Routes
app.use("/student", studentRoutes);


// Facualty Routes
app.use("/faculty", FacultyRoutes);


// Subjects Routes
app.use("/subjects", Subjectrouter);


// Lecture Routes
app.use("/lectures", Lecturerouter);

// Attendance Routes
app.use("/attendance", Attandancerouter);

// HEALTH CHECK ROUTE

app.get("/", (req, res) => {
    res.send("Attendance Backend Running 🚀");
});

export default app;