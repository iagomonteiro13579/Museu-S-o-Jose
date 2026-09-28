'use client';
import { X } from 'lucide-react';
import { type ReactNode, useEffect, useRef } from 'react';
import { useLanguage } from './Language';
export default function Dialog({
  title,
  onClose,
  children,
}: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { t } = useLanguage();
  useEffect(() => {
    const element = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="museum-dialog"
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog-heading">
        <h2>{title}</h2>
        <button type="button" onClick={onClose} aria-label={t('Fechar')}>
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
