import { useMutation } from "@tanstack/react-query";
import { uploadApi } from "@/apis/upload";

// Upload an image to R2. Pass `folder` to bucket it (defaults to "avatars"
// server-side).
export const useUploadImage = () =>
  useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      uploadApi.image(file, folder),
  });
