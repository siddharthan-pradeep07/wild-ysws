import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest)
{
    const response = NextResponse.redirect(new URL("/", request.url));

    response.cookies.delete("session_user");
    response.cookies.delete("access_token");

    return response;
}
