import Link from "next/link";

export interface LogoProps extends Omit<React.ComponentProps<typeof Link>, 'href'> {
  /** Preset size: header/footer */
  size?: "header" | "footer";
  /** Custom width, higher priority than size */
  width?: number;
  /** Custom height, higher priority than size */
  height?: number;
  /** Whether to show text */
  showText?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Click redirect path */
  href?: string;
  /** Whether this is being used for favicon generation */
  asFavicon?: boolean;
}

/**
 * Shared SVG color definitions - ship and sea only, transparent background.
 */
const SVG_PATHS = {
  hull: "#0F2A3A", // Ship hull, outlines, waves (navy)
  sail: "#DC2626", // Red sails
  sailStripe: "#0F2A3A", // Dark stripes on sails
  mast: "#0F2A3A", // Masts / outlines
  sea: "#0EA5E9", // Sea baseline
  wave: "#0F2A3A", // Waves
} as const;

/**
 * Logo SVG content - shared between Logo component and favicon
 */
export function LogoSVG({
  width = 32,
  height = 32,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="pairusuo logo"
    >
      {/* Sea baseline */}
      <rect x="0" y="26.5" width="32" height="0.8" fill={SVG_PATHS.sea} />
      {/* Waves */}
      <path d="M2 29 Q3 28 4 29 T6 29 T8 29 T10 29 T12 29 T14 29 T16 29 T18 29 T20 29 T22 29 T24 29 T26 29 T28 29 T30 29" stroke={SVG_PATHS.wave} strokeWidth="0.7" fill="none" />

      {/* Masts (extended to meet deck/hull) */}
      <rect x="20.5" y="8" width="1.2" height="18" fill={SVG_PATHS.mast} />
      <rect x="9.2" y="11" width="0.9" height="12" fill={SVG_PATHS.mast} />
      {/* Mast bases to visually connect with hull */}
      <rect x="20.3" y="24" width="1.6" height="2.2" fill={SVG_PATHS.hull} />
      <rect x="9" y="23.5" width="1.4" height="2" fill={SVG_PATHS.hull} />

      {/* Sails (red junk style) */}
      {/* Large front sail (bottom lowered to meet deck) */}
      <path d="M21 12 L28 18 L21 22.5 Z" fill={SVG_PATHS.sail} />
      <path d="M21 13.2 L27 18" stroke={SVG_PATHS.sailStripe} strokeWidth="0.7" />
      <path d="M21 14.8 L26 19.2" stroke={SVG_PATHS.sailStripe} strokeWidth="0.7" />
      <path d="M21 16.4 L25 20.4" stroke={SVG_PATHS.sailStripe} strokeWidth="0.7" />

      {/* Small rear sail (bottom lowered) */}
      <path d="M10 13 L13.5 16 L10 17.8 Z" fill={SVG_PATHS.sail} />
      <path d="M10 14.2 L12.8 16.4" stroke={SVG_PATHS.sailStripe} strokeWidth="0.6" />

      {/* Ship hull (heading right) */}
      <path d="M5 24 L12 24 L14 26 L25 26 Q28 25 29 24 L27.5 28 L7 28 Q5.8 27.2 5 26 Z" fill={SVG_PATHS.hull} />

      {/* Superstructure removed per request (no gray deck / yellow windows) */}
    </svg>
  );
}

/**
 * Get SVG string for favicon generation
 * Uses the same constants to ensure complete consistency with React component
 */
export function getLogoSvgString(width = 32, height = 32): string {
  return `<svg width="${width}" height="${height}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="26.5" width="32" height="0.8" fill="${SVG_PATHS.sea}" />
  <path d="M2 29 Q3 28 4 29 T6 29 T8 29 T10 29 T12 29 T14 29 T16 29 T18 29 T20 29 T22 29 T24 29 T26 29 T28 29 T30 29" stroke="${SVG_PATHS.wave}" stroke-width="0.7" fill="none" />

  <rect x="20.5" y="8" width="1.2" height="18" fill="${SVG_PATHS.mast}" />
  <rect x="9.2" y="11" width="0.9" height="12" fill="${SVG_PATHS.mast}" />
  <rect x="20.3" y="24" width="1.6" height="2.2" fill="${SVG_PATHS.hull}" />
  <rect x="9" y="23.5" width="1.4" height="2" fill="${SVG_PATHS.hull}" />

  <path d="M21 12 L28 18 L21 22.5 Z" fill="${SVG_PATHS.sail}" />
  <path d="M21 13.2 L27 18" stroke="${SVG_PATHS.sailStripe}" stroke-width="0.7" fill="none" />
  <path d="M21 14.8 L26 19.2" stroke="${SVG_PATHS.sailStripe}" stroke-width="0.7" fill="none" />
  <path d="M21 16.4 L25 20.4" stroke="${SVG_PATHS.sailStripe}" stroke-width="0.7" fill="none" />

  <path d="M10 13 L13.5 16 L10 17.8 Z" fill="${SVG_PATHS.sail}" />
  <path d="M10 14.2 L12.8 16.4" stroke="${SVG_PATHS.sailStripe}" stroke-width="0.6" fill="none" />

  <path d="M5 24 L12 24 L14 26 L25 26 Q28 25 29 24 L27.5 28 L7 28 Q5.8 27.2 5 26 Z" fill="${SVG_PATHS.hull}" />
</svg>`;
}

/**
 * Logo component: ship-only
 */
export function Logo({
  size = "header",
  width,
  height,
  showText = false,
  className,
  href = "/",
  ...props
}: LogoProps) {
  // Calculate logo size
  const defaultSize = size === "header" ? 24 : 64;
  const logoWidth = width || defaultSize;
  const logoHeight = height || defaultSize;

  return (
    <Link
      href={href}
      className={("flex items-center gap-2 smooth-transition " + (className || "")).trim()}
      {...props}
    >
      <LogoSVG width={logoWidth} height={logoHeight} className="object-contain smooth-transition hover:scale-110" />
      {showText && <span className="font-semibold text-lg gradient-text">pairusuo</span>}
    </Link>
  );
}
