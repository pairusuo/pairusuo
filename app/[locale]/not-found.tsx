"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotFound({ params }: { params?: { locale?: string } }) {
  const router = useRouter();
  // App Router will not pass params to not-found by default; infer from location
  const locale = typeof window !== "undefined" && /^\/en(\/|$)/.test(window.location.pathname) ? "en" : "zh";
  const home = locale === "zh" ? "/" : "/en";
  const [sec, setSec] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => setSec((s) => (s > 1 ? s - 1 : s)), 1000);
    const go = setTimeout(() => router.push(home), 5000);
    return () => {
      clearInterval(timer);
      clearTimeout(go);
    };
  }, [home, router]);

  return (
    <div className="mx-auto max-w-[72ch] py-10">
      <h1 className="text-2xl font-semibold tracking-tight">404 Not Found</h1>
      <p className="text-muted-foreground mt-2">
        {locale === "zh"
          ? `页面不存在，将在 ${sec} 秒后返回首页。`
          : `Page not found. Redirecting to home in ${sec} seconds.`}
      </p>
    </div>
  );
}
