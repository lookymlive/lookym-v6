import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Panel de Control</h1>
      {/* Add dashboard content here */}
    </div>
  )
}