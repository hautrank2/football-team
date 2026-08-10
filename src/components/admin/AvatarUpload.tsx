"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadApi } from "@/apis/upload";
import { useUpdatePlayer, useUploadImage } from "@/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ImageCropperDialog } from "@/components/ui/image-cropper";
import { ImagePreview } from "@/components/ui/image-preview";

export type AvatarUploadProps = {
  value?: string | null;
  onChange: (url: string | undefined) => void;
  disabled?: boolean;
  // When set, the new avatar is persisted to this player immediately (no need to
  // press a separate Save button). Leave undefined in create flows (no player yet).
  playerId?: string;
  // Called after a successful immediate save (e.g. to sync auth/header state).
  onSaved?: (url?: string) => void;
};

// Picks an image, lets the user crop it to a square, uploads the crop to R2
// (/api/upload), and returns the public URL. When `playerId` is given, the change
// is saved to the DB right away so the surrounding form's Save is not required.
export const AvatarUpload = ({ value, onChange, disabled, playerId, onSaved }: AvatarUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadImage();
  const update = useUpdatePlayer();
  const busy = upload.isPending || update.isPending || disabled;

  // Persist the avatar change straight away when editing an existing player.
  const persist = (url?: string) => {
    if (!playerId) return;
    update.mutate(
      { id: playerId, body: { avatarUrl: url ?? "" } },
      {
        onSuccess: () => {
          toast.success("Đã cập nhật ảnh");
          onSaved?.(url);
        },
        onError: () => toast.error("Không thể cập nhật ảnh"),
      }
    );
  };

  // Object URL + name of the just-picked file, kept while the crop dialog is open.
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropName, setCropName] = useState<string>();

  const closeCrop = () => {
    setCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp ảnh");
      return;
    }
    setCropName(file.name);
    setCropSrc(URL.createObjectURL(file));
  };

  // Best-effort removal of a previously-uploaded avatar so it doesn't orphan in
  // R2. Fire-and-forget: failures (e.g. external URLs) are ignored.
  const removeFromStorage = (url?: string | null) => {
    if (url) uploadApi.remove(url).catch(() => {});
  };

  const onCropped = (file: File) => {
    const previous = value;
    upload.mutate(
      { file },
      {
        onSuccess: ({ url }) => {
          onChange(url);
          removeFromStorage(previous); // drop the replaced image
          closeCrop();
          persist(url); // save to DB right away (edit flows)
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Upload thất bại"),
      }
    );
  };

  const onRemove = () => {
    removeFromStorage(value);
    onChange(undefined);
    persist(undefined);
  };

  return (
    <div className="flex items-center gap-4">
      <ImagePreview src={value} alt="Ảnh đại diện">
        <Avatar className="size-16">
          <AvatarImage src={value ?? undefined} className="object-cover" />
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
      </ImagePreview>
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
            <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={onRemove}>
              <X className="size-4" />
              Xóa
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">PNG/JPG, tối đa 5MB</p>
      </div>

      <ImageCropperDialog
        open={!!cropSrc}
        src={cropSrc}
        fileName={cropName}
        loading={upload.isPending}
        onCancel={closeCrop}
        onCropped={onCropped}
      />
    </div>
  );
};
