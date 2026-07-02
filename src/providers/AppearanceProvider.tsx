"use client";

import { useEffect } from "react";
import { applyAppearanceStyle, getAppearanceSettings } from "@/lib/appearance";
import { API_URL } from "@/lib/api";

/**
 * AppearanceProvider — загружает серверный white-label стиль и применяет его.
 *
 * Перенесено из src/App.jsx (бывший useEffect, строки 77-99):
 *   - getAppearanceSettings() (/appearance/settings)
 *   - /appearance/style → applyAppearanceStyle() (CSS-переменные --appearance-*)
 */
export default function AppearanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    let isMounted = true;

    getAppearanceSettings().catch(() => {});

    fetch(`${API_URL}/appearance/style`, {
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((style) => {
        if (isMounted) {
          applyAppearanceStyle(style);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return <>{children}</>;
}
