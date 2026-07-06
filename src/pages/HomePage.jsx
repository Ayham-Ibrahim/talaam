import { PageContainer } from '@/components/layout/PageContainer';
import { Hero } from '@/components/home/Hero';
import {
  EducationTypes,
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
      <EducationTypes />
      <FeaturedTeachers />
      <StatsBand />
      <HowItWorks />
      <Testimonials />
      <CTASection />
    </PageContainer>
  );
}
