import Link from "next/link"
import { Button } from "./button"
import { signIn, signOut, auth } from "@/auth"

export async function Header() {
  const session = await auth()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Lookym</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/explore"
              className="transition-colors hover:text-foreground/80"
            >
              Explore
            </Link>
            <Link
              href="/upload"
              className="transition-colors hover:text-foreground/80"
            >
              Upload
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {session?.user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm">{session.user.email}</span>
              <form
                action={async () => {
                  "use server"
                  await signOut()
                }}
              >
                <Button variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </div>
          ) : (
            <form
              action={async () => {
                "use server"
                await signIn()
              }}
            >
              <Button size="sm">
                Sign in
              </Button>
            </form>
          )}
        </div>
      </div>
    </header>
  )
}
