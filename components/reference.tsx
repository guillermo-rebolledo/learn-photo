"use client";

import { useState } from "react";
import Link from "next/link";
import { beginnerScale, cameraScale, formatShutter } from "@/lib/exposure-scales";
import { curriculumSourceGroups, referenceTerms, sourcePhotographs } from "@/lib/reference-data";

function ScaleTable({ name, scale }: { name: string; scale: typeof beginnerScale | typeof cameraScale }) {
  return <table aria-label={name} className="scale-table">
    <thead><tr><th scope="col">Control</th><th scope="col">Values</th></tr></thead>
    <tbody><tr><th scope="row">Aperture</th><td>{scale.aperture.map((value) => `f/${value}`).join(" · ")}</td></tr><tr><th scope="row">Shutter speed</th><td>{scale.shutter.map(formatShutter).join(" · ")}</td></tr><tr><th scope="row">ISO</th><td>{scale.iso.join(" · ")}</td></tr></tbody>
  </table>;
}

export function Reference() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matchingTerms = normalizedQuery
    ? referenceTerms.filter(({ name, keywords }) => `${name} ${keywords}`.toLocaleLowerCase().includes(normalizedQuery))
    : referenceTerms;
  const matchingSourceGroups = curriculumSourceGroups.map((group) => ({ ...group, sources: normalizedQuery ? group.sources.filter((source) => `${source.title} ${source.publisher}`.toLocaleLowerCase().includes(normalizedQuery)) : group.sources })).filter(({ lesson, sources }) => !normalizedQuery || lesson.toLocaleLowerCase().includes(normalizedQuery) || sources.length);
  const matchingPhotographs = normalizedQuery ? sourcePhotographs.filter((asset) => `${asset.photographer} ${asset.license} ${asset.file}`.toLocaleLowerCase().includes(normalizedQuery)) : sourcePhotographs;
  const quickSections = [
    { label: "Stops and equivalent exposure", href: "#stop-relationships", keywords: "stop equivalent captured light rendered brightness" },
    { label: "Control ranges", href: "#control-ranges", keywords: "aperture shutter iso beginner camera scale" },
    { label: "Digital ISO and film speed", href: "#digital-film", keywords: "digital film roll grain noise" },
    { label: "Exposure Modes", href: "#exposure-modes", keywords: "auto program aperture priority shutter priority manual compensation" },
  ].filter(({ label, keywords }) => normalizedQuery && `${label} ${keywords}`.toLocaleLowerCase().includes(normalizedQuery));
  const resultCount = matchingTerms.length + quickSections.length + matchingSourceGroups.reduce((total, group) => total + group.sources.length, 0) + matchingPhotographs.length;

  return <main id="main" tabIndex={-1} className="simple-page reference-page">
    <p className="eyebrow">Reference</p>
    <h1>Exposure Stops</h1>
    <p className="lede">Search plain-language definitions, compare settings, or trace every Curriculum Source and Source Photograph without reading a full Lesson.</p>

    <div className="reference-search">
      <label htmlFor="reference-query">Search the Reference</label>
      <div><input id="reference-query" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “Meter Reference” or “film”" />{query && <button type="button" onClick={() => setQuery("")}>Clear search</button>}</div>
      <p role="status" aria-live="polite">{resultCount} {resultCount === 1 ? "result" : "results"}</p>
    </div>

    <section aria-label="Reference results">
      <h2 id="canonical-terms">Canonical terms</h2>
      {matchingTerms.length ? <div className="term-grid">{matchingTerms.map((term) => <article className="term-card" key={term.name}><h3>{term.name}</h3><p>{term.definition}</p></article>)}</div> : <p className="empty-reference">No terms match “{query}”. Try a control, mode, or result.</p>}
      {quickSections.length > 0 && <nav aria-label="Matching quick tables"><ul>{quickSections.map((section) => <li key={section.href}><a href={section.href}>{section.label}</a></li>)}</ul></nav>}
    </section>

    <section aria-labelledby="stop-relationships"><h2 id="stop-relationships">Stops and equivalent exposure</h2><table aria-label="Full-stop relationships" className="scale-table"><thead><tr><th scope="col">Change</th><th scope="col">Captured Light</th><th scope="col">Rendered Brightness</th><th scope="col">Distinct tradeoff</th></tr></thead><tbody><tr><th scope="row">f/4 → f/5.6</th><td>Halved</td><td>One Stop darker</td><td>Wider depth of field</td></tr><tr><th scope="row">1/125s → 1/60s</th><td>Doubled</td><td>One Stop brighter</td><td>More motion may show</td></tr><tr><th scope="row">ISO 400 → 800</th><td>Unchanged</td><td>One Stop brighter</td><td>Noise may be more visible</td></tr><tr><th scope="row">f/4 at 1/125s → f/5.6 at 1/60s</th><td>Balanced changes</td><td>Equivalent</td><td>Depth and motion differ</td></tr></tbody></table></section>
    <section aria-labelledby="control-ranges"><h2 id="control-ranges">Control ranges</h2><div className="reference-table-stack"><div><h3>Beginner Scale</h3><p>Full stops make doubling and halving easy to see.</p><ScaleTable name="Beginner Scale full-stop values" scale={beginnerScale} /></div><div><h3>Camera Scale</h3><p>Third stops reflect the finer increments commonly offered by Cameras.</p><ScaleTable name="Camera Scale third-stop values" scale={cameraScale} /></div></div></section>
    <section aria-labelledby="digital-film"><h2 id="digital-film">Digital ISO and film speed</h2><table aria-label="Digital ISO and film speed comparison" className="scale-table"><thead><tr><th scope="col">Question</th><th scope="col">Digital ISO</th><th scope="col">Film speed</th></tr></thead><tbody><tr><th scope="row">When can it change?</th><td>Change for each photograph</td><td>Fixed across the loaded roll</td></tr><tr><th scope="row">Visible tradeoff</th><td>Higher settings can reveal more noise and less fine detail</td><td>Faster stocks generally show more grain; format and enlargement also matter</td></tr><tr><th scope="row">How do you respond?</th><td>Choose aperture, shutter speed, and a compatible ISO</td><td>Choose a practical stock first, then balance aperture and shutter speed</td></tr></tbody></table></section>
    <section aria-labelledby="exposure-modes"><h2 id="exposure-modes">Exposure Modes</h2><p>Aliases vary by manufacturer, but the division of responsibility transfers between Cameras.</p><table aria-label="Exposure Modes and common aliases" className="scale-table"><thead><tr><th scope="col">Exposure Mode</th><th scope="col">Aliases</th><th scope="col">Learner selects</th><th scope="col">Camera selects</th></tr></thead><tbody><tr><th scope="row">Auto</th><td>Auto</td><td>—</td><td>Aperture, shutter speed, ISO</td></tr><tr><th scope="row">Program</th><td>P</td><td>ISO</td><td>Aperture, shutter speed</td></tr><tr><th scope="row">Aperture Priority</th><td>A, Av</td><td>Aperture, ISO</td><td>Shutter speed</td></tr><tr><th scope="row">Shutter Priority</th><td>S, Tv</td><td>Shutter speed, ISO</td><td>Aperture</td></tr><tr><th scope="row">Manual</th><td>M</td><td>Aperture, shutter speed, ISO</td><td>—</td></tr></tbody></table><p>Exposure Compensation shifts automatic and priority results relative to the Meter Reference. Optional Auto ISO transfers ISO selection to the Camera within configured limits.</p></section>

    <section aria-labelledby="curriculum-sources" aria-label="Curriculum Sources"><h2 id="curriculum-sources">Curriculum Sources</h2><p>Every source used by every available Lesson, grouped so its teaching context remains visible.</p><div className="source-groups">{matchingSourceGroups.map((group) => <article key={group.slug}><h3><Link href={`/lessons/${group.slug}`}>{group.lesson}</Link></h3><ul>{group.sources.map((source) => {
      const groupIndex = curriculumSourceGroups.findIndex(({ slug }) => slug === group.slug);
      const firstGroupIndex = curriculumSourceGroups.findIndex(({ sources }) => sources.some(({ url }) => url === source.url));
      const accessibleName = firstGroupIndex === groupIndex ? undefined : `Repeated Curriculum Source for ${group.lesson}`;
      return <li key={source.url}><a href={source.url} aria-label={accessibleName}>{source.title}</a><span>{source.publisher}</span></li>;
    })}</ul></article>)}</div></section>
    <section aria-labelledby="photograph-credits" aria-label="Source Photograph credits"><h2 id="photograph-credits">Source Photograph credits</h2><p>Creator credit and recorded license provenance for every Source Photograph in the application.</p><div className="credit-grid">{matchingPhotographs.map((asset) => <article key={asset.file}><p className="eyebrow">{asset.file}</p><h3><a href={asset.sourceUrl}>{asset.photographer}</a></h3><p><a href={asset.licenseUrl}>{asset.license}</a></p><dl><div><dt>Downloaded</dt><dd>{asset.downloadDate}</dd></div><div><dt>License verified</dt><dd>{asset.licenseVerifiedDate}</dd></div></dl><p>{asset.modifications}</p></article>)}</div></section>
    <Link className="text-link" href="/">Return to Learn →</Link>
  </main>;
}
