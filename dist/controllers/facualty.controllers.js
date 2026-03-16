"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginFaculty = exports.registerFaculty = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../config/db"));
const token_1 = require("../utils/token");
const Facualty_validations_1 = require("../validations/Facualty.validations");
// REGISTER
const registerFaculty = async (req, res) => {
    try {
        // Validation
        const parsed = Facualty_validations_1.registerFacultySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid registration data",
                errors: parsed.error.flatten().fieldErrors
            });
        }
        const { name, email, password, college_name } = parsed.data;
        // Check existing faculty
        const existing = await db_1.default.query(`SELECT * FROM faculty WHERE email = $1`, [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Faculty account already exists with this email"
            });
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Insert faculty
        const result = await db_1.default.query(`INSERT INTO faculty (name, email, password_hash, college_name)
            VALUES ($1,$2,$3,$4)
            RETURNING id`, [name, email, hashedPassword, college_name]);
        const facultyId = result.rows[0].id;
        const token = (0, token_1.generateToken)(facultyId.id, "faculty");
        return res.status(201).json({
            success: true,
            message: "Faculty registered successfully",
            token,
            faculty_id: facultyId
        });
    }
    catch (error) {
        console.error("Faculty Register Error:", error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred during registration"
        });
    }
};
exports.registerFaculty = registerFaculty;
// LOGIN
const loginFaculty = async (req, res) => {
    try {
        // Validation
        const parsed = Facualty_validations_1.loginFacultySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid login data",
                errors: parsed.error.flatten().fieldErrors
            });
        }
        const { email, password } = parsed.data;
        // Find faculty
        const result = await db_1.default.query(`SELECT * FROM faculty WHERE email = $1`, [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Faculty account not found"
            });
        }
        const faculty = result.rows[0];
        // Compare password
        const validPassword = await bcrypt_1.default.compare(password, faculty.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }
        const token = (0, token_1.generateToken)(faculty.id, "faculty");
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            faculty_id: faculty.id
        });
    }
    catch (error) {
        console.error("Faculty Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred during login"
        });
    }
};
exports.loginFaculty = loginFaculty;
