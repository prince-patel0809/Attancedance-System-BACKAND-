import { z } from "zod";

export const markAttendanceSchema = z.object({
    lecture_id: z.string(),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180)
});