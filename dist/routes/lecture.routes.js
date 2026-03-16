"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const FacualtyAuth_1 = require("../middlewares/FacualtyAuth");
const lecture_controllers_1 = require("../controllers/lecture.controllers");
const Lecturerouter = express_1.default.Router();
Lecturerouter.post("/start", FacualtyAuth_1.facultyAuth, lecture_controllers_1.startLectureSession);
Lecturerouter.post("/end/:lecture_id", FacualtyAuth_1.facultyAuth, lecture_controllers_1.endLectureSession);
exports.default = Lecturerouter;
