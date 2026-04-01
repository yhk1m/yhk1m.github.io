const { useState, useEffect, useRef, useCallback } = React;

// ===== Utilities =====
const ls = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('hub_' + k)) ?? d; } catch { return d; } },
  set(k, v) { localStorage.setItem('hub_' + k, JSON.stringify(v)); }
};

function useStore(key, initial) {
  const [val, setVal] = useState(() => ls.get(key, initial));
  useEffect(() => { ls.set(key, val); }, [key, val]);
  return [val, setVal];
}

const today = () => new Date().toISOString().slice(0, 10);
const WEEKDAYS = ['일','월','화','수','목','금','토'];
const MOODS = [{icon:'😊',label:'좋음'},{icon:'😌',label:'평온'},{icon:'😐',label:'보통'},{icon:'😢',label:'슬픔'},{icon:'😡',label:'화남'}];

const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const diffDays = (target) => {
  const d = new Date(target); d.setHours(0,0,0,0);
  const now = new Date(); now.setHours(0,0,0,0);
  return Math.ceil((d - now) / 86400000);
};

// ===== Main Page Defaults =====
const DEFAULT_HERO = {
  label:'Geography Teacher · Developer · Creator',
  name:'Yonghyun Kim', nameSub:'김용현',
  desc:'지리 교육의 디지털 전환을 만들어갑니다.\n수업 현장의 필요에서 시작해, 교육용 웹 애플리케이션을 직접 설계하고 개발합니다.',
  tags:['양정고등학교 지리교사','EdTech 개발','파노라마 모의고사','비그늘 YouTube'],
};
const DEFAULT_PROJECTS = [
  {name:'GeoStatAtlas',icon:'🌍',desc:'세계 통계 지도 시각화 플랫폼. Robinson·Miller 투영법, 경제 블록 오버레이, Köppen 기후 필터링 등 수업용 인터랙티브 지도 제공.',tech:['D3.js','Leaflet','GAS','Google Sheets'],url:'https://geostatlas.yhk1m.kr'},
  {name:'GeoTester',icon:'📝',desc:'지리 시험 문제 자동 생성기. Canvas 기반 그래프 렌더링, 좌표 변환, 모듈식 문항 아키텍처로 다양한 유형의 문제를 생성.',tech:['Canvas API','GAS','EPSG:5179'],url:'https://geotester.yhk1m.kr'},
  {name:'GeoGrapher',icon:'📊',desc:'지리 그래프 생성기. 6종 차트 타입, CSV 업로드, Google Sheets 연동, 한/영 UI 지원으로 수업 자료 제작에 최적화.',tech:['Canvas','Chart.js','CSV'],url:'https://geographer.yhk1m.kr'},
  {name:'LatLong Finder',icon:'📍',desc:'위경도 탐색 지도 도구. 12색 마커, 위경도 격자 오버레이, DMS/Decimal 전환, CSV·PNG 내보내기, TopoJSON 세계지도.',tech:['Leaflet.js','TopoJSON'],url:'https://latlongfinder.yhk1m.kr'},
  {name:'GeoGameCenter',icon:'🎮',desc:'지리 게임 플랫폼. GeoPuzzle 드래그앤드롭 퍼즐, GeoQuizBattle 팀 퀴즈 대결 등 게이미피케이션 기반 학습 도구.',tech:['Firebase','GeoJSON','Realtime DB'],url:'https://geogamecenter.yhk1m.kr'},
  {name:'BokdoRoad',icon:'🏫',desc:'임용시험 기출문제 검색 플랫폼. 복도길만 걸으세요 — 전 과목 임용 기출 아카이브를 목표로 개발 중.',tech:['Coming Soon'],url:'https://bokdoroad.yhk1m.kr'},
  {name:'통사랑',icon:'🔍',desc:'수능 사회탐구 기출문제 검색 플랫폼. 연도별·단원별 검색, 해설 연동으로 수능 대비 학습을 지원.',tech:['GAS','Google Sheets'],url:'https://tongsarang.kr'},
  {name:'e-GIS',icon:'🗺️',desc:'교육용 GIS 플랫폼. OpenLayers 기반 공간 데이터 시각화, Supabase/PostGIS 연동으로 지리 수업에서 실제 GIS를 체험.',tech:['OpenLayers','Supabase','PostGIS'],url:'https://e-gis.kr'},
];
const DEFAULT_BIO = {
  paragraphs:[
    '현직 고등학교 지리교사로서 수업 현장에서 느끼는 불편함을 기술로 해결합니다. "이런 도구가 있으면 좋겠다"는 생각에서 시작해, 직접 설계하고 개발하여 실제 수업에 적용하고 있습니다.',
    'GAS, JavaScript, D3.js, Leaflet.js 등을 활용한 교육용 웹 애플리케이션 개발에 깊은 경험을 갖고 있으며, 한국지도학회·지리교육학회 등 학술대회에서 연구 결과를 발표해왔습니다.',
    '파노라마 모의고사 발행을 통해 평가 콘텐츠를 제작하고, 비그늘 유튜브 채널을 통해 경제·교육 콘텐츠를 공유하고 있습니다.',
  ],
  stats:[
    {number:'8+',label:'Education Web Apps'},
    {number:'2',label:'도메인 서비스 운영'},
    {number:'D3 · Leaflet',label:'Core Tech Stack'},
    {number:'GAS',label:'Primary Platform'},
  ],
  timeline:[
    {date:'2026.03',title:'개인 허브 웹페이지 개발',desc:'스케줄링, 포트폴리오, 도구함을 통합한 개인 웹 플랫폼 구축'},
    {date:'2025.06',title:'Geolgo — 한국지리올림피아드 시스템',desc:'ECharts 시각화, PDF/Excel 출력 기능 개발'},
    {date:'2025.03',title:'통사랑 — 사회 기출문제 검색',desc:'수능 사회탐구 기출문제 검색 및 PDF 출력 플랫폼'},
    {date:'2024.12',title:'e-GIS — 교육용 GIS 플랫폼',desc:'OpenLayers 기반 공간 데이터 시각화'},
    {date:'2024.09',title:'GIS 데이터 처리 가이드 발행',desc:'DEM, Slope, Aspect 등 지형 분석 실전 가이드'},
    {date:'2023',title:'콘텐츠 크리에이터 활동 시작',desc:'유튜브, 블로그를 통한 지식 공유 및 커뮤니티 형성'},
  ],
};
const DEFAULT_YOUTUBE = {name:'비그늘 BGNL',handle:'@bgnlkr',channelId:'UC7BJiTmOsxfK9ItbRKaw1Mg',desc:'경제와 교육을 주제로 깊이 있는 콘텐츠를 만듭니다. 복잡한 개념을 명확하게, 교과서 너머의 시선으로 풀어냅니다.',url:'https://youtube.com/@bgnlkr'};
const DEFAULT_CONTACTS = [
  {icon:'📸',label:'Instagram',value:'@yhk1m',url:'https://instagram.com/yhk1m'},
  {icon:'📝',label:'Blog',value:'rainshadow21',url:'https://blog.naver.com/rainshadow21'},
  {icon:'🎬',label:'YouTube',value:'비그늘 BGNL',url:'https://youtube.com/@bgnlkr'},
  {icon:'✉️',label:'Email',value:'rainshadow21@naver.com',url:'mailto:rainshadow21@naver.com'},
];

