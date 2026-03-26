import { z } from "zod";

export const markAttendanceSchema = z.object({
    lecture_id: z.string(),
    latitude: z.number(),
    longitude: z.number()
});