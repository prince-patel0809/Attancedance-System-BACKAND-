"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAttendanceSchema = void 0;
const zod_1 = require("zod");
exports.markAttendanceSchema = zod_1.z.object({
    lecture_id: zod_1.z.string().uuid(),
    latitude: zod_1.z.number(),
    longitude: zod_1.z.number()
});
