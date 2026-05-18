"use client";

import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={props.id} className="text-xs font-semibold uppercase tracking-wide text-theme-secondary">
          {label}
        </label>
      )}
      <select
        className={cn(
          "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-150 cursor-pointer appearance-auto",
          "bg-theme-bg text-theme-primary",
          "border", error ? "border-danger" : "border-theme focus-ring-brand",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs font-medium text-danger">
          {error}
        </span>
      )}
    </div>
  );
}
