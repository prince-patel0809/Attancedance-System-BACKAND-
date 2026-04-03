"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadAttendanceHistory = exports.markAttendance = void 0;
const db_1 = __importDefault(require("../config/db"));
const geolib_1 = require("geolib");
const attendance_validation_1 = require("../validations/attendance.validation");
const exceljs_1 = __importDefault(require("exceljs"));
const markAttendance = async (req, res) => {
    try {
        // 1️⃣ Validate request
        const parsed = attendance_validation_1.markAttendanceSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance data",
                errors: parsed.error.flatten().fieldErrors,
            });
        }
        const { lecture_id, latitude, longitude, subject_name, faculty_name, } = parsed.data;
        const studentId = req.user.id;
        // 2️⃣ Check lecture exists
        const lectureResult = await db_1.default.query(`SELECT * FROM lecture_sessions WHERE id = $1`, [lecture_id]);
        if (lectureResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Lecture session not found",
            });
        }
        const lecture = lectureResult.rows[0];
        // 3️⃣ Check lecture active
        if (!lecture.is_active) {
            return res.status(403).json({
                success: false,
                message: "Attendance session has ended",
            });
        }
        // 4️⃣ Prevent duplicate
        const existing = await db_1.default.query(`SELECT 1 FROM attendance 
       WHERE lecture_id = $1 AND student_id = $2`, [lecture_id, studentId]);
        if (existing.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Attendance already marked",
            });
        }
        // 5️⃣ Distance check
        const distance = (0, geolib_1.getDistance)({ latitude: lecture.latitude, longitude: lecture.longitude }, { latitude, longitude });
        if (distance > lecture.radius) {
            return res.status(403).json({
                success: false,
                message: `You must be within ${lecture.radius} meters`,
                distance,
            });
        }
        // 6️⃣ Insert attendance ✅ (USING FRONTEND DATA)
        const result = await db_1.default.query(`INSERT INTO attendance
      (lecture_id,
       student_id,
       student_latitude,
       student_longitude,
       distance,
       subject_name,
       faculty_name,
       status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`, [
            lecture_id,
            studentId,
            latitude,
            longitude,
            distance,
            subject_name, // ✅ FROM FRONTEND
            faculty_name, // ✅ FROM FRONTEND
            "present",
        ]);
        return res.status(201).json({
            success: true,
            message: "Attendance marked successfully",
            attendance: result.rows[0],
        });
    }
    catch (error) {
        console.error("Attendance Error:", error);
        if (error.code === "23502") {
            return res.status(400).json({
                success: false,
                message: "Missing required fields (subject_name or faculty_name)",
            });
        }
        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Attendance already recorded",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Server error while marking attendance",
        });
    }
};
exports.markAttendance = markAttendance;
// attandance history for student
const downloadAttendanceHistory = async (req, res) => {
    try {
        // 🔐 Check user
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const studentId = req.user.id;
        // 1️⃣ Fetch attendance history
        const result = await db_1.default.query(`
      SELECT 
        subject_name,
        faculty_name,
        status,
        distance,
        marked_at
      FROM attendance
      WHERE student_id = $1
      ORDER BY marked_at DESC
      `, [studentId]);
        // 2️⃣ Create workbook
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet("Attendance History");
        // 3️⃣ Add title row (optional but professional)
        worksheet.mergeCells("A1:E1");
        worksheet.getCell("A1").value = "Student Attendance History";
        worksheet.getCell("A1").font = { bold: true, size: 16 };
        // 4️⃣ Add header
        worksheet.columns = [
            { header: "Subject", key: "subject_name", width: 25 },
            { header: "Faculty", key: "faculty_name", width: 25 },
            { header: "Status", key: "status", width: 15 },
            { header: "Distance (m)", key: "distance", width: 15 },
            { header: "Date & Time", key: "marked_at", width: 25 }
        ];
        worksheet.getRow(2).font = { bold: true };
        // 5️⃣ Add data
        result.rows.forEach((row) => {
            const formattedTime = new Date(row.marked_at).toLocaleString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
            worksheet.addRow({
                subject_name: row.subject_name,
                faculty_name: row.faculty_name,
                status: row.status,
                distance: row.distance,
                marked_at: formattedTime
            });
        });
        // 6️⃣ Auto download headers
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=Attendance_History.xlsx");
        // 7️⃣ Send file
        await workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        console.error("Attendance History Excel Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate attendance history file"
        });
    }
};
exports.downloadAttendanceHistory = downloadAttendanceHistory;
