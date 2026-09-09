type ConnectionThreadProps = {
  className?: string;
};

export function ConnectionThread({ className = "" }: ConnectionThreadProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 520 240"
      fill="none"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d="M36 162C104 94 164 110 220 72C274 36 334 38 390 82C430 114 463 112 496 76"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.34"
      />
      <path
        d="M88 196C142 146 182 152 236 126C302 94 362 112 426 160"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.18"
      />
      <circle cx="36" cy="162" r="4.5" fill="currentColor" opacity="0.38" />
      <circle cx="220" cy="72" r="5.5" fill="currentColor" opacity="0.46" />
      <circle cx="390" cy="82" r="4.5" fill="currentColor" opacity="0.34" />
      <circle cx="496" cy="76" r="3.5" fill="currentColor" opacity="0.28" />
      <circle cx="88" cy="196" r="3" fill="currentColor" opacity="0.22" />
      <circle cx="236" cy="126" r="3.5" fill="currentColor" opacity="0.28" />
      <circle cx="426" cy="160" r="3" fill="currentColor" opacity="0.2" />
    </svg>
  );
}
