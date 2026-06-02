import Navbar from "@/components/navigation/Navbar";
import Hero from "@/sections/hero/Hero";

import About from "@/sections/about/About";
import Skills from "@/sections/skills/Skills";

import Projects from "@/sections/projects/Projects";

import Experience from "@/sections/experience/Experience";
import Contact from "@/sections/contact/Contact";
import Footer from "@/sections/footer/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Experience />
      <Contact />
      <Footer />
    </main>
  );
}

