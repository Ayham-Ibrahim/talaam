import { PageContainer } from '@/components/layout/PageContainer';
import { Seo } from '@/components/seo/Seo';
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
      <Seo
        title="TAALAM | مدرس خصوصي في الإمارات — عربي، رياضيات، إنجليزي، فيزياء وIGCSE"
        description="منصة TAALAM تربطك بأفضل المعلمين المعتمدين لدروس خصوصية في اللغة العربية والرياضيات واللغة الإنجليزية والفيزياء ومناهج IGCSE (رياضيات، فيزياء، كيمياء، أحياء) في دبي وأبوظبي والشارقة وعجمان والعين ورأس الخيمة والفجيرة."
        path="/"
      />
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
