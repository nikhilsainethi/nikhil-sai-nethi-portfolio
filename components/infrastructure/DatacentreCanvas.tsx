"use client";

import type { MotionValue } from "framer-motion";
import { SceneCanvas } from "./SceneCanvas";

type Props = { progress: MotionValue<number>; motionEnabled: boolean };

/** The hero's walk-through data-centre aisle. */
export function DatacentreCanvas(props: Props) {
  return <SceneCanvas scene="aisle" testId="datacentre-canvas" {...props} />;
}

/** The three-cabinet diorama under the "Follow the signals" drawing. */
export function StoryCanvas(props: Props) {
  return <SceneCanvas scene="story" testId="story-canvas" {...props} />;
}

export default DatacentreCanvas;
