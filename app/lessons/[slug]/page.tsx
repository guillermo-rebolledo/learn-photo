import Link from "next/link";
import { notFound } from "next/navigation";
import { lessons } from "@/lib/curriculum";
import { LessonOne } from "@/components/lesson-one";
import LightAndExposureContent from "@/content/lessons/light-and-exposure.mdx";
import { LessonPositionTracker } from "@/components/lesson-position-tracker";
import { LessonTwo } from "@/components/lesson-two";
import StopsAndEquivalentExposuresContent from "@/content/lessons/stops-and-equivalent-exposures.mdx";
import { LessonThree } from "@/components/lesson-three";
import ApertureAndDepthContent from "@/content/lessons/aperture-and-depth-of-field.mdx";
import { LessonFive } from "@/components/lesson-five";
import IsoAndImageQualityContent from "@/content/lessons/iso-and-image-quality.mdx";
import { LessonFour } from "@/components/lesson-four";
import ShutterSpeedAndMotionContent from "@/content/lessons/shutter-speed-and-motion.mdx";
import { LessonSix } from "@/components/lesson-six";
import MeterAndHistogramContent from "@/content/lessons/meter-and-histogram.mdx";

export function generateStaticParams() { return lessons.map(({ slug }) => ({ slug })); }

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = lessons.find((item) => item.slug === slug);
  if (!lesson) notFound();

  return (
    <main id="main" className={["01", "03", "04", "05", "06"].includes(lesson.number) ? "lesson-page interactive-lesson-page" : "simple-page lesson-page"}>
      <LessonPositionTracker slug={lesson.slug} />
      <p className="eyebrow">Lesson {lesson.number} · {lesson.time}</p>
      <h1>{lesson.title}</h1>
      <p className="lede">{lesson.summary}</p>
      {lesson.number === "01" ? (
        <LessonOne explanation={<LightAndExposureContent />} />
      ) : lesson.number === "02" ? (
        <LessonTwo explanation={<StopsAndEquivalentExposuresContent />} />
      ) : lesson.number === "03" ? (
        <LessonThree explanation={<ApertureAndDepthContent />} />
      ) : lesson.number === "04" ? (
        <LessonFour explanation={<ShutterSpeedAndMotionContent />} />
      ) : lesson.number === "05" ? (
        <LessonFive explanation={<IsoAndImageQualityContent />} />
      ) : lesson.number === "06" ? (
        <LessonSix explanation={<MeterAndHistogramContent />} />
      ) : <p className="status-note"><strong>Open, not locked.</strong> This Lesson’s learning content is being prepared.</p>}
      <Link className="text-link" href="/">← Back to the Learning Path</Link>
    </main>
  );
}
