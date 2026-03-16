import { Request, Response } from "express";
import pool from "../config/db";
import { createSubjectSchema } from "../validations/subject.validation";

export const createSubject = async (req: Request, res: Response) => {
    try {

        // 1️⃣ Validate request
        const parsed = createSubjectSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid subject data",
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const { subject_name } = parsed.data;

        const facultyId = (req.user as any).id;

        // 2️⃣ Check if subject already exists for faculty
        const existing = await pool.query(
            `SELECT * FROM subjects 
            WHERE subject_name = $1 AND faculty_id = $2`,
            [subject_name, facultyId]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Subject already exists"
            });
        }

        // 3️⃣ Insert subject
        const result = await pool.query(
            `INSERT INTO subjects (subject_name, faculty_id)
            VALUES ($1,$2)
            RETURNING *`,
            [subject_name, facultyId]
        );

        return res.status(201).json({
            success: true,
            message: "Subject created successfully",
            subject: result.rows[0]
        });

    } catch (error) {

        console.error("Create Subject Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating subject"
        });
    }
};


export const getFacultySubjects = async (req: Request, res: Response) => {
    try {

        const facultyId = (req.user as any).id;

        const result = await pool.query(
            `SELECT * FROM subjects
            WHERE faculty_id = $1
            ORDER BY created_at DESC`,
            [facultyId]
        );

        return res.status(200).json({
            success: true,
            subjects: result.rows
        });

    } catch (error) {

        console.error("Get Subjects Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching subjects"
        });
    }
};



export const deleteSubject = async (req: Request, res: Response) => {
    try {

        const { id } = req.params;
        const facultyId = (req.user as any).id;

        const result = await pool.query(
            `DELETE FROM subjects
            WHERE id = $1 AND faculty_id = $2
            RETURNING *`,
            [id, facultyId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Subject deleted successfully"
        });

    } catch (error) {

        console.error("Delete Subject Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deleting subject"
        });
    }
};