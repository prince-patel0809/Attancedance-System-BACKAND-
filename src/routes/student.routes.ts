import express from "express";
import { getStudentProfile, loginStudent, registerStudent } from "../controllers/students.controllers";
import { studentAuth } from "../middlewares/studentsAuth";


const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);

router.get("/profile", studentAuth, getStudentProfile)

export default router;