"use client";

import { useState } from "react";
import Image from "next/image";
import WavyDivider from "@/components/WavyDivider";

const examplePages = [
 [
  { src: "/wild-ysws-raw-images/project-1-1.jpg", alt: "project 1-1", caption: "a dustbin"},
  { src: "/wild-ysws-raw-images/project-1-2.png", alt: "project 1-2", caption: "a chat bot"},
  { src: "/wild-ysws-raw-images/project-1-3.jpg", alt: "project 1-3", caption: "talking dustbin"},
 ],
 [
  { src: "/wild-ysws-raw-images/project-2-1.jpg", alt: "project 2-1", caption: "king kong"},
  { src: "/wild-ysws-raw-images/project-2-2.png", alt: "project 2-2", caption: "chrome dino game"},
  { src: "/wild-ysws-raw-images/project-2-3.png", alt: "project 2-3", caption: "king kong jump"},
 ],
 [
  { src: "/wild-ysws-raw-images/project-3-1.jpg", alt: "project 3-1", caption: "umbrella"},
  { src: "/wild-ysws-raw-images/project-3-2.jpg", alt: "project 3-2", caption: "drone"},
  { src: "/wild-ysws-raw-images/project-3-3.jpg", alt: "project 3-3", caption: "a flying umbrella"},
 ],
 [
  { src: "/wild-ysws-raw-images/project-4-1.jpg", alt: "project 4-1", caption: "sun glasses"},
  { src: "/wild-ysws-raw-images/project-4-2.jpg", alt: "project 4-2", caption: "windshield wipers"},
  { src: "/wild-ysws-raw-images/project-4-3.jpg", alt: "project 4-3", caption: "wiper glasses"},
 ],
];
export default function HomePage() 
{
  const [currentPage, setCurrentPage]= useState(0);
  return (
    <main className="min-h-screen bg-[#a3b18a] flex flex-col items-center justify-start pt-0 text-center">
      <div className="w-full flex flex-col items-center px-10">
        <div className="relative w-156 h-156 md:w-[920px] md:h-[520px] mb-2">
          <Image
            src="/logo_main_image-remove.png"
            alt="Logo"
            fill
            // className="object-contain"
            priority
          />
        </div>

        <h1 className="text-2xl md:text-4xl italic text-[#132A36] mb-4">
          make projects that combine two random things, get intersting combo prizes
        </h1>

        <form action="/api/auth/login" method="GET" className="flex flex-col sm:flex-row gap-1 w-full max-w-sm mb-10 mx-auto justify-center">
          <input
            type="email"
            name="email"
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
        <div className="examples-top">
          <h2 className="examples-title">Example projects</h2>
        <div className="examples-box">
          {examplePages[currentPage].map((item, i) => (
            <div key={i} className="flex items-center gap-4 md:gap-6">
              {i > 0 && (
                <span className="text-4xl md:text-6xl font-bold text-[#132A36]">
                  {i === examplePages[currentPage].length - 1 ? "=" : "+"}
                </span>
              )}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-32 h-32 md:w-48 md:h-48 shrink-0">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="image-names">{item.caption}</p>
              </div>
            </div>
          ))}
        

        <div className="page-buttons">
          {examplePages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`page-button ${i === currentPage ? "page-button-active" : ""}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        </div>
        </div>  
      </section>
      <WavyDivider/>
    </main>
  );
}