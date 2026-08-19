export function PolicyStub({
  title,
  note,
}: {
  title: string;
  note: string;
}) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24 sm:px-10">
      <h1 className="font-display text-4xl text-navy">{title}</h1>
      <p className="mt-5 font-body text-[15px] leading-relaxed text-navy/70">
        {note}
      </p>
      <p className="mt-5 font-body text-[15px] leading-relaxed text-navy/70">
        Questions in the meantime -  write to{" "}
        <a href="mailto:feedback@trulysusi.in" className="text-brass hover:text-navy">
          feedback@trulysusi.in
        </a>
        .
      </p>
    </main>
  );
}
