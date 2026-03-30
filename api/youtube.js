export default async function handler(req, res) {
  const channelId = req.query.channelId;
  if (!channelId) return res.status(400).json({ error: 'channelId required' });

  try {
    const response = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`
    );
    const xml = await response.text();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch {
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
}
