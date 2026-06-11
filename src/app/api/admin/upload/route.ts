import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/admin/auth'
import { uploadToS3 } from '@/lib/s3'
import sharp from 'sharp'
import path from 'path'

// Google Discover minimum: 1200×630px
const MIN_WIDTH  = 1200
const MIN_HEIGHT = 630

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file     = formData.get('file') as File
    const skipDimensionCheck = formData.get('skipDimensionCheck') === 'true'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
    if (!allowed.includes(file.type)) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })

    // Optional: article slug — if provided, save to articles/{slug}/featured.webp
    const slug = (formData.get('slug') as string | null)?.trim() || null

    const buffer = Buffer.from(await file.arrayBuffer()) as Buffer

    // Check dimensions with sharp
    const meta   = await sharp(buffer).metadata()
    const width  = meta.width  || 0
    const height = meta.height || 0

    // Warn if too small for Google Discover (but don't hard-block if skipDimensionCheck)
    if (!skipDimensionCheck && (width < MIN_WIDTH || height < MIN_HEIGHT)) {
      return NextResponse.json({
        error:         `Image too small for Google Discover`,
        details:       `Your image is ${width}×${height}px. Minimum required: ${MIN_WIDTH}×${MIN_HEIGHT}px.`,
        width,
        height,
        tooSmall:      true,
      }, { status: 422 })
    }

    // Auto-convert to WebP for better performance (except GIF)
    let finalBuffer = buffer
    let finalType   = file.type
    let finalExt    = file.name.split('.').pop()?.toLowerCase() || 'jpg'

    if (file.type !== 'image/gif') {
      const targetWidth = Math.min(width, 1920)

      // ── Watermark: TechPulseGlobe logo (top-right corner, 20px padding) ──
      const logoPath  = path.join(process.cwd(), 'public', 'logo-rect-1000x250.png')
      const logoWidth = Math.round(targetWidth * 0.22) // 22% of image width

      // 1. Resize logo
      let logoBuffer = await sharp(logoPath)
        .resize({ width: logoWidth, withoutEnlargement: true })
        .ensureAlpha()
        .toBuffer()

      // 2. One raw pass: gray subtitle text → black  +  75% opacity
      const { data: logoRaw, info: logoInfo } = await sharp(logoBuffer)
        .raw()
        .toBuffer({ resolveWithObject: true })
      for (let i = 0; i < logoRaw.length; i += 4) {
        const r = logoRaw[i], g = logoRaw[i + 1], b = logoRaw[i + 2]
        // Convert medium-gray "AI · FINANCE · TECHNOLOGY" text to near-black
        const isNeutralGray = Math.abs(r - g) < 18 && Math.abs(g - b) < 18 && Math.abs(r - b) < 18
        const isMediumGray  = r > 100 && r < 190
        if (isNeutralGray && isMediumGray) {
          logoRaw[i] = 20; logoRaw[i + 1] = 20; logoRaw[i + 2] = 20
        }
        // Apply 75% opacity
        logoRaw[i + 3] = Math.round(logoRaw[i + 3] * 0.75)
      }
      logoBuffer = await sharp(logoRaw, {
        raw: { width: logoInfo.width, height: logoInfo.height, channels: 4 },
      }).png().toBuffer()

      // 3. Calculate top-right position: 20px from top, 20px from right edge
      const logoFinalWidth = (await sharp(logoBuffer).metadata()).width ?? logoWidth
      const logoPosLeft    = targetWidth - logoFinalWidth - 20

      // 4. Resize main image + composite watermark → WebP
      finalBuffer = await sharp(buffer)
        .resize({ width: targetWidth, withoutEnlargement: true })
        .composite([{ input: logoBuffer, top: 20, left: logoPosLeft }])
        .webp({ quality: 85 })
        .toBuffer()

      finalType = 'image/webp'
      finalExt  = 'webp'
    }

    // If slug provided → articles/{slug}/featured.webp (organized, overwrite-safe)
    // Otherwise → media/{timestamp}-{random}.ext (generic media library upload)
    const key = slug
      ? `articles/${slug}/featured.webp`
      : `media/${Date.now()}-${Math.random().toString(36).slice(2)}.${finalExt}`

    const url = await uploadToS3(finalBuffer, key, finalType)

    return NextResponse.json({ url, key, width, height })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
