import type { CSSProperties } from "react";

type Point = readonly [number, number, number?];

const clusters: Array<{
  key: string;
  className?: string;
  points: readonly Point[];
  edges: readonly [number, number][];
}> = [
  {
    key: "north-west",
    className: "global-network-cluster--teal",
    points: [[64,74,4],[25,198,5],[168,34,8],[194,222,11],[141,377,6],[315,482,8]],
    edges: [[0,1],[0,2],[0,3],[1,2],[1,3],[1,4],[2,3],[2,4],[3,4],[3,5],[4,5]],
  },
  {
    key: "north-east",
    points: [[1160,96,5],[1328,70,4],[1460,165,8],[1388,246,5],[1518,307,4]],
    edges: [[0,1],[1,2],[1,3],[2,3],[2,4],[3,4]],
  },
  {
    key: "east",
    points: [[1265,505,6],[1390,575,5],[1510,548,8],[1565,653,4],[1425,690,5]],
    edges: [[0,1],[0,4],[1,2],[1,4],[2,3],[2,4],[3,4]],
  },
  {
    key: "centre",
    points: [[620,362,4],[690,418,5],[650,486,4],[750,440,4],[705,560,6]],
    edges: [[0,1],[0,2],[1,2],[1,3],[1,4],[2,4],[3,4]],
  },
  {
    key: "south-west",
    points: [[108,690,6],[205,762,5],[155,840,8],[268,875,5]],
    edges: [[0,1],[0,2],[1,2],[1,3],[2,3]],
  },
  {
    key: "south-centre",
    points: [[540,790,5],[618,845,4],[700,815,8],[752,896,5],[634,935,4]],
    edges: [[0,1],[0,2],[1,2],[1,4],[2,3],[2,4],[3,4]],
  },
  {
    key: "north-mid",
    points: [[790,36,5],[860,86,4],[900,176,6]],
    edges: [[0,1],[1,2],[0,2]],
  },
];

const isolated: readonly Point[] = [
  [530,105,7],[940,278,4],[1060,390,5],[338,610,5],[1010,760,4],[382,924,5],[1200,900,4],
];

export function GlobalNetworkBackground() {
  return (
    <div className="global-network-background" aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" role="presentation">
        {clusters.map((cluster, clusterIndex) => (
          <g
            key={cluster.key}
            className={`global-network-cluster ${cluster.className ?? ""}`}
            style={{ "--cluster-index": clusterIndex } as CSSProperties}
          >
            <g className="global-network-cluster-lines">
              {cluster.edges.map(([from, to], index) => {
                const [x1, y1] = cluster.points[from];
                const [x2, y2] = cluster.points[to];
                return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />;
              })}
            </g>
            <g className="global-network-cluster-nodes">
              {cluster.points.map(([cx, cy, r = 4], index) => (
                <circle
                  key={index}
                  cx={cx}
                  cy={cy}
                  r={r}
                  style={{ "--node-index": index } as CSSProperties}
                />
              ))}
            </g>
          </g>
        ))}

        <g className="global-network-isolated">
          {isolated.map(([cx, cy, r = 4], index) => (
            <circle key={index} cx={cx} cy={cy} r={r} />
          ))}
        </g>
      </svg>
    </div>
  );
}
