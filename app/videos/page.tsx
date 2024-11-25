import { auth } from "@/auth"
import clientPromise from "@/lib/mongodb"
import { VideoCard } from "@/components/VideoCard"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Suspense } from "react"
import { redirect } from "next/navigation"

async function getVideos(page = 1, limit = 12) {
  const client = await clientPromise
  const db = client.db()
  
  const skip = (page - 1) * limit
  
  try {
    const [videos, total] = await Promise.all([
      db.collection("videos")
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("videos").countDocuments()
    ])

    const enhancedVideos = videos.map(video => ({
      ...video,
      _id: video._id.toString(),
      createdAt: video.createdAt.toISOString()
    }))

    return {
      videos: enhancedVideos,
      total,
      hasMore: total > skip + limit
    }
  } catch (error) {
    console.error("Error fetching videos:", error)
    throw new Error("Failed to load videos")
  }
}

function VideoGrid({ videos }: { videos: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoCard
          key={video._id}
          id={video._id}
          title={video.title}
          description={video.description}
          videoUrl={video.videoUrl}
        />
      ))}
    </div>
  )
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border bg-card p-4 space-y-4 animate-pulse"
        >
          <div className="h-40 bg-muted rounded-md" />
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}

export default async function VideosPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const session = await auth()
  
  if (!session) {
    redirect('/')
  }

  const page = Number(searchParams.page) || 1
  const { videos, hasMore } = await getVideos(page)

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Descubre Videos</h1>
            <p className="text-zinc-400">Explora los mejores videos de comercios locales</p>
          </div>
          {session.user.role === 'admin' && (
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <a href="/upload">Subir Video</a>
            </Button>
          )}
        </div>

        <Suspense fallback={<LoadingGrid />}>
          <VideoGrid videos={videos} />
        </Suspense>

        {videos.length === 0 && (
          <div className="text-center py-12 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <h2 className="text-xl font-semibold mb-2 text-white">No hay videos disponibles</h2>
            <p className="text-zinc-400 mb-4">
              {session.user.role === 'admin' 
                ? '¡Sé el primero en subir un video!'
                : 'Aún no hay videos disponibles. Vuelve más tarde.'}
            </p>
            {session.user.role === 'admin' && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <a href="/upload">Subir Video</a>
              </Button>
            )}
          </div>
        )}

        {videos.length > 0 && (
          <div className="mt-8 flex justify-center gap-2">
            {page > 1 && (
              <Button
                variant="outline"
                asChild
                className="border-zinc-700 hover:bg-zinc-800"
              >
                <a href={`/videos?page=${page - 1}`}>Anterior</a>
              </Button>
            )}
            {hasMore && (
              <Button
                variant="outline"
                asChild
                className="border-zinc-700 hover:bg-zinc-800"
              >
                <a href={`/videos?page=${page + 1}`}>Siguiente</a>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
