import { TwitterApi } from 'twitter-api-v2'

function getTwitterClient() {
  const appKey       = process.env.Consumer_Key
  const appSecret    = process.env.Consumer_Key_Secret
  const accessToken  = process.env.X_Access_Token
  const accessSecret = process.env.X_Token_Secret

  if (!appKey || !appSecret || !accessToken || !accessSecret) {
    throw new Error('Twitter credentials missing in env')
  }

  return new TwitterApi({ appKey, appSecret, accessToken, accessSecret })
}

export async function postArticleTweet(article: {
  title: string
  slug: string
  aiSummary?: string
  excerpt?: string
  category: { name: string; slug: string }
}): Promise<string> {
  const siteUrl = (process.env.NEXT_PUBLIC_URL ?? 'https://techpulseglobe.com')
    .replace('http://localhost:3000', 'https://techpulseglobe.com')

  const url = `${siteUrl}/${article.category.slug}/${article.slug}`
  const tag = `#${article.category.name.replace(/[\s&]/g, '')} #TechNews`

  // URL counts as 23 chars (Twitter t.co), tag + 2 newlines
  const maxBodyLen = 280 - 23 - tag.length - 4

  // Priority: aiSummary → excerpt → title
  const raw = article.aiSummary || article.excerpt || article.title
  const body = raw.length > maxBodyLen ? raw.slice(0, maxBodyLen - 1) + '…' : raw

  const tweet = `${body}\n\n${url}\n\n${tag}`

  const client = getTwitterClient()
  const result = await client.v2.tweet(tweet)
  return result.data.id
}
