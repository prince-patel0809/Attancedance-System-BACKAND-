"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubject = exports.getFacultySubjects = exports.createSubject = void 0;
const db_1 = __importDefault(require("../config/db"));
const subject_validation_1 = require("../validations/subject.validation");
const createSubject = async (req, res) => {
    try {
        // 1️⃣ Validate request
        const parsed = subject_validation_1.createSubjectSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid subject data",
                errors: parsed.error.flatten().fieldErrors
            });
        }
        const { subject_name } = parsed.data;
        const facultyId = req.user.id;
        // 2️⃣ Check if subject already exists for faculty
        const existing = await db_1.default.query(`SELECT * FROM subjects 
            WHERE subject_name = $1 AND faculty_id = $2`, [subject_name, facultyId]);
        if (existing.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Subject already exists"
            });
        }
        // 3️⃣ Insert subject
        const result = await db_1.default.query(`INSERT INTO subjects (subject_name, faculty_id)
            VALUES ($1,$2)
            RETURNING *`, [subject_name, facultyId]);
        return res.status(201).json({
            success: true,
            message: "Subject created successfully",
            subject: result.rows[0]
        });
    }
    catch (error) {
        console.error("Create Subject Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while creating subject"
        });
    }
};
exports.createSubject = createSubject;
const getFacultySubjects = async (req, res) => {
    try {
        const facultyId = req.user.id;
        const result = await db_1.default.query(`SELECT * FROM subjects
            WHERE faculty_id = $1
            ORDER BY created_at DESC`, [facultyId]);
        return res.status(200).json({
            success: true,
            subjects: result.rows
        });
    }
    catch (error) {
        console.error("Get Subjects Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching subjects"
        });
    }
};
exports.getFacultySubjects = getFacultySubjects;
const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const facultyId = req.user.id;
        const result = await db_1.default.query(`DELETE FROM subjects
            WHERE id = $1 AND faculty_id = $2
            RETURNING *`, [id, facultyId]);
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
    }
    catch (error) {
        console.error("Delete Subject Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while deleting subject"
        });
    }
};
exports.deleteSubject = deleteSubject;
