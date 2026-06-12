// Infinite sliding strip of brands. Sits flush above the footer on every page
// (rendered in the root layout) and is styled dark so it reads as the top band
// of the footer.
const BRANDS = [
  'Nike', 'Adidas', 'Zara', 'Puma', 'The North Face',
  "Levi's", 'Carhartt', 'Ralph Lauren', 'Tommy Hilfiger', 'Vans',
  'Dior', 'Chanel', 'Gucci', 'Prada', 'H&M', 'Mango', 'Hugo Boss',
  'MAC Cosmetics', 'Sephora', "L'Oréal", 'Fenty Beauty'
];

export default function BrandsMarquee() {
  return (
    <div className="relative bg-brand-black py-5 overflow-hidden flex">
      {/* Gold hairline ties it into the footer below */}
      <div className="absolute inset-x-0 top-0 h-px bg-gold-line opacity-40 pointer-events-none" />
      {/* Edge fades into the dark background */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-brand-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-brand-black to-transparent z-10 pointer-events-none" />

      <div className="flex whitespace-nowrap animate-marquee gap-12 sm:gap-16 items-center pr-12 sm:pr-16 text-white/20 font-bold tracking-widest text-xl sm:text-2xl uppercase">
        {/* Doubled for a seamless infinite loop */}
        {[...BRANDS, ...BRANDS].map((brand, i) => (
          <span key={i} className="inline-block hover:text-brand-gold-soft transition-colors duration-300">
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
}
