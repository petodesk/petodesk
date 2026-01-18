import Hero from "./HeroSection";
import bussinesshero from "../assets/buss.png";

export default function BusinessHero() {
  return (
    <div>
      <Hero
        title="Run your business efficiently from one
smart platform."
        description="Track sales, manage inventory, oversee tasks, generate invoices, and get actionable
reports, all in one place."
        imageSrc={bussinesshero}
        primaryButtonText="Activate Free Trial"
        secondaryButtonText="Contact Sales"
      />
      <div className="pt-10 md:pt-0 md:pb-10">
        <h1 className="text-xl md:text-3xl font-bold font-italic text-center">Everything You Need to Get Started</h1>
      </div>

    </div>
  );
}
