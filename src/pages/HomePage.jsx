import { PageContainer } from '@/components/layout/PageContainer';
import { Hero } from '@/components/home/Hero';
import { EcosystemSection } from '@/motion/ambient/AmbientEnvironment';
import {
  EducationTypes,
  FeaturedTeachers,
  StatsBand,
  WhyChooseUs,
  HowItWorks,
  Testimonials,
  CTASection,
} from '@/components/home/sections';

export function HomePage() {
  return (
    <PageContainer>
      <EcosystemSection id="hero">
        <Hero />
        <EducationTypes />
      </EcosystemSection>
      
      <EcosystemSection id="teachers">
        <FeaturedTeachers />
        <StatsBand />
      </EcosystemSection>
      
      <EcosystemSection id="content">
        <WhyChooseUs />
        <HowItWorks />
        <Testimonials />
        <CTASection />
      </EcosystemSection>
    </PageContainer>
  );
}
