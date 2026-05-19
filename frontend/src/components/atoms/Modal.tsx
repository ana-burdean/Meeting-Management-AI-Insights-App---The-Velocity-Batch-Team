import type { ReactNode } from 'react';
import Button from './Button';

interface ModalProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
}

export default function Modal({ title, subtitle, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#373D20]/60 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-black">{title}</h3>
            {subtitle && <p className="text-sm text-[#766153]">{subtitle}</p>}
          </div>

          <Button type="button" variant="secondary" onClick={onClose} className="px-3">
            ✕
          </Button>
        </div>

        {children}
      </div>
    </div>
  );
}