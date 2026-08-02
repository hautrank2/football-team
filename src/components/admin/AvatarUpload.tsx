"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { useUploadImage } from "@/apis/upload/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export type AvatarUploadProps = {
  value?: string | null;
  onChange: (url: string | undefined) => void;
  disabled?: boolean;
};

// Picks an image, uploads it to R2 (/api/upload), and returns the public URL.
export const AvatarUpload = ({ value, onChange, disabled }: AvatarUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadImage();
  const busy = upload.isPending || disabled;

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    upload.mutate(file, {
      onSuccess: ({ url }) => onChange(url),
      onError: (err) => toast.error(err instanceof Error ? err.message : "Upload thất bại"),
    });
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        <AvatarImage src={value ?? undefined} />
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {upload.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            {value ? "Đổi ảnh" : "Tải ảnh"}
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => onChange(undefined)}
            >
              <X className="size-4" />
              Xóa
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">PNG/JPG, tối đa 5MB</p>
      </div>
    </div>
  );
};
