'use client'

import { uploadVideo } from "@/app/actions/upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Upload } from "lucide-react"

export default function UploadPage() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    try {
      setUploading(true)
      setProgress(0)
      
      // Validate file size (max 100MB)
      const file = formData.get("video") as File
      if (file.size > 100 * 1024 * 1024) {
        toast.error("File size must be less than 100MB")
        return
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 500)

      await uploadVideo(formData)
      
      clearInterval(progressInterval)
      setProgress(100)
      toast.success("Video uploaded successfully!")
      
      router.push('/videos')
    } catch (error) {
      console.error("Upload failed:", error)
      toast.error(error instanceof Error ? error.message : "Upload failed. Please try again.")
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="rounded-lg border bg-card p-8">
        <h1 className="text-3xl font-bold mb-8">Upload Video</h1>
        
        <form action={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              name="title" 
              placeholder="Enter a descriptive title"
              required 
              disabled={uploading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Describe your video"
              required 
              disabled={uploading}
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="video">Video File</Label>
            <Input 
              id="video" 
              name="video" 
              type="file" 
              accept="video/*"
              required 
              disabled={uploading}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground">
              Maximum file size: 100MB. Supported formats: MP4, WebM
            </p>
          </div>

          {progress > 0 && (
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading... {progress}%
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Video
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
