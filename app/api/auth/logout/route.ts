import { NextResponse } from "next/server";

export async function POST() {
  // Clear any server-side session data here

  return NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
}
