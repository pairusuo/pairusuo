"use client";

export default function Footer() {

  return (
    <footer
      className="sticky bottom-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="contentinfo"
    >
      <div className="site-container h-auto py-6 flex flex-col gap-2 sm:h-14 sm:flex-row sm:items-center sm:justify-between border-t">
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} pairusuo</p>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/pairusuo/pairusuo"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub"
            title="GitHub"
            className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path fillRule="evenodd" clipRule="evenodd" d="M12 .5C5.73.5.98 5.23.98 11.48c0 4.83 3.14 8.93 7.49 10.37.55.1.75-.24.75-.53 0-.26-.01-1.13-.02-2.06-3.05.66-3.7-1.3-3.7-1.3-.5-1.27-1.22-1.6-1.22-1.6-.99-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.97 1.66 2.55 1.18 3.17.9.1-.7.38-1.18.68-1.46-2.44-.28-5-1.22-5-5.42 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.42.11-2.95 0 0 .92-.3 3.02 1.13a10.5 10.5 0 0 1 5.5 0c2.1-1.43 3.02-1.13 3.02-1.13.6 1.53.22 2.67.11 2.95.7.77 1.12 1.75 1.12 2.95 0 4.21-2.57 5.13-5.01 5.4.39.34.72 1 .72 2.02 0 1.45-.01 2.62-.01 2.98 0 .29.2.63.76.52 4.35-1.43 7.48-5.53 7.48-10.36C23.02 5.23 18.27.5 12 .5z" />
            </svg>
          </a>
          <a
            href="https://x.com/pairusuo"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="X (Twitter)"
            title="X (Twitter)"
            className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
