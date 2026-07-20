import type { Metadata } from "next";
import { Sandbox } from "@/components/sandbox";

export const metadata: Metadata = {
  title: "Sandbox",
  description: "Move between every core Curated Scene and follow the visible tradeoffs, with no Challenge or grade.",
  alternates: { canonical: "/sandbox" },
  openGraph: { url: "/sandbox" },
};

export default function SandboxPage() {
  return <main id="main" tabIndex={-1} className="interactive-lesson-page sandbox-page"><p className="eyebrow">Sandbox · Unrestricted</p><h1>Explore exposure freely.</h1><p className="lede">Move between every core Curated Scene and follow the visible tradeoffs. There is no Challenge, grade, or completion state here—and no hidden feedback or completion pressure.</p><Sandbox /></main>;
}
