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
        src="/brand/logo-lockup-navy.png"
        alt="Truly Susi's — Sweeter together"
        width={480}
        height={270}
        priority
        className="w-full max-w-sm rounded-2xl"
      />

      <div className="max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-navy/50">
          Phase 1 &middot; infra check
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-navy sm:text-5xl">
          Brand tokens are live.
        </h1>
        <p className="mt-4 font-body text-base text-navy/70">
          Cormorant Garamond for display, Inter for body, and the five
          locked brand colors below — all wired through Tailwind. Real Home
          page content lands in Phase 2.
        </p>
      </div>

      <ul className="flex flex-wrap justify-center gap-4">
        {swatches.map((s) => (
          <li key={s.name} className="flex flex-col items-center gap-2">
            <span
              className={`block h-16 w-16 rounded-full border border-navy/10 ${s.token}`}
            />
            <span className="font-mono text-[11px] text-navy/60">
              {s.name}
            </span>
            <span className="font-mono text-[10px] text-navy/40">
              {s.hex}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
