import Link from "next/link";
import { curriculumSources } from "@/lib/curriculum";
import { beginnerScale, cameraScale, formatShutter } from "@/lib/exposure-scales";

function ScaleTable({ name, scale }: { name: string; scale: typeof beginnerScale | typeof cameraScale }) {
  return <table aria-label={name} className="scale-table">
    <thead><tr><th scope="col">Control</th><th scope="col">Values</th></tr></thead>
    <tbody>
      <tr><th scope="row">Aperture</th><td>{scale.aperture.map((value) => `f/${value}`).join(" · ")}</td></tr>
      <tr><th scope="row">Shutter speed</th><td>{scale.shutter.map(formatShutter).join(" · ")}</td></tr>
      <tr><th scope="row">ISO</th><td>{scale.iso.join(" · ")}</td></tr>
    </tbody>
  </table>;
}

export default function ReferencePage() {
  return <main id="main" className="simple-page reference-page">
    <p className="eyebrow">Reference</p>
    <h1>Exposure Stops</h1>
    <p className="lede">A Stop is a doubling or halving. Equivalent exposures balance opposite Stop changes while aperture, shutter speed, and digital ISO retain different physical and visual consequences.</p>
    <section aria-labelledby="stop-relationships"><h2 id="stop-relationships">Stop and equivalence table</h2><table aria-label="Full-stop relationships" className="scale-table"><thead><tr><th scope="col">Change</th><th scope="col">Captured Light</th><th scope="col">Rendered Brightness</th><th scope="col">Distinct tradeoff</th></tr></thead><tbody><tr><th scope="row">f/4 → f/5.6</th><td>Halved</td><td>One Stop darker</td><td>Wider depth of field</td></tr><tr><th scope="row">1/125s → 1/60s</th><td>Doubled</td><td>One Stop brighter</td><td>More motion may show</td></tr><tr><th scope="row">ISO 400 → 800</th><td>Unchanged</td><td>One Stop brighter</td><td>Noise may be more visible</td></tr><tr><th scope="row">f/4 at 1/125s → f/5.6 at 1/60s</th><td>Balanced changes</td><td>Equivalent</td><td>Depth and motion differ</td></tr></tbody></table></section>
    <section aria-labelledby="beginner-scale"><h2 id="beginner-scale">Beginner Scale</h2><p>Full stops make the doubling and halving relationship easy to see.</p><ScaleTable name="Beginner Scale full-stop values" scale={beginnerScale} /></section>
    <section aria-labelledby="camera-scale"><h2 id="camera-scale">Camera Scale</h2><p>Third stops provide the finer increments commonly offered by cameras.</p><ScaleTable name="Camera Scale third-stop values" scale={cameraScale} /></section>
    <section aria-labelledby="digital-film"><h2 id="digital-film">Digital ISO and film speed</h2><table aria-label="Digital ISO and film speed comparison" className="scale-table"><thead><tr><th scope="col">Question</th><th scope="col">Digital ISO</th><th scope="col">Film speed</th></tr></thead><tbody><tr><th scope="row">When can it change?</th><td>Change for each photograph</td><td>Fixed across the loaded roll</td></tr><tr><th scope="row">What is the visible tradeoff?</th><td>Higher settings can reveal more noise and reduced fine detail</td><td>Faster stocks generally show more grain; format and enlargement also matter</td></tr><tr><th scope="row">How do you respond to the scene?</th><td>Choose aperture, shutter, and a compatible ISO</td><td>Choose a practical stock first, then balance aperture and shutter</td></tr></tbody></table></section>
    <section aria-labelledby="exposure-modes"><h2 id="exposure-modes">Exposure Mode table</h2><p>Aliases vary by manufacturer, but the division of responsibility transfers between cameras.</p><table aria-label="Exposure Modes and common aliases" className="scale-table"><thead><tr><th scope="col">Exposure Mode</th><th scope="col">Common aliases</th><th scope="col">Learner selects</th><th scope="col">Camera selects</th></tr></thead><tbody><tr><th scope="row">Auto</th><td>Auto</td><td>—</td><td>Aperture, shutter speed, ISO</td></tr><tr><th scope="row">Program</th><td>P</td><td>ISO</td><td>Aperture, shutter speed</td></tr><tr><th scope="row">Aperture Priority</th><td>A, Av</td><td>Aperture, ISO</td><td>Shutter speed</td></tr><tr><th scope="row">Shutter Priority</th><td>S, Tv</td><td>Shutter speed, ISO</td><td>Aperture</td></tr><tr><th scope="row">Manual</th><td>M</td><td>Aperture, shutter speed, ISO</td><td>—</td></tr></tbody></table><p>Exposure Compensation shifts automatic and priority results relative to the Meter Reference. Optional Auto ISO transfers ISO selection to the Camera within configured limits.</p></section>
    <section aria-labelledby="curriculum-sources"><h2 id="curriculum-sources">Curriculum Sources</h2><ul>{curriculumSources.map((source) => <li key={source.url}><a href={source.url}>{source.title}</a> — {source.publisher}</li>)}</ul></section>
    <Link className="text-link" href="/">Return to Learn →</Link>
  </main>;
}
