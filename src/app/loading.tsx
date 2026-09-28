import { T } from '@/components/Language';

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto max-w-6xl px-6 py-16 min-h-[60vh]"
    >
      <p className="text-xl text-gray-700">
        <T text="Carregando..." />
      </p>
      <div aria-hidden="true" className="mt-8 space-y-4">
        <div className="h-8 w-2/3 rounded bg-gray-200" />
        <div className="h-48 rounded bg-gray-100" />
      </div>
    </div>
  );
}
