"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubjectSchema = void 0;
const zod_1 = require("zod");
exports.createSubjectSchema = zod_1.z.object({
    subject_name: zod_1.z
        .string()
        .min(3, "Subject name must be at least 3 characters")
});
