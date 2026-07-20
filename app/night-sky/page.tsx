import type { Metadata } from "next";
import { NightSkyBonus } from "@/components/night-sky-bonus";

export const metadata: Metadata = {
  title: "Night Sky",
  description: "Compare relatively sharp stars with intentional star trails using simulated Bulb Exposure presets.",
  alternates: { canonical: "/night-sky" },
  openGraph: { url: "/night-sky" },
};

export default function NightSkyPage() {
  return <main id="main" tabIndex={-1} className="lesson-page interactive-lesson-page night-sky-page">
    <p className="eyebrow">Post-core bonus · Bulb Exposure</p>
    <h1>Shape starlight over time</h1>
    <p className="lede">Compare relatively sharp stars with intentional star trails. Every long exposure is simulated immediately—there is no real-time wait.</p>
    <NightSkyBonus />
  </main>;
}
