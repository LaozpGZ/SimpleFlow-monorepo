import crypto from 'crypto'
import { getAuth } from 'firebase-admin/auth'
import { firebaseAdmin } from 'lib/firebase-admin'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Telegram sends auth data as query parameters
  const { query } = req
  console.log({ query }, 'handler???')
  try {
    // 1. Verify the authentication data
    const { hash, ...authData } = query

    if (!hash || typeof hash !== 'string') {
      res.status(400).json({ error: 'Invalid authentication data' })
      return
    }

    // Sort the auth data alphabetically as required by Telegram
    const dataCheckString = Object.keys(authData)
      .sort()
      .map((key) => `${key}=${authData[key]}`)
      .join('\n')

    // Create a secret key by hashing the bot token with SHA-256
    const secretKey = crypto
      .createHash('sha256')
      .update(process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || '')
      .digest()

    // Calculate the hash of the data check string using HMAC-SHA-256
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

    // Verify that the hash matches
    if (calculatedHash !== hash) {
      res.status(401).json({ error: 'Authentication failed: Data integrity check failed' })
      return
    }

    // 2. Extract Telegram user ID
    const telegramId = authData.id

    if (!telegramId) {
      res.status(400).json({ error: 'Telegram ID not found' })
      return
    }

    // 3. Issue Firebase custom token
    await firebaseAdmin() // Ensure Admin SDK is initialized
    const customToken = await getAuth().createCustomToken(telegramId as string)
    console.log('Custom token:', customToken, telegramId)

    // 4. Return token to frontend via postMessage
    res.setHeader('Content-Type', 'text/html')
    res.end(`
      <!DOCTYPE html>
  <html lang="zh-TW">
    <head>
      <meta charset="UTF-8" />
      <title>Login success</title>
    </head>
    <body>
      <script>
        document.addEventListener('DOMContentLoaded', function () {
          const token = "${customToken}";
          const origin = "${process.env.NEXT_PUBLIC_FRONTEND_ORIGIN || '*'}";

          if (window.opener) {
            window.opener.postMessage({ customToken: token }, origin);
            window.close();
          } else {
            // fallback
            localStorage.setItem('telegramAuthToken', token);
            document.body.innerHTML =
              '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; flex-direction: column;">' +
              '<h2>Login success</h2>' +
              '<p>close window and return to PancakeSwap.</p>' +
              '<button onclick="window.close()" style="padding: 10px 20px; background: #1FC7D4; color: white; border: none; border-radius: 16px; cursor: pointer; margin-top: 20px;">close window</button>' +
              '</div>';
          }
        });
      </script>
    </body>
  </html>
    `)
  } catch (err) {
    console.error('[Telegram callback error]:', err)
    res.status(500).json({ error: 'Telegram authentication failed' })
  }
}
