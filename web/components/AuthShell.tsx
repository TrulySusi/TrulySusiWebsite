import Image from "next/image";
import Link from "next/link";

/**
 * Full-bleed split layout for login/signup — deliberately outside the
 * normal site chrome (see app/(auth)/layout.tsx) so it isn't competing
 * with the header/footer/floating widgets for attention. The left panel
 * is hidden below lg; the form stays the whole story on mobile.
 */
export function AuthShell({
  image,
  headline,
  tagline,
  children,
}: {
  image: string;
  headline: string;
  tagline: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen">
      <div className="relative hidden w-[44%] shrink-0 overflow-hidden lg:block">
        <Image src={image} alt="" fill priority sizes="44vw" className="animate-bg-breathe object-cover object-center" />
        <div className="absolute inset-0 bg-navy/78" />
        <div className="animate-blob-a absolute -left-24 top-16 h-72 w-72 rounded-full bg-brass/25 blur-3xl" />
        <div className="animate-blob-b absolute -right-16 bottom-24 h-64 w-64 rounded-full bg-sage/20 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
          <Link href="/" className="relative block h-9 w-40">
            <Image src="/brand/wordmark-cream.png" alt="Truly Susi's" fill sizes="160px" className="object-contain object-left" />
          </Link>

          <div className="animate-auth-card-in max-w-md">
            <p className="font-display text-4xl italic leading-tight text-white xl:text-5xl">{headline}</p>
            <p className="mt-5 font-body text-[15px] leading-relaxed text-cream/70">{tagline}</p>
          </div>

          <p className="font-body text-xs text-cream/40">Homemade in Salem, Tamil Nadu.</p>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-cream px-6 py-16 sm:px-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 lg:hidden">
          <div className="animate-blob-a absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brass/20 blur-3xl" />
          <div className="animate-blob-b absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-sage/20 blur-3xl" />
        </div>
        <div className="w-full max-w-lg">{children}</div>
      </div>
    </div>
  );
}
