import { NextRequest, NextResponse } from "next/server";

// Example API route for login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // TODO: Implement actual authentication logic
    // This is just an example response structure

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Example: Replace with actual authentication
    const user = {
      id: "1",
      email: email,
      name: "Demo User",
      avatar: "",
      role: "user" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tokens = {
      accessToken: "example-access-token",
      refreshToken: "example-refresh-token",
    };

    return NextResponse.json({
      success: true,
      data: {
        user,
        tokens,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
