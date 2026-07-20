import type { Metadata } from "next";
import { analyticsEventCatalog } from "@/lib/analytics-model";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Learn Photo handles browser-local Progress and anonymous curriculum analytics.",
  alternates: { canonical: "/privacy" },
  openGraph: { url: "/privacy" },
};

export default function PrivacyPage() {
  return <main id="main" tabIndex={-1} className="simple-page privacy-page">
    <p className="eyebrow">Privacy</p>
    <h1>Progress and analytics</h1>
    <p className="lede">Learn Photo has no account, no sign-in, and no advertising. This page describes the two separate things it stores: your browser-local Progress, and anonymous curriculum analytics.</p>

    <section aria-labelledby="progress-heading">
      <h2 id="progress-heading">Progress stays on your device</h2>
      <p>Progress — your completed Lessons and Challenges, current Learning Path position, and the last unfinished Challenge — is stored only in this browser’s local storage. It is never sent to a server, never synchronized across devices, and is cleared entirely by the Reset progress action.</p>
    </section>

    <section aria-labelledby="analytics-heading">
      <h2 id="analytics-heading">Anonymous curriculum analytics</h2>
      <p>Learn Photo may separately send a small number of anonymous curriculum events. This is distinct from Progress: it never identifies you, never leaves this device attached to a name or account, and never reconstructs your individual Learning Path. Every event is limited to a canonical identifier — a Lesson, Challenge, Success Criterion, or Curated Scene — and never carries names, typed content, personal imagery, an advertising profile, or a cross-site identifier.</p>
      <p>Analytics failure or blocking never affects the Learning Loop, Progress, rendering, or page responsiveness; the events below are the complete list Learn Photo can send.</p>
      <table aria-label="Anonymous analytics events" className="scale-table">
        <thead><tr><th scope="col">Event</th><th scope="col">Purpose</th><th scope="col">Properties</th></tr></thead>
        <tbody>
          {analyticsEventCatalog.map((event) => <tr key={event.name}>
            <td><code>{event.name}</code></td>
            <td>{event.purpose}</td>
            <td>{event.properties.join(", ")}</td>
          </tr>)}
        </tbody>
      </table>
    </section>
  </main>;
}
