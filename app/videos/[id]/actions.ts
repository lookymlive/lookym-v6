'use server'

import { auth } from "@/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const commentSchema = z.object({
  videoId: z.string(),
  content: z.string().min(1, "Comment cannot be empty"),
})

export async function addComment(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Must be logged in to comment")
  }

  const validatedFields = commentSchema.safeParse({
    videoId: formData.get("videoId"),
    content: formData.get("content"),
  })

  if (!validatedFields.success) {
    throw new Error("Invalid comment data")
  }

  const { videoId, content } = validatedFields.data

  const client = await clientPromise
  const db = client.db()

  const comment = {
    content,
    userId: session.user.id,
    userName: session.user.name,
    createdAt: new Date(),
  }

  await db.collection("videos").updateOne(
    { _id: new ObjectId(videoId) },
    {
      $push: { comments: comment },
      $inc: { commentCount: 1 },
    }
  )

  revalidatePath(`/videos/${videoId}`)
}
