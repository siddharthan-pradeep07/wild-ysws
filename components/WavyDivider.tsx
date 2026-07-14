export default function WavyDivider({ color = "#493e2a" }: { color?: string }) {
  const encodedColor = encodeURIComponent(color);

  return (
    <div
      className="w-full h-8 md:h-10"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20'%3E%3Cpath d='M0 10 Q 10 -5 20 10 T 40 10' fill='none' stroke='${encodedColor}' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat-x",
        backgroundSize: "60px 30px",
        backgroundPosition: "left center",
      }}
    />
  );
}