// ===== Navigation =====
function Nav({ page, setPage, dark, setDark, section, setSection, lang, visitorCounts }) {
  const [open, setOpen] = useState(false);
  const privatePages = [
    { id:'dashboard', label:'대시보드', icon:'📊' },
    { id:'main-edit', label:'메인 편집', icon:'🎨' },
    { id:'tools', label:'도구함', icon:'🛠️' },
    { id:'diary', label:'일기', icon:'📝' },
    { id:'pdfs', label:'자료실', icon:'📂' },
    { id:'write', label:'글쓰기', icon:'✍️' },
  ];

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <div className="nav-logo" onClick={() => { setPage(section === 'public' ? 'portfolio' : 'dashboard'); setOpen(false); }}>
          <img src={window.HUB_LANG==='en'?'../favicon.svg':'favicon.svg'} alt="" className="nav-logo-icon" />
          <span className="nav-logo-text">BGNL.kr</span>
          {section === 'private' && <span className="nav-section-badge">PRIVATE</span>}
        </div>
        {section === 'public' && (
          <div className="nav-scroll-links">
            {[{l:'Bio',id:'bio'},{l:'Geo',id:'geo'},{l:'Notes',id:'notes'},{l:'Lab',id:'lab'},{l:'YouTube',id:'youtube'},{l:'Contact',id:'contact'}].map(s => (
              <span key={s.id} className="nav-scroll-link" onClick={() => document.getElementById('s-'+s.id)?.scrollIntoView({behavior:'smooth'})}>
                {s.id === 'youtube' || s.id === 'contact' ? s.l : <>{<span className="nav-scroll-initial">{s.l[0]}</span>}{s.l.slice(1)}</>}
              </span>
            ))}
          </div>
        )}
        {section === 'private' && (
          <div className={`nav-links ${open ? 'open' : ''}`}>
            {privatePages.map(p => (
              <button key={p.id} className={`nav-link ${page===p.id?'active':''}`}
                onClick={() => { setPage(p.id); setOpen(false); }}>
                <span className="nav-icon">{p.icon}</span><span>{p.label}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-sm align-center">
          {section === 'public' && visitorCounts && (
            <div className="nav-visitor-counter">
              <span className="nav-vc-item">Today <strong>{visitorCounts.today}</strong></span>
              <span className="nav-vc-divider">|</span>
              <span className="nav-vc-item">Total <strong>{visitorCounts.total}</strong></span>
            </div>
          )}
          {section === 'public' && (
            <a className="lang-toggle" href={lang === 'ko' ? 'en/' : '../'}>
              {lang === 'ko' ? 'EN' : 'KR'}
            </a>
          )}
          {section === 'private' && (
            <button className="lang-toggle" onClick={() => { setSection('public'); setPage('portfolio'); setOpen(false); history.replaceState(null,'',location.pathname); sessionStorage.removeItem('hub_private_auth'); }}>
              PUBLIC
            </button>
          )}
          <button className="theme-toggle" onClick={() => setDark(!dark)}>{dark ? '☀️' : '🌙'}</button>
          {section === 'private' && (
            <button className="mobile-toggle" onClick={() => setOpen(!open)}>{open ? '✕' : '☰'}</button>
          )}
        </div>
      </div>
    </nav>
  );
}

// ===== Dashboard: Quick Stats =====
function QuickStats({ todos, ideas, habits, goals }) {
  const d = new Date();
  const greeting = d.getHours() < 12 ? '좋은 아침이에요' : d.getHours() < 18 ? '좋은 오후에요' : '좋은 저녁이에요';
  const doneTodos = todos.filter(t => t.done).length;
  return (
    <div className="card">
      <div className="card-body">
        <h3 style={{fontSize:'1.25rem',marginBottom:16}}>{greeting} 👋</h3>
        <p className="text-muted text-sm" style={{marginBottom:20}}>
          {d.toLocaleDateString('ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'long'})}
        </p>
        <div className="grid grid-2 gap-sm">
          <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-number">{doneTodos}/{todos.length}</div><div className="stat-label">할 일</div></div>
          <div className="stat-card"><div className="stat-icon">💡</div><div className="stat-number">{ideas.length}</div><div className="stat-label">아이디어</div></div>
          <div className="stat-card"><div className="stat-icon">🔥</div><div className="stat-number">{Object.values(habits).flat().filter(Boolean).length}</div><div className="stat-label">습관 달성</div></div>
          <div className="stat-card"><div className="stat-icon">🎯</div><div className="stat-number">{goals.filter(g=>g.progress>=100).length}/{goals.length}</div><div className="stat-label">목표 달성</div></div>
        </div>
      </div>
    </div>
  );
}

// ===== Dashboard: Calendar =====
function Calendar() {
  const [viewDate, setViewDate] = useState(new Date());
  const [events, setEvents] = useStore('events', []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', date:'', category:'일반' });

  const y = viewDate.getFullYear(), m = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(y, m);
  const firstDay = new Date(y, m, 1).getDay();
  const now = new Date();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  const isToday = d => d === now.getDate() && m === now.getMonth() && y === now.getFullYear();
  const hasEvent = d => events.some(e => { const ed = new Date(e.date); return ed.getDate()===d && ed.getMonth()===m && ed.getFullYear()===y; });

  const addEvent = () => {
    if (!form.title || !form.date) return;
    setEvents([...events, { ...form, id: Date.now() }]);
    setForm({ title:'', date:'', category:'일반' });
    setShowForm(false);
  };

  const monthEvents = events.filter(e => { const ed = new Date(e.date); return ed.getMonth()===m && ed.getFullYear()===y; })
    .sort((a,b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">📅 캘린더</h3>
        <div className="flex gap-sm">
          <button className="btn btn-icon btn-sm" onClick={() => setViewDate(new Date(y, m-1))}>◀</button>
          <span className="text-sm text-bold">{y}년 {m+1}월</span>
          <button className="btn btn-icon btn-sm" onClick={() => setViewDate(new Date(y, m+1))}>▶</button>
        </div>
      </div>
      <div className="card-body">
        <div className="calendar-grid">
          {WEEKDAYS.map(d => <div key={d} className="calendar-weekday">{d}</div>)}
          {cells.map((d, i) => (
            <div key={i} className={`calendar-day${d?'':' empty'}${d&&isToday(d)?' today':''}${d&&hasEvent(d)?' has-event':''}`}>{d}</div>
          ))}
        </div>
        <div className="mt-md flex-between">
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ 일정 추가</button>
        </div>
        {showForm && (
          <div className="mt-sm fade-in">
            <input className="input" placeholder="일정 제목" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
            <input className="input mt-sm" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
            <div className="input-row mt-sm">
              <select className="select" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                <option>일반</option><option>업무</option><option>개인</option><option>중요</option>
              </select>
              <button className="btn btn-primary" onClick={addEvent}>저장</button>
            </div>
          </div>
        )}
        {monthEvents.length > 0 && <div className="mt-md">{monthEvents.map(e => (
          <div key={e.id} className="event-item">
            <div className="flex gap-sm"><span className="badge">{e.category}</span><span>{new Date(e.date).getDate()}일 - {e.title}</span></div>
            <button className="btn btn-icon btn-sm btn-ghost" onClick={() => setEvents(events.filter(x=>x.id!==e.id))}>✕</button>
          </div>
        ))}</div>}
      </div>
    </div>
  );
}

// ===== Dashboard: Todo =====
function TodoList({ todos, setTodos }) {
  const [input, setInput] = useState('');
  const add = () => { if (!input.trim()) return; setTodos([...todos, {id:Date.now(), text:input.trim(), done:false}]); setInput(''); };
  const toggle = id => setTodos(todos.map(t => t.id===id ? {...t, done:!t.done} : t));
  const remove = id => setTodos(todos.filter(t => t.id!==id));

  return (
    <div className="card">
      <div className="card-header"><h3 className="card-title">✅ 할 일</h3><span className="badge">{todos.filter(t=>!t.done).length}개 남음</span></div>
      <div className="card-body">
        <div className="input-row">
          <input className="input" placeholder="할 일을 입력하세요" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} />
          <button className="btn btn-primary" onClick={add}>추가</button>
        </div>
        <div className="mt-md">
          {todos.length === 0 && <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-text">할 일을 추가해보세요</div></div>}
          {todos.map(t => (
            <div key={t.id} className="todo-item">
              <div className={`todo-check ${t.done?'done':''}`} onClick={()=>toggle(t.id)}>{t.done?'✓':''}</div>
              <span className={`todo-text ${t.done?'done':''}`}>{t.text}</span>
              <button className="btn btn-icon btn-sm btn-ghost" onClick={()=>remove(t.id)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== Dashboard: Ideas =====
function IdeasBoard({ ideas, setIdeas }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ content:'', tags:'' });
  const add = () => {
    if (!form.content.trim()) return;
    setIdeas([{ id:Date.now(), content:form.content.trim(), tags:form.tags.split(',').map(t=>t.trim()).filter(Boolean), date:today() }, ...ideas]);
    setForm({ content:'', tags:'' }); setShow(false);
  };

  return (
    <div className="card">
      <div className="card-header"><h3 className="card-title">💡 아이디어</h3><button className="btn btn-primary btn-sm" onClick={()=>setShow(!show)}>+ 기록</button></div>
      <div className="card-body">
        {show && (
          <div className="mb-md fade-in">
            <textarea className="textarea" placeholder="아이디어를 자유롭게 적어보세요..." value={form.content} onChange={e=>setForm({...form,content:e.target.value})} />
            <div className="input-row mt-sm">
              <input className="input" placeholder="태그 (쉼표로 구분)" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} />
              <button className="btn btn-primary" onClick={add}>저장</button>
            </div>
          </div>
        )}
        {ideas.length === 0 && <div className="empty-state"><div className="empty-state-icon">✨</div><div className="empty-state-text">첫 번째 아이디어를 기록해보세요</div></div>}
        {ideas.map(idea => (
          <div key={idea.id} className="idea-card">
            <div className="flex-between"><span className="text-sm text-muted">{idea.date}</span><button className="btn btn-icon btn-sm btn-ghost" onClick={()=>setIdeas(ideas.filter(i=>i.id!==idea.id))}>✕</button></div>
            <div className="idea-content mt-xs">{idea.content}</div>
            <div className="idea-tags">{idea.tags?.map((t,i) => <span key={i} className="badge">{t}</span>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Dashboard: Habit Tracker =====
function HabitTracker({ habits, setHabits }) {
  const [newHabit, setNewHabit] = useState('');
  const habitNames = useStore('habitNames', [])[0];
  const [names, setNames] = useStore('habitNames', []);

  const d = new Date();
  const weekDates = Array.from({length:7}, (_,i) => {
    const dt = new Date(d); dt.setDate(d.getDate() - d.getDay() + i);
    return dt.toISOString().slice(0,10);
  });

  const toggleHabit = (name, date) => {
    const key = `${name}_${date}`;
    setHabits({...habits, [key]: !habits[key]});
  };

  const addHabit = () => {
    if (!newHabit.trim() || names.includes(newHabit.trim())) return;
    setNames([...names, newHabit.trim()]);
    setNewHabit('');
  };

  return (
    <div className="card">
      <div className="card-header"><h3 className="card-title">🔥 습관 트래커</h3><span className="text-sm text-muted">이번 주</span></div>
      <div className="card-body">
        <div className="habit-header">
          {weekDates.map(dt => <span key={dt}>{WEEKDAYS[new Date(dt).getDay()]}</span>)}
        </div>
        {names.map(name => (
          <div key={name} className="habit-row">
            <span className="habit-label" title={name}>{name}</span>
            <div className="habit-cells">
              {weekDates.map(dt => {
                const key = `${name}_${dt}`;
                return <div key={dt} className={`habit-cell${habits[key]?' completed':''}`} onClick={()=>toggleHabit(name,dt)}>{habits[key]?'✓':new Date(dt).getDate()}</div>;
              })}
            </div>
            <button className="btn btn-icon btn-sm btn-ghost" onClick={()=>setNames(names.filter(n=>n!==name))}>✕</button>
          </div>
        ))}
        <div className="input-row mt-md">
          <input className="input" placeholder="새 습관 추가" value={newHabit} onChange={e=>setNewHabit(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addHabit()} />
          <button className="btn btn-sm" onClick={addHabit}>추가</button>
        </div>
      </div>
    </div>
  );
}

// ===== Dashboard: Goals =====
function GoalProgress({ goals, setGoals }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name:'', target:100, progress:0 });
  const add = () => {
    if (!form.name.trim()) return;
    setGoals([...goals, { ...form, id:Date.now() }]);
    setForm({ name:'', target:100, progress:0 }); setShow(false);
  };

  return (
    <div className="card">
      <div className="card-header"><h3 className="card-title">🎯 목표</h3><button className="btn btn-primary btn-sm" onClick={()=>setShow(!show)}>+ 추가</button></div>
      <div className="card-body">
        {show && (
          <div className="mb-md fade-in">
            <input className="input" placeholder="목표 이름" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            <div className="input-row mt-sm">
              <input className="input" type="number" placeholder="목표 (%)" value={form.target} onChange={e=>setForm({...form,target:+e.target.value})} />
              <button className="btn btn-primary" onClick={add}>저장</button>
            </div>
          </div>
        )}
        {goals.length === 0 && <div className="empty-state"><div className="empty-state-icon">🏔️</div><div className="empty-state-text">목표를 설정해보세요</div></div>}
        {goals.map(g => {
          const pct = Math.min(100, Math.round((g.progress / g.target) * 100));
          return (
            <div key={g.id} className="progress-item">
              <div className="progress-info">
                <span className="text-bold">{g.name}</span>
                <div className="flex gap-sm">
                  <span className="text-sm text-muted">{pct}%</span>
                  <button className="btn btn-icon btn-sm btn-ghost" onClick={()=>setGoals(goals.filter(x=>x.id!==g.id))}>✕</button>
                </div>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}} /></div>
              <input type="range" min="0" max={g.target} value={g.progress} style={{width:'100%',marginTop:6,accentColor:'var(--accent)'}}
                onChange={e => setGoals(goals.map(x => x.id===g.id ? {...x, progress:+e.target.value} : x))} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== Dashboard Page =====
function VisitorStats() {
  const [daily, setDaily] = useState([]);
  const [counts, setCounts] = useState({ today: 0, total: 0 });
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetch('/api/counter').then(r => r.json()).then(setCounts).catch(() => {});
    fetch(`/api/counter?action=daily&days=${days}`).then(r => r.json()).then(d => setDaily(d || [])).catch(() => {});
  }, [days]);

  const maxCount = Math.max(...daily.map(d => d.count), 1);

  return (
    <div className="card">
      <div className="card-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3 className="card-title">방문자 통계</h3>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <span className="text-sm" style={{color:'var(--text-muted)'}}>Today <strong style={{color:'var(--text)'}}>{counts.today}</strong></span>
          <span style={{opacity:0.3}}>|</span>
          <span className="text-sm" style={{color:'var(--text-muted)'}}>Total <strong style={{color:'var(--text)'}}>{counts.total}</strong></span>
        </div>
      </div>
      <div className="card-body">
        <div style={{display:'flex',gap:6,marginBottom:12}}>
          {[7,14,30].map(d => (
            <button key={d} className={`btn btn-sm ${days===d?'btn-primary':''}`} onClick={()=>setDays(d)} style={{fontSize:12,padding:'4px 10px'}}>{d}일</button>
          ))}
        </div>
        {daily.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-text">아직 방문 데이터가 없습니다</div></div>
        ) : (
          <div className="vs-chart">
            {daily.map(d => (
              <div key={d.date} className="vs-bar-col">
                <span className="vs-bar-count">{d.count}</span>
                <div className="vs-bar" style={{height:`${Math.max((d.count/maxCount)*120, 4)}px`}} />
                <span className="vs-bar-date">{new Date(d.date + 'T00:00:00').toLocaleDateString('ko-KR',{month:'numeric',day:'numeric'})}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const [todos, setTodos] = useStore('todos', []);
  const [ideas, setIdeas] = useStore('ideas', []);
  const [habits, setHabits] = useStore('habits', {});
  const [goals, setGoals] = useStore('goals', []);

  return (
    <div className="page container dashboard">
      <div className="page-header">
        <h1 className="page-title">대시보드</h1>
        <p className="text-muted">오늘 하루를 한눈에</p>
      </div>
      <div className="grid grid-3">
        <div className="col-span-2"><Calendar /></div>
        <QuickStats todos={todos} ideas={ideas} habits={habits} goals={goals} />
      </div>
      <div className="mt-lg"><VisitorStats /></div>
      <div className="grid grid-2 mt-lg">
        <TodoList todos={todos} setTodos={setTodos} />
        <IdeasBoard ideas={ideas} setIdeas={setIdeas} />
      </div>
      <div className="grid grid-2 mt-lg">
        <HabitTracker habits={habits} setHabits={setHabits} />
        <GoalProgress goals={goals} setGoals={setGoals} />
      </div>
    </div>
  );
}

// ===== Translations =====
const TEXTS = {
  ko: {
    filterAll: '전체',
    boardBack: '← 목록으로',
    boardTech: '기술 스택',
    boardLoading: '불러오는 중...',
  },
  en: {
    filterAll: 'All',
    boardBack: '← Back to list',
    boardTech: 'Tech Stack',
    boardLoading: 'Loading...',
  },
};

// ===== Visitor Counter =====
function VisitorCounter() {
  const [counts, setCounts] = useStore('visitors', { total: 0, today: 0, date: '' });

  useEffect(() => {
    const todayStr = today();
    const visited = sessionStorage.getItem('hub_visited');
    if (!visited) {
      sessionStorage.setItem('hub_visited', '1');
      setCounts(prev => ({
        total: prev.total + 1,
        today: prev.date === todayStr ? prev.today + 1 : 1,
        date: todayStr
      }));
    } else {
      setCounts(prev => prev.date !== todayStr ? { ...prev, today: 0, date: todayStr } : prev);
    }
  }, []);

  return (
    <div className="visitor-counter">
      <div className="visitor-stat">
        <span className="visitor-label">TODAY</span>
        <span className="visitor-count">{counts.today}</span>
      </div>
      <div className="visitor-divider" />
      <div className="visitor-stat">
        <span className="visitor-label">TOTAL</span>
        <span className="visitor-count">{counts.total}</span>
      </div>
    </div>
  );
}

// ===== Posts Loader =====
const postsBase = window.HUB_LANG === 'en' ? '../posts/' : 'posts/';

function usePosts(lang) {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetch(postsBase + 'index.json')
      .then(r => r.json())
      .then(data => {
        const mapped = data.map(p => ({
          id: p.id,
          cat: p.cat[lang] || p.cat['ko'],
          title: p.title[lang] || p.title['ko'],
          desc: p.desc[lang] || p.desc['ko'],
          date: p.date,
          file: p.file,
          tech: p.tech || [],
          links: p.links || [],
        }));
        setPosts(mapped);
      })
      .catch(() => {});
  }, [lang]);
  return posts;
}

function useVisitorCount() {
  const [counts, setCounts] = useState({ today: 0, total: 0 });
  useEffect(() => {
    let visitorId = localStorage.getItem('hub_visitor_id');
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem('hub_visitor_id', visitorId);
    }
    const visited = sessionStorage.getItem('hub_visited');
    if (!visited) {
      sessionStorage.setItem('hub_visited', '1');
      fetch('/api/counter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorId }) })
        .then(r => r.json()).then(setCounts).catch(() => {});
    } else {
      fetch('/api/counter').then(r => r.json()).then(setCounts).catch(() => {});
    }
  }, []);
  return counts;
}

function useYoutubeVideos(channelId, count = 3) {
  const [videos, setVideos] = useState([]);
  useEffect(() => {
    if (!channelId) return;
    fetch(`/api/youtube?channelId=${channelId}`)
      .then(r => r.text())
      .then(xml => {
        const doc = new DOMParser().parseFromString(xml, 'text/xml');
        const entries = doc.querySelectorAll('entry');
        const items = [];
        for (let i = 0; i < Math.min(entries.length, count); i++) {
          const e = entries[i];
          const videoId = e.querySelector('videoId')?.textContent;
          const title = e.querySelector('title')?.textContent;
          const published = e.querySelector('published')?.textContent;
          const thumb = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
          items.push({ videoId, title, published, thumb });
        }
        setVideos(items);
      })
      .catch(() => {});
  }, [channelId, count]);
  return videos;
}

// ===== Board Detail Component =====
function BoardDetail({ item, onBack, texts }) {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!item.file) { setLoading(false); return; }
    fetch(postsBase + item.file)
      .then(r => r.text())
      .then(md => {
        setHtml(marked.parse(md));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [item.file]);

  return (
    <div className="fade-in">
      <button className="btn btn-ghost mb-md" onClick={onBack}>{texts.boardBack}</button>
      <div className="card">
        <div className="card-body">
          <div className="board-detail-header">
            <span className="badge">{item.cat}</span>
            <span className="board-item-date">{item.date}</span>
          </div>
          <h1 className="board-detail-title">{item.title}</h1>
          <p className="board-detail-desc">{item.desc}</p>

          {item.links && item.links.length > 0 && (
            <div className="board-detail-links">
              {item.links.map((link, i) => (
                <a key={i} className="btn btn-sm" href={link.url} target="_blank" rel="noopener noreferrer" style={{borderBottom:'none'}}>{link.label} →</a>
              ))}
            </div>
          )}

          {item.tech && item.tech.length > 0 && (
            <div className="board-detail-section">
              <h3 className="board-detail-section-title">{texts.boardTech}</h3>
              <div className="skill-tags">
                {item.tech.map(t => <span key={t} className="skill-tag">{t}</span>)}
              </div>
            </div>
          )}

          <div className="board-detail-content">
            {loading
              ? <p className="text-muted">{texts.boardLoading}</p>
              : <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Board Component =====
function Board({ items, filterAll, texts }) {
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const categories = [...new Set(items.map(i => i.cat))];
  const filtered = filter === 'all' ? items : items.filter(i => i.cat === filter);
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  const selectedItem = items.find(i => i.id === selectedId);
  if (selectedItem) {
    return <BoardDetail item={selectedItem} onBack={() => setSelectedId(null)} texts={texts} />;
  }

  const catIcon = (cat) => {
    if (cat === '프로그램' || cat === 'Program') return '🔬';
    if (cat === '지리' || cat === 'Geography') return '🌍';
    return '📝';
  };

  return (
    <div className="fade-in">
      {categories.length > 1 && (
        <div className="board-filters">
          <button className={`board-filter ${filter==='all'?'active':''}`} onClick={()=>setFilter('all')}>
            {filterAll} ({items.length})
          </button>
          {categories.map(cat => (
            <button key={cat} className={`board-filter ${filter===cat?'active':''}`} onClick={()=>setFilter(cat)}>
              {cat} ({items.filter(i=>i.cat===cat).length})
            </button>
          ))}
        </div>
      )}
      {sorted.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <div className="empty-state-text">아직 게시물이 없습니다</div>
        </div>
      )}
      <div className="board-grid">
        {sorted.map(item => (
          <div key={item.id} className="board-card" onClick={() => setSelectedId(item.id)}>
            <div className="board-card-thumb">
              <span className="board-card-icon">{catIcon(item.cat)}</span>
            </div>
            <div className="board-card-body">
              <h3 className="board-card-title">{item.title}</h3>
              <p className="board-card-desc">{item.desc}</p>
              {item.tech && item.tech.length > 0 && (
                <div className="board-card-tech">
                  {item.tech.slice(0,4).map(t => <span key={t} className="tech-badge">{t}</span>)}
                </div>
              )}
              <div className="board-card-footer">
                <span className="board-card-date">{item.date}</span>
                {item.links && item.links.length > 0 && (
                  <div className="board-card-links">
                    {item.links.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()} className="board-card-link">{link.label} →</a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {sorted.length > 0 && <div className="board-count">{sorted.length} / {items.length}</div>}
    </div>
  );
}

// ===== Hero Globe Animation =====
function HeroGlobe() {
  const ref = useRef(null);

  useEffect(() => {
    let raf, angle = 127;
    const R = 178, N = 8;
    const toRad = d => d * Math.PI / 180;

    const ortho = (lon, lat, cLon) => {
      const l = toRad(lon), p = toRad(lat), l0 = toRad(cLon);
      if (Math.cos(p) * Math.cos(l - l0) < 0) return null;
      return [200 + R * Math.cos(p) * Math.sin(l - l0), 200 - R * Math.sin(p)];
    };

    const tick = () => {
      const svg = ref.current;
      if (!svg) { raf = requestAnimationFrame(tick); return; }
      angle = (angle + 0.04) % 360;
      const cLon = angle;
      const a = toRad(angle);

      // Longitude ellipses
      for (let i = 0; i < N; i++) {
        const el = svg.querySelector('#lon' + i);
        if (!el) continue;
        const phi = (i * Math.PI / (N / 2)) + a;
        el.setAttribute('rx', Math.max(Math.abs(R * Math.cos(phi)), 0.5));
        el.setAttribute('opacity', Math.abs(Math.cos(phi)) * 0.7 + 0.3);
      }

      // Seoul marker (37°N, 127°E)
      const m = svg.querySelector('#gm'), mp = svg.querySelector('#gmp');
      if (m && mp) {
        const pos = ortho(127, 37, cLon);
        if (pos) {
          m.setAttribute('cx', pos[0]); m.setAttribute('cy', pos[1]);
          mp.setAttribute('cx', pos[0]); mp.setAttribute('cy', pos[1]);
          m.style.opacity = 1; mp.style.opacity = 1;
        } else {
          m.style.opacity = 0; mp.style.opacity = 0;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const timer = setTimeout(() => { raf = requestAnimationFrame(tick); }, 2500);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
  }, []);

  const R = 178, N = 8;
  return (
    <svg ref={ref} className="hero-globe" viewBox="0 0 400 400" aria-hidden="true">
      <defs><clipPath id="gc"><circle cx="200" cy="200" r="176"/></clipPath></defs>
      <circle cx="200" cy="200" r="178" className="gl gl-outer"/>
      <g clipPath="url(#gc)">
        <line x1="0" y1="200" x2="400" y2="200" className="gl gl-lat" style={{animationDelay:'0.8s'}}/>
        <line x1="10" y1="140" x2="390" y2="140" className="gl gl-lat" style={{animationDelay:'1.0s'}}/>
        <line x1="50" y1="80" x2="350" y2="80" className="gl gl-lat" style={{animationDelay:'1.2s'}}/>
        <line x1="10" y1="260" x2="390" y2="260" className="gl gl-lat" style={{animationDelay:'1.1s'}}/>
        <line x1="50" y1="320" x2="350" y2="320" className="gl gl-lat" style={{animationDelay:'1.3s'}}/>
        {Array.from({length: N}, (_, i) => {
          const phi = i * Math.PI / (N / 2);
          return <ellipse key={i} id={'lon' + i} cx="200" cy="200" rx={Math.max(Math.abs(R * Math.cos(phi)), 0.5)} ry={R}
            className="gl gl-lon" style={{animationDelay: 0.4 + i * 0.1 + 's'}} />;
        })}
      </g>
      <circle id="gm" cx="200" cy="93" r="5" className="gl-marker"/>
      <circle id="gmp" cx="200" cy="93" r="12" className="gl-pulse"/>
    </svg>
  );
}

// ===== Portfolio Page (Scroll Layout) =====
function Portfolio({ lang = 'ko' }) {
  const t = TEXTS[lang];
  const posts = usePosts(lang);
  const [selectedPost, setSelectedPost] = useState(null);

  const [hero] = useStore('mainHero', DEFAULT_HERO);
  const [projects] = useStore('mainProjects', DEFAULT_PROJECTS);
  const [bio] = useStore('mainBio', DEFAULT_BIO);
  const [youtube] = useStore('mainYoutube', DEFAULT_YOUTUBE);
  const ytVideos = useYoutubeVideos(youtube.channelId);
  const [contacts] = useStore('mainContacts', DEFAULT_CONTACTS);

  const [geoOrder] = useStore('geoPostOrder', []);
  const [notesOrder] = useStore('notesPostOrder', []);
  const sortByOrder = (list, order) => {
    if (!order.length) return list;
    const map = new Map(list.map(p => [p.id, p]));
    const sorted = order.filter(id => map.has(id)).map(id => map.get(id));
    list.forEach(p => { if (!order.includes(p.id)) sorted.push(p); });
    return sorted;
  };
  const geoPosts = sortByOrder(posts.filter(p => p.cat === '지리' || p.cat === 'Geography'), geoOrder);
  const notesPosts = sortByOrder(posts.filter(p => p.cat === '글' || p.cat === 'Article'), notesOrder);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const siblings = Array.from(el.parentElement.children).filter(c =>
            c.classList.contains(el.className.split(' ')[0])
          );
          const i = siblings.indexOf(el);
          setTimeout(() => el.classList.add('visible'), i * 80);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.s-project-card, .s-post-card, .s-stat-card, .s-contact-card, .s-youtube-card, .s-yt-video-card').forEach(el => {
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [posts, selectedPost, ytVideos]);

  if (selectedPost) {
    return (
      <div className="page container" style={{paddingTop:96}}>
        <BoardDetail item={selectedPost} onBack={() => setSelectedPost(null)} texts={t} />
      </div>
    );
  }

  let sectionNum = 1;

  return (
    <div className="portfolio-scroll">
      {/* Hero */}
      <section className="s-hero">
        <HeroGlobe />
        <div className="container s-hero-content">
          <div className="s-hero-label">{hero.label}</div>
          <h1 className="s-hero-name">{hero.name}</h1>
          <p className="s-hero-name-sub">{hero.nameSub}</p>
          <p className="s-hero-desc">{hero.desc.split('\n').map((line, i) =>
            <React.Fragment key={i}>{line}{i < hero.desc.split('\n').length - 1 && <br/>}</React.Fragment>
          )}</p>
          <div className="s-hero-tags">
            {hero.tags.map((tag, i) => <span key={i} className="s-hero-tag">{tag}</span>)}
          </div>
        </div>
      </section>

      {/* 01 Bio */}
      <section className="s-section" id="s-bio">
        <div className="container">
          <div className="s-section-header">
            <span className="s-section-num">0{sectionNum++}</span>
            <h2 className="s-section-title"><span className="tab-initial">B</span>iography</h2>
            <div className="s-section-line" />
          </div>
          <div className="s-about-content">
            <div className="s-about-text">
              {bio.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div className="s-about-stats">
              {bio.stats.map((s, i) => (
                <div key={i} className="s-stat-card"><div className="s-stat-number">{s.number}</div><div className="s-stat-label">{s.label}</div></div>
              ))}
            </div>
          </div>
          {bio.timeline && bio.timeline.length > 0 && (
            <div className="s-timeline mt-lg">
              {bio.timeline.map((item, i) => (
                <div key={i} className="s-timeline-item">
                  <div className="s-timeline-date">{item.date}</div>
                  <div className="s-timeline-dot" />
                  <div className="s-timeline-body">
                    <div className="s-timeline-title">{item.title}</div>
                    <div className="s-timeline-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 02 Geo (if posts exist) */}
      {geoPosts.length > 0 && (
        <section className="s-section" id="s-geo">
          <div className="container">
            <div className="s-section-header">
              <span className="s-section-num">0{sectionNum++}</span>
              <h2 className="s-section-title"><span className="tab-initial">G</span>eography</h2>
              <div className="s-section-line" />
            </div>
            <div className="s-projects-grid">
              {geoPosts.map(item => (
                <div key={item.id} className="s-post-card" onClick={() => setSelectedPost(item)}>
                  <div className="s-card-header-row"><div className="s-project-icon">🌍</div><h3 className="s-project-name">{item.title}</h3></div>
                  <p className="s-project-desc">{item.desc}</p>
                  {item.tech && item.tech.length > 0 && (
                    <div className="s-project-tech">{item.tech.map(t => <span key={t}>{t}</span>)}</div>
                  )}
                  <div className="s-project-date">{item.date}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 03 Notes (if posts exist) */}
      {notesPosts.length > 0 && (
        <section className="s-section" id="s-notes">
          <div className="container">
            <div className="s-section-header">
              <span className="s-section-num">0{sectionNum++}</span>
              <h2 className="s-section-title"><span className="tab-initial">N</span>otes</h2>
              <div className="s-section-line" />
            </div>
            <div className="s-projects-grid">
              {notesPosts.map(item => (
                <div key={item.id} className="s-post-card" onClick={() => setSelectedPost(item)}>
                  <div className="s-card-header-row"><div className="s-project-icon">📝</div><h3 className="s-project-name">{item.title}</h3></div>
                  <p className="s-project-desc">{item.desc}</p>
                  <div className="s-project-date">{item.date}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 04 Labs */}
      <section className="s-section" id="s-lab">
        <div className="container">
          <div className="s-section-header">
            <span className="s-section-num">0{sectionNum++}</span>
            <h2 className="s-section-title"><span className="tab-initial">L</span>aboratory</h2>
            <div className="s-section-line" />
          </div>
          <div className="s-projects-grid">
            {projects.map((p, i) => (
              <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="s-project-card" style={{borderBottom:'none'}}>
                <span className="s-project-arrow">↗</span>
                <div className="s-card-header-row"><div className="s-project-icon">{p.icon?.startsWith('data:') ? <img src={p.icon} alt="" style={{width:24,height:24,objectFit:'contain'}} /> : p.icon}</div><h3 className="s-project-name">{p.name}</h3></div>
                <p className="s-project-desc">{p.desc}</p>
                <div className="s-project-tech">
                  {p.tech.map(t => <span key={t}>{t}</span>)}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* YouTube */}
      <section className="s-section" id="s-youtube">
        <div className="container">
          <div className="s-section-header">
            <span className="s-section-num">0{sectionNum++}</span>
            <h2 className="s-section-title">YouTube</h2>
            <div className="s-section-line" />
          </div>
          <div className="s-youtube-card">
            <div className="s-yt-icon">▶</div>
            <div className="s-yt-info">
              <h3 className="s-yt-name">{youtube.name}</h3>
              <p className="s-yt-handle">{youtube.handle}</p>
              <p className="s-yt-desc">{youtube.desc}</p>
              <a href={youtube.url} target="_blank" rel="noopener noreferrer" className="s-yt-link">채널 방문하기 →</a>
            </div>
          </div>
          {ytVideos.length > 0 && (
            <div className="s-projects-grid" style={{marginTop:'2rem'}}>
              {ytVideos.map(v => (
                <a key={v.videoId} href={`https://www.youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noopener noreferrer" className="s-post-card s-yt-video-card" style={{textDecoration:'none',color:'inherit',borderBottom:'none'}}>
                  <div className="s-yt-thumb-wrap">
                    <img src={v.thumb} alt={v.title} className="s-yt-thumb" />
                    <div className="s-yt-play-overlay">▶</div>
                  </div>
                  <h3 className="s-project-name" style={{marginTop:'0.75rem'}}>{v.title}</h3>
                  <div className="s-project-date">{new Date(v.published).toLocaleDateString('ko-KR')}</div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact */}
      <section className="s-section" id="s-contact">
        <div className="container">
          <div className="s-section-header">
            <span className="s-section-num">0{sectionNum++}</span>
            <h2 className="s-section-title">Contact</h2>
            <div className="s-section-line" />
          </div>
          <div className="s-contact-grid">
            {contacts.map((c, i) => (
              <a key={i} href={c.url} target={c.url.startsWith('mailto')?undefined:'_blank'} rel="noopener noreferrer" className="s-contact-card" style={{borderBottom:'none'}}>
                <div className="s-contact-icon">{c.icon}</div>
                <div><div className="s-contact-label">{c.label}</div><div className="s-contact-value">{c.value}</div></div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ===== Tools: Pomodoro (Circular + Customizable) =====
function PomodoroTimer() {
  const WORK_PRESETS = [15, 25, 30, 45, 60];
  const BREAK_PRESETS = [5, 10, 15];

  const [workMin, setWorkMin] = useStore('pomoWork', 25);
  const [breakMin, setBreakMin] = useStore('pomoBreak', 5);
  const [customWork, setCustomWork] = useState('');
  const [customBreak, setCustomBreak] = useState('');
  const [totalTime, setTotalTime] = useState(() => workMin * 60);
  const [time, setTime] = useState(() => workMin * 60);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useStore('pomodoroSessions', 0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTime(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            const next = isBreak;
            if (!isBreak) setSessions(s => s + 1);
            setIsBreak(!isBreak);
            const newTotal = (!isBreak ? breakMin : workMin) * 60;
            setTotalTime(newTotal);
            return newTotal;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, isBreak, workMin, breakMin]);

  const selectWork = (m) => { setWorkMin(m); if (!running && !isBreak) { setTime(m*60); setTotalTime(m*60); } };
  const selectBreak = (m) => { setBreakMin(m); if (!running && isBreak) { setTime(m*60); setTotalTime(m*60); } };
  const applyCustom = () => {
    const w = parseInt(customWork); const b = parseInt(customBreak);
    if (w > 0) { setWorkMin(w); if (!running && !isBreak) { setTime(w*60); setTotalTime(w*60); } }
    if (b > 0) { setBreakMin(b); if (!running && isBreak) { setTime(b*60); setTotalTime(b*60); } }
    setCustomWork(''); setCustomBreak('');
  };
  const reset = () => { setRunning(false); const t = (isBreak ? breakMin : workMin) * 60; setTime(t); setTotalTime(t); };
  const switchMode = () => { setRunning(false); const next = !isBreak; setIsBreak(next); const t = (next ? breakMin : workMin) * 60; setTime(t); setTotalTime(t); };

  const mm = String(Math.floor(time / 60)).padStart(2, '0');
  const ss = String(time % 60).padStart(2, '0');

  // Circular progress SVG
  const R = 88, C = 2 * Math.PI * R;
  const progress = totalTime > 0 ? time / totalTime : 1;
  const offset = C * (1 - progress);

  return (
    <div className="card">
      <div className="card-header"><h3 className="card-title">🍅 포모도로</h3><span className="badge">{sessions}세션 완료</span></div>
      <div className="card-body">
        <div className="pomodoro">
          <div className="pomo-presets-wrap">
            <div className="pomo-setting">
              <div className="pomo-setting-label">집중 시간</div>
              <div className="pomo-presets">
                {WORK_PRESETS.map(m => (
                  <button key={m} className={`pomo-preset${workMin===m?' active':''}`} onClick={()=>selectWork(m)} disabled={running}>{m}분</button>
                ))}
              </div>
            </div>
            <div className="pomo-setting">
              <div className="pomo-setting-label">휴식 시간</div>
              <div className="pomo-presets">
                {BREAK_PRESETS.map(m => (
                  <button key={m} className={`pomo-preset${breakMin===m?' active':''}`} onClick={()=>selectBreak(m)} disabled={running}>{m}분</button>
                ))}
              </div>
            </div>
            <div className="pomo-custom">
              <div className="pomo-custom-row">
                <input className="pomo-custom-input" type="number" min="1" max="120" placeholder={workMin} value={customWork}
                  onChange={e=>setCustomWork(e.target.value)} disabled={running} />
                <span className="pomo-custom-label">분 집중</span>
                <input className="pomo-custom-input" type="number" min="1" max="60" placeholder={breakMin} value={customBreak}
                  onChange={e=>setCustomBreak(e.target.value)} disabled={running} />
                <span className="pomo-custom-label">분 휴식</span>
                <button className="btn btn-sm" onClick={applyCustom} disabled={running}>적용</button>
              </div>
            </div>
          </div>

          <div className="pomo-circle-wrap">
            <svg className="pomo-svg" viewBox="0 0 200 200">
              <circle className="pomo-track" cx="100" cy="100" r={R} />
              <circle className="pomo-progress" cx="100" cy="100" r={R}
                style={{ strokeDasharray: C, strokeDashoffset: offset }} />
            </svg>
            <div className="pomo-center">
              <div className="pomo-time">{mm}:{ss}</div>
              <div className="pomo-label">{isBreak ? '휴식' : '집중'}</div>
              <div className="pomo-sessions">{workMin}분 / {breakMin}분</div>
            </div>
          </div>

          <div className="pomodoro-controls">
            <button className={running ? 'btn' : 'btn btn-primary'} onClick={() => setRunning(!running)}>
              {running ? '일시정지' : '시작'}
            </button>
            <button className="btn" onClick={reset}>리셋</button>
            <button className="btn" onClick={switchMode}>
              {isBreak ? '집중 모드' : '휴식 모드'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Tools: D-Day =====
function DDayCounter() {
  const [items, setItems] = useStore('ddays', []);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name:'', date:'' });

  const add = () => {
    if (!form.name || !form.date) return;
    setItems([...items, { ...form, id:Date.now() }]);
    setForm({ name:'', date:'' }); setShow(false);
  };

  return (
    <div className="card">
      <div className="card-header"><h3 className="card-title">📆 D-Day</h3><button className="btn btn-primary btn-sm" onClick={()=>setShow(!show)}>+ 추가</button></div>
      <div className="card-body">
        {show && (
          <div className="mb-md fade-in">
            <input className="input" placeholder="이벤트 이름" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            <div className="input-row mt-sm">
              <input className="input" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
              <button className="btn btn-primary" onClick={add}>저장</button>
            </div>
          </div>
        )}
        {items.length === 0 && <div className="empty-state"><div className="empty-state-icon">📅</div><div className="empty-state-text">D-Day를 추가해보세요</div></div>}
        {items.sort((a,b) => new Date(a.date)-new Date(b.date)).map(item => {
          const d = diffDays(item.date);
          return (
            <div key={item.id} className="dday-item">
              <div>
                <div className="dday-name">{item.name}</div>
                <div className="dday-date">{item.date}</div>
              </div>
              <div className="flex gap-sm">
                <div className={`dday-count ${d < 0 ? 'past' : ''}`}>
                  {d === 0 ? 'D-Day!' : d > 0 ? `D-${d}` : `D+${Math.abs(d)}`}
                </div>
                <button className="btn btn-icon btn-sm btn-ghost" onClick={()=>setItems(items.filter(x=>x.id!==item.id))}>✕</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== Tools: Bookmarks =====
function BookmarkManager() {
  const [bookmarks, setBookmarks] = useStore('bookmarks', []);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title:'', url:'', category:'기타' });

  const add = () => {
    if (!form.title || !form.url) return;
    setBookmarks([...bookmarks, { ...form, id:Date.now() }]);
    setForm({ title:'', url:'', category:'기타' }); setShow(false);
  };

  const categories = [...new Set(bookmarks.map(b => b.category))];

  return (
    <div className="card">
      <div className="card-header"><h3 className="card-title">🔖 북마크</h3><button className="btn btn-primary btn-sm" onClick={()=>setShow(!show)}>+ 추가</button></div>
      <div className="card-body">
        {show && (
          <div className="mb-md fade-in">
            <input className="input" placeholder="제목" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
            <input className="input mt-sm" placeholder="URL" value={form.url} onChange={e=>setForm({...form,url:e.target.value})} />
            <div className="input-row mt-sm">
              <input className="input" placeholder="카테고리" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} />
              <button className="btn btn-primary" onClick={add}>저장</button>
            </div>
          </div>
        )}
        {categories.map(cat => (
          <div key={cat}>
            <div className="bookmark-category">{cat}</div>
            {bookmarks.filter(b=>b.category===cat).map(b => (
              <div key={b.id} className="bookmark-item" onClick={() => window.open(b.url, '_blank')}>
                <div className="bookmark-favicon">🔗</div>
                <span className="bookmark-title">{b.title}</span>
                <span className="bookmark-url">{b.url.replace(/^https?:\/\//,'').slice(0,30)}</span>
                <button className="btn btn-icon btn-sm btn-ghost" onClick={e=>{e.stopPropagation();setBookmarks(bookmarks.filter(x=>x.id!==b.id))}}>✕</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Tools: Reading List =====
function ReadingList() {
  const [books, setBooks] = useStore('books', []);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title:'', author:'', status:'want' });
  const statusLabels = { want:'읽고 싶은', reading:'읽는 중', read:'읽음' };

  const add = () => {
    if (!form.title) return;
    setBooks([...books, { ...form, id:Date.now() }]);
    setForm({ title:'', author:'', status:'want' }); setShow(false);
  };

  const cycleStatus = (id) => {
    const order = ['want','reading','read'];
    setBooks(books.map(b => {
      if (b.id !== id) return b;
      const idx = (order.indexOf(b.status) + 1) % order.length;
      return { ...b, status: order[idx] };
    }));
  };

  return (
    <div className="card">
      <div className="card-header"><h3 className="card-title">📚 독서 리스트</h3><button className="btn btn-primary btn-sm" onClick={()=>setShow(!show)}>+ 추가</button></div>
      <div className="card-body">
        {show && (
          <div className="mb-md fade-in">
            <input className="input" placeholder="책 제목" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
            <input className="input mt-sm" placeholder="저자" value={form.author} onChange={e=>setForm({...form,author:e.target.value})} />
            <div className="input-row mt-sm">
              <select className="select" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                <option value="want">읽고 싶은</option><option value="reading">읽는 중</option><option value="read">읽음</option>
              </select>
              <button className="btn btn-primary" onClick={add}>저장</button>
            </div>
          </div>
        )}
        {books.length === 0 && <div className="empty-state"><div className="empty-state-icon">📖</div><div className="empty-state-text">읽고 싶은 책을 추가해보세요</div></div>}
        {books.map(b => (
          <div key={b.id} className="book-item">
            <div className="book-cover">📖</div>
            <div className="book-info">
              <div className="book-title">{b.title}</div>
              <div className="book-author">{b.author}</div>
              <span className={`book-status ${b.status}`} onClick={()=>cycleStatus(b.id)} style={{cursor:'pointer'}}>
                {statusLabels[b.status]}
              </span>
            </div>
            <button className="btn btn-icon btn-sm btn-ghost" onClick={()=>setBooks(books.filter(x=>x.id!==b.id))}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Tools Page =====
function Tools() {
  return (
    <div className="page container tools-page">
      <div className="page-header">
        <h1 className="page-title">도구함</h1>
        <p className="text-muted">생산성을 높여주는 도구 모음</p>
      </div>
      <div className="grid grid-2">
        <PomodoroTimer />
        <DDayCounter />
      </div>
      <div className="grid grid-2 mt-lg">
        <BookmarkManager />
        <ReadingList />
      </div>
    </div>
  );
}

// ===== PDF Library Page =====
function PdfLibrary() {
  const [token] = useStore('gh_token', '');
  const [folders, setFolders] = useStore('pdf_folders', []);
  const [pdfs, setPdfs] = useStore('pdfs', []);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const fileRef = useRef(null);

  const ghApiPdf = async (path, method, body) => {
    const res = await fetch(`https://api.github.com/repos/yhk1m/yhk1m.github.io/contents/${path}`, {
      method,
      headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res;
  };

  const getFileSha = async (path) => {
    const res = await fetch(`https://api.github.com/repos/yhk1m/yhk1m.github.io/contents/${path}`, {
      headers: { 'Authorization': `token ${token}` },
    });
    if (res.ok) { const data = await res.json(); return data.sha; }
    return null;
  };

  const addFolder = () => {
    if (!newFolderName.trim()) return;
    const folder = { id: Date.now(), name: newFolderName.trim(), date: today() };
    setFolders(prev => [...prev, folder]);
    setNewFolderName('');
    setShowNewFolder(false);
    setMessage({ type:'success', text:`"${folder.name}" 폴더 생성 완료!` });
  };

  const deleteFolder = (folder) => {
    const filesInFolder = pdfs.filter(p => p.folderId === folder.id);
    const msg = filesInFolder.length > 0
      ? `"${folder.name}" 폴더와 안의 자료 ${filesInFolder.length}개를 모두 삭제하시겠습니까?`
      : `"${folder.name}" 폴더를 삭제하시겠습니까?`;
    if (!confirm(msg)) return;
    setPdfs(prev => prev.filter(p => p.folderId !== folder.id));
    setFolders(prev => prev.filter(f => f.id !== folder.id));
    if (currentFolder?.id === folder.id) setCurrentFolder(null);
  };

  const renameFolder = (folder) => {
    const newName = prompt('새 폴더 이름:', folder.name);
    if (!newName || !newName.trim() || newName === folder.name) return;
    setFolders(prev => prev.map(f => f.id === folder.id ? { ...f, name: newName.trim() } : f));
  };

  const handleUpload = async () => {
    if (!token) { setMessage({ type:'error', text:'GitHub 토큰을 먼저 설정해주세요. (글쓰기 페이지에서 설정)' }); return; }
    const file = fileRef.current?.files?.[0];
    if (!file) { setMessage({ type:'error', text:'파일을 선택해주세요.' }); return; }
    if (!file.name.endsWith('.pdf')) { setMessage({ type:'error', text:'PDF 파일만 업로드 가능합니다.' }); return; }
    if (file.size > 25 * 1024 * 1024) { setMessage({ type:'error', text:'25MB 이하 파일만 업로드 가능합니다.' }); return; }

    setUploading(true);
    setMessage(null);

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const safeName = file.name.replace(/[^a-zA-Z0-9가-힣._\-]/g, '_');
      const path = `pdfs/${Date.now()}_${safeName}`;
      const sha = await getFileSha(path);
      const body = { message: `Upload PDF: ${safeName}`, content: base64 };
      if (sha) body.sha = sha;

      const res = await ghApiPdf(path, 'PUT', body);
      if (!res.ok) throw new Error('업로드 실패');

      const url = `https://yhk1m.github.io/${path}`;
      const newPdf = {
        id: Date.now(),
        name: file.name,
        path,
        url,
        size: (file.size / 1024 / 1024).toFixed(1) + 'MB',
        folderId: currentFolder?.id || null,
        date: today(),
      };
      setPdfs(prev => [newPdf, ...prev]);
      fileRef.current.value = '';
      setMessage({ type:'success', text:`"${file.name}" 업로드 완료! 1-2분 후 열람 가능합니다.` });
    } catch (err) {
      setMessage({ type:'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const deletePdf = async (pdf) => {
    if (!confirm(`"${pdf.name}" 을(를) 삭제하시겠습니까?`)) return;
    if (token && pdf.path) {
      try {
        const sha = await getFileSha(pdf.path);
        if (sha) await ghApiPdf(pdf.path, 'DELETE', { message: `Delete PDF: ${pdf.name}`, sha });
      } catch {}
    }
    setPdfs(prev => prev.filter(p => p.id !== pdf.id));
    if (viewing?.id === pdf.id) setViewing(null);
  };

  const movePdf = (pdf) => {
    const options = [{ id: null, name: '(루트)' }, ...folders.filter(f => f.id !== pdf.folderId)];
    const names = options.map((f, i) => `${i}: ${f.name}`).join('\n');
    const choice = prompt(`이동할 폴더 번호를 입력하세요:\n${names}`);
    if (choice === null) return;
    const idx = parseInt(choice);
    if (isNaN(idx) || idx < 0 || idx >= options.length) return;
    setPdfs(prev => prev.map(p => p.id === pdf.id ? { ...p, folderId: options[idx].id } : p));
    setMessage({ type:'success', text:`"${pdf.name}" → "${options[idx].name}" 이동 완료` });
  };

  const currentPdfs = pdfs.filter(p => (p.folderId || null) === (currentFolder?.id || null));

  return (
    <div className="page container">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">자료실</h1>
          <p className="text-muted">PDF 파일을 업로드하고 열람합니다</p>
        </div>
      </div>

      {message && (
        <div className="card mb-md fade-in" style={{
          borderLeft: `3px solid ${message.type === 'error' ? '#c81e1e' : 'var(--text)'}`,
          background: message.type === 'error' ? 'rgba(200,30,30,0.04)' : 'var(--accent-light)',
        }}>
          <div className="card-body"><p className="text-sm">{message.text}</p></div>
        </div>
      )}

      {/* Upload */}
      <div className="card mb-md">
        <div className="card-header"><h3 className="card-title">📤 PDF 업로드{currentFolder ? ` → ${currentFolder.name}` : ''}</h3></div>
        <div className="card-body">
          <div className="pdf-upload-row">
            <input ref={fileRef} type="file" accept=".pdf" className="input" style={{flex:1}} />
            <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
              {uploading ? '업로드 중...' : '업로드'}
            </button>
          </div>
          <p className="text-sm text-muted" style={{marginTop:8}}>최대 25MB · GitHub Pages에 저장됩니다</p>
        </div>
      </div>

      {/* Viewer */}
      {viewing && (
        <div className="card mb-md fade-in">
          <div className="card-header flex-between">
            <h3 className="card-title" style={{margin:0}}>📄 {viewing.name}</h3>
            <button className="btn btn-sm" onClick={() => setViewing(null)}>✕ 닫기</button>
          </div>
          <div className="card-body" style={{padding:0}}>
            <iframe src={viewing.url} className="pdf-viewer-frame" title={viewing.name} />
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="card">
        <div className="card-header flex-between">
          <div className="flex gap-sm" style={{alignItems:'center'}}>
            <span className="pdf-breadcrumb-item" onClick={() => setCurrentFolder(null)}
              style={{cursor:'pointer', fontWeight: !currentFolder ? 700 : 400}}>
              📂 전체
            </span>
            {currentFolder && (
              <>
                <span className="text-muted">/</span>
                <span className="text-bold">📁 {currentFolder.name}</span>
              </>
            )}
          </div>
          <div className="flex gap-sm">
            <button className="btn btn-sm" onClick={() => setShowNewFolder(!showNewFolder)}>+ 새 폴더</button>
            <span className="badge">{currentPdfs.length}개</span>
          </div>
        </div>

        {showNewFolder && (
          <div className="card-body" style={{borderBottom:'1px solid var(--border-light)', paddingBottom:12}}>
            <div className="pdf-upload-row">
              <input className="input" placeholder="폴더 이름"
                value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addFolder()} style={{flex:1}} />
              <button className="btn btn-primary" onClick={addFolder}>만들기</button>
            </div>
          </div>
        )}

        <div className="card-body">
          {/* Folders (only show at root) */}
          {!currentFolder && folders.map(folder => (
            <div key={folder.id} className="pdf-list-item">
              <div style={{flex:1, minWidth:0, cursor:'pointer'}} onClick={() => setCurrentFolder(folder)}>
                <div className="text-sm text-bold">
                  📁 {folder.name}
                </div>
                <div className="flex gap-sm" style={{marginTop:4}}>
                  <span className="text-xs text-muted">{pdfs.filter(p => p.folderId === folder.id).length}개 자료</span>
                  <span className="text-xs text-muted">{folder.date}</span>
                </div>
              </div>
              <div className="flex gap-xs" style={{flexShrink:0}}>
                <button className="btn btn-sm" onClick={() => renameFolder(folder)} title="이름 변경">✏️</button>
                <button className="btn btn-icon btn-sm btn-danger" onClick={() => deleteFolder(folder)} title="삭제">🗑️</button>
              </div>
            </div>
          ))}

          {/* Files */}
          {currentPdfs.length === 0 && (!currentFolder ? folders.length === 0 : true) && (
            <div className="empty-state">
              <div className="empty-state-icon">📄</div>
              <div className="empty-state-text">등록된 자료가 없습니다</div>
            </div>
          )}
          {currentPdfs.map(pdf => (
            <div key={pdf.id} className="pdf-list-item">
              <div style={{flex:1, minWidth:0, cursor:'pointer'}} onClick={() => setViewing(pdf)}>
                <div className="text-sm text-bold" style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  📄 {pdf.name}
                </div>
                <div className="flex gap-sm" style={{marginTop:4}}>
                  <span className="text-xs text-muted">{pdf.date}</span>
                  {pdf.size && <span className="text-xs text-muted">{pdf.size}</span>}
                </div>
              </div>
              <div className="flex gap-xs" style={{flexShrink:0}}>
                <button className="btn btn-sm" onClick={() => setViewing(pdf)} title="보기">👁️</button>
                <button className="btn btn-sm" onClick={() => movePdf(pdf)} title="이동">📦</button>
                <a className="btn btn-sm" href={pdf.url} target="_blank" rel="noopener" title="새 탭">↗</a>
                <button className="btn btn-icon btn-sm btn-danger" onClick={() => deletePdf(pdf)} title="삭제">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== Diary Page =====
function Diary() {
  const [entries, setEntries] = useStore('diary', []);
  const [form, setForm] = useState({ content:'', mood:null, date: today() });

  const add = () => {
    if (!form.content.trim() || form.mood === null) return;
    setEntries([{ id:Date.now(), content:form.content.trim(), mood:form.mood, date:form.date }, ...entries]);
    setForm({ content:'', mood:null, date: today() });
  };

  // Mood stats for last 7 entries
  const moodCounts = MOODS.map((m, i) => entries.filter(e => e.mood === i).length);
  const maxCount = Math.max(1, ...moodCounts);

  return (
    <div className="page container diary-page">
      <div className="page-header">
        <h1 className="page-title">일기</h1>
        <p className="text-muted">하루를 기록하고 돌아보기</p>
      </div>
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header"><h3 className="card-title">✏️ 오늘의 기록</h3></div>
          <div className="card-body">
            <input className="input mb-sm" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
            <p className="text-sm text-muted mb-sm">오늘의 기분은?</p>
            <div className="mood-selector">
              {MOODS.map((m, i) => (
                <button key={i} className={`mood-btn ${form.mood===i?'selected':''}`} onClick={()=>setForm({...form,mood:i})} title={m.label}>
                  {m.icon}
                </button>
              ))}
            </div>
            <textarea className="textarea mt-sm" placeholder="오늘 하루는 어땠나요? 자유롭게 적어보세요..." rows={5}
              value={form.content} onChange={e=>setForm({...form,content:e.target.value})} />
            <button className="btn btn-primary mt-md" onClick={add} style={{width:'100%'}}>기록 저장</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">📊 감정 통계</h3><span className="text-sm text-muted">전체 {entries.length}개 기록</span></div>
          <div className="card-body">
            <div className="mood-stats">
              {MOODS.map((m, i) => (
                <div key={i} className="mood-stat-item">
                  <div className="mood-bar-bg">
                    <div className="mood-bar-fill" style={{height: `${(moodCounts[i]/maxCount)*100}%`}} />
                  </div>
                  <div className="mood-stat-label">{m.icon}<br/>{moodCounts[i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-lg">
        <div className="card-header"><h3 className="card-title">📒 기록 목록</h3></div>
        <div className="card-body">
          {entries.length === 0 && <div className="empty-state"><div className="empty-state-icon">📔</div><div className="empty-state-text">첫 번째 일기를 작성해보세요</div></div>}
          {entries.map(e => (
            <div key={e.id} className="entry-item">
              <div className="flex-between">
                <div className="flex gap-sm">
                  <span className="entry-mood">{MOODS[e.mood]?.icon}</span>
                  <span className="entry-date">{e.date} ({WEEKDAYS[new Date(e.date).getDay()]})</span>
                </div>
                <button className="btn btn-icon btn-sm btn-ghost" onClick={()=>setEntries(entries.filter(x=>x.id!==e.id))}>✕</button>
              </div>
              <div className="entry-preview">{e.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== Post Editor =====
function PostEditor() {
  const [token, setToken] = useStore('gh_token', '');
  const [showToken, setShowToken] = useState(false);
  const [tokenInput, setTokenInput] = useState('');

  const emptyForm = { title:'', cat:'프로그램', date: today(), desc:'', tech:'', body:'', links:'' };
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState(null);

  // Load existing posts for management
  const [posts, setPosts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [showMdGuide, setShowMdGuide] = useState(false);

  const loadPosts = useCallback(() => {
    fetch(postsBase + 'index.json')
      .then(r => r.json())
      .then(setPosts)
      .catch(() => {});
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const saveToken = () => {
    setToken(tokenInput);
    setTokenInput('');
    setShowToken(false);
    setMessage({ type:'success', text:'GitHub 토큰이 저장되었습니다.' });
  };

  const generateFilename = () => {
    const slug = form.title.toLowerCase()
      .replace(/[가-힣]+/g, m => m)
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9가-힣\-]/g, '')
      .slice(0, 40);
    return `${form.date.slice(0,7)}-${slug || 'untitled'}.md`;
  };

  const ghApi = async (path, method, body) => {
    const res = await fetch(`https://api.github.com/repos/yhk1m/yhk1m.github.io/contents/${path}`, {
      method,
      headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res;
  };

  const getFileSha = async (path) => {
    const res = await fetch(`https://api.github.com/repos/yhk1m/yhk1m.github.io/contents/${path}`, {
      headers: { 'Authorization': `token ${token}` },
    });
    if (res.ok) { const data = await res.json(); return data.sha; }
    return null;
  };

  const publish = async () => {
    if (!token) { setMessage({ type:'error', text:'GitHub 토큰을 먼저 설정해주세요.' }); return; }
    if (!form.title || !form.body) { setMessage({ type:'error', text:'제목과 본문을 입력해주세요.' }); return; }

    setPublishing(true);
    setMessage(null);

    try {
      const filename = editingFile || generateFilename();
      const mdContent = form.body;

      // 1. Upload markdown file
      const mdPath = `posts/${filename}`;
      const mdSha = await getFileSha(mdPath);
      const mdBody = {
        message: `Add post: ${form.title}`,
        content: btoa(unescape(encodeURIComponent(mdContent))),
      };
      if (mdSha) mdBody.sha = mdSha;
      const mdRes = await ghApi(mdPath, 'PUT', mdBody);
      if (!mdRes.ok) throw new Error('마크다운 파일 업로드 실패');

      // 2. Update index.json
      const indexSha = await getFileSha('posts/index.json');
      let indexData = [];
      try {
        const r = await fetch(`https://api.github.com/repos/yhk1m/yhk1m.github.io/contents/posts/index.json`, {
          headers: { 'Authorization': `token ${token}` },
        });
        const d = await r.json();
        indexData = JSON.parse(decodeURIComponent(escape(atob(d.content.replace(/\n/g, '')))));
      } catch {}

      const techArr = form.tech ? form.tech.split(',').map(t => t.trim()).filter(Boolean) : [];
      const linksArr = form.links ? form.links.split('\n').map(l => {
        const [label, url] = l.split('|').map(s => s.trim());
        return label && url ? { label, url } : null;
      }).filter(Boolean) : [];

      const newEntry = {
        id: editingId || Date.now(),
        cat: { ko: form.cat, en: form.cat === '프로그램' ? 'Program' : form.cat === '지리' ? 'Geography' : 'Article' },
        title: { ko: form.title, en: form.title },
        desc: { ko: form.desc, en: form.desc },
        date: form.date.slice(0, 7),
        file: filename,
      };
      if (techArr.length) newEntry.tech = techArr;
      if (linksArr.length) newEntry.links = linksArr;

      if (editingId) {
        const idx = indexData.findIndex(p => p.id === editingId);
        if (idx >= 0) indexData[idx] = newEntry;
        else indexData.push(newEntry);
      } else {
        indexData.push(newEntry);
      }

      const indexBody = {
        message: `Update index: ${form.title}`,
        content: btoa(unescape(encodeURIComponent(JSON.stringify(indexData, null, 2)))),
      };
      if (indexSha) indexBody.sha = indexSha;
      const indexRes = await ghApi('posts/index.json', 'PUT', indexBody);
      if (!indexRes.ok) throw new Error('index.json 업데이트 실패');

      setMessage({ type:'success', text: `"${form.title}" 게시 완료! 1-2분 후 사이트에 반영됩니다.` });
      setForm(emptyForm);
      setEditingId(null);
      setEditingFile(null);
      loadPosts();
    } catch (err) {
      setMessage({ type:'error', text: err.message });
    } finally {
      setPublishing(false);
    }
  };

  const editPost = async (post) => {
    setEditingId(post.id);
    setEditingFile(post.file || null);
    setForm({
      title: post.title?.ko || post.title,
      cat: post.cat?.ko || post.cat,
      date: post.date + (post.date.length === 7 ? '-01' : ''),
      desc: post.desc?.ko || post.desc,
      tech: (post.tech || []).join(', '),
      links: (post.links || []).map(l => `${l.label}|${l.url}`).join('\n'),
      body: '',
    });
    // Load existing markdown
    if (post.file) {
      try {
        const r = await fetch(postsBase + post.file);
        const text = await r.text();
        setForm(prev => ({ ...prev, body: text }));
      } catch {}
    }
    setPreview(false);
  };

  const deletePost = async (post) => {
    if (!token) { setMessage({ type:'error', text:'GitHub 토큰을 먼저 설정해주세요.' }); return; }
    if (!confirm(`"${post.title?.ko || post.title}" 을(를) 삭제하시겠습니까?`)) return;

    setPublishing(true);
    try {
      // Delete md file
      if (post.file) {
        const sha = await getFileSha(`posts/${post.file}`);
        if (sha) {
          await ghApi(`posts/${post.file}`, 'DELETE', {
            message: `Delete post: ${post.title?.ko}`,
            sha,
          });
        }
      }
      // Update index.json
      const indexSha = await getFileSha('posts/index.json');
      const r = await fetch(`https://api.github.com/repos/yhk1m/yhk1m.github.io/contents/posts/index.json`, {
        headers: { 'Authorization': `token ${token}` },
      });
      const d = await r.json();
      let indexData = JSON.parse(decodeURIComponent(escape(atob(d.content.replace(/\n/g, '')))));
      indexData = indexData.filter(p => p.id !== post.id);

      await ghApi('posts/index.json', 'PUT', {
        message: `Delete from index: ${post.title?.ko}`,
        content: btoa(unescape(encodeURIComponent(JSON.stringify(indexData, null, 2)))),
        sha: indexSha,
      });

      setMessage({ type:'success', text:'삭제 완료!' });
      loadPosts();
    } catch (err) {
      setMessage({ type:'error', text: err.message });
    } finally {
      setPublishing(false);
    }
  };

  const loadTemplate = async () => {
    try {
      const r = await fetch(postsBase + '_template.md');
      const text = await r.text();
      setForm(prev => ({ ...prev, body: text }));
    } catch {}
  };

  return (
    <div className="page container">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">{editingId ? '글 수정' : '글쓰기'}</h1>
          <p className="text-muted text-sm">마크다운으로 작성하고 GitHub Pages에 바로 게시합니다</p>
        </div>
        <div className="flex gap-sm">
          <button className="btn btn-sm" onClick={() => setShowToken(!showToken)}>
            {token ? '🔑 토큰 변경' : '🔑 토큰 설정'}
          </button>
        </div>
      </div>

      {showToken && (
        <div className="card mb-md fade-in">
          <div className="card-body">
            <p className="text-sm text-muted mb-sm">
              GitHub Personal Access Token (repo 권한 필요).
              Settings → Developer settings → Personal access tokens → Fine-grained tokens에서 발급하세요.
            </p>
            <div className="input-row">
              <input className="input" type="password" placeholder="ghp_xxxxxxxxxxxx"
                value={tokenInput} onChange={e => setTokenInput(e.target.value)} />
              <button className="btn btn-primary" onClick={saveToken}>저장</button>
            </div>
            {token && <p className="text-sm mt-sm" style={{color:'var(--text-muted)', wordBreak:'break-all'}}>현재 토큰: {token}</p>}
          </div>
        </div>
      )}

      {message && (
        <div className={`card mb-md fade-in`} style={{
          borderLeft: `3px solid ${message.type === 'error' ? '#c81e1e' : 'var(--text)'}`,
          background: message.type === 'error' ? 'rgba(200,30,30,0.04)' : 'var(--accent-light)',
        }}>
          <div className="card-body">
            <p className="text-sm">{message.text}</p>
          </div>
        </div>
      )}

      <div className="grid grid-2">
        <div>
          {/* Metadata */}
          <div className="card mb-md">
            <div className="card-header"><h3 className="card-title">📋 기본 정보</h3></div>
            <div className="card-body">
              <input className="input mb-sm" placeholder="제목" value={form.title}
                onChange={e => setForm({...form, title:e.target.value})} />
              <div className="input-row mb-sm">
                <select className="select" value={form.cat} onChange={e => setForm({...form, cat:e.target.value})}>
                  <option value="프로그램">프로그램 (Labs)</option>
                  <option value="글">글 (Notes)</option>
                  <option value="지리">지리 (Geo)</option>
                </select>
                <input className="input" type="date" value={form.date}
                  onChange={e => setForm({...form, date:e.target.value})} />
              </div>
              <textarea className="textarea mb-sm" rows={2} placeholder="한 줄 설명"
                value={form.desc} onChange={e => setForm({...form, desc:e.target.value})} />
              <input className="input mb-sm" placeholder="기술 스택 (쉼표로 구분: React, Node.js, ...)"
                value={form.tech} onChange={e => setForm({...form, tech:e.target.value})} />
              <textarea className="textarea" rows={2}
                placeholder={"링크 (줄바꿈으로 구분)\nGitHub|https://github.com/...\nLive|https://..."}
                value={form.links} onChange={e => setForm({...form, links:e.target.value})} />
            </div>
          </div>

          {/* Editor */}
          <div className={`card${expanded ? ' editor-expanded' : ''}`}>
            <div className="card-header">
              <h3 className="card-title">📝 본문 (마크다운)</h3>
              <div className="flex gap-sm">
                <button className="btn btn-sm btn-ghost" onClick={() => setShowMdGuide(true)}>❓ 마크다운 안내</button>
                <button className="btn btn-sm btn-ghost" onClick={loadTemplate}>템플릿 불러오기</button>
                <button className="btn btn-sm btn-ghost" onClick={() => setExpanded(!expanded)}>
                  {expanded ? '↙ 축소' : '↗ 확대'}
                </button>
                <button className={`btn btn-sm ${preview?'btn-primary':''}`}
                  onClick={() => setPreview(!preview)}>
                  {preview ? '편집' : '미리보기'}
                </button>
              </div>
            </div>
            <div className="card-body">
              {preview ? (
                <div className="markdown-body board-detail-content"
                  dangerouslySetInnerHTML={{ __html: marked.parse(form.body || '') }} />
              ) : (
                <textarea className="textarea post-editor-body" rows={expanded ? 40 : 20}
                  placeholder="마크다운으로 작성하세요..."
                  value={form.body} onChange={e => setForm({...form, body:e.target.value})} />
              )}
            </div>
          </div>

          {/* Markdown Guide Modal */}
          {showMdGuide && (
            <div className="modal-overlay" onClick={() => setShowMdGuide(false)}>
              <div className="modal-content md-guide-modal" onClick={e => e.stopPropagation()}>
                <div className="flex-between mb-md">
                  <h2 style={{margin:0}}>마크다운 문법 안내</h2>
                  <button className="btn btn-sm btn-icon" onClick={() => setShowMdGuide(false)}>✕</button>
                </div>
                <div className="md-guide-body">
                  <table className="md-guide-table">
                    <thead><tr><th>문법</th><th>결과</th></tr></thead>
                    <tbody>
                      <tr><td><code># 제목 1</code></td><td><strong style={{fontSize:'1.4em'}}>제목 1</strong></td></tr>
                      <tr><td><code>## 제목 2</code></td><td><strong style={{fontSize:'1.2em'}}>제목 2</strong></td></tr>
                      <tr><td><code>### 제목 3</code></td><td><strong style={{fontSize:'1.05em'}}>제목 3</strong></td></tr>
                      <tr><td><code>**굵게**</code></td><td><strong>굵게</strong></td></tr>
                      <tr><td><code>*기울임*</code></td><td><em>기울임</em></td></tr>
                      <tr><td><code>~~취소선~~</code></td><td><del>취소선</del></td></tr>
                      <tr><td><code>[링크 텍스트](https://url)</code></td><td><span style={{color:'var(--text)', textDecoration:'underline'}}>링크 텍스트</span></td></tr>
                      <tr><td><code>![이미지 설명](https://url/img.png)</code></td><td>이미지 삽입</td></tr>
                      <tr><td><code>- 목록 항목</code></td><td>• 목록 항목</td></tr>
                      <tr><td><code>1. 번호 목록</code></td><td>1. 번호 목록</td></tr>
                      <tr><td><code>&gt; 인용문</code></td><td><blockquote style={{margin:'0',padding:'2px 8px',borderLeft:'3px solid var(--border)'}}>인용문</blockquote></td></tr>
                      <tr><td><code>---</code></td><td><hr style={{margin:'4px 0'}} /></td></tr>
                      <tr><td><code>`인라인 코드`</code></td><td><code>인라인 코드</code></td></tr>
                      <tr><td><pre style={{margin:0,fontSize:'0.85em'}}>{'```python\nprint("코드")\n```'}</pre></td><td>코드 블록</td></tr>
                      <tr><td><code>{'| 열1 | 열2 |'}</code></td><td>표 (테이블)</td></tr>
                    </tbody>
                  </table>
                  <div className="mt-md" style={{padding:'12px', background:'var(--accent-light)', borderRadius:'8px'}}>
                    <p className="text-sm text-bold" style={{marginBottom:8}}>💡 유튜브 영상 삽입</p>
                    <code className="text-sm">{'<iframe width="100%" height="400" src="https://www.youtube.com/embed/VIDEO_ID" allowfullscreen></iframe>'}</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-sm mt-md" style={{justifyContent:'flex-end'}}>
            {editingId && (
              <button className="btn" onClick={() => { setForm(emptyForm); setEditingId(null); setEditingFile(null); }}>
                취소
              </button>
            )}
            <button className="btn btn-primary" onClick={publish} disabled={publishing}>
              {publishing ? '게시 중...' : editingId ? '수정 게시' : '게시하기'}
            </button>
          </div>
        </div>

        {/* Post List */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📂 게시물 관리</h3>
              <span className="badge">{posts.length}개</span>
            </div>
            <div className="card-body">
              {posts.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">📄</div>
                  <div className="empty-state-text">아직 게시물이 없습니다</div>
                </div>
              )}
              {[...posts].sort((a,b) => b.date.localeCompare(a.date)).map(post => (
                <div key={post.id} className="post-manage-item">
                  <div style={{flex:1, minWidth:0}}>
                    <div className="flex gap-sm" style={{alignItems:'center', marginBottom:4}}>
                      <span className="badge">{post.cat?.ko || post.cat}</span>
                      <span className="text-sm text-muted">{post.date}</span>
                    </div>
                    <div className="text-sm text-bold" style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                      {post.title?.ko || post.title}
                    </div>
                  </div>
                  <div className="flex gap-xs" style={{flexShrink:0}}>
                    <button className="btn btn-icon btn-sm" onClick={() => editPost(post)} title="수정">✏️</button>
                    <button className="btn btn-icon btn-sm btn-danger" onClick={() => deletePost(post)} title="삭제">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Main Page Editor =====
function MainPageEditor() {
  const [hero, setHero] = useStore('mainHero', DEFAULT_HERO);
  const [projects, setProjects] = useStore('mainProjects', DEFAULT_PROJECTS);
  const [bio, setBio] = useStore('mainBio', DEFAULT_BIO);
  const [youtube, setYoutube] = useStore('mainYoutube', DEFAULT_YOUTUBE);
  const [contacts, setContacts] = useStore('mainContacts', DEFAULT_CONTACTS);
  const allPosts = usePosts('ko');
  const [geoOrder, setGeoOrder] = useStore('geoPostOrder', []);
  const [notesOrder, setNotesOrder] = useStore('notesPostOrder', []);
  const sortByOrder = (posts, order) => {
    if (!order.length) return posts;
    const map = new Map(posts.map(p => [p.id, p]));
    const sorted = order.filter(id => map.has(id)).map(id => map.get(id));
    posts.forEach(p => { if (!order.includes(p.id)) sorted.push(p); });
    return sorted;
  };
  const geoPosts = sortByOrder(allPosts.filter(p => p.cat === '지리'), geoOrder);
  const notesPosts = sortByOrder(allPosts.filter(p => p.cat === '글'), notesOrder);

  const [editTab, setEditTab] = useState('hero');
  const [editIdx, setEditIdx] = useState(null);
  const [pForm, setPForm] = useState({name:'',icon:'',desc:'',tech:'',url:''});
  const [cForm, setCForm] = useState({icon:'',label:'',value:'',url:''});
  const [sForm, setSForm] = useState({number:'',label:''});
  const [tForm, setTForm] = useState({date:'',title:'',desc:''});

  const startEditProject = (i) => {
    const p = projects[i];
    setPForm({...p, tech: p.tech.join(', ')});
    setEditIdx(i);
  };
  const saveProject = () => {
    if (!pForm.name) return;
    const p = {...pForm, tech: pForm.tech.split(',').map(t=>t.trim()).filter(Boolean)};
    if (editIdx >= 0) setProjects(projects.map((pr,i) => i===editIdx ? p : pr));
    else setProjects([...projects, p]);
    setEditIdx(null); setPForm({name:'',icon:'',desc:'',tech:'',url:''});
  };
  const moveProject = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= projects.length) return;
    const arr = [...projects]; [arr[i], arr[j]] = [arr[j], arr[i]];
    setProjects(arr);
  };

  const dragRef = useRef(null);
  const [dragOver, setDragOver] = useState(null);
  const handleDrag = (list, setList) => ({
    onDragStart: (e, i) => { dragRef.current = i; e.currentTarget.classList.add('dragging'); },
    onDragEnd: (e) => { e.currentTarget.classList.remove('dragging'); setDragOver(null); },
    onDragOver: (e, i) => { e.preventDefault(); if (dragRef.current !== i) setDragOver(i); },
    onDragLeave: () => {},
    onDrop: (e, i) => {
      e.preventDefault();
      const from = dragRef.current;
      setDragOver(null);
      if (from === null || from === i) return;
      const arr = [...list];
      const [item] = arr.splice(from, 1);
      arr.splice(i, 0, item);
      setList(arr);
      dragRef.current = null;
    },
  });

  const startEditContact = (i) => { setCForm({...contacts[i]}); setEditIdx(i); };
  const saveContact = () => {
    if (!cForm.label) return;
    if (editIdx >= 0) setContacts(contacts.map((c,i) => i===editIdx ? cForm : c));
    else setContacts([...contacts, cForm]);
    setEditIdx(null); setCForm({icon:'',label:'',value:'',url:''});
  };

  const saveStat = () => {
    if (!sForm.number) return;
    if (editIdx >= 0) setBio({...bio, stats: bio.stats.map((s,i) => i===editIdx ? sForm : s)});
    else setBio({...bio, stats: [...bio.stats, sForm]});
    setEditIdx(null); setSForm({number:'',label:''});
  };

  return (
    <div className="page container">
      <div className="page-header">
        <h1 className="page-title">메인 페이지 편집</h1>
        <p className="text-muted">공개 페이지의 콘텐츠를 수정합니다</p>
      </div>

      <div className="tabs">
        {[{id:'hero',l:'Hero'},{id:'bio',l:'Bio'},{id:'geo',l:'Geo'},{id:'notes',l:'Notes'},{id:'projects',l:'Lab'},{id:'youtube',l:'YouTube'},{id:'contacts',l:'Contact'}].map(t => (
          <button key={t.id} className={`tab ${editTab===t.id?'active':''}`} onClick={()=>{setEditTab(t.id);setEditIdx(null);}}>{t.l}</button>
        ))}
      </div>

      {/* Hero */}
      {editTab === 'hero' && (
        <div className="card fade-in">
          <div className="card-header"><h3 className="card-title">Hero 섹션</h3></div>
          <div className="card-body">
            <label className="text-sm text-muted">라벨 (상단 소제목)</label>
            <input className="input mb-sm mt-xs" value={hero.label} onChange={e => setHero({...hero, label:e.target.value})} />
            <label className="text-sm text-muted">영문 이름</label>
            <input className="input mb-sm mt-xs" value={hero.name} onChange={e => setHero({...hero, name:e.target.value})} />
            <label className="text-sm text-muted">한글 이름</label>
            <input className="input mb-sm mt-xs" value={hero.nameSub} onChange={e => setHero({...hero, nameSub:e.target.value})} />
            <label className="text-sm text-muted">소개 (줄바꿈 가능)</label>
            <textarea className="textarea mb-sm mt-xs" rows={4} value={hero.desc} onChange={e => setHero({...hero, desc:e.target.value})} />
            <label className="text-sm text-muted">태그 (쉼표로 구분)</label>
            <input className="input mt-xs" value={hero.tagsRaw ?? hero.tags.join(', ')}
              onChange={e => setHero({...hero, tagsRaw: e.target.value, tags: e.target.value.split(',').map(t=>t.trim()).filter(Boolean)})}
              onBlur={() => setHero(h => { const {tagsRaw, ...rest} = h; return rest; })} />
          </div>
        </div>
      )}

      {/* Projects */}
      {editTab === 'projects' && (
        <div className="card fade-in">
          <div className="card-header"><h3 className="card-title">Lab</h3>
            <button className="btn btn-primary btn-sm" onClick={()=>{setEditIdx(-1);setPForm({name:'',icon:'',desc:'',tech:'',url:''});}}>+ 추가</button>
          </div>
          <div className="card-body">
            {editIdx !== null && (
              <div className="mb-md fade-in" style={{padding:16,border:'1px solid var(--border)',background:'var(--bg-secondary)'}}>
                <div className="input-row mb-sm" style={{alignItems:'center'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                    {pForm.icon && pForm.icon.startsWith('data:') ? (
                      <img src={pForm.icon} alt="" style={{width:36,height:36,objectFit:'contain',border:'1px solid var(--border)',borderRadius:6}} />
                    ) : (
                      <span style={{fontSize:20,width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid var(--border)',borderRadius:6}}>{pForm.icon||'?'}</span>
                    )}
                    <label className="btn btn-sm" style={{cursor:'pointer',marginBottom:0}}>
                      파일
                      <input type="file" accept=".svg,.png,.jpg,.webp" style={{display:'none'}} onChange={e=>{
                        const file=e.target.files?.[0]; if(!file)return;
                        const reader=new FileReader();
                        reader.onload=()=>setPForm({...pForm,icon:reader.result});
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                    <input className="input" style={{maxWidth:60}} placeholder="이모지" value={pForm.icon?.startsWith('data:')?'':pForm.icon} onChange={e=>setPForm({...pForm,icon:e.target.value})} />
                  </div>
                  <input className="input" placeholder="이름" value={pForm.name} onChange={e=>setPForm({...pForm,name:e.target.value})} />
                </div>
                <textarea className="textarea mb-sm" rows={2} placeholder="설명" value={pForm.desc} onChange={e=>setPForm({...pForm,desc:e.target.value})} />
                <input className="input mb-sm" placeholder="기술 스택 (쉼표 구분)" value={pForm.tech} onChange={e=>setPForm({...pForm,tech:e.target.value})} />
                <div className="input-row">
                  <input className="input" placeholder="URL" value={pForm.url} onChange={e=>setPForm({...pForm,url:e.target.value})} />
                  <button className="btn btn-primary" onClick={saveProject}>저장</button>
                  <button className="btn" onClick={()=>setEditIdx(null)}>취소</button>
                </div>
              </div>
            )}
            {projects.map((p, i) => {
              const d = handleDrag(projects, setProjects);
              return (
              <div key={i} className={`post-manage-item drag-item${dragOver===i && dragRef.current!==i ? ' drag-over' : ''}${dragRef.current===i ? ' dragging' : ''}`} draggable
                onDragStart={e=>d.onDragStart(e,i)} onDragEnd={d.onDragEnd} onDragOver={e=>d.onDragOver(e,i)} onDrop={e=>d.onDrop(e,i)}>
                <span className="drag-handle" title="드래그하여 순서 변경">⠿</span>
                <div style={{flex:1,minWidth:0}}>
                  <div className="text-sm text-bold" style={{display:'flex',alignItems:'center',gap:6}}>{p.icon?.startsWith('data:') ? <img src={p.icon} alt="" style={{width:18,height:18,objectFit:'contain'}} /> : p.icon} {p.name}</div>
                  <div className="text-sm text-muted" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.url}</div>
                </div>
                <div className="flex gap-xs">
                  <button className="btn btn-icon btn-sm" onClick={()=>startEditProject(i)} title="수정">✏️</button>
                  <button className="btn btn-icon btn-sm btn-danger" onClick={()=>{if(confirm('삭제?'))setProjects(projects.filter((_,j)=>j!==i));}} title="삭제">🗑️</button>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bio */}
      {editTab === 'bio' && (
        <div className="fade-in">
          <div className="card mb-md">
            <div className="card-header"><h3 className="card-title">소개 문단</h3></div>
            <div className="card-body">
              {bio.paragraphs.map((p, i) => (
                <div key={i} className="mb-sm">
                  <div className="flex-between mb-xs">
                    <span className="text-sm text-muted">문단 {i+1}</span>
                    <button className="btn btn-icon btn-sm btn-danger" onClick={()=>setBio({...bio,paragraphs:bio.paragraphs.filter((_,j)=>j!==i)})}>✕</button>
                  </div>
                  <textarea className="textarea" rows={3} value={p} onChange={e=>{const arr=[...bio.paragraphs];arr[i]=e.target.value;setBio({...bio,paragraphs:arr});}} />
                </div>
              ))}
              <button className="btn btn-sm mt-sm" onClick={()=>setBio({...bio,paragraphs:[...bio.paragraphs,'']})}>+ 문단 추가</button>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">스탯 카드</h3>
              <button className="btn btn-primary btn-sm" onClick={()=>{setEditIdx(-1);setSForm({number:'',label:''});}}>+ 추가</button>
            </div>
            <div className="card-body">
              {editIdx !== null && editTab === 'bio' && (
                <div className="mb-md fade-in" style={{padding:16,border:'1px solid var(--border)',background:'var(--bg-secondary)'}}>
                  <div className="input-row">
                    <input className="input" placeholder="숫자/값" value={sForm.number} onChange={e=>setSForm({...sForm,number:e.target.value})} />
                    <input className="input" placeholder="라벨" value={sForm.label} onChange={e=>setSForm({...sForm,label:e.target.value})} />
                    <button className="btn btn-primary" onClick={saveStat}>저장</button>
                    <button className="btn" onClick={()=>setEditIdx(null)}>취소</button>
                  </div>
                </div>
              )}
              {bio.stats.map((s, i) => (
                <div key={i} className="post-manage-item">
                  <div><span className="text-bold">{s.number}</span> <span className="text-sm text-muted">— {s.label}</span></div>
                  <div className="flex gap-xs">
                    <button className="btn btn-icon btn-sm" onClick={()=>{setEditIdx(i);setSForm({...s});}}>✏️</button>
                    <button className="btn btn-icon btn-sm btn-danger" onClick={()=>setBio({...bio,stats:bio.stats.filter((_,j)=>j!==i)})}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card mt-md">
            <div className="card-header"><h3 className="card-title">타임라인</h3>
              <button className="btn btn-primary btn-sm" onClick={()=>{setEditIdx('t-new');setTForm({date:'',title:'',desc:''});}}>+ 추가</button>
            </div>
            <div className="card-body">
              {String(editIdx).startsWith('t') && (
                <div className="mb-md fade-in" style={{padding:16,border:'1px solid var(--border)',background:'var(--bg-secondary)'}}>
                  <div className="input-row mb-sm">
                    <input className="input" style={{maxWidth:120}} placeholder="연월 (2026.03)" value={tForm.date} onChange={e=>setTForm({...tForm,date:e.target.value})} />
                    <input className="input" placeholder="제목" value={tForm.title} onChange={e=>setTForm({...tForm,title:e.target.value})} />
                  </div>
                  <div className="input-row">
                    <input className="input" placeholder="설명" value={tForm.desc} onChange={e=>setTForm({...tForm,desc:e.target.value})} />
                    <button className="btn btn-primary" onClick={()=>{
                      if(!tForm.date||!tForm.title)return;
                      const tl=bio.timeline||[];
                      if(editIdx==='t-new') setBio({...bio,timeline:[tForm,...tl]});
                      else { const idx=parseInt(String(editIdx).slice(2)); setBio({...bio,timeline:tl.map((t,i)=>i===idx?tForm:t)}); }
                      setEditIdx(null);setTForm({date:'',title:'',desc:''});
                    }}>저장</button>
                    <button className="btn" onClick={()=>setEditIdx(null)}>취소</button>
                  </div>
                </div>
              )}
              {(bio.timeline||[]).map((t, i) => (
                <div key={i} className="post-manage-item">
                  <div style={{flex:1,minWidth:0}}>
                    <div className="flex gap-sm" style={{alignItems:'center'}}>
                      <span className="badge">{t.date}</span>
                      <span className="text-sm text-bold">{t.title}</span>
                    </div>
                    {t.desc && <div className="text-sm text-muted mt-xs">{t.desc}</div>}
                  </div>
                  <div className="flex gap-xs">
                    <button className="btn btn-icon btn-sm" onClick={()=>{setEditIdx('t-'+i);setTForm({...t});}}>✏️</button>
                    <button className="btn btn-icon btn-sm" onClick={()=>{if(i>0){const arr=[...(bio.timeline||[])];[arr[i],arr[i-1]]=[arr[i-1],arr[i]];setBio({...bio,timeline:arr});}}} title="위로">↑</button>
                    <button className="btn btn-icon btn-sm" onClick={()=>{const tl=bio.timeline||[];if(i<tl.length-1){const arr=[...tl];[arr[i],arr[i+1]]=[arr[i+1],arr[i]];setBio({...bio,timeline:arr});}}} title="아래로">↓</button>
                    <button className="btn btn-icon btn-sm btn-danger" onClick={()=>setBio({...bio,timeline:(bio.timeline||[]).filter((_,j)=>j!==i)})}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Geo */}
      {editTab === 'geo' && (
        <div className="card fade-in">
          <div className="card-header">
            <h3 className="card-title">Geo 게시물</h3>
            <button className="btn btn-primary btn-sm" onClick={()=>{window.location.hash='write';}}>+ 새 글 작성</button>
          </div>
          <div className="card-body">
            <p className="text-sm text-muted mb-md">카테고리가 "지리"인 게시물이 Geo 섹션에 표시됩니다. 글쓰기 페이지에서 카테고리를 "지리 (Geo)"로 선택하세요.</p>
            {geoPosts.length === 0 && (
              <div className="empty-state"><div className="empty-state-icon">🌍</div><div className="empty-state-text">아직 Geo 게시물이 없습니다</div></div>
            )}
            {geoPosts.map((p, i) => {
              const d = handleDrag(geoPosts, arr => setGeoOrder(arr.map(x=>x.id)));
              return (
              <div key={p.id} className={`post-manage-item drag-item${dragOver===i && dragRef.current!==i ? ' drag-over' : ''}${dragRef.current===i ? ' dragging' : ''}`} draggable
                onDragStart={e=>d.onDragStart(e,i)} onDragEnd={d.onDragEnd} onDragOver={e=>d.onDragOver(e,i)} onDrop={e=>d.onDrop(e,i)}>
                <span className="drag-handle">⠿</span>
                <div style={{flex:1,minWidth:0}}>
                  <div className="flex gap-sm" style={{alignItems:'center',marginBottom:4}}>
                    <span className="badge">지리</span>
                    <span className="text-sm text-muted">{p.date}</span>
                  </div>
                  <div className="text-sm text-bold">{p.title}</div>
                  <div className="text-sm text-muted" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.desc}</div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      {editTab === 'notes' && (
        <div className="card fade-in">
          <div className="card-header">
            <h3 className="card-title">Notes 게시물</h3>
            <button className="btn btn-primary btn-sm" onClick={()=>{window.location.hash='write';}}>+ 새 글 작성</button>
          </div>
          <div className="card-body">
            <p className="text-sm text-muted mb-md">카테고리가 "글"인 게시물이 Notes 섹션에 표시됩니다. 글쓰기 페이지에서 카테고리를 "글 (Notes)"로 선택하세요.</p>
            {notesPosts.length === 0 && (
              <div className="empty-state"><div className="empty-state-icon">📝</div><div className="empty-state-text">아직 Notes 게시물이 없습니다</div></div>
            )}
            {notesPosts.map((p, i) => {
              const d = handleDrag(notesPosts, arr => setNotesOrder(arr.map(x=>x.id)));
              return (
              <div key={p.id} className={`post-manage-item drag-item${dragOver===i && dragRef.current!==i ? ' drag-over' : ''}${dragRef.current===i ? ' dragging' : ''}`} draggable
                onDragStart={e=>d.onDragStart(e,i)} onDragEnd={d.onDragEnd} onDragOver={e=>d.onDragOver(e,i)} onDrop={e=>d.onDrop(e,i)}>
                <span className="drag-handle">⠿</span>
                <div style={{flex:1,minWidth:0}}>
                  <div className="flex gap-sm" style={{alignItems:'center',marginBottom:4}}>
                    <span className="badge">글</span>
                    <span className="text-sm text-muted">{p.date}</span>
                  </div>
                  <div className="text-sm text-bold">{p.title}</div>
                  <div className="text-sm text-muted" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.desc}</div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* YouTube */}
      {editTab === 'youtube' && (
        <div className="card fade-in">
          <div className="card-header"><h3 className="card-title">YouTube 섹션</h3></div>
          <div className="card-body">
            <label className="text-sm text-muted">채널 이름</label>
            <input className="input mb-sm mt-xs" value={youtube.name} onChange={e=>setYoutube({...youtube,name:e.target.value})} />
            <label className="text-sm text-muted">핸들</label>
            <input className="input mb-sm mt-xs" value={youtube.handle} onChange={e=>setYoutube({...youtube,handle:e.target.value})} />
            <label className="text-sm text-muted">설명</label>
            <textarea className="textarea mb-sm mt-xs" rows={3} value={youtube.desc} onChange={e=>setYoutube({...youtube,desc:e.target.value})} />
            <label className="text-sm text-muted">채널 URL</label>
            <input className="input mt-xs" value={youtube.url} onChange={e=>setYoutube({...youtube,url:e.target.value})} />
          </div>
        </div>
      )}

      {/* Contacts */}
      {editTab === 'contacts' && (
        <div className="card fade-in">
          <div className="card-header"><h3 className="card-title">Contact 섹션</h3>
            <button className="btn btn-primary btn-sm" onClick={()=>{setEditIdx(-1);setCForm({icon:'',label:'',value:'',url:''});}}>+ 추가</button>
          </div>
          <div className="card-body">
            {editIdx !== null && editTab === 'contacts' && (
              <div className="mb-md fade-in" style={{padding:16,border:'1px solid var(--border)',background:'var(--bg-secondary)'}}>
                <div className="input-row mb-sm">
                  <input className="input" style={{maxWidth:80}} placeholder="아이콘" value={cForm.icon} onChange={e=>setCForm({...cForm,icon:e.target.value})} />
                  <input className="input" placeholder="라벨" value={cForm.label} onChange={e=>setCForm({...cForm,label:e.target.value})} />
                </div>
                <div className="input-row">
                  <input className="input" placeholder="표시값" value={cForm.value} onChange={e=>setCForm({...cForm,value:e.target.value})} />
                  <input className="input" placeholder="URL" value={cForm.url} onChange={e=>setCForm({...cForm,url:e.target.value})} />
                  <button className="btn btn-primary" onClick={saveContact}>저장</button>
                  <button className="btn" onClick={()=>setEditIdx(null)}>취소</button>
                </div>
              </div>
            )}
            {contacts.map((c, i) => {
              const d = handleDrag(contacts, setContacts);
              return (
              <div key={i} className={`post-manage-item drag-item${dragOver===i && dragRef.current!==i ? ' drag-over' : ''}${dragRef.current===i ? ' dragging' : ''}`} draggable
                onDragStart={e=>d.onDragStart(e,i)} onDragEnd={d.onDragEnd} onDragOver={e=>d.onDragOver(e,i)} onDrop={e=>d.onDrop(e,i)}>
                <span className="drag-handle" title="드래그하여 순서 변경">⠿</span>
                <div style={{flex:1}}><span>{c.icon}</span> <span className="text-bold">{c.label}</span> <span className="text-sm text-muted">— {c.value}</span></div>
                <div className="flex gap-xs">
                  <button className="btn btn-icon btn-sm" onClick={()=>startEditContact(i)}>✏️</button>
                  <button className="btn btn-icon btn-sm btn-danger" onClick={()=>setContacts(contacts.filter((_,j)=>j!==i))}>🗑️</button>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Footer =====
function Footer({ lang = 'ko' }) {
  return (
    <footer className="footer" style={{textAlign:'center'}}>
      <div className="container">
        <p className="footer-copy">&copy; 2026 Yonghyun Kim. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ===== Main App =====
function App() {
  const lang = window.HUB_LANG || 'ko';
  const [section, setSection] = useState('public');
  const [page, setPage] = useState('portfolio');
  const [dark, setDark] = useState(() => ls.get('dark', false));
  const visitorCounts = useVisitorCount();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    ls.set('dark', dark);
  }, [dark]);

  // Hash-based routing — #private enters private mode with password
  useEffect(() => {
    const PRIVATE_HASH = '212121';
    const onHash = () => {
      const hash = location.hash.slice(1);
      if (!hash || hash === 'portfolio') { setSection('public'); setPage('portfolio'); return; }
      const privatePages = ['dashboard', 'main-edit', 'tools', 'diary', 'pdfs', 'write'];
      if (hash === PRIVATE_HASH || hash === 'private' || privatePages.includes(hash)) {
        const authed = sessionStorage.getItem('hub_private_auth');
        if (!authed) {
          const pw = prompt('비밀번호를 입력하세요');
          if (pw !== '212121') {
            history.replaceState(null, '', location.pathname);
            setSection('public'); setPage('portfolio');
            return;
          }
          sessionStorage.setItem('hub_private_auth', '1');
        }
        setSection('private');
        setPage(privatePages.includes(hash) ? hash : 'dashboard');
        return;
      }
    };
    window.addEventListener('hashchange', onHash);
    onHash();
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => { if (page === 'portfolio') { history.replaceState(null, '', location.pathname); } else { location.hash = page; } }, [page]);

  const renderPage = () => {
    switch (page) {
      case 'portfolio': return <Portfolio lang={lang} />;
      case 'dashboard': return <Dashboard />;
      case 'main-edit': return <MainPageEditor />;
      case 'tools': return <Tools />;
      case 'diary': return <Diary />;
      case 'pdfs': return <PdfLibrary />;
      case 'write': return <PostEditor />;
      default: return <Portfolio lang={lang} />;
    }
  };

  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <Nav page={page} setPage={setPage} dark={dark} setDark={setDark} section={section} setSection={setSection} lang={lang} visitorCounts={visitorCounts} />
      {renderPage()}
      <Footer lang={lang} />
      <button className={`top-btn${showTop ? ' visible' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Top">↑</button>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
