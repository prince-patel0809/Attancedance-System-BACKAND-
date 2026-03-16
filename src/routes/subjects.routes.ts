import express from "express";
import { facultyAuth } from "../middlewares/FacualtyAuth";
import { createSubject, deleteSubject, getFacultySubjects } from "../controllers/subject.controllers";


const Subjectrouter = express.Router();

Subjectrouter.post("/create", facultyAuth, createSubject);
Subjectrouter.get("/get", facultyAuth, getFacultySubjects);
Subjectrouter.delete("/delete/:id", facultyAuth, deleteSubject);

export default Subjectrouter;