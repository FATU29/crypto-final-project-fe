import { NextRequest, NextResponse } from "next/server";

// Use AI service directly when running in Docker (bypass gateway auth for internal calls)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://ai:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, limit = 5, accountType } = body;

    if (!symbol) {
      return NextResponse.json(
        { detail: "Symbol is required" },
        { status: 400 },
      );
    }

    // Check if user is VIP
    if (accountType !== "VIP") {
      return NextResponse.json(
        {
          detail:
            "This feature is only available to VIP members. Upgrade your account to access AI price predictions.",
        },
        { status: 403 },
      );
    }

    // Call AI service
    const response = await fetch(`${AI_SERVICE_URL}/api/v1/ai/predict-price`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        symbol: symbol.toUpperCase(),
        limit: Math.min(Math.max(limit, 1), 50), // Clamp between 1 and 50
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { detail: errorData.detail || "Failed to get prediction" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in predict-price API:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 },
    );
  }
}
