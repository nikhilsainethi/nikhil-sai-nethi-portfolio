"use client";

import { useEffect, useState } from "react";

const MOBILE_WIDTH_QUERY = "(max-width: 900px)";
const COARSE_POINTER_QUERY = "(pointer: coarse)";

function getShouldSimplifyMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return (
    window.matchMedia(MOBILE_WIDTH_QUERY).matches ||
    window.matchMedia(COARSE_POINTER_QUERY).matches
  );
}

export function useShouldSimplifyMotion() {
  const [shouldSimplifyMotion, setShouldSimplifyMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mobileWidthMedia = window.matchMedia(MOBILE_WIDTH_QUERY);
    const coarsePointerMedia = window.matchMedia(COARSE_POINTER_QUERY);
    const update = () => setShouldSimplifyMotion(getShouldSimplifyMotion());

    update();
    mobileWidthMedia.addEventListener("change", update);
    coarsePointerMedia.addEventListener("change", update);

    return () => {
      mobileWidthMedia.removeEventListener("change", update);
      coarsePointerMedia.removeEventListener("change", update);
    };
  }, []);

  return shouldSimplifyMotion;
}
