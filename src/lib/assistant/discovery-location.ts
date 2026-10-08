// Aliases are explicit language/geography equivalents, not inferred residence.
export function canonicalDiscoveryLocation(value: string) {
  const cleaned = value.trim();
  if (/^(?:bc|b\.c\.|british columbia|بریتیش کلمبیا|بریټش کولمبیا)$/iu.test(cleaned)) return "British Columbia";
  if (/^ونکوور$/u.test(cleaned)) return "Vancouver";
  return cleaned;
}
export function discoveryLocationTerms(value: string) {
  const canonical = canonicalDiscoveryLocation(value);
  return canonical === "British Columbia" ? ["British Columbia", "BC", "B.C."] : canonical ? [canonical] : [];
}
