const STEPS = [
  { key: "placed", label: "Order placed" },
  { key: "preparing", label: "Preparing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function stepIndexForStatus(status: string) {
  if (status === "pending_payment" || status === "paid") return 0;
  if (status === "packed") return 1;
  if (status === "shipped") return 2;
  if (status === "delivered") return 3;
  return -1; // cancelled / refunded — no stepper
}

export function OrderStatusStepper({ status }: { status: string }) {
  const activeIndex = stepIndexForStatus(status);

  if (activeIndex === -1) {
    const isCancelled = status === "cancelled";
    return (
      <div
        className={`rounded-xl px-5 py-4 text-center font-body text-sm font-semibold ${
          isCancelled ? "bg-brass/10 text-brass" : "bg-navy/6 text-navy/70"
        }`}
      >
        {isCancelled ? "This order was cancelled." : "This order was refunded."}
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full font-body text-xs font-bold ${
                i <= activeIndex ? "bg-navy text-cream" : "bg-navy/10 text-navy/40"
              }`}
            >
              {i < activeIndex ? "✓" : i + 1}
            </div>
            <span
              className={`whitespace-nowrap font-body text-xs font-medium ${
                i <= activeIndex ? "text-navy" : "text-navy/40"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`mx-1 h-0.5 flex-1 ${i < activeIndex ? "bg-navy" : "bg-navy/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
