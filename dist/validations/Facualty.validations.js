"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginFacultySchema = exports.registerFacultySchema = void 0;
const zod_1 = require("zod");
exports.registerFacultySchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    college_name: zod_1.z.string().min(3)
});
exports.loginFacultySchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
