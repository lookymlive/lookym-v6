import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getUploadUrl, saveVideoMetadata } from "@/lib/video-service";

const videoSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  file: z.instanceof(FileList).refine((files) => {
    return files.length > 0 && files[0].type.startsWith("video/");
  }, "Must upload a video file"),
});

type VideoForm = z.infer<typeof videoSchema>;

export function UploadVideo() {
  const [isUploading, setIsUploading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VideoForm>({
    resolver: zodResolver(videoSchema),
  });

  const onSubmit = async (data: VideoForm) => {
    try {
      setIsUploading(true);
      const file = data.file[0];
      const fileName = `${Date.now()}-${file.name}`;

      // Get presigned URL for upload
      const uploadUrl = await getUploadUrl(fileName);

      // Upload video to S3
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      // Save video metadata
      await saveVideoMetadata({
        title: data.title,
        description: data.description,
        fileName,
        duration: 0, // TODO: Calculate video duration
      });

      toast.success("Video uploaded successfully!");
      reset();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload video. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Enter video title"
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Enter video description"
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Video File</Label>
        <Input
          id="file"
          type="file"
          accept="video/*"
          {...register("file")}
          className="cursor-pointer"
        />
        {errors.file && (
          <p className="text-sm text-red-500">{errors.file.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Video
          </>
        )}
      </Button>
    </form>
  );
}
