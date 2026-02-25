'use client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  hint?: string;
  rows?: number;
  placeholder?: string;
  mono?: boolean;
}

export function Field({
  label,
  value,
  onChange,
  multiline,
  hint,
  rows = 3,
  placeholder,
  mono,
}: FieldProps) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {multiline ? (
        <Textarea
          rows={rows}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={mono ? 'font-mono' : undefined}
        />
      ) : (
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={mono ? 'font-mono' : undefined}
        />
      )}
    </div>
  );
}
