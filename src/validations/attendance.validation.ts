import { z } from "zod";

export const markAttendanceSchema = z.object({
    lecture_id: z.string().uuid(),
    latitude: z.number(),
    longitude: z.number()
});