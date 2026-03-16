import express from "express";
import { studentAuth } from "../middlewares/studentsAuth";
import { markAttendance } from "../controllers/attendance.controllers";


const Attandancerouter = express.Router();

Attandancerouter.post("/mark", studentAuth, markAttendance);

export default Attandancerouter;