import { useMutation } from "@tanstack/react-query";
import { uploadApi } from "./index";

export const useUploadImage = () =>
  useMutation({ mutationFn: (file: File) => uploadApi.image(file) });
