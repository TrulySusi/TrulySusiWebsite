import Image from "next/image";

const swatches = [
  { name: "Navy", token: "bg-navy", hex: "#041C35" },
  { name: "Lilac", token: "bg-lilac", hex: "#EACAE8" },
  { name: "Coral", token: "bg-coral", hex: "#E2372B" },
  { name: "Cream", token: "bg-cream", hex: "#FDECE2" },
  { name: "Sage", token: "bg-sage", hex: "#8AB284" },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-16 px-6 py-20">
      <Image
        src="/brand/logo-lockup-light.png"
        alt="Truly Susi's — Sweeter together"
        width={480}
        height={270}
        priority
        className="w-full max-w-sm rounded-2xl"
      />

      <div className="max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-cream/50">
          Phase 2 &middot; shop is live
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-cream sm:text-5xl">
          The real Home page isn&rsquo;t built yet.
        </h1>
        <p className="mt-4 font-body text-base text-cream/70">
          But <a href="/shop" className="text-coral underline underline-offset-4">the shop</a> is
          reading real data. Cormorant Garamond for display, Inter for
          body, and the five brand colors below — all wired through
          Tailwind.
        </p>
      </div>

      <ul className="flex flex-wrap justify-center gap-4">
        {swatches.map((s) => (
          <li key={s.name} className="flex flex-col items-center gap-2">
            <span
              className={`block h-16 w-16 rounded-full border border-cream/20 ${s.token}`}
            />
            <span className="font-mono text-[11px] text-cream/60">
              {s.name}
            </span>
            <span className="font-mono text-[10px] text-cream/40">
              {s.hex}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
