import { NightSkyBonus } from "@/components/night-sky-bonus";

export default function NightSkyPage() {
  return <main id="main" className="lesson-page interactive-lesson-page night-sky-page">
    <p className="eyebrow">Post-core bonus · Bulb Exposure</p>
    <h1>Shape starlight over time</h1>
    <p className="lede">Compare relatively sharp stars with intentional star trails. Every long exposure is simulated immediately—there is no real-time wait.</p>
    <NightSkyBonus />
  </main>;
}
