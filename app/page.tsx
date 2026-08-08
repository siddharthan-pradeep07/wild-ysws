"use client";

import { useState } from "react";
import Image from "next/image";
import WavyDivider from "@/components/WavyDivider";

const faq = [
  {
    question: "What's Hack Club?",
    answer: "Hack Club is a 501(c)(3) nonprofit (EIN: 81-2908499) that helps high school students learn to code and build projects. We’re the largest teen-led coding community, with over 60,000 students building projects with their friends in Hack Club each year."
  },
  {
    question: "Who can participate?",
    answer: "Anyone from the ages of 13-18 are eligible"
  },
  {
    question: "What counts as a valid submission?",
    answer: "A working project that combines two unrelated things. The weirder the combo, the better it is!"
  },
  {
    question: "Event timeline",
    answer: "Wild starts on xx/xx and ends on xxxx"
  },
  {
    question: "What prizes do I get?",
    answer: "You'll get prizes in combos based on your time spent on projects!"
  },
]

const steps = [
  "Come up with a project idea that combines two random things — ask in #wild in Slack for suggestions",
  "Start making the project, view the project guide here if you're new",
  "Submit your project on or before 1st of December",
  "Win cool prizes! :yay:",
];

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
  const [openFaq, setOpenFaq] = useState < number | null > (null);
  return (
    <main className="min-h-screen bg-[#a3b18a] flex flex-col items-center justify-start pt-0 text-center">

      <div className="landing-hero w-full flex flex-col items-center px-10 pt-10">
        <div className="landing-blob landing-blob-1" />
        <div className="landing-blob landing-blob-2" />

        <div className="landing-hero-content w-full flex flex-col items-center">
          <div className="relative w-156 h-156 md:w-[920px] md:h-[520px] mb-2">
            <Image
              src="/logo_main_image-remove.png"
              alt="Logo"
              fill
              priority
            />
          </div>
          <h1 className="text-2xl md:text-4xl italic text-[#132A36] mb-4">
            make projects that combine two random things, get intersting combo prizes
          </h1>

          <form
            action="/api/auth/login"
            method="GET"
            className="flex flex-col sm:flex-row gap-1 w-full max-w-sm mb-10 mx-auto justify-center"
          >
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
      </div>

      <WavyDivider/>
      <section className="w-full flex flex-col items-center px-10 py-16">
        <div className="landing-section text-left">
          <h2 className="text-2xl md:text-4xl font-bold mb-6 text-[#132A36]">
            What should I do?
          </h2>
          <ol className="landing-steps">
            {steps.map((step, i) => (
              <li key={i} className="landing-step">
                <span className="landing-step-number">{i + 1}</span>
                <span className="landing-step-text">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <WavyDivider/>
      <section className="w-full flex flex-col items-center px-10 py-16">
        <div className="landing-section">
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
      <section className="w-full flex flex-col items-center px-10 py-16">
        <div className="landing-section">
          <h2 className="examples-title">Frequently asked questions</h2>
          <div className="faq-box">
            {faq.map((faq, i) =>
            (
              <div key={i} className="faq-item">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="faq-question">
                    <span>{faq.question}</span>
                    <span className={`faq-icon ${openFaq === i ? "faq-icon-open" : ""}`}>+</span>
                  </button>
                  <div className={`faq-answer ${openFaq === i ? "faq-answer-open" : ""}`}>
                    <p className = "faq-answer-text">{faq.answer}</p>
                  </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <WavyDivider/>
    </main>
  );
}
