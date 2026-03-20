"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentDashboard = exports.endLectureSession = exports.startLectureSession = void 0;
const db_1 = __importDefault(require("../config/db"));
const lectures_validations_1 = require("../validations/lectures.validations");
const exceljs_1 = __importDefault(require("exceljs"));
const geolib_1 = require("geolib");
const startLectureSession = async (req, res) => {
    try {
        // Validate input
        const parsed = lectures_validations_1.createLectureSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid lecture data",
                errors: parsed.error.flatten().fieldErrors
            });
        }
        const { subject_id, latitude, longitude } = parsed.data;
        const facultyId = req.user.id;
        // Check if lecture already active
        const activeLecture = await db_1.default.query(`SELECT * FROM lecture_sessions 
            WHERE subject_id = $1 AND is_active = true`, [subject_id]);
        if (activeLecture.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Lecture session already active for this subject"
            });
        }
        // Create lecture session
        const result = await db_1.default.query(`INSERT INTO lecture_sessions 
            (subject_id, faculty_id, latitude, longitude)
            VALUES ($1,$2,$3,$4)
      RETURNING *`, [subject_id, facultyId, latitude, longitude]);
        return res.status(201).json({
            success: true,
            message: "Lecture session started",
            lecture: result.rows[0]
        });
    }
    catch (error) {
        console.error("Start Lecture Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while starting lecture"
        });
    }
};
exports.startLectureSession = startLectureSession;
const endLectureSession = async (req, res) => {
    try {
        const { lecture_id } = req.params;
        // Get subject name
        const subjectResult = await db_1.default.query(`SELECT subjects.subject_name
       FROM lecture_sessions
       JOIN subjects ON lecture_sessions.subject_id = subjects.id
       WHERE lecture_sessions.id = $1`, [lecture_id]);
        const subjectName = subjectResult.rows[0].subject_name;
        // Get attendance data
        const attendance = await db_1.default.query(`SELECT 
        students.enrollment_no,
        students.name,
        attendance.distance,
        attendance.status,
        attendance.marked_at
       FROM attendance
       JOIN students ON students.id = attendance.student_id
       WHERE attendance.lecture_id = $1`, [lecture_id]);
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet("Attendance");
        worksheet.columns = [
            { header: "Enrollment No", key: "enrollment_no", width: 20 },
            { header: "Student Name", key: "name", width: 25 },
            { header: "Distance", key: "distance", width: 15 },
            { header: "Status", key: "status", width: 15 },
            { header: "Marked Time", key: "marked_at", width: 25 }
        ];
        attendance.rows.forEach((row) => {
            worksheet.addRow(row);
        });
        const fileName = subjectName.replace(/\s+/g, "_") + "_Attendance.xlsx";
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
        await workbook.xlsx.write(res);
        res.end(); // VERY IMPORTANT
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Excel generation failed"
        });
    }
};
exports.endLectureSession = endLectureSession;
const getStudentDashboard = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { latitude, longitude } = req.body;
        // 1️⃣ Get active lecture
        const lectureResult = await db_1.default.query(`
      SELECT 
        lecture_sessions.id,
        lecture_sessions.latitude,
        lecture_sessions.longitude,
        lecture_sessions.radius,
        subjects.subject_name,
        faculty.name AS faculty_name
      FROM lecture_sessions
      JOIN subjects ON subjects.id = lecture_sessions.subject_id
      JOIN faculty ON faculty.id = lecture_sessions.faculty_id
      WHERE lecture_sessions.is_active = true
      LIMIT 1
      `);
        let activeLecture = null;
        if (lectureResult.rows.length > 0) {
            const lecture = lectureResult.rows[0];
            // 2️⃣ Calculate distance
            const distance = (0, geolib_1.getDistance)({ latitude: lecture.latitude, longitude: lecture.longitude }, { latitude, longitude });
            // 3️⃣ Check range
            if (distance <= lecture.radius) {
                activeLecture = {
                    id: lecture.id,
                    subject_name: lecture.subject_name,
                    faculty_name: lecture.faculty_name,
                    distance
                };
            }
        }
        // 4️⃣ Attendance summary (same as before)
        const summaryResult = await db_1.default.query(`
      SELECT 
        subjects.subject_name,
        COUNT(attendance.id) AS attended
      FROM attendance
      JOIN lecture_sessions 
        ON lecture_sessions.id = attendance.lecture_id
      JOIN subjects 
        ON subjects.id = lecture_sessions.subject_id
      WHERE attendance.student_id = $1
      GROUP BY subjects.subject_name
      `, [studentId]);
        return res.status(200).json({
            success: true,
            active_lecture: activeLecture, // null if not in range
            attendance_summary: summaryResult.rows.map(row => ({
                subject_name: row.subject_name,
                attended: Number(row.attended)
            }))
        });
    }
    catch (error) {
        console.error("Dashboard Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load dashboard"
        });
    }
};
exports.getStudentDashboard = getStudentDashboard;
