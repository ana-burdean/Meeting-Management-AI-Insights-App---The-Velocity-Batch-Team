import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'accent';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-[#373D20] text-[#EFF1ED] hover:bg-[#717744]',
  secondary: 'bg-[#EFF1ED] text-[#373D20] hover:bg-[#BCBD8B]/40',
  danger: 'bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100',
  accent: 'bg-[#BCBD8B] text-[#373D20] hover:bg-[#EFF1ED]',
};

export default function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-2xl px-4 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}