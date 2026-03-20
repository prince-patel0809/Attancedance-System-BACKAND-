import { Request, Response } from "express";
import pool from "../config/db";
import { createLectureSchema } from "../validations/lectures.validations";
import ExcelJS from "exceljs";
import { getDistance } from "geolib";


export const startLectureSession = async (req: Request, res: Response) => {
    try {

        // Validate input
        const parsed = createLectureSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid lecture data",
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const { subject_id, latitude, longitude } = parsed.data;

        const facultyId = (req.user as { id: string }).id;

        // Check if lecture already active
        const activeLecture = await pool.query(
            `SELECT * FROM lecture_sessions 
            WHERE subject_id = $1 AND is_active = true`,
            [subject_id]
        );

        if (activeLecture.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Lecture session already active for this subject"
            });
        }

        // Create lecture session
        const result = await pool.query(
            `INSERT INTO lecture_sessions 
            (subject_id, faculty_id, latitude, longitude)
            VALUES ($1,$2,$3,$4)
      RETURNING *`,
            [subject_id, facultyId, latitude, longitude]
        );

        return res.status(201).json({
            success: true,
            message: "Lecture session started",
            lecture: result.rows[0]
        });

    } catch (error) {

        console.error("Start Lecture Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while starting lecture"
        });
    }
};




export const endLectureSession = async (req: Request, res: Response) => {
    try {
        const { lecture_id } = req.params;

        // Get subject name
        const subjectResult = await pool.query(
            `SELECT subjects.subject_name
       FROM lecture_sessions
       JOIN subjects ON lecture_sessions.subject_id = subjects.id
       WHERE lecture_sessions.id = $1`,
            [lecture_id]
        );

        const subjectName = subjectResult.rows[0].subject_name;

        // Get attendance data
        const attendance = await pool.query(
            `SELECT 
        students.enrollment_no,
        students.name,
        attendance.distance,
        attendance.status,
        attendance.marked_at
       FROM attendance
       JOIN students ON students.id = attendance.student_id
       WHERE attendance.lecture_id = $1`,
            [lecture_id]
        );

        const workbook = new ExcelJS.Workbook();
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

        const fileName =
            subjectName.replace(/\s+/g, "_") + "_Attendance.xlsx";

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${fileName}`
        );

        await workbook.xlsx.write(res);

        res.end(); // VERY IMPORTANT
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Excel generation failed"
        });
    }
};




export const getStudentDashboard = async (req: Request, res: Response) => {
    try {

        const studentId = (req.user as { id: string }).id;
        const { latitude, longitude } = req.body;

        // 🔴 Validate location
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required"
            });
        }

        // 1️⃣ Get ALL active lectures (REMOVE LIMIT 1)
        const lectureResult = await pool.query(`
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
        `);

        let activeLecture = null;

        // 2️⃣ Loop through lectures
        for (const lecture of lectureResult.rows) {

            const distance = getDistance(
                { latitude: lecture.latitude, longitude: lecture.longitude },
                { latitude, longitude }
            );

            console.log("Distance:", distance);

            if (distance <= lecture.radius) {
                activeLecture = {
                    id: lecture.id,
                    subject_name: lecture.subject_name,
                    faculty_name: lecture.faculty_name,
                    distance
                };
                break; // stop when first valid lecture found
            }
        }

        // 3️⃣ Attendance summary
        const summaryResult = await pool.query(
            `
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
            `,
            [studentId]
        );

        return res.status(200).json({
            success: true,
            active_lecture: activeLecture,
            attendance_summary: summaryResult.rows.map(row => ({
                subject_name: row.subject_name,
                attended: Number(row.attended)
            }))
        });

    } catch (error) {

        console.error("Dashboard Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load dashboard"
        });
    }
};