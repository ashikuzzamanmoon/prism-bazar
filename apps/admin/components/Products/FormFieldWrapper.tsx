import type React from "react";
import { Label } from "@/components/ui/label";

interface FormFieldWrapperProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

export function FormFieldWrapper({
  label,
  required = false,
  error,
  children,
  htmlFor,
}: FormFieldWrapperProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
