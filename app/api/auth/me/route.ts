import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // TODO: Get user from token
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Example user - replace with actual token verification
  const user = {
    id: "1",
    email: "demo@example.com",
    name: "Demo User",
    avatar: "",
    role: "user" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return NextResponse.json({
    success: true,
    data: user,
  });
}
