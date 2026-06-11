export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/admin/auth'
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const source = new URL(req.url).searchParams.get('source') || 'all' // all | media | articles

  try {
    const baseUrl = process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_S3_URL!
    const prefixes = source === 'media' ? ['media/'] : source === 'articles' ? ['articles/'] : ['media/', 'articles/']

    const allFiles: any[] = []

    for (const prefix of prefixes) {
      let token: string | undefined
      do {
        const res = await s3.send(new ListObjectsV2Command({
          Bucket:            process.env.AWS_S3_BUCKET!,
          Prefix:            prefix,
          MaxKeys:           500,
          ContinuationToken: token,
        }))
        const files = (res.Contents || [])
          .filter(f => f.Key && f.Key !== prefix && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f.Key))
          .map(f => ({
            key:          f.Key!,
            url:          `${baseUrl}/${f.Key}`,
            size:         f.Size || 0,
            lastModified: f.LastModified?.toISOString() ?? '',
            name:         f.Key!.split('/').pop() ?? f.Key!,
            path:         f.Key!,
            source:       f.Key!.startsWith('articles/') ? 'article' : 'media',
          }))
        allFiles.push(...files)
        token = res.IsTruncated ? res.NextContinuationToken : undefined
      } while (token)
    }

    allFiles.sort((a, b) => (b.lastModified > a.lastModified ? 1 : -1))

    return NextResponse.json({ data: allFiles, total: allFiles.length })
  } catch {
    return NextResponse.json({ data: [], total: 0 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { key } = await req.json()
  if (!key) return NextResponse.json({ error: 'Key required' }, { status: 400 })

  await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET!, Key: key }))
  return NextResponse.json({ success: true })
}
