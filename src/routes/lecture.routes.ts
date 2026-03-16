import express from "express";
import { facultyAuth } from "../middlewares/FacualtyAuth";
import { endLectureSession, startLectureSession } from "../controllers/lecture.controllers";


const Lecturerouter = express.Router();

Lecturerouter.post("/start", facultyAuth, startLectureSession);

Lecturerouter.post("/end/:lecture_id", facultyAuth, endLectureSession);

export default Lecturerouter;