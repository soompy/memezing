import Header from '@/components/ui/Header';
import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import Demo from '@/components/sections/Demo';
import CTA from '@/components/sections/CTA';
import Footer from '@/components/ui/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <Demo />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}