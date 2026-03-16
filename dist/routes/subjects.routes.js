"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const FacualtyAuth_1 = require("../middlewares/FacualtyAuth");
const subject_controllers_1 = require("../controllers/subject.controllers");
const Subjectrouter = express_1.default.Router();
Subjectrouter.post("/create", FacualtyAuth_1.facultyAuth, subject_controllers_1.createSubject);
Subjectrouter.get("/get", FacualtyAuth_1.facultyAuth, subject_controllers_1.getFacultySubjects);
Subjectrouter.delete("/delete/:id", FacualtyAuth_1.facultyAuth, subject_controllers_1.deleteSubject);
exports.default = Subjectrouter;
