import { useState, useRef, useCallback, useEffect, type PointerEvent } from "react";
import { Input } from "@/components/ui/input";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHsv(hex: string): [number, number, number] {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  const s = max === 0 ? 0 : d / max;
  return [h, s, max];
}

const HEX_RE = /^#[\da-f]{6}$/i;

export type ColorPickerProps = {
  value: string;
  onChange: (hex: string) => void;
};

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [hsv, setHsv] = useState<[number, number, number]>(() => hexToHsv(value));
  const [hexInput, setHexInput] = useState(value);
  const satPanelRef = useRef<HTMLDivElement>(null);
  const hueBarRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"panel" | "hue" | null>(null);

  useEffect(() => {
    if (value !== hsvToHex(hsv[0], hsv[1], hsv[2])) {
      setHsv(hexToHsv(value));
      setHexInput(value);
    }
    // only sync when external value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const emitColor = useCallback((h: number, s: number, v: number) => {
    const hex = hsvToHex(h, s, v);
    setHexInput(hex);
    onChange(hex);
  }, [onChange]);

  const handlePanelPointer = useCallback((e: PointerEvent<HTMLDivElement>) => {
    const rect = satPanelRef.current?.getBoundingClientRect();
    if (!rect) return;
    const s = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const v = clamp(1 - (e.clientY - rect.top) / rect.height, 0, 1);
    const next: [number, number, number] = [hsv[0], s, v];
    setHsv(next);
    emitColor(next[0], next[1], next[2]);
  }, [hsv, emitColor]);

  const handleHuePointer = useCallback((e: PointerEvent<HTMLDivElement>) => {
    const rect = hueBarRef.current?.getBoundingClientRect();
    if (!rect) return;
    const h = clamp(((e.clientX - rect.left) / rect.width) * 360, 0, 360);
    const next: [number, number, number] = [h, hsv[1], hsv[2]];
    setHsv(next);
    emitColor(next[0], next[1], next[2]);
  }, [hsv, emitColor]);

  const onPanelDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = "panel";
    e.currentTarget.setPointerCapture(e.pointerId);
    handlePanelPointer(e);
  };

  const onPanelMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current === "panel") handlePanelPointer(e);
  };

  const onHueDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = "hue";
    e.currentTarget.setPointerCapture(e.pointerId);
    handleHuePointer(e);
  };

  const onHueMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current === "hue") handleHuePointer(e);
  };

  const onPointerUp = () => {
    dragging.current = null;
  };

  const handleHexChange = (raw: string) => {
    setHexInput(raw);
    if (HEX_RE.test(raw)) {
      const next = hexToHsv(raw);
      setHsv(next);
      onChange(raw.toLowerCase());
    }
  };

  const hueColor = hsvToHex(hsv[0], 1, 1);

  return (
    <div className="flex flex-col gap-3">
      {/* Saturation/Value panel */}
      <div
        ref={satPanelRef}
        className="relative h-40 w-full cursor-crosshair rounded-md border"
        style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor})` }}
        onPointerDown={onPanelDown}
        onPointerMove={onPanelMove}
        onPointerUp={onPointerUp}
      >
        <div
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
          style={{
            left: `${hsv[1] * 100}%`,
            top: `${(1 - hsv[2]) * 100}%`,
            backgroundColor: hsvToHex(hsv[0], hsv[1], hsv[2]),
          }}
        />
      </div>

      {/* Hue slider */}
      <div
        ref={hueBarRef}
        className="relative h-4 w-full cursor-pointer rounded-full border"
        style={{ background: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" }}
        onPointerDown={onHueDown}
        onPointerMove={onHueMove}
        onPointerUp={onPointerUp}
      >
        <div
          className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
          style={{
            left: `${(hsv[0] / 360) * 100}%`,
            backgroundColor: hueColor,
          }}
        />
      </div>

      {/* Hex input + preview */}
      <div className="flex items-center gap-2">
        <div
          className="h-8 w-8 shrink-0 rounded-md border"
          style={{ backgroundColor: hsvToHex(hsv[0], hsv[1], hsv[2]) }}
        />
        <Input
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          className="h-8 w-28 font-mono text-xs"
          maxLength={7}
          aria-label="Hex color"
        />
      </div>
    </div>
  );
}
