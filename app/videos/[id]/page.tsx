'use client'
import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useFetchData } from '@/app/hooks/useFetchData'
import { ObjectId } from "mongodb"
import { notFound } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { addComment } from "./actions"

function CommentForm({ videoId }: { videoId: string }) {
  return (
    <form action={addComment} className="space-y-4">
      <input type="hidden" name="videoId" value={videoId} />
      <Textarea
        name="content"
        placeholder="Add a comment..."
        required
        rows={3}
      />
      <Button type="submit">Post Comment</Button>
    </form>
  )
}

function CommentList({ comments }: { comments: any[] }) {
  return (
    <div className="space-y-4">
      {comments.map((comment: any, index: number) => (
        <Card key={index} className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{comment.userName}</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-black">
      <video
        src={videoUrl}
        controls
        className="w-full h-full"
        poster="/placeholder.png"
      />
    </div>
  )
}

function LoadingVideo() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="aspect-video bg-muted rounded-lg" />
      <div className="h-8 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-1/2" />
    </div>
  )
}

export default function VideoPage({
  params,
}: {
  params: { id: string }
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const controller = new AbortController();
  const { data: video, loading, error } = useFetchData<any>({
    url: `/api/videos/${params.id}`,
    controller
  });

  useEffect(() => {
    // Check authentication status
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(session => {
        setIsAuthenticated(!!session);
      });

    return () => {
      controller.abort();
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="container max-w-4xl py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          Please sign in to view this video.
        </p>
        <Button asChild>
          <a href="/api/auth/signin">Sign In</a>
        </Button>
      </div>
    );
  }

  if (loading) {
    return <LoadingVideo />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!video) {
    notFound();
  }

  return (
    <div className="container max-w-4xl py-8">
      <Suspense fallback={<LoadingVideo />}>
        <VideoPlayer videoUrl={video.videoUrl} />
      </Suspense>

      <div className="mt-6">
        <h1 className="text-3xl font-bold mb-2">{video.title}</h1>
        <p className="text-muted-foreground mb-6">{video.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>{video.views} views</span>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Comments</h2>
            <CommentForm videoId={video._id} />
          </div>

          <div className="space-y-4">
            {video.comments?.length > 0 ? (
              <CommentList comments={video.comments} />
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
