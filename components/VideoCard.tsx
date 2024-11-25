import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Info } from "lucide-react"

interface VideoCardProps {
  id: string
  title: string
  description: string
  videoUrl: string
  createdAt?: string
  views?: number
  userName?: string
}

export function VideoCard({ id, title, description, videoUrl, createdAt, views, userName }: VideoCardProps) {
  return (
    <Card className="w-full overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="line-clamp-1">{title}</CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
        {userName && (
          <div className="text-sm text-muted-foreground">
            Uploaded by {userName}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video w-full overflow-hidden rounded-md">
          <video 
            src={videoUrl} 
            controls 
            className="h-full w-full object-cover"
            poster="/placeholder.png"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {createdAt && new Date(createdAt).toLocaleDateString()}
          {createdAt && views && ' • '}
          {views && `${views} views`}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="gap-2">
            <Play className="h-4 w-4" />
            Play
          </Button>
          <Link href={`/videos/${id}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Info className="h-4 w-4" />
              Details
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
