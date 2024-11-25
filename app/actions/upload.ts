'use server'

import { auth } from "@/auth"
import { uploadToS3 } from "@/lib/s3"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function uploadVideo(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  const file = formData.get("video") as File
  if (!file) {
    throw new Error("No file provided")
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const fileName = `${session.user.id}-${Date.now()}-${file.name}`
  
  const videoUrl = await uploadToS3(buffer, fileName)
  
  const response = await fetch(`${process.env.MONGODB_URI}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: session.user.id,
      title: formData.get("title"),
      description: formData.get("description"),
      videoUrl,
      createdAt: new Date(),
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to save video metadata")
  }

  revalidatePath('/videos')
  redirect('/videos')
}

