import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth()
  
  // If user is already authenticated, redirect based on role
  if (session?.user) {
    if (session.user.role === 'admin') {
      redirect('/dashboard')
    } else {
      redirect('/videos')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-800">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          <span className="text-blue-500">Lookym</span>
        </h1>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:gap-12">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-xl text-white">Para Comercios</CardTitle>
              <CardDescription className="text-zinc-400">
                Sube y gestiona videos de tu negocio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action="/api/auth/signin/google"
                method="POST"
              >
                <input type="hidden" name="callbackUrl" value="/dashboard" />
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                  Acceder como Comercio
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-xl text-white">Para Usuarios</CardTitle>
              <CardDescription className="text-zinc-400">
                Descubre y explora videos de comercios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action="/api/auth/signin/google"
                method="POST"
              >
                <input type="hidden" name="callbackUrl" value="/videos" />
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
                  Acceder como Usuario
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-zinc-400 max-w-lg">
          Plataforma de videos para comercios y usuarios. Descubre, comparte y conecta con negocios locales a través de contenido audiovisual.
        </p>
      </div>
    </div>
  )
}