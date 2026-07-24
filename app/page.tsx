import Image from "next/image";
import WavyDivider from "@/components/WavyDivider";

export default function HomePage() 
{
  return (
    <main className="min-h-screen bg-[#cad2c5] flex flex-col items-center justify-start pt-0 text-center">
      <div className="w-full flex flex-col items-center px-10">
        <div className="relative w-156 h-156 md:w-[920px] md:h-[520px] mb-2">
          <Image
            src="/logo_main_image-remove.png"
            alt="Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <h1 className="text-2xl md:text-4xl italic text-[#132A36] mb-4">
          make projects that combine two random things, get intersting prizes
        </h1>

        <form className="flex flex-col sm:flex-row gap-1 w-full max-w-sm mb-10 mx-auto justify-center">
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="input-email"
          />
          <button
            type="submit"
            className="btn-primary shrink-0"
          >
            get started
          </button>
        </form>
      </div>

      <WavyDivider/>
      <section className="w-full flex flex-col items-center px-10 py-16">
        <div className='info-box'>
          <h2 className="text-2xl md:text-4xl font-bold mb-4 text-[#132A36]">
            What should I do?
          </h2>
          <p className="text-rg md:text-xl text-[#132A36] mb-3">
            - Come up with a project idea that combines two random things, ask in #wild in slack for suggestions      
          </p>
          <p className="text-lg md:text-xl text-[#132A36] mb-3">
            - Start making the project, view project guide here if you're new
          </p>
          <p className="text-lg md:text-xl text-[#132A36] mb-3">
            - Submit your project on or before 1st of december      
          </p>
          <p className="text-lg md:text-xl text-[#132A36]">
            - win cool prizes! :yay:      
          </p>
        </div>
      </section>
      <WavyDivider/>
      <section className="w-full flex flex-col items-center px-10 py-16">
        <div className="examples-box">
          <div className="relative w-32 h-32 md:w-48 md:h-48 shrink-0">
            <Image
              src="/wild-ysws-raw-images/project-1-1.jpg"
              alt="First project first thing"
              fill
              className="object-contain"
            />
          </div>   
            {/* image seperator icon */}
          <span className= "text-4xl md:text-6xl font-bold text-[#132A36]">+</span>

          <div className="relative w-32 h-32 md:w-48 md:h-48 shrink-0">
            <Image
              src="/wild-ysws-raw-images/project-1-2.png"
              alt="First project second thing"
              fill
              className="object-contain"
            />
          </div>

          <span className= "text-4xl md:text-6xl font-bold text-[#132A36]">=</span>

          <div className="relative w-32 h-32 md:w-48 md:h-48 shrink-0">
            <Image
              src="/wild-ysws-raw-images/project-1-3.jpg"
              alt="First project last thing"
              fill
              className="object-contain"
            />
          </div> 
        </div>  
      </section>
    </main>
  );
}