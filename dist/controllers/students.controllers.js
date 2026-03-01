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
        // ===============================
        // 1️⃣ ZOD VALIDATION
        // ===============================
        const parsed = student_validation_2.registerStudentSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.flatten().fieldErrors
            });
        }
        const { name, enrollment_no, device_id } = parsed.data;
        // ===============================
        // 2️⃣ CHECK EXISTING STUDENT
        // ===============================
        const existing = await db_1.default.query(`SELECT * FROM students WHERE enrollment_no = $1`, [enrollment_no]);
        if (existing.rows.length > 0) {
            return res.status(400).json({
                message: "Student already registered"
            });
        }
        // ===============================
        // 3️⃣ INSERT STUDENT
        // ===============================
        const result = await db_1.default.query(`INSERT INTO students (name, enrollment_no, device_id)
       VALUES ($1, $2, $3)
       RETURNING id`, [name, enrollment_no, device_id]);
        // get only ID
        const studentId = result.rows[0].id;
        // ===============================
        // 4️⃣ GENERATE TOKEN
        // ===============================
        const token = (0, token_1.generateToken)(studentId);
        // ===============================
        // 5️⃣ RESPONSE
        // ===============================
        return res.status(201).json({
            success: true,
            token,
            student_id: studentId
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
};
exports.registerStudent = registerStudent;
const loginStudent = async (req, res) => {
    try {
        // 1️⃣ VALIDATION
        const parsed = student_validation_1.loginStudentSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.flatten().fieldErrors
            });
        }
        const { enrollment_no, device_id } = parsed.data;
        // 2️⃣ FIND STUDENT
        const result = await db_1.default.query(`SELECT * FROM students WHERE enrollment_no = $1`, [enrollment_no]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }
        const student = result.rows[0];
        // 3️⃣ DEVICE LOCK CHECK
        if (student.device_id !== device_id) {
            return res.status(403).json({
                message: "Login denied: wrong device"
            });
        }
        // 4️⃣ GENERATE TOKEN
        const token = (0, token_1.generateToken)(student.id);
        // 5️⃣ RESPONSE
        return res.status(200).json({
            success: true,
            token,
            student_id: student.id
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
};
exports.loginStudent = loginStudent;
