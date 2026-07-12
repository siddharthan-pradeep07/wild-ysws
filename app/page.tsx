import Image from "next/image";

export default function HomePage() 
{
  return (
    <main className="min-h-screen bg-[#ffffff] flex flex-col items-center justify-center px-6 text-center">
      <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
        <Image
          src="/logo.png"
          alt="Logo"
          fill
          className="object-contain drop-shadow-2xl"
          priority
        />
      </div>

      <h1 className="text-3xl md:text-5xl font-italic text-[#132A36] mb-4">
        Ship something wild. 
      </h1>
      <p className="text-lg text-[#132A36]/80 max-w-md">
        Build a real project, get reviewed, and earn rewards. abcdefghijklmnopqrstuvwxyz
      </p>
    </main>
  );
}
