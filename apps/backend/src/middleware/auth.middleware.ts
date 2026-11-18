import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Unauthorized authHeader",
        });
    }

    const [schema, token] = authHeader.split(" ");
    if (schema !== "Bearer" || !token) {
        return res.status(401).json({
            message: "Invalid authorization header",
        });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not defined");
    }

    try {
        const decoded = jwt.verify(
            token,
            jwtSecret,
        );
        req.user = decoded as {
            id: string;
            email: string;
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token",
        });
    }
}
