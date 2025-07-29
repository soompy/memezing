import { Header, Footer } from '@/components/ui';
import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import Demo from '@/components/sections/Demo';
import CTA from '@/components/sections/CTA';

export default function HomePage() {
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