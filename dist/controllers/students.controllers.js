"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginStudent = exports.registerStudent = void 0;
const student_validation_1 = require("../validations/student.validation");
const student_validation_2 = require("../validations/student.validation");
const db_1 = __importDefault(require("../config/db"));
const token_1 = require("../utils/token");
const registerStudent = async (req, res) => {
    try {
        // =========================
        // 1️⃣ Validate Request
        // =========================
        const parsed = student_validation_2.registerStudentSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid registration details",
                errors: parsed.error.flatten().fieldErrors
            });
        }
        const { name, enrollment_no, device_id } = parsed.data;
        // =========================
        // 2️⃣ Check if student exists
        // =========================
        const studentResult = await db_1.default.query(`SELECT * FROM students WHERE enrollment_no = $1`, [enrollment_no]);
        if (studentResult.rows.length > 0) {
            const student = studentResult.rows[0];
            // Student registered on another device
            if (student.device_id !== device_id) {
                return res.status(403).json({
                    success: false,
                    message: "This account is already linked to another device. Please use your original device to access the application."
                });
            }
            // Same device → allow login
            const token = (0, token_1.generateToken)(student.id);
            return res.status(200).json({
                success: true,
                message: "Registration successful",
                token,
                student_id: student.id
            });
        }
        // =========================
        // 3️⃣ Check if device already used
        // =========================
        const deviceCheck = await db_1.default.query(`SELECT * FROM students WHERE device_id = $1`, [device_id]);
        if (deviceCheck.rows.length > 0) {
            return res.status(403).json({
                success: false,
                message: "This device is already registered with another student account. Only one account can be used per device."
            });
        }
        // =========================
        // 4️⃣ Register New Student
        // =========================
        const result = await db_1.default.query(`INSERT INTO students (name, enrollment_no, device_id)
       VALUES ($1,$2,$3)
       RETURNING id`, [name, enrollment_no, device_id]);
        const studentId = result.rows[0].id;
        const token = (0, token_1.generateToken)(studentId);
        return res.status(201).json({
            success: true,
            message: "Registration completed successfully",
            token,
            student_id: studentId
        });
    }
    catch (error) {
        // =========================
        // Database duplicate error
        // =========================
        if (error.code === "23505") {
            return res.status(400).json({
                success: false,
                message: "A student with this enrollment number already exists."
            });
        }
        console.error("Registration Error:", error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while processing your request. Please try again later."
        });
    }
};
exports.registerStudent = registerStudent;
const loginStudent = async (req, res) => {
    try {
        // =========================
        // 1️⃣ VALIDATION
        // =========================
        const parsed = student_validation_1.loginStudentSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid login details provided",
                errors: parsed.error.flatten().fieldErrors
            });
        }
        const { enrollment_no, device_id } = parsed.data;
        // =========================
        // 2️⃣ FIND STUDENT
        // =========================
        const result = await db_1.default.query(`SELECT * FROM students WHERE enrollment_no = $1`, [enrollment_no]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No student account found with this enrollment number"
            });
        }
        const student = result.rows[0];
        // =========================
        // 3️⃣ DEVICE CHECK
        // =========================
        if (student.device_id !== device_id) {
            return res.status(403).json({
                success: false,
                message: "This account is already linked to another device. Please use your registered device to log in."
            });
        }
        // =========================
        // 4️⃣ GENERATE TOKEN
        // =========================
        const token = (0, token_1.generateToken)(student.id);
        // =========================
        // 5️⃣ SUCCESS RESPONSE
        // =========================
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            student_id: student.id
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        // Database connection error
        if (error.code === "ECONNREFUSED") {
            return res.status(500).json({
                success: false,
                message: "Unable to connect to the database. Please try again later."
            });
        }
        // Unknown server error
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while processing your login request."
        });
    }
};
exports.loginStudent = loginStudent;
