"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAttendanceSchema = void 0;
const zod_1 = require("zod");
exports.markAttendanceSchema = zod_1.z.object({
    lecture_id: zod_1.z.string(),
    latitude: zod_1.z.coerce.number().min(-90).max(90),
    longitude: zod_1.z.coerce.number().min(-180).max(180)
});
