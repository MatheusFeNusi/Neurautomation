"use client";

import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { neurautomationFrentes } from "@/components/home/home-timeline-data";

export function NeurautomationHomeOrbital() {
  return <RadialOrbitalTimeline timelineData={neurautomationFrentes} />;
}
