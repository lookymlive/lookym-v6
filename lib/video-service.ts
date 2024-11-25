import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/auth";
import clientPromise from "./mongodb";
import { ObjectId } from 'mongodb';

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("AWS credentials are not properly configured");
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "lookym-videos";

export interface Comment {
  content: string;
  userId: string;
  userName: string | null;
  createdAt: Date;
}

export async function getUploadUrl(fileName: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `uploads/${fileName}`,
    ContentType: "video/mp4",
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return uploadUrl;
}

export async function getVideoUrl(videoKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: videoKey,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
}

export async function saveVideoMetadata({
  title,
  description,
  fileName,
  duration,
}: {
  title: string;
  description: string;
  fileName: string;
  duration: number;
}): Promise<any> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("User must be authenticated to upload videos");
  }

  const client = await clientPromise;
  const db = client.db();

  const video = await db.collection("videos").insertOne({
    title,
    description,
    fileName,
    duration,
    userId: session.user.id,
    createdAt: new Date(),
    views: 0,
    likes: 0,
    comments: [] as Comment[],
  });

  return video;
}

export async function getVideos(page = 1, limit = 12): Promise<any> {
  const client = await clientPromise;
  const db = client.db();

  const skip = (page - 1) * limit;

  const videos = await db
    .collection("videos")
    .find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await db.collection("videos").countDocuments();

  return {
    videos,
    total,
    hasMore: total > skip + limit,
  };
}

export async function getVideoById(id: string): Promise<any> {
  const client = await clientPromise;
  const db = client.db();

  const video = await db.collection("videos").findOne({ _id: new ObjectId(id) });
  return video;
}

export async function addComment({
  videoId,
  content,
}: {
  videoId: string;
  content: string;
}): Promise<Comment> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("User must be authenticated to comment");
  }

  const client = await clientPromise;
  const db = client.db();

  const comment: Comment = {
    content,
    userId: session.user.id,
    userName: session.user.name || null,
    createdAt: new Date(),
  };

  await db.collection("videos").updateOne(
    { _id: new ObjectId(videoId) },
    {
      $push: { comments: comment },
    }
  );

  return comment;
}
