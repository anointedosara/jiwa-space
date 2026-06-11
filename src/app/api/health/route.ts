import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

// Simple health-check endpoint that verifies the MongoDB connection.
// GET /api/health
export async function GET() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });

    return NextResponse.json({
      status: "ok",
      database: db.databaseName,
      connected: true,
    });
  } catch (error) {
    console.error("MongoDB health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        connected: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
