"use client";

import dynamic from "next/dynamic";
import type { SceneVariant } from "./SceneAccent";

const SceneAccent = dynamic(() => import("./SceneAccent"), { ssr: false });

/** Client-only mount so Server Components can host Three.js accents. */
export default function SceneAccentLazy({
  variant,
  className,
}: {
  variant: SceneVariant;
  className?: string;
}) {
  return <SceneAccent variant={variant} className={className} />;
}
