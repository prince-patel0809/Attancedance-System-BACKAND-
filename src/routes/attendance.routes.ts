import express from "express";
import { studentAuth } from "../middlewares/studentsAuth";
import { downloadAttendanceHistory, getLast30DaysAttendance, markAttendance } from "../controllers/attendance.controllers";


const Attandancerouter = express.Router();

Attandancerouter.post("/mark", studentAuth, markAttendance);

Attandancerouter.get("/history/excel", studentAuth, downloadAttendanceHistory);

Attandancerouter.get("/history/30days", studentAuth, getLast30DaysAttendance);

export default Attandancerouter;