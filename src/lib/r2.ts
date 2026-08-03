import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Cloudflare R2 is S3-compatible. Credentials come from .env / .env.local.
const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
  // R2 rejects the CRC32 checksum that recent aws-sdk versions add by default.
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

// Uploads a file to R2 under `<folder>/<uuid>.<ext>` and returns its public URL.
export const uploadToR2 = async (file: File, folder: string): Promise<string> => {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const key = `${folder}/${crypto.randomUUID()}.${ext}`;
  const body = Buffer.from(await file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: file.type || "application/octet-stream",
    })
  );

  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
};

// Deletes an object by its public URL (or raw key).
export const deleteFromR2 = async (urlOrKey: string): Promise<void> => {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
  const key = base && urlOrKey.startsWith(base)
    ? urlOrKey.slice(base.length).replace(/^\//, "")
    : urlOrKey;

  await client.send(
    new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key })
  );
};
