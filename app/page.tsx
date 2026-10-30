import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import CalculatorSection from "@/components/CalculatorSection";
import Gallery from "@/components/Gallery";
import Advantages from "@/components/Advantages";
import Steps from "@/components/Steps";
import Reviews from "@/components/Reviews";
import Faq from "@/components/Faq";
import Contacts from "@/components/Contacts";
import Footer from "@/components/Footer";
import MobileFab from "@/components/MobileFab";
import ScrollProgress from "@/components/ScrollProgress";
import MusicToggle from "@/components/MusicToggle";
import LeadProvider from "@/components/LeadProvider";

export default function Home() {
  return (
    <LeadProvider>
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <Services />
        <CalculatorSection />
        <Gallery />
        <Advantages />
        <Steps />
        <Reviews />
        <Faq />
        <Contacts />
      </main>
      <Footer />
      <MobileFab />
      <MusicToggle />
    </LeadProvider>
  );
}
