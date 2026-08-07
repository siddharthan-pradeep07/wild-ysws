import { createHmac, timingSafeEqual } from "node:crypto";

// The session_user cookie carries the user's identity (including email,
// which authorization checks in lib/admin.ts key off of). httpOnly only
// stops JS from reading it — it does nothing to stop a client from sending
// a hand-edited cookie value. Signing it means a tampered value fails
// verification and is treated as logged-out, instead of being trusted.

function getSecret(): string
{
    const secret = process.env.SESSION_SECRET;

    if (!secret)
    {
        throw new Error(
            "SESSION_SECRET is not set. Add it to .env.local — sessions cannot be signed without it."
        );
    }

    return secret;
}

function sign(payload: string): string
{
    return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function signSessionCookie(data: unknown): string
{
    const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
    return `${payload}.${sign(payload)}`;
}

export function verifySessionCookie<T>(raw: string | undefined | null): T | null
{
    if (!raw)
    {
        return null;
    }

    const separatorIndex = raw.lastIndexOf(".");

    if (separatorIndex === -1)
    {
        return null;
    }

    const payload = raw.slice(0, separatorIndex);
    const signature = raw.slice(separatorIndex + 1);

    let expected: Buffer;
    let actual: Buffer;

    try
    {
        expected = Buffer.from(sign(payload));
        actual = Buffer.from(signature);
    }
    catch
    {
        return null;
    }

    // Constant-time comparison — a naive === here would let an attacker
    // time their way to a valid signature byte-by-byte.
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual))
    {
        return null;
    }

    try
    {
        return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as T;
    }
    catch
    {
        return null;
    }
}
