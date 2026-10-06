"use client";

import { useEffect, useRef } from "react";
import { mountAPNBCNetwork } from "./apnbc-network";

export function GlobalNetworkBackground() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas.current) return;
    return mountAPNBCNetwork(canvas.current);
  }, []);

  return (
    <div className="global-network-background" aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  );
}
