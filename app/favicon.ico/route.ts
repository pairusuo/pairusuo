import { NextResponse } from "next/server";
import { getLogoSvgString } from "@/components/logo";

export const dynamic = 'force-static';

export function GET() {
  // Generate SVG from the single source of truth component
  const svg = getLogoSvgString(32, 32);
  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
