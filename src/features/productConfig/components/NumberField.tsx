import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  min?: number;
  disabled?: boolean;
  error?: string;
};

export function NumberField({
  label,
  value,
  onChange,
  suffix,
  min = 0,
  disabled,
  error,
}: NumberFieldProps) {
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
          disabled={disabled}
          className={suffix ? "pr-12" : ""}
          aria-invalid={!!error}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
