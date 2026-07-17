"use client";

import Image from "next/image";
import { useState } from "react";
import { renderExposure } from "@/lib/exposure-model";

export function ExposurePreview() {
  const [shutter, setShutter] = useState(60);
  const rendered = renderExposure({ aperture: 5.6, shutter, iso: 400 });

  return (
    <figure className="preview">
      <div className="preview-frame">
        <Image
          src="/images/neutral-still-life-960.jpg"
          alt="A quiet tabletop still life with fruit, cups, and books in window light"
          fill
          priority
          sizes="(max-width: 900px) 100vw, 58vw"
          className="preview-image"
          style={{ filter: `brightness(${rendered.baseBrightness})` }}
        />
        <span className="scene-highlight-layer" style={{ opacity: rendered.highlightOpacity }} />
        <span className="viewfinder-corner top-left" /><span className="viewfinder-corner top-right" />
        <span className="viewfinder-corner bottom-left" /><span className="viewfinder-corner bottom-right" />
        <div className="preview-readout"><span>Neutral Still Life</span><strong>f/5.6 · 1/{shutter}s · ISO 400</strong></div>
      </div>
      <figcaption className="preview-control">
        <div>
          <strong>A quiet place to experiment</strong>
          <p aria-live="polite">{rendered.description}</p>
        </div>
        <label className="landing-control">Shutter speed
          <select aria-label="Landing shutter speed" value={shutter} onChange={(event) => setShutter(Number(event.target.value))}>
            {[30, 60, 125, 250].map((value) => <option value={value} key={value}>1/{value}s</option>)}
          </select>
        </label>
      </figcaption>
      <p className="photo-credit">Photograph: Ruth Hartnup · <a href="https://commons.wikimedia.org/wiki/File:Still_life_-_various_objects_on_table.jpg">CC BY 2.0</a></p>
    </figure>
  );
}
