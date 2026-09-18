/** Soft, slow-drifting blobs behind a login/signup card — a plain color page otherwise. */
export function AuthBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-cream">
      <div className="animate-blob-a absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brass/25 blur-3xl" />
      <div className="animate-blob-b absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-sage/25 blur-3xl" />
      <div className="animate-blob-c absolute -bottom-24 left-1/4 h-96 w-96 rounded-full bg-navy/10 blur-3xl" />
    </div>
  );
}
