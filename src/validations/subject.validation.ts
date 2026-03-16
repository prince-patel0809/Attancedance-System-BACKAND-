import { z } from "zod";

export const createSubjectSchema = z.object({
    subject_name: z
        .string()
        .min(3, "Subject name must be at least 3 characters")
});