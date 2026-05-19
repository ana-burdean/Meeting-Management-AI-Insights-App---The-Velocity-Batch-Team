import type { InputHTMLAttributes, ReactNode } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  children?: ReactNode;
}

export default function Field({ label, children, className = '', ...props }: FieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-bold">{label}</span>
      {children ?? (
        <input
          className={`w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744] ${className}`}
          {...props}
        />
      )}
    </label>
  );
}