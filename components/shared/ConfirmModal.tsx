'use client';
import { IconAlertTriangle } from '@tabler/icons-react';

interface Props {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ open, title, description, confirmLabel = 'Sil', onConfirm, onCancel }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 bg-red-100 rounded-full p-2">
            <IconAlertTriangle size={18} className="text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{title}</p>
            {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 border rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            İptal
          </button>
          <button
            onClick={() => { onConfirm(); onCancel(); }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
