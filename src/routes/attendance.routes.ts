import express from "express";
import { studentAuth } from "../middlewares/studentsAuth";
import { downloadAttendanceHistory, markAttendance } from "../controllers/attendance.controllers";


const Attandancerouter = express.Router();

Attandancerouter.post("/mark", studentAuth, markAttendance);

Attandancerouter.get("/history/excel", studentAuth, downloadAttendanceHistory);

export default Attandancerouter;