import { redirect } from "next/navigation";

export default function ProfilePage() {
  // For now, redirect to settings
  // This can be expanded later with a dedicated profile page
  redirect("/settings");
}
