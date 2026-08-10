import { useMutation } from "@tanstack/react-query";
import { aiApi } from "@/apis/ai";

// Send an image to the AI service and get back a transparent-background PNG blob.
export const useRemoveBg = () =>
  useMutation({ mutationFn: (file: File) => aiApi.removeBg(file) });

// Remove backgrounds for many images in a single request. Keyed by an arbitrary
// id (we use the player id); returns a blob per key.
export const useRemoveBgBatch = () =>
  useMutation({ mutationFn: (files: Record<string, File>) => aiApi.removeBgBatch(files) });
