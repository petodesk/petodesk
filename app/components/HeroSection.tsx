import Image, { StaticImageData } from "next/image";

type HeroProps = {
  title: string;
  description: string;
  imageSrc: StaticImageData | string;
  primaryButtonText: string;
  secondaryButtonText?: string;
};

export default function Hero({
  title,
  description,
  imageSrc,
  primaryButtonText,
  secondaryButtonText,
}: HeroProps) {
  return (
    <section className="flex flex-col-reverse md:flex-row items-center justify-between gap-10 px-6 pt-12 font-poppins">

      {/* Left content */}
      <div className="flex-1 max-w-2xl text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {title}
        </h1>

        <p className="text-gray-600 mb-6">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <button className="btn-primary px-6 py-2 rounded-md">
            {primaryButtonText}
          </button>

          {secondaryButtonText && (
            <button className="btn-secondary px-6 py-2 rounded-md">
              {secondaryButtonText}
            </button>
          )}
        </div>
      </div>

      {/* Right image */}
      <div className="relative w-[340px] h-[320px] sm:w-[280px] sm:h-[380px] md:w-[320px] md:h-[420px]">
        <Image
          src={imageSrc}
          alt="Hero Image"
          fill
          className="object-contain"
          priority
        />
      </div>
    </section>
  );
}
