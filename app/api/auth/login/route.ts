import { NextRequest, NextResponse } from "next/server";

// Mock authentication credentials
const MOCK_USERS = [
  {
    id: "1",
    email: "admin",
    username: "admin",
    password: "admin", // In production, this should be hashed!
    name: "Administrator",
    avatar: "",
    role: "admin" as const,
  },
  {
    id: "2",
    email: "user@example.com",
    username: "user",
    password: "user",
    name: "Demo User",
    avatar: "",
    role: "user" as const,
  },
];

// Mock API route for login with admin/admin credentials
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Find user by email or username
    const user = MOCK_USERS.find(
      (u) =>
        (u.email.toLowerCase() === email.toLowerCase() ||
          u.username.toLowerCase() === email.toLowerCase()) &&
        u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate mock tokens
    const accessToken = `mock-access-token-${user.id}-${Date.now()}`;
    const refreshToken = `mock-refresh-token-${user.id}-${Date.now()}`;

    // Return user data without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pwd, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        tokens: {
          accessToken,
          refreshToken,
        },
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
