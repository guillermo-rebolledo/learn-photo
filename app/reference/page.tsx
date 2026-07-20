import type { Metadata } from "next";
import { Reference } from "@/components/reference";

export const metadata: Metadata = {
  title: "Reference",
  description: "A concise collection of definitions, quick tables, and Source Photograph credits available outside the Learning Path.",
  alternates: { canonical: "/reference" },
  openGraph: { url: "/reference" },
};

export default function ReferencePage() {
  return <Reference />;
}
