/** Original stepped lattice: a contemporary geometric signature, not a copied cultural motif. */
export function CommunitySignature({ className }: { className?: string }) {
  return <svg className={className} data-community-signature viewBox="0 0 240 56" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" strokeLinejoin="miter">
      {[8, 64, 120, 176].map(x => <path key={x} d={`M${x} 28h8V20h8v-8h8v8h8v8h8v8h-8v8h-8v-8h-8v-8Z`} />)}
      <path d="M0 28h8m40 0h16m40 0h16m40 0h16m40 0h24" />
    </g>
    <path d="M88 20h8v8h8v8h-8v8h-8v-8h-8v-8h8Z" fill="#624291" fillOpacity=".12" />
  </svg>;
}
