import express from "express";
import { facultyAuth } from "../middlewares/FacualtyAuth";
import { endLectureSession, getStudentDashboard, startLectureSession } from "../controllers/lecture.controllers";
import { studentAuth } from "../middlewares/studentsAuth";


const Lecturerouter = express.Router();

Lecturerouter.post("/start", facultyAuth, startLectureSession);

Lecturerouter.post("/end/:lecture_id", facultyAuth, endLectureSession);

Lecturerouter.post("/dashboard/student", studentAuth, getStudentDashboard)

export default Lecturerouter;