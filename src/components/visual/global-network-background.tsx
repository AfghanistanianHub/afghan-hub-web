const networkPaths = [
  "M110 170L310 245L510 150L720 260L925 180L1160 285L1430 190",
  "M180 520L390 430L610 560L830 450L1040 600L1280 500L1500 610",
  "M120 820L360 700L570 815L790 705L1010 830L1240 720L1460 810",
  "M310 245L390 430L360 700",
  "M510 150L610 560L570 815",
  "M720 260L830 450L790 705",
  "M925 180L1040 600L1010 830",
  "M1160 285L1280 500L1240 720",
];

const nodes = [
  [110,170],[310,245],[510,150],[720,260],[925,180],[1160,285],[1430,190],
  [180,520],[390,430],[610,560],[830,450],[1040,600],[1280,500],[1500,610],
  [120,820],[360,700],[570,815],[790,705],[1010,830],[1240,720],[1460,810],
];

export function GlobalNetworkBackground() {
  return (
    <div className="global-network-background" aria-hidden="true">
      <svg
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        role="presentation"
      >
        <g className="global-network-lines">
          {networkPaths.map((d, index) => <path key={`line-${index}`} d={d} />)}
        </g>

        <g className="global-network-signal">
          {networkPaths.slice(0, 3).map((d, index) => (
            <path key={`signal-${index}`} d={d} pathLength="1" />
          ))}
        </g>

        <g className="global-network-nodes">
          {nodes.map(([cx, cy], index) => (
            <circle key={index} cx={cx} cy={cy} r={index % 5 === 0 ? 5.5 : 3.5} />
          ))}
        </g>
      </svg>
    </div>
  );
}
