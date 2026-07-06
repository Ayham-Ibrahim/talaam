import { PageContainer } from '@/components/layout/PageContainer';
import { Hero } from '@/components/home/Hero';
import {
  FeaturedTeachers,
  StatsBand,
  HowItWorks,
  Testimonials,
  CTASection,
} from '@/components/home/sections';

export function HomePage() {
  return (
    <PageContainer>
      <Hero />
      <FeaturedTeachers />
      <StatsBand />
      <HowItWorks />
      <Testimonials />
      <CTASection />
    </PageContainer>
  );
}
