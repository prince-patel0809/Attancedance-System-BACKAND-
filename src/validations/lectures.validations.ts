import { z } from "zod";

export const createLectureSchema = z.object({
    subject_id: z.string().uuid(),
    latitude: z.number(),
    longitude: z.number()
});