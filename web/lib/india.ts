// India's states + union territories, current as of the 2019/2020
// reorganisation (J&K/Ladakh split, DNH+DD merger). Used for the delivery
// address state dropdown.
export const INDIA_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

// Free, no-key India Post lookup — given a 6-digit pincode, returns the
// district (used as city) and state so the form can auto-fill both.
// Returns null on any failure; callers should leave the fields editable
// either way rather than blocking on this.
export async function lookupPincode(
  pincode: string,
): Promise<{ city: string; state: string } | null> {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await res.json();
    const first = data?.[0];
    if (first?.Status !== "Success" || !first.PostOffice?.length) return null;

    const po = first.PostOffice[0];
    const matchedState = INDIA_STATES.find(
      (s) => s.toLowerCase() === String(po.State).toLowerCase(),
    );
    if (!po.District || !matchedState) return null;

    return { city: po.District, state: matchedState };
  } catch {
    return null;
  }
}
