"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type DeleteDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  loading?: boolean;
  confirmLabel?: string;
  destructive?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

// Generic confirm dialog. Defaults to a destructive "Xóa" action.
export const DeleteDialog = ({
  open,
  title,
  description,
  loading,
  confirmLabel = "Xóa",
  destructive = true,
  onOpenChange,
  onConfirm,
}: DeleteDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
        <AlertDialogAction
          disabled={loading}
          onClick={(e) => {
            e.preventDefault(); // keep open while the mutation runs
            onConfirm();
          }}
          className={destructive ? "bg-destructive text-white hover:bg-destructive/90" : undefined}
        >
          {loading ? "Đang xử lý…" : confirmLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
