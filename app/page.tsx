import { redirect } from "next/navigation";

export default function Home() {
  // With localePrefix: 'as-needed', default locale (zh) lives at '/'.
  // Redirect to '/' to avoid legacy '/zh' behavior.
  redirect("/");
}
