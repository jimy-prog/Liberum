import { useReveal } from "./hooks/useReveal";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Hero from "./sections/Hero";
import TrustStrip from "./sections/TrustStrip";
import Problem from "./sections/Problem";
import Ecosystem from "./sections/Ecosystem";
import Studio from "./sections/Studio";
import Business from "./sections/Business";
import Mock from "./sections/Mock";
import AISection from "./sections/AISection";
import Students from "./sections/Students";
import Future from "./sections/Future";
import Market from "./sections/Market";
import Why from "./sections/Why";
import HowItWorks from "./sections/HowItWorks";
import Paths from "./sections/Paths";
import Founder from "./sections/Founder";
import FinalCTA from "./sections/FinalCTA";

export default function App() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <TrustStrip />
        <Problem />
        <Ecosystem />
        <Studio />
        <Business />
        <Mock />
        <AISection />
        <Students />
        <Future />
        <Market />
        <Why />
        <HowItWorks />
        <Paths />
        <Founder />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
