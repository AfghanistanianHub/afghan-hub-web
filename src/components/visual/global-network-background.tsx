"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { mountAPNBCNetwork } from "./apnbc-network";

export function GlobalNetworkBackground() {
  const pathname = usePathname();
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (pathname === "/" || !canvas.current) return;
    return mountAPNBCNetwork(canvas.current);
  }, [pathname]);

  return (
    <div className="global-network-background" aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  );
}
