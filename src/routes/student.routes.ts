import express from "express";
import { loginStudent, registerStudent } from "../controllers/students.controllers";


const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);

export default router;