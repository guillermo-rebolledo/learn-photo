type Lesson = {
  slug: string;
  number: string;
  title: string;
  summary: string;
  time: `${number} min`;
};

function defineLearningPath<const T extends readonly Lesson[]>(items: T): T {
  const slugs = new Set(items.map(({ slug }) => slug));
  const numbers = new Set(items.map(({ number }) => number));
  if (items.length !== 8 || slugs.size !== items.length || numbers.size !== items.length) {
    throw new Error("Learning Path must contain eight uniquely numbered Lessons with unique routes.");
  }
  return items;
}

export const lessons = defineLearningPath([
  { slug: "light-and-exposure", number: "01", title: "Light and exposure", summary: "See how a photograph begins with captured light.", time: "7 min" },
  { slug: "stops-and-equivalent-exposures", number: "02", title: "Stops and equivalent exposures", summary: "Reason in simple doublings and halvings.", time: "8 min" },
  { slug: "aperture-and-depth-of-field", number: "03", title: "Aperture and depth of field", summary: "Shape light and background definition.", time: "9 min" },
  { slug: "shutter-speed-and-motion", number: "04", title: "Shutter speed and motion", summary: "Freeze movement or let it flow.", time: "9 min" },
  { slug: "iso-and-image-quality", number: "05", title: "ISO and image quality", summary: "Lift rendered brightness and weigh the tradeoff.", time: "8 min" },
  { slug: "meter-and-histogram", number: "06", title: "Meter and Histogram", summary: "Read evidence without treating it as an answer.", time: "10 min" },
  { slug: "exposure-modes", number: "07", title: "Exposure modes", summary: "Decide which choices belong to you or the Camera.", time: "9 min" },
  { slug: "choosing-settings", number: "08", title: "Choosing settings for an intention", summary: "Bring every Exposure Control together.", time: "10 min" },
] as const);
