import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLenis } from '@/hooks/useLenis';

export function PageContainer({ children }) {
  const { pathname } = useLocation();
  const lenis = useLenis();

  // Smooth scroll to top on route change
  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [pathname, lenis]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mt-16">{children}</main>
      <Footer />
    </div>
  );
}
