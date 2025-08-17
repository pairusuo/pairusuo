export default function Head() {
  return (
    <>
      {/* Speed up image CDN connections for LCP */}
      <link rel="preconnect" href="https://image.pairusuo.top" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="//image.pairusuo.top" />
    </>
  );
}
