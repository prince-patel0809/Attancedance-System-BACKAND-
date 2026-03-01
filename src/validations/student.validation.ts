import { z } from "zod";

export const registerStudentSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    enrollment_no: z.string().min(3, "Enrollment number required"),
    device_id: z.string().uuid("Invalid device id")
});


export const loginStudentSchema = z.object({
    enrollment_no: z.string().min(3),
    device_id: z.string().uuid()
});

