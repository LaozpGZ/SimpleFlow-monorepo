export default function handler(req, res) {
  const { id } = req.query

  const disabledIds = process.env.DISABLED_PM_ADD_LIQUIDITY_IDS?.split(',') || []

  if (!id) {
    return res.status(400).json({ error: 'Missing ID' })
  }

  const isDisabled = disabledIds.includes(id)

  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=59')

  return res.status(200).json({ disableAddingLiquidity: isDisabled })
}
