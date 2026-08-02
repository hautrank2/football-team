"use client";

import { Loader2, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { uploadApi } from "@/apis/upload";
import { Button } from "@/components/ui/button";

const FOLDER = "test";

const TestImagePage = () => {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const res = await uploadApi.image(file, FOLDER);
      setUrl(res.url);
      toast.success("Upload thành công");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload thất bại");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!url) return;
    setBusy(true);
    try {
      await uploadApi.remove(url);
      toast.success("Đã xóa ảnh");
      setUrl("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xóa thất bại");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Test upload ảnh</h1>
        <p className="text-sm text-muted-foreground">
          Upload & xóa ảnh trên R2 (folder <code>{FOLDER}/</code>).
        </p>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-accent">
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        Chọn ảnh để upload
        <input
          type="file"
          accept="image/*"
          hidden
          disabled={busy}
          onChange={onUpload}
        />
      </label>

      {url ? (
        <div className="flex flex-col gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="uploaded"
            className="max-h-64 w-fit rounded-md border"
          />
          <p className="break-all text-xs text-muted-foreground">{url}</p>
          <Button
            variant="destructive"
            className="w-fit"
            disabled={busy}
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
            Xóa ảnh
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground">Chưa có ảnh.</p>
      )}
    </div>
  );
};

export default TestImagePage;
