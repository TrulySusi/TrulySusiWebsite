// Razorpay's merchant terms (Part I, clause 6.2) require a named person for
// customer complaints, reachable by phone and email, with a reply within 5
// business days. Name and number are the LLP's Razorpay signatory details.
export function GrievanceOfficer() {
  return (
    <section>
      <h2 className="font-display text-2xl text-navy">Complaints &amp; Grievance Officer</h2>
      <p className="mt-3">
        If you have a complaint about an order, a payment, or a refund, please contact our
        Grievance Officer. We will respond within 5 business days of receiving your complaint.
      </p>
      <ul className="mt-3 space-y-1.5">
        <li>
          <span className="text-navy">Name:</span> Jayakumar Susaritha
        </li>
        <li>
          <span className="text-navy">Company:</span> Aahara Heritage LLP
        </li>
        <li>
          <span className="text-navy">Phone:</span>{" "}
          <a href="tel:+916382033215" className="text-brass hover:text-navy">
            +91 63820 33215
          </a>
        </li>
        <li>
          <span className="text-navy">Email:</span>{" "}
          <a href="mailto:feedback@trulysusi.in" className="text-brass hover:text-navy">
            feedback@trulysusi.in
          </a>
        </li>
      </ul>
    </section>
  );
}
