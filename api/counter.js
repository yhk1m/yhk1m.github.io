const SUPA_URL = 'https://lufbotdmhgsuvejlytgh.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1ZmJvdGRtaGdzdXZlamx5dGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMDY1NzUsImV4cCI6MjA4MTg4MjU3NX0.JMzU8SiR8jb39xcRe4ySQSvZJButJP8OeCqOMDkNbRI';
const headers = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' };

export default async function handler(req, res) {
  const action = req.query.action;

  // POST: record a visit
  if (req.method === 'POST' && action !== 'daily') {
    const visitorId = req.body?.visitorId || 'anonymous';
    await fetch(`${SUPA_URL}/rest/v1/page_views`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({ visitor_id: visitorId, site: 'hub' }),
    });
  }

  // GET daily stats
  if (action === 'daily') {
    const days = parseInt(req.query.days) || 30;
    const resp = await fetch(`${SUPA_URL}/rest/v1/rpc/get_daily_counts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ p_site: 'hub', p_days: days }),
    });
    const data = await resp.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(data || []);
  }

  // Default: return today/total counts
  const resp = await fetch(`${SUPA_URL}/rest/v1/rpc/get_visitor_counts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ p_site: 'hub' }),
  });
  const data = await resp.json();
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.status(200).json(data);
}
