import Hero from "./HeroSection";
import phone1 from "../assets/on phone 1 (1).png";
import { FaCheckCircle } from "react-icons/fa";

export default function LandingPageHero() {
  return (
    <div>
      <Hero
        title="Manage Your Business and Team Smarter 
All in One Platform"
        description="Track your sales effortlessly, manage inventory in real time, oversee your staff and their tasks,
run payroll with ease, handle HR operations seamlessly, and make smarter business decisions,
all from one secure, responsive platform. Collaborate with your team, monitor performance,
and stay on top of deadlines without switching between multiple tools. Gain actionable insights
from comprehensive reports and analytics, helping your business grow efficiently. "
        imageSrc={phone1}
        primaryButtonText="Activate Free Trial"
        secondaryButtonText="Contact Sales"
      />

      {/* Bottom features */}
      <div className="px-6 font-poppins">
        <ul className="flex flex-col sm:flex-row gap-4 mt-10 sm:gap-10 list-none mb-4 items-center sm:items-start justify-center sm:justify-start">

          <li className="flex items-center gap-2">
            <FaCheckCircle className="text-green-500 text-xl" />
            Free for 30 days
          </li>

          <li className="flex items-center gap-2">
            <FaCheckCircle className="text-green-500 text-xl" />
            No Credit Card Required
          </li>

          <li className="flex items-center gap-2">
            <FaCheckCircle className="text-green-500 text-xl" />
            Request a Demo
          </li>

        </ul>
      </div>
    </div>
  );
}
