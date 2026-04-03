"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const studentsAuth_1 = require("../middlewares/studentsAuth");
const attendance_controllers_1 = require("../controllers/attendance.controllers");
const Attandancerouter = express_1.default.Router();
Attandancerouter.post("/mark", studentsAuth_1.studentAuth, attendance_controllers_1.markAttendance);
Attandancerouter.get("/history/excel", studentsAuth_1.studentAuth, attendance_controllers_1.downloadAttendanceHistory);
exports.default = Attandancerouter;
