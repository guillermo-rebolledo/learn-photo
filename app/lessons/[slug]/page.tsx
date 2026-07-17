import Link from "next/link";
import { notFound } from "next/navigation";
import { lessons } from "@/lib/curriculum";

export function generateStaticParams() { return lessons.map(({ slug }) => ({ slug })); }

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = lessons.find((item) => item.slug === slug);
  if (!lesson) notFound();

  return (
    <main id="main" className="simple-page lesson-page">
      <p className="eyebrow">Lesson {lesson.number} · {lesson.time}</p>
      <h1>{lesson.title}</h1>
      <p className="lede">{lesson.summary}</p>
      {lesson.number === "01" ? (
        <div className="lesson-note">
          <p><strong>Your first Lesson route is ready.</strong></p>
          <p>The sourced explanation, guided experiment, and Challenge are being prepared as the next learning increment.</p>
        </div>
      ) : <p className="status-note"><strong>Open, not locked.</strong> This Lesson’s learning content is being prepared.</p>}
      <Link className="text-link" href="/">← Back to the Learning Path</Link>
    </main>
  );
}
