import Link from "next/link";
import { ExposurePreview } from "@/components/exposure-preview";
import { lessons } from "@/lib/curriculum";
import { ProgressLink } from "@/components/progress-link";
import { LearningPathStatus } from "@/components/learning-path-status";

export default function LearnPage() {
  return (
    <main id="main">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Exposure Fundamentals · 8 short Lessons</p>
          <h1 id="hero-title">Learn to shape light, not chase settings.</h1>
          <p className="hero-intro">Understand what aperture, shutter speed, and ISO do to a photograph through calm explanations and guided practice.</p>
          <ProgressLink className="button primary-button">Start learning <span aria-hidden="true">→</span></ProgressLink>
          <p className="reassurance">Free. No account. Every Lesson stays open.</p>
        </div>
        <ExposurePreview />
      </section>

      <section className="learning-path" aria-labelledby="path-title">
        <div className="section-heading">
          <div><p className="eyebrow">Your recommended route</p><h2 id="path-title">Learning Path</h2></div>
          <p>About 60–90 minutes, at your own pace. Start anywhere—nothing is locked.</p>
        </div>
        <ol className="lesson-list">
          {lessons.map((lesson, index) => (
            <li key={lesson.slug}>
              <Link href={`/lessons/${lesson.slug}`} className="lesson-link">
                <span className="lesson-number">{lesson.number}</span>
                <span className="lesson-body"><strong>{lesson.title}</strong><span>{lesson.summary}</span></span>
                <span className="lesson-time">{lesson.time}</span>
                <span className="lesson-arrow" aria-hidden="true">{index === 0 ? "Begin →" : "→"}</span>
              </Link>
            </li>
          ))}
        </ol>
        <LearningPathStatus />
        <aside className="bonus-card"><p className="eyebrow">Launch-required bonus</p><h3>Night Sky and Bulb Exposure</h3><p>Compare relatively sharp stars with deliberate star trails—without waiting through a real long exposure.</p><Link className="button secondary-button" href="/night-sky">Open the Night Sky bonus <span aria-hidden="true">→</span></Link></aside>
      </section>
    </main>
  );
}
