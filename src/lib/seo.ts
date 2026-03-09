const fallbackSiteUrl = "https://pairusuo.top";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl;
export const twitterHandle =
  process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@pairusuo";

export const defaultOgImagePath = "/preview.png";
export const defaultOgImage = `${siteUrl}${defaultOgImagePath}`;
export const gamesOgImagePath = "/og-image.png";
export const gamesOgImage = `${siteUrl}${gamesOgImagePath}`;
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
