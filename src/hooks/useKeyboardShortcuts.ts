import { useEffect } from "react";

interface KeyboardShortcutsProps {
  onExport: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAnimationType: (type: string) => void;
  onShowHelp?: () => void;
}

export const useKeyboardShortcuts = ({
  onExport,
  onSave,
  onUndo,
  onRedo,
  onAnimationType,
  onShowHelp,
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + E for Export
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault();
        onExport();
        return;
      }

      // Ctrl/Cmd + S for Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        onSave();
        return;
      }

      // Ctrl/Cmd + Z for Undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        onUndo();
        return;
      }

      // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z for Redo
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        onRedo();
        return;
      }

      // ? key for help (only if not in input)
      if (e.key === "?" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        onShowHelp?.();
        return;
      }

      // Number keys 1-8 for animation types (only if not in input)
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const animationTypes = [
        "rotate",
        "slide-horizontal",
        "slide-vertical",
        "pulse",
        "wave",
        "diagonal",
        "zoom",
        "color-shift",
      ];

      const keyNum = parseInt(e.key);
      if (keyNum >= 1 && keyNum <= 8) {
        e.preventDefault();
        onAnimationType(animationTypes[keyNum - 1]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onExport, onSave, onUndo, onRedo, onAnimationType, onShowHelp]);
};
