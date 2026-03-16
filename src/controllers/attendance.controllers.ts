import { Request, Response } from "express";
import pool from "../config/db";
import { getDistance } from "geolib";
import { markAttendanceSchema } from "../validations/attendance.validation";

export const markAttendance = async (req: Request, res: Response) => {
    try {

        // 1️⃣ Validate request
        const parsed = markAttendanceSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance data",
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const { lecture_id, latitude, longitude } = parsed.data;

        const studentId = (req.user as { id: string }).id;

        // 2️⃣ Check lecture session
        const lectureResult = await pool.query(
            `SELECT * FROM lecture_sessions WHERE id = $1`,
            [lecture_id]
        );

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
        const existing = await pool.query(
            `SELECT * FROM attendance 
            WHERE lecture_id = $1 AND student_id = $2`,
            [lecture_id, studentId]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Attendance already marked"
            });
        }

        // 5️⃣ Calculate distance
        const distance = getDistance(
            { latitude: lecture.latitude, longitude: lecture.longitude },
            { latitude, longitude }
        );

        // 6️⃣ Check distance
        if (distance > lecture.radius) {
            return res.status(403).json({
                success: false,
                message: `You must be within ${lecture.radius} meters of the lecture location`,
                distance
            });
        }

        // 7️⃣ Insert attendance
        const result = await pool.query(
            `INSERT INTO attendance
            (lecture_id, student_id, student_latitude, student_longitude, distance)
            VALUES ($1,$2,$3,$4,$5)
      RETURNING *`,
            [lecture_id, studentId, latitude, longitude, distance]
        );

        return res.status(201).json({
            success: true,
            message: "Attendance marked successfully",
            attendance: result.rows[0]
        });

    } catch (error: any) {

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