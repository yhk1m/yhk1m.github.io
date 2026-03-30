const SUPA_URL = 'https://lufbotdmhgsuvejlytgh.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1ZmJvdGRtaGdzdXZlamx5dGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMDY1NzUsImV4cCI6MjA4MTg4MjU3NX0.JMzU8SiR8jb39xcRe4ySQSvZJButJP8OeCqOMDkNbRI';
const headers = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' };

// 이 날짜 이후의 방문만 카운트 (카운터 리셋 날짜)
const RESET_DATE = '2026-03-31';

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
    let data = await resp.json();
    // 리셋 날짜 이전 데이터 필터링
    if (Array.isArray(data)) {
      data = data.filter(d => d.visit_date >= RESET_DATE);
    }
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(data || []);
  }

  // Default: return today/total counts (리셋 날짜 이후만 카운트)
  const todayStr = new Date().toISOString().slice(0, 10);

  // Total: 리셋 날짜 이후 전체 방문 수
  const totalResp = await fetch(
    `${SUPA_URL}/rest/v1/page_views?site=eq.hub&visited_at=gte.${RESET_DATE}T00:00:00Z&select=id`,
    { method: 'GET', headers: { ...headers, Prefer: 'count=exact' } }
  );
  const totalCount = parseInt(totalResp.headers.get('content-range')?.split('/')[1]) || 0;

  // Today: 오늘 방문 수
  const todayResp = await fetch(
    `${SUPA_URL}/rest/v1/page_views?site=eq.hub&visit_date=eq.${todayStr}&visited_at=gte.${RESET_DATE}T00:00:00Z&select=id`,
    { method: 'GET', headers: { ...headers, Prefer: 'count=exact' } }
  );
  const todayCount = parseInt(todayResp.headers.get('content-range')?.split('/')[1]) || 0;

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.status(200).json({ today: todayCount, total: totalCount });
}
