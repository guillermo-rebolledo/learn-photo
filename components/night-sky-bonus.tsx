"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { bulbDurations, evaluateNightSky, nightSkyChallenges, nightSkyExposureStops, type NightSkyIntention, type NightSkySettings } from "@/lib/night-sky-model";

const storageKey = "learn-photo-night-sky";
const defaults: Record<NightSkyIntention, NightSkySettings> = { sharp: nightSkyChallenges.sharp.defaults, trails: nightSkyChallenges.trails.defaults };

export function NightSkyBonus() {
  const [settings, setSettings] = useState(defaults);
  const [attempted, setAttempted] = useState<NightSkyIntention[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [effects, setEffects] = useState(true);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      if (saved?.settings) setSettings(saved.settings);
      if (Array.isArray(saved?.attempted)) setAttempted(saved.attempted);
      setEffects(localStorage.getItem("learn-photo-visual-effects") !== "off");
    } catch { /* Invalid bonus Progress is ignored. */ }
    setHydrated(true);
  }, []);

  const results = { sharp: evaluateNightSky("sharp", settings.sharp), trails: evaluateNightSky("trails", settings.trails) };
  const completed = attempted.filter((path) => results[path].complete);
  const bonusComplete = completed.includes("sharp") && completed.includes("trails");

  function update(path: NightSkyIntention, field: keyof NightSkySettings, value: number) {
    setSettings((current) => ({ ...current, [path]: { ...current[path], [field]: value } }));
  }
  function attempt(path: NightSkyIntention) {
    const nextAttempted = [...new Set([...attempted, path])];
    setAttempted(nextAttempted);
    localStorage.setItem(storageKey, JSON.stringify({ settings, attempted: nextAttempted }));
    const nextComplete = nextAttempted.every((item) => evaluateNightSky(item, settings[item]).complete) && nextAttempted.length === 2;
    try {
      const progress = JSON.parse(localStorage.getItem("learn-photo-progress") ?? "{}");
      localStorage.setItem("learn-photo-progress", JSON.stringify({ ...progress, nightSkyComplete: nextComplete }));
    } catch { localStorage.setItem("learn-photo-progress", JSON.stringify({ nightSkyComplete: nextComplete })); }
  }

  return <>
    <section className="lesson-explanation night-sky-intro">
      <h2>Long exposures are choices, not countdowns</h2>
      <p>Bulb Exposure extends the Camera beyond its standard 30-second shutter setting. Here, selecting 1, 2, 5, or 10 minutes produces a deterministic Rendered Result immediately.</p>
      <details className="scene-assumptions" open><summary>Scene Assumptions and graceful fallback</summary><p>This Curated Scene assumes a tripod, remote or delayed release, fixed focus set manually, full-frame format, and a 24 mm focal length. A different format, focal length, sky direction, output size, or tolerance changes how soon star motion becomes visible. If layered effects are unavailable, the Source Photograph, controls, evaluation, and synchronized text remain usable.</p></details>
    </section>
    <section className="capstone-challenges night-sky-challenges" aria-label="Night Sky Challenges">
      {(["sharp", "trails"] as const).map((path) => {
        const definition = nightSkyChallenges[path];
        const result = results[path];
        const shown = attempted.includes(path);
        return <article className="capstone-challenge" role="region" aria-label={definition.label} key={path}>
          <header><p className="eyebrow">Photographic Intention</p><h3>{definition.title}</h3><p>{definition.intention} Multiple settings combinations can work.</p></header>
          <div className="simulator night-sky-simulator">
            <NightSkyPreview intention={path} settings={settings[path]} effects={effects} />
            <div className="camera-controls">
              <label>Bulb Exposure duration<select aria-label="Bulb Exposure duration" disabled={!hydrated} value={settings[path].duration} onChange={(event) => update(path, "duration", Number(event.target.value))}>{bulbDurations.map((duration) => <option key={duration} value={duration}>{duration === 30 ? "30 seconds" : `${duration / 60} ${duration === 60 ? "minute" : "minutes"}`}</option>)}</select></label>
              <label>Aperture<select aria-label="Aperture" disabled={!hydrated} value={settings[path].aperture} onChange={(event) => update(path, "aperture", Number(event.target.value))}>{[2, 2.8, 4, 5.6].map((value) => <option key={value} value={value}>f/{value}</option>)}</select></label>
              <label>ISO<select aria-label="ISO" disabled={!hydrated} value={settings[path].iso} onChange={(event) => update(path, "iso", Number(event.target.value))}>{[200, 400, 800, 1600, 3200].map((value) => <option key={value} value={value}>ISO {value}</option>)}</select></label>
              <button className="button primary-button capture-button" disabled={!hydrated} onClick={() => attempt(path)}>{shown ? "Retry" : "Take photo"}</button>
            </div>
          </div>
          {shown && <div className="feedback capstone-feedback" aria-live="polite"><h3>{result.complete ? "Challenge complete" : "Review the result"}</h3><div className="criteria iso-criteria">{result.criteria.map((criterion) => <article key={criterion.id} aria-label={`${criterion.label}${criterion.essential ? " essential" : " optional"}`}><h4>{criterion.label} {!criterion.essential && <small>Optional</small>}</h4><strong className={`status status-${criterion.result.status.toLowerCase()}`}>{criterion.result.status}</strong><p>{criterion.result.explanation}</p></article>)}</div><p><strong>Tradeoff Feedback:</strong> {result.tradeoff}</p></div>}
        </article>;
      })}
    </section>
    {bonusComplete && <div className="feedback capstone-complete" aria-live="polite"><p className="eyebrow">Progress updated</p><h2>Night Sky bonus complete</h2><p>Both Photographic Intentions are complete. You can revisit either Challenge and compare more valid solutions.</p></div>}
    <aside className="photo-credit"><strong>Source Photograph:</strong> “Milky Way and starry night sky” by <a href="https://commons.wikimedia.org/wiki/File:Milky_Way_and_starry_night_sky_(26972689115).jpg">NPS / Jacob W. Frank</a>, a U.S. National Park Service public-domain work. Local derivatives and the calibrated star-motion layer are documented in the image manifest.</aside>
  </>;
}

