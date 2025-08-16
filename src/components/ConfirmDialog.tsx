"use client"
import React from 'react'

type Props = {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', loading, onCancel, onConfirm }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm card p-5">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && <p className="text-sm text-gray-600">{description}</p>}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button className="btn" onClick={onCancel} disabled={!!loading}>{cancelLabel}</button>
            <button className="btn btn-primary" onClick={onConfirm} disabled={!!loading}>{loading ? 'Please wait…' : confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
