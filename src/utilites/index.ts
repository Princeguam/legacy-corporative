import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
    throw new Error("JWT SECRET NOT FETCHED");
}

const JWT_SECRET = process.env.JWT_SECRET;

export function decodeJwtToken(token: string): {
    value?: string;
    error?: string;
} {
    const payload = jwt.verify(token, JWT_SECRET) as { value: string };

    if (!payload.value) {
        return { error: "Invalid Token" };
    }

    return { value: payload.value };
}

export function generatJwtToken(value: string, expiresIn?: string): string {
    const jwtPayload = { value };

    if (expiresIn) {
        const options = { expiresIn };
        return jwt.sign(jwtPayload, JWT_SECRET, {
            expiresIn: expiresIn as any,
        });
    } else {
        return jwt.sign(jwtPayload, JWT_SECRET);
    }
}

export function parseBoolean(value: any): Boolean {
    if (typeof value === "boolean") return value;

    if (typeof value === "string") {
        const lower = value.toLowerCase().trim();
        const truthyValues = ["true", "1", "yes", "y", "on"];
        const falsyValues = ["false", "0", "no", "n", "off"];

        if (truthyValues.includes(lower)) return true;
        if (falsyValues.includes(lower)) return false;
    }

    if (typeof value === "number") {
        return value !== 0;
    }

    return Boolean(value);
}

export * from "./prismaClient.js";
export * from "./sendResponse.js";
