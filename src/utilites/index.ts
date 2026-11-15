import jwt from "jsonwebtoken";
import "./bigInt.js";
import type { $Enums } from "../constants/enums.js";

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

export function getSkippedPrismaValue(page: number, count: number): number {
    return Math.max((page - 1) * count, 0);
}

export function parseMoneyAmount(
    value: number | string | bigint,
    minimum: bigint = 1n,
): bigint | null {
    if (typeof value === "number") {
        if (!Number.isSafeInteger(value)) return null;
    } else if (typeof value === "string") {
        value = value.trim();

        if (!/^\d+$/.test(value)) return null;
    }

    const amount = BigInt(value);

    return amount >= minimum && amount <= 9223372036854775807n ? amount : null;
}

export function convertToNativeDate(date: Date | string) {
    return new Date(date);
}

export function isValidDate(date: Date) {
    return !isNaN(new Date(date).getTime());
}

export function parseDateRangeValue(value: string, endOfRange = false) {
    if (value === undefined || value === "") return undefined;
    if (typeof value !== "string") return undefined;

    const input = value.trim();
    if (!input) return undefined;
    const date = convertToNativeDate(input);
    if (!exports.isValidDate(date)) return undefined;

    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        if (date.toISOString().slice(0, 10) !== input) return undefined;
        if (endOfRange) date.setUTCHours(23, 59, 59, 999);
    }
    return date;
}

export function parseEnumList<T extends string>(
    value: string | undefined,
    allowedValues: readonly T[],
): T[] {
    if (value === undefined || value === "") return [];
    if (typeof value !== "string") return [];

    const values = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    if (values.length === 1 && values[0].toLowerCase() === "all") {
        return [];
    }

    const result: T[] = [];

    for (const item of values) {
        const match = allowedValues.find(
            (allowed) => allowed.toLowerCase() === item.toLowerCase(),
        );

        if (!match) continue;
        if (!result.includes(match)) result.push(match);
    }

    return result;
}

export * from "./prismaClient.js";
export * from "./sendResponse.js";
