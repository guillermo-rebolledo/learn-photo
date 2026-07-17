import Link from "next/link";
import { notFound } from "next/navigation";
import { lessons } from "@/lib/curriculum";
import { LessonOne } from "@/components/lesson-one";
import LightAndExposureContent from "@/content/lessons/light-and-exposure.mdx";
import { LessonPositionTracker } from "@/components/lesson-position-tracker";

export function generateStaticParams() { return lessons.map(({ slug }) => ({ slug })); }

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = lessons.find((item) => item.slug === slug);
  if (!lesson) notFound();

  return (
    <main id="main" className={lesson.number === "01" ? "lesson-page lesson-one-page" : "simple-page lesson-page"}>
      <LessonPositionTracker slug={lesson.slug} />
      <p className="eyebrow">Lesson {lesson.number} · {lesson.time}</p>
      <h1>{lesson.title}</h1>
      <p className="lede">{lesson.summary}</p>
      {lesson.number === "01" ? (
        <LessonOne explanation={<LightAndExposureContent />} />
      ) : <p className="status-note"><strong>Open, not locked.</strong> This Lesson’s learning content is being prepared.</p>}
      <Link className="text-link" href="/">← Back to the Learning Path</Link>
    </main>
  );
}
