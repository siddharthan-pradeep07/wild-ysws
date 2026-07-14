import Image from "next/image";
import WavyDivider from "@/components/WavyDivider";

export default function HomePage() 
{
  return (
    <main className="min-h-screen bg-[#fff] flex flex-col items-center justify-start pt-0 px-10 text-center">
      <div className="relative w-156 h-156 md:w-[920px] md:h-[520px] mb-2">
        <Image
          src="/logo_main_image-remove.png"
          alt="Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      <h1 className="text-3xl md:text-5xl italic text-[#132A36] mb-4">
        Ship something wild. 
      </h1>

      <form className="flex flex-col sm:flex-row gap-1 w-full max-w-sm mb-10">
        <input
          type="email"
          required
          placeholder="you@example.com"
          className="input-email"
        />
        <button
          type="submit"
          className="btn-primary"
        >
          get started
        </button>
      </form>
      <WavyDivider color="#132A36"/>
    </main>
  );
}