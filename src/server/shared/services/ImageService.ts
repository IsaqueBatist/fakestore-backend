import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { logger } from "./Logger";

let r2Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!r2Client) {
    if (
      !process.env.R2_ENDPOINT ||
      !process.env.R2_ACCESS_KEY_ID ||
      !process.env.R2_SECRET_ACCESS_KEY
    ) {
      throw new Error(
        "R2_ENDPOINT, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY are required for image uploads",
      );
    }

    r2Client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return r2Client;
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Generates a presigned URL for direct upload to Cloudflare R2.
 * The binary NEVER passes through Node.js — the client uploads directly to R2.
 */
export async function generateUploadUrl(
  tenantId: number,
  filename: string,
  mimeType: string,
): Promise<{ uploadUrl: string; objectKey: string; publicUrl: string }> {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(
      `Invalid mime type: ${mimeType}. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
    );
  }

  const bucket = process.env.R2_BUCKET_NAME || "fakestore-images";
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const objectKey = `tenants/${tenantId}/products/${Date.now()}-${sanitizedFilename}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ContentType: mimeType,
    ContentLength: MAX_FILE_SIZE,
  });

  const uploadUrl = await getSignedUrl(getR2Client(), command, {
    expiresIn: 300, // 5 minutes
  });

  const publicUrl = process.env.R2_PUBLIC_URL
    ? `${process.env.R2_PUBLIC_URL}/${objectKey}`
    : objectKey;

  logger.info(
    { tenantId, objectKey, mimeType },
    "Presigned upload URL generated",
  );

  return { uploadUrl, objectKey, publicUrl };
}

/**
 * Deletes an object from R2 storage.
 */
export async function deleteObject(objectKey: string): Promise<void> {
  const bucket = process.env.R2_BUCKET_NAME || "fakestore-images";

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: objectKey,
  });

  await getR2Client().send(command);
  logger.info({ objectKey }, "Object deleted from R2");
}
