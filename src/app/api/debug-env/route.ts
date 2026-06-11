export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({
    nodeEnv: process.env.NODE_ENV,
    hasMongoUri: !!process.env.MONGODB_URI,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasS3Region: !!process.env.S3_REGION,
    hasUpstash: !!process.env.UPSTASH_REDIS_REST_URL,
    mongoUriLen: (process.env.MONGODB_URI || '').length,
    authSecretLen: (process.env.AUTH_SECRET || '').length,
  })
}
