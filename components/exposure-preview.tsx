import Image from "next/image";

export function ExposurePreview() {
  return (
    <figure className="preview">
      <div className="preview-frame">
        <Image
          src="/images/neutral-still-life.jpg"
          alt="A quiet tabletop still life with fruit, cups, and books in window light"
          fill
          priority
          sizes="(max-width: 900px) 100vw, 58vw"
          className="preview-image"
        />
        <span className="viewfinder-corner top-left" /><span className="viewfinder-corner top-right" />
        <span className="viewfinder-corner bottom-left" /><span className="viewfinder-corner bottom-right" />
        <div className="preview-readout"><span>Neutral Still Life</span><strong>f/5.6 · 1/60s · ISO 400</strong></div>
      </div>
      <figcaption className="preview-control">
        <div>
          <strong>A quiet place to experiment</strong>
          <p>Each Lesson will connect one Exposure Control to a visible photographic result.</p>
        </div>
        <span className="preview-status">Preview</span>
      </figcaption>
      <p className="photo-credit">Photograph: Ruth Hartnup · <a href="https://commons.wikimedia.org/wiki/File:Still_life_-_various_objects_on_table.jpg">CC BY 2.0</a></p>
    </figure>
  );
}
