"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const facualty_controllers_1 = require("../controllers/facualty.controllers");
const FacultyRoutes = express_1.default.Router();
FacultyRoutes.post("/register", facualty_controllers_1.registerFaculty);
FacultyRoutes.post("/login", facualty_controllers_1.loginFaculty);
exports.default = FacultyRoutes;
