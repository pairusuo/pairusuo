"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotFoundContent() {
  const router = useRouter();
  // 推断当前路径的语言：/en 开头视为英文，否则中文
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
    <div className="mx-auto max-w-[72ch] min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-2xl font-semibold tracking-tight">404 Not Found</h1>
      <p className="text-muted-foreground mt-2">
        {locale === "zh"
          ? `页面不存在，将在 ${sec} 秒后返回首页。`
          : `Page not found. Redirecting to home in ${sec} seconds.`}
      </p>
    </div>
  );
}
