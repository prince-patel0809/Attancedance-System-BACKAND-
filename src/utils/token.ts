import jwt from "jsonwebtoken";

export const generateToken = (id: string, role: "student" | "faculty") => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
    );
};