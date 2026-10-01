function PeopleNodes() {
 const nodes = [[43, 158], [99, 115], [151, 142], [208, 80], [256, 115], [80, 58], [155, 43], [49, 90], [157, 190]];
 return nodes.map(([x, y], index) => (
   <g key={index} transform={`translate(${x} ${y})`} data-person-node={index === 2 ? "main" : "surrounding"}>
     <rect x={index === 2 ? -16 : -13} y="-16" width={index === 2 ? 32 : 26} height="32" rx="5" fill={index === 2 ? "#624291" : "#f8f5ee"} />
     <g stroke={index === 2 ? "#fff" : "#938b81"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
       <circle cy="-6" r="4" stroke={index === 5 ? "#be6443" : undefined} />
       <path d="M-8 10V7a8 8 0 0 1 16 0v3Z" />
     </g>
     {index === 6 ? <path d="M-3 10h6" stroke="#b68c28" strokeWidth="1.5" /> : null}
   </g>
 ));
}

export function PeopleIllustration() { return (<svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
 <g stroke="#9e978e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  <path d="M43 158 99 115 151 142 208 80 256 115" />
  <path d="M99 115 80 58 155 43 208 80 M151 142 157 190 M43 158 49 90 80 58 M151 142 256 115" />
 </g>
 <g stroke="#624291" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
  <path data-motion="connection" data-step="0" pathLength="1" d="M151 142 99 115 43 158 M151 142 157 190" />
  <path data-motion="connection" data-step="1" pathLength="1" d="M99 115 80 58 49 90 43 158 M80 58 155 43" />
  <path data-motion="connection" data-step="2" pathLength="1" d="M151 142 208 80 256 115 M208 80 155 43 M151 142 256 115" />
 </g>
 <PeopleNodes />
 <path d="M218 165h22m-11-11v22" stroke="#624291" strokeWidth="1.4" />
</svg>); }

export function OrganizationsIllustration() { return (
<svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
 <path d="M46 148 130 195 260 122 176 75Z" stroke="#9e978e" strokeWidth="1.17" strokeLinejoin="round" />
 <g data-motion="module-left" stroke="#9e978e" strokeWidth="1.52" strokeLinecap="round" strokeLinejoin="round">
  <path d="M68 104 111 80 154 104 111 128Z M68 104v44l43 25 43-25v-44 M111 128v45" />
  <path d="M82 112v20m15-11v19" />
 </g>
 <g data-motion="module-top" stroke="#9e978e" strokeWidth="1.52" strokeLinecap="round" strokeLinejoin="round">
  <path d="M132 58 175 34 218 58 175 83Z M132 58v58l43 25 43-25V58 M175 83v58" />
  <path d="M132 58 175 83 218 58 175 34Z" stroke="#624291" strokeWidth="1.75" fill="#ede5f4" />
  <path d="M186 87v29m15-38v29" />
 </g>
 <g data-motion="module-right" stroke="#9e978e" strokeWidth="1.52" strokeLinejoin="round">
  <path d="M176 129 212 109 248 129 212 150Z M176 129v32l36 20 36-20v-32 M212 150v31" />
  <rect x="201" y="142" width="8" height="8" fill="#dc754e" stroke="#dc754e" />
 </g>
</svg>); }

export function EventsIllustration() { return (
<svg viewBox="0 0 300 210" fill="none" aria-hidden="true"><path d="M35 169 153 200 271 169 M53 149 153 175 253 149 M73 128 153 149 233 128 M95 107 153 122 211 107" stroke="#9e978e" strokeWidth="1.40" fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d="M34 50Q153 210 272 50 M53 43Q153 174 253 43 M77 39Q153 140 230 39" stroke="#9e978e" strokeWidth="1.52" fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d="M153 17v57 M25 107l55 8 M280 107l-53 8 M75 198l33-38 M232 198l-33-38" stroke="#9e978e" strokeWidth="1.29" fill="none" strokeLinecap="round" strokeLinejoin="round" /><g stroke="#624291" strokeWidth="2.4" strokeLinecap="round">
 <path data-motion="gathering" pathLength="1" d="M77 39Q115 89.5 153.5 89.5" />
 <path data-motion="gathering" data-step="1" pathLength="1" d="M230 39Q191.5 89.5 153.5 89.5" />
 <path data-motion="gathering" data-step="2" pathLength="1" d="M153 17V81" />
 </g>
 <circle data-motion="focal" cx="153" cy="90" r="17" stroke="#624291" strokeWidth="1.5" />
 <circle cx="153" cy="90" r="9" fill="#624291" stroke="#624291"/><circle cx="74" cy="72" r="4" fill="#dc754e" stroke="#dc754e"/><circle cx="230" cy="73" r="4" fill="#d8ac40" stroke="#d8ac40"/><path d="M141 90h24" stroke="#f8f5ee" strokeWidth="1.64" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
); }

export function OpportunitiesIllustration() { return (
<svg viewBox="0 0 300 210" fill="none" aria-hidden="true"><path d="M54 194v-46q0-22 22-22h52q22 0 22-22V47 M99 194v-28q0-20 20-20h68q24 0 24-24V65 M150 105h57q27 0 27-27V38 M150 105h-42q-24 0-24-24V34" stroke="#9e978e" strokeWidth="1.52" fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d="M150 194v-39q0-24 24-24h28q32 0 32-32V38" stroke="#624291" strokeWidth="2.00" fill="none" strokeLinecap="round" strokeLinejoin="round" /><path data-motion="branch" pathLength="1" d="M150 194v-39q0-24 24-24h28q32 0 32-32V38" stroke="#624291" strokeWidth="3.8" strokeLinecap="round" />
<rect x="69" y="16" width="30" height="28" rx="0" fill="#f8f5ee" stroke="#d9d2c6"/><rect x="135" y="20" width="30" height="28" rx="0" fill="#ede5f4" stroke="#624291"/><rect data-motion="opening" x="220" y="11" width="28" height="28" rx="0" fill="#f8f5ee" stroke="#d9d2c6"/><path data-motion="doorway" d="M227 33V18h14v15" stroke="#624291" strokeWidth="1.8" /><rect x="196" y="45" width="30" height="29" rx="0" fill="#f8f5ee" stroke="#d9d2c6"/><path d="M140 35h20m-5-5 5 5-5 5" stroke="#624291" strokeWidth="1.52" fill="none" strokeLinecap="round" strokeLinejoin="round" /><circle cx="54" cy="194" r="4" fill="#dc754e" stroke="#dc754e"/><rect x="78" y="27" width="12" height="7" rx="0" fill="#d8ac40" stroke="#d8ac40"/></svg>
); }

export function CommunityIllustration() { return (
<svg viewBox="0 0 600 430" fill="none" aria-hidden="true">
 <g strokeLinecap="round" strokeLinejoin="round">
  <path d="M32 278 279 417 568 251 321 111Z" stroke="#d9d2c6" strokeWidth="1.17" />
  <path d="M83 249l247 139 M81 305l289-166 M181 193l247 139 M179 361l289-166 M279 137l247 139 M277 417l289-166" stroke="#d9d2c6" strokeWidth=".82" />
  <g data-hero-layer="architecture">
   <g data-hero-reveal stroke="#9e978e">
    <path d="M108 192 193 143 278 192 193 241Z M108 192v74l85 49 85-49v-74 M193 241v74" strokeWidth="1.52" />
    <path d="M140 136 193 105 246 136 193 167Z M140 136v57l53 30 53-30v-57 M193 167v56" strokeWidth="1.52" />
    <path d="M140 136 193 105 246 136 193 167Z" strokeWidth="1.17" fill="#eee7dc" />
    <path d="M152 202v28m16-18v28 M211 257v28" strokeWidth="1.17" />
   </g>
  </g>
  <g data-hero-layer="gathering">
   <path data-hero-accent d="M271 313v-86q0-42 36-63l24-14q37-21 37 23v84 M284 320v-88q0-30 25-45l21-12q25-14 25 17v58 M271 313l13 7 M368 257l-13-7" stroke="#624291" strokeWidth="1.87" />
   <path data-hero-draw pathLength="1" d="M305 329 394 380 505 317 M325 304 394 344 485 291 M347 281 394 308 464 267 M368 258 394 273 445 244" stroke="#9e978e" strokeWidth="1.52" />
   <path data-hero-draw pathLength="1" d="M394 273v-72 M424 282l31-84 M359 287l-34-58" stroke="#9e978e" strokeWidth="1.17" />
   <path d="M425 277 441 268 457 277 441 286Z" stroke="#c46640" strokeWidth="1.75" fill="#dd7851" />
  </g>
  <g data-hero-layer="network">
   <path data-hero-draw pathLength="1" d="M75 312 133 342 198 304 254 336 M133 342 141 392 M198 304 174 267" stroke="#9e978e" strokeWidth="1.4" />
   <path data-hero-pulse="network" pathLength="1" d="M75 312 133 342 198 304 254 336" stroke="#624291" strokeWidth="3.5" />
   <path data-hero-focus pathLength="1" d="M75 312 133 342 198 304 254 336 M133 342 141 392 M198 304 174 267" stroke="#624291" strokeWidth="2.6" />
   <circle cx="75" cy="312" r="9" fill="#f8f5ee" stroke="#9e978e" />
   <circle data-hero-accent cx="133" cy="342" r="11" fill="#624291" stroke="#624291" />
   <circle cx="198" cy="304" r="9" fill="#f8f5ee" stroke="#9e978e" />
   <circle cx="254" cy="336" r="7" fill="#f8f5ee" stroke="#9e978e" />
   <circle data-hero-node="network" cx="254" cy="336" r="11" stroke="#624291" strokeWidth="2" fill="#ede5f4" />
   <circle cx="141" cy="392" r="6" fill="#f8f5ee" stroke="#9e978e" />
   <circle cx="174" cy="267" r="6" fill="#f8f5ee" stroke="#9e978e" />
   <circle cx="174" cy="267" r="3" fill="#d8ac40" stroke="#d8ac40" />
  </g>
  <g data-hero-layer="openings">
   <path data-hero-draw pathLength="1" d="M379 169v-22q0-16 16-25l71-41q19-11 19-28V22 M417 192v-24q0-15 16-24l66-38q17-10 17-26V42 M466 81l-37-21q-13-7-13-21V18" stroke="#9e978e" strokeWidth="1.52" />
   <path data-hero-pulse="opening" pathLength="1" d="M379 169v-22q0-16 16-25l71-41q19-11 19-28V22" stroke="#624291" strokeWidth="3.5" />
   <path data-hero-focus d="M379 169v-22q0-16 16-25l71-41q19-11 19-28V22" stroke="#624291" strokeWidth="2.6" />
   <rect x="469" y="8" width="31" height="31" fill="#f8f5ee" stroke="#9e978e" />
   <rect data-hero-accent x="500" y="26" width="31" height="31" fill="#ede5f4" stroke="#624291" />
   <rect x="401" y="3" width="30" height="30" fill="#f8f5ee" stroke="#9e978e" />
   <rect data-hero-node="opening" x="469" y="8" width="31" height="31" fill="#ede5f4" stroke="#624291" strokeWidth="2" />
  </g>
  <path data-hero-accent d="M516 346h23m-11-11v22" stroke="#624291" strokeWidth="1.29" />
 </g>
</svg>); }
