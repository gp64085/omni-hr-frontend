import React from "react";
import { Button } from "./Button";

interface ModalFooterProps {
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  submitVariant?: "primary" | "secondary" | "danger" | "gradient";
  className?: string;
}

/**
 * Standardized, reusable footer actions for modals and dialogs.
 */
export function ModalFooter({
  onCancel,
  submitLabel = "Save Changes",
  cancelLabel = "Cancel",
  isLoading = false,
  submitVariant = "gradient",
  className = "",
}: ModalFooterProps) {
  return (
    <div
      className={`flex items-center justify-end gap-3 pt-4 border-t border-slate-800 ${className}`}
    >
      <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
        {cancelLabel}
      </Button>
      <Button type="submit" variant={submitVariant} isLoading={isLoading}>
        {submitLabel}
      </Button>
    </div>
  );
}
