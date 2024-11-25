import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const client = await clientPromise;
    const db = client.db();

    const video = await db
      .collection("videos")
      .findOne({ _id: new ObjectId(params.id) });

    if (!video) {
      return new NextResponse(JSON.stringify({ error: "Video not found" }), {
        status: 404,
      });
    }

    return NextResponse.json({
      ...video,
      _id: video._id.toString(),
      createdAt: video.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching video:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
