import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container max-w-4xl py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Video Not Found</h1>
      <p className="text-muted-foreground mb-8">
        The video you are looking for does not exist or has been removed.
      </p>
      <Button asChild>
        <a href="/videos">Back to Videos</a>
      </Button>
    </div>
  )
}
