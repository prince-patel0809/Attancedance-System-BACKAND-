import { z } from "zod";

export const registerFacultySchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    college_name: z.string().min(3)
});

export const loginFacultySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});