function NightSkyPreview({ intention, settings, effects }: { intention: NightSkyIntention; settings: NightSkySettings; effects: boolean }) {
  const exposure = nightSkyExposureStops(settings);
  const brightness = Math.max(.45, Math.min(1.65, 2 ** exposure));
  const outcome = intention === "sharp" && settings.duration === 30 ? "Stars remain relatively sharp under these assumptions." : `${settings.duration / 60} ${settings.duration === 60 ? "minute shows" : "minutes show"} ${settings.duration >= 300 ? "deliberate extended" : "short"} star motion.`;
  return <figure className={`lesson-preview night-sky-preview ${effects ? "" : "no-night-sky-effects"}`} aria-label={`Rendered Result: ${settings.duration} seconds at f/${settings.aperture} with sensitivity ${settings.iso}. ${outcome}`}>
    <div className="lesson-preview-frame"><Image src="/images/night-sky-960.jpg" alt="Milky Way and stars above silhouetted flowers and land" fill priority={intention === "sharp"} sizes="(max-width: 900px) 100vw, 55vw" style={{ filter: `brightness(${brightness})` }} /><Image data-testid={`${intention}-star-motion`} className="night-sky-trail-layer" src={`/images/night-sky-trails.svg#duration-${settings.duration}`} alt="" aria-hidden fill unoptimized sizes="(max-width: 900px) 100vw, 55vw" /><span data-testid={`${intention}-noise`} className="noise-layer" aria-hidden style={{ opacity: Math.max(0, Math.log2(settings.iso / 200) * .035) }} /></div>
    <figcaption>{outcome} Exposure is {Math.abs(exposure) < .1 ? "at" : `${Math.abs(exposure)} Stops ${exposure > 0 ? "above" : "below"}`} the scene reference. {!effects && "Visual refinement is unavailable; the Source Photograph and this synchronized text remain usable."}</figcaption>
  </figure>;
}
