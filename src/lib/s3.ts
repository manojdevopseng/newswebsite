import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  region:      process.env.S3_REGION!,
  credentials: {
    accessKeyId:     process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
})

const BUCKET  = process.env.S3_BUCKET!
const S3_URL  = process.env.NEXT_PUBLIC_S3_URL!
// CloudFront CDN URL — all uploaded files are served via CDN, not S3 direct
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || S3_URL

export async function uploadToS3(
  buffer:      Buffer,
  key:         string,
  contentType: string,
): Promise<string> {
  await s3.send(new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         key,
    Body:        buffer,
    ContentType: contentType,
  }))
  // Return CDN URL — upload still goes to S3, only the returned URL uses CloudFront
  return `${CDN_URL}/${key}`
}

export async function deleteFromS3(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

export function getS3Key(url: string): string {
  // Handle both CDN URLs (new) and S3 direct URLs (old articles in DB)
  return url.replace(`${CDN_URL}/`, '').replace(`${S3_URL}/`, '')
}
