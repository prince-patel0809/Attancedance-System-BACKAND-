
import express from "express";
import { loginFaculty, registerFaculty } from "../controllers/facualty.controllers";





const FacultyRoutes = express.Router();

FacultyRoutes.post("/register", registerFaculty);
FacultyRoutes.post("/login", loginFaculty);


export default FacultyRoutes