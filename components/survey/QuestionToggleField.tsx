"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

interface QuestionToggleFieldProps {
  checked: boolean;
  description: string;
  id: string;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}

export function QuestionToggleField({
  checked,
  description,
  id,
  label,
  onCheckedChange,
}: QuestionToggleFieldProps) {
  return (
    <FieldLabel htmlFor={id}>
      <Field orientation="horizontal">
        <FieldContent>
          <FieldTitle className="text-xs">{label}</FieldTitle>
          <FieldDescription className="text-xs">{description}</FieldDescription>
        </FieldContent>
        <Switch
          checked={checked}
          id={id}
          onCheckedChange={onCheckedChange}
        />
      </Field>
    </FieldLabel>
  );
}
