import jwt from "jsonwebtoken";

export const generateToken = (studentId: string) => {
    return jwt.sign(
        { id: studentId },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
    );
};