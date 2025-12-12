import { NextRequest, NextResponse } from "next/server";

// Example API route for registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // TODO: Implement actual registration logic

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Example: Replace with actual user creation
    const user = {
      id: "1",
      email: email,
      name: name,
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
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
