import { useEffect, type RefObject } from "react";
import { AccessibilityInfo, type View } from "react-native";

// Anuncia un mensaje con VoiceOver o TalkBack sin mover el foco (HU-08). A diferencia de
// accessibilityLiveRegion (solo Android), funciona en las dos plataformas.
export function announce(message: string) {
  AccessibilityInfo.announceForAccessibility(message);
}

// Anuncia `message` cada vez que cambia a un valor no vacío (errores o estados en pantalla).
export function useAnnounce(message: string | null | undefined) {
  useEffect(() => {
    if (message) announce(message);
  }, [message]);
}

// Devuelve el foco del lector de pantalla a un elemento (p. ej. al cerrar un modal).
export function restoreFocus(ref: RefObject<View | null>) {
  if (ref.current) AccessibilityInfo.sendAccessibilityEvent(ref.current, "focus");
}
