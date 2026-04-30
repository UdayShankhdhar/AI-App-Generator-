"use client";

import { useEffect } from "react";

export default function ThemeLoader({
  theme,
}: {
  theme: any;
}) {

  useEffect(() => {

    if (!theme) return;

    document.body.style.background =
      theme.mode === "dark"
        ? "#111"
        : "#fff";

    document.body.style.color =
      theme.mode === "dark"
        ? "#fff"
        : "#000";

    document.documentElement.style.setProperty(
      "--primary-color",
      theme.primaryColor
    );

  }, [theme]);

  return null;
}