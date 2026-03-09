const fallbackSiteUrl = "https://pairusuo.top";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl;

export const defaultOgImagePath = "/preview.png";
export const defaultOgImage = `${siteUrl}${defaultOgImagePath}`;
export const defaultOgImageWidth = 1200;
export const defaultOgImageHeight = 630;

export function createDefaultOgImage(alt: string, url = defaultOgImage) {
  return {
    url,
    width: defaultOgImageWidth,
    height: defaultOgImageHeight,
    alt,
  };
}
