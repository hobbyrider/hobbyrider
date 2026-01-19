import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function SeedProductsPage() {
  // Redirect to main admin dashboard with seed-products tab
  redirect("/admin?tab=seed-products")
}
