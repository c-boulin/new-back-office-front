import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  min?: number;
};

export function NumberField({ label, value, onChange, suffix, min = 0 }: NumberFieldProps) {
  const id = useId();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          min={min}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={suffix ? "pr-12" : ""}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}
