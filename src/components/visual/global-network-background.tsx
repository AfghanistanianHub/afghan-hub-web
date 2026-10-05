export function GlobalNetworkBackground() {
  return (
    <div className="global-network-background" aria-hidden="true">
      <svg
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        role="presentation"
      >
        <g className="global-network-lines">
          <path d="M110 170L310 245L510 150L720 260L925 180L1160 285L1430 190" />
          <path d="M180 520L390 430L610 560L830 450L1040 600L1280 500L1500 610" />
          <path d="M120 820L360 700L570 815L790 705L1010 830L1240 720L1460 810" />
          <path d="M310 245L390 430L360 700" />
          <path d="M510 150L610 560L570 815" />
          <path d="M720 260L830 450L790 705" />
          <path d="M925 180L1040 600L1010 830" />
          <path d="M1160 285L1280 500L1240 720" />
        </g>

        <g className="global-network-nodes">
          {[
            [110,170],[310,245],[510,150],[720,260],[925,180],[1160,285],[1430,190],
            [180,520],[390,430],[610,560],[830,450],[1040,600],[1280,500],[1500,610],
            [120,820],[360,700],[570,815],[790,705],[1010,830],[1240,720],[1460,810],
          ].map(([cx, cy], index) => (
            <circle key={index} cx={cx} cy={cy} r={index % 5 === 0 ? 5.5 : 3.5} />
          ))}
        </g>

        <g className="global-network-labels">
          <text x="420" y="320">Community</text>
          <text x="960" y="350">Opportunities</text>
          <text x="240" y="655">Organizations</text>
          <text x="860" y="705">Events</text>
          <text x="1270" y="655">Businesses</text>
        </g>
      </svg>
    </div>
  );
}
