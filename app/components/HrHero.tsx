import Hero from "./HeroSection";
import Hrhero from "../assets/bussimg.svg";

export default function HrHero() {
  return (
    <div className="md:mt-6">
      <Hero
        title="Manage Your Team Smarter with OserHR
Everything your business needs in one place"
        description="Track attendance, payroll, recruitment, performance, and benefits seamlessly,
making HR simple and efficient."
        imageSrc={Hrhero}
        primaryButtonText="Activate Free Trial"
        secondaryButtonText="Contact Sales"
      />
      <div className="pt-10 md:pt-0 md:pb-10">
        <h1 className="text-xl md:text-3xl font-bold font-italic text-center">Everything You Need to Get Started</h1>
      </div>

    </div>
  );
}
