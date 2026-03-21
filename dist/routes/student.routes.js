"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const students_controllers_1 = require("../controllers/students.controllers");
const studentsAuth_1 = require("../middlewares/studentsAuth");
const router = express_1.default.Router();
router.post("/register", students_controllers_1.registerStudent);
router.post("/login", students_controllers_1.loginStudent);
router.get("/profile", studentsAuth_1.studentAuth, students_controllers_1.getStudentProfile);
exports.default = router;
