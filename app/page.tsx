import Image from "next/image";

export default function HomePage() 
{
  return (
    <main className="min-h-screen bg-[#ffffff] flex flex-col items-center justify-center px-6 text-center">
      <div className="relative w-72 h-72 md:w-[420px] md:h-[420px] mb-8">
        <Image
          src="/logo_main_image.png"
          alt="Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      <h1 className="text-3xl md:text-5xl italic text-[#132A36] mb-4">
        Ship something wild. 
      </h1>

      <form className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
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
    </main>
  );
}