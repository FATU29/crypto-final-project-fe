import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Get user from token
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Extract token
  const token = authHeader.substring(7);

  // Parse token to get user ID (mock implementation)
  // In a real app, you'd verify the JWT token
  const tokenParts = token.split("-");
  const userId = tokenParts[3]; // mock-access-token-{userId}-{timestamp}

  // Mock user data based on token
  const user =
    userId === "1"
      ? {
          id: "1",
          email: "admin",
          username: "admin",
          name: "Administrator",
          avatar: "",
          role: "admin" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      : {
          id: "2",
          email: "user@example.com",
          username: "user",
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
