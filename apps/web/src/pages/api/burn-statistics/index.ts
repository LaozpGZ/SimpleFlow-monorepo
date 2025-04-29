import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT || '',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    })

    const command = new GetObjectCommand({
      Bucket: 'burn-statistics',
      Key: 'data.json',
    })

    const result = await s3Client.send(command)
    const data = await result.Body?.transformToString()

    if (!data) {
      return res.status(500).json({ error: 'No data found' })
    }

    // Cache response
    res.setHeader('Cache-Control', 'max-age=60, s-maxage=3600, stale-while-revalidate=60')

    return res.status(200).json(JSON.parse(data))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: `An error occurred while fetching burn statistics ${error}` })
  }
}

export default handler
