"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAttendance = void 0;
const db_1 = __importDefault(require("../config/db"));
const geolib_1 = require("geolib");
const attendance_validation_1 = require("../validations/attendance.validation");
const markAttendance = async (req, res) => {
    try {
        // 1️⃣ Validate request
        const parsed = attendance_validation_1.markAttendanceSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance data",
                errors: parsed.error.flatten().fieldErrors
            });
        }
        const { lecture_id, latitude, longitude } = parsed.data;
        const studentId = req.user.id;
        // 2️⃣ Check lecture session
        const lectureResult = await db_1.default.query(`SELECT * FROM lecture_sessions WHERE id = $1`, [lecture_id]);
        if (lectureResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Lecture session not found"
            });
        }
        const lecture = lectureResult.rows[0];
        // 3️⃣ Check lecture active
        if (!lecture.is_active) {
            return res.status(403).json({
                success: false,
                message: "Attendance session has ended"
            });
        }
        // 4️⃣ Check duplicate attendance
        const existing = await db_1.default.query(`SELECT * FROM attendance 
            WHERE lecture_id = $1 AND student_id = $2`, [lecture_id, studentId]);
        if (existing.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Attendance already marked"
            });
        }
        // 5️⃣ Calculate distance
        const distance = (0, geolib_1.getDistance)({ latitude: lecture.latitude, longitude: lecture.longitude }, { latitude, longitude });
        // 6️⃣ Check distance
        if (distance > lecture.radius) {
            return res.status(403).json({
                success: false,
                message: `You must be within ${lecture.radius} meters of the lecture location`,
                distance
            });
        }
        // 7️⃣ Insert attendance
        const result = await db_1.default.query(`INSERT INTO attendance
            (lecture_id, student_id, student_latitude, student_longitude, distance)
            VALUES ($1,$2,$3,$4,$5)
      RETURNING *`, [lecture_id, studentId, latitude, longitude, distance]);
        return res.status(201).json({
            success: true,
            message: "Attendance marked successfully",
            attendance: result.rows[0]
        });
    }
    catch (error) {
        console.error("Attendance Error:", error);
        // Duplicate constraint safety
        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Attendance already recorded"
            });
        }
        return res.status(500).json({
            success: false,
            message: "Server error while marking attendance"
        });
    }
};
exports.markAttendance = markAttendance;
