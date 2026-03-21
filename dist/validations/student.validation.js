"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginStudentSchema = exports.registerStudentSchema = void 0;
const zod_1 = require("zod");
exports.registerStudentSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    enrollment_no: zod_1.z.string().min(3, "Enrollment number required"),
    device_id: zod_1.z.string()
});
exports.loginStudentSchema = zod_1.z.object({
    enrollment_no: zod_1.z.string().min(3),
    device_id: zod_1.z.string()
});
