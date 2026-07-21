import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function PageContainer({ children }) {
  const { pathname } = useLocation();

  // Smooth scroll to top on route change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mt-16">{children}</main>
      <Footer />
    </div>
  );
}
