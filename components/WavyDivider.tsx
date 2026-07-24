export default function WavyDivider({ src = "/squiggle.webp", color = "#493e2a" }: { src?: string; color?: string }) {
  return (
    <div
      className="w-full h-8 md:h-10"
      style={{
        backgroundColor: color,
        WebkitMaskImage: `url("${src}")`,
        maskImage: `url("${src}")`,
        WebkitMaskRepeat: "repeat-x",
        maskRepeat: "repeat-x",
        WebkitMaskSize: "auto 100%",
        maskSize: "auto 100%",
        WebkitMaskPosition: "left center",
        maskPosition: "left center",
      }}
    />
  );
}