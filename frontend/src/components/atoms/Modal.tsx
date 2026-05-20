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
        <div
            className="fixed inset-0 z-50 grid place-items-center bg-[#373D20]/60 p-4"
            onMouseDown={(e) => {
                // Close when clicking the backdrop (not the modal itself)
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-[2rem] bg-white shadow-2xl">

                {/* Sticky header */}
                <div className="sticky top-0 z-10 flex items-start justify-between rounded-t-[2rem] bg-white px-8 pt-7 pb-4 border-b border-[#BCBD8B]/30">
                    <div>
                        <h3 className="text-2xl font-black">{title}</h3>
                        {subtitle && <p className="text-sm text-[#766153]">{subtitle}</p>}
                    </div>
                    <Button type="button" variant="secondary" onClick={onClose} className="px-3 shrink-0">
                        ✕
                    </Button>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto px-8 py-6">
                    {children}
                </div>
            </div>
        </div>
    );
}