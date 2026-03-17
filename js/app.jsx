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

// ===== Navigation =====
function Nav({ page, setPage, dark, setDark, section, setSection, lang }) {
  const [open, setOpen] = useState(false);
  const privatePages = [
    { id:'dashboard', label:'대시보드', icon:'📊' },
    { id:'tools', label:'도구함', icon:'🛠️' },
    { id:'diary', label:'일기', icon:'📝' },
    { id:'write', label:'글쓰기', icon:'✍️' },
  ];

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <div className="nav-logo" onClick={() => { setPage(section === 'public' ? 'portfolio' : 'dashboard'); setOpen(false); }}>
          <span className="nav-logo-text">MY HUB</span>
          {section === 'private' && <span className="nav-section-badge">PRIVATE</span>}
        </div>
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
        <div className="flex gap-sm">
          {section === 'public' && (
            <a className="lang-toggle" href={lang === 'ko' ? 'en/' : '../'}>
              {lang === 'ko' ? 'EN' : 'KR'}
            </a>
          )}
          {section === 'private' && (
            <button className="lang-toggle" onClick={() => { setSection('public'); setPage('portfolio'); setOpen(false); }}>
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
  const habitNames = useStore('habitNames', ['운동','독서','명상'])[0];
  const [names, setNames] = useStore('habitNames', ['운동','독서','명상']);

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
    hero: { line1:'안녕하세요,', name:'김용현', line2:'입니다',
      subtitle:'기술과 콘텐츠로 가치를 만드는 크리에이터\n끊임없이 배우고, 나누고, 성장합니다' },
    tabs: { about:'소개', timeline:'타임라인', works:'작업물', board:'게시판' },
    aboutTitle: 'About Me',
    aboutP1: '다양한 분야에 관심을 가지고 끊임없이 도전하는 크리에이터입니다. 프로그래밍, GIS, 콘텐츠 제작 등 여러 영역을 넘나들며 기술적 역량과 창의적 표현력을 동시에 키워가고 있습니다.',
    aboutP2: '유튜브와 블로그를 통해 배운 것들을 나누고, 출판을 통해 더 깊은 지식을 전달하고 있습니다. 함께 성장하는 것을 가장 가치있게 생각합니다.',
    skills: ['Python','JavaScript','React','HTML/CSS','GIS','QGIS','데이터분석','콘텐츠제작','프레젠테이션','기획','글쓰기','영상편집'],
    timeline: [
      { year:'2026', title:'개인 허브 웹페이지 개발', desc:'스케줄링, 포트폴리오, 도구함을 통합한 개인 웹 플랫폼 구축' },
      { year:'2025', title:'자기소개 프레젠테이션 제작', desc:'Python 기반 자동 PPT 생성 시스템 개발' },
      { year:'2024', title:'GIS/공간정보 프로젝트', desc:'지형 분석 및 공간 데이터 처리 (DEM, Slope, Aspect)' },
      { year:'2023', title:'콘텐츠 크리에이터 활동', desc:'유튜브, 블로그를 통한 지식 공유 및 커뮤니티 형성' },
    ],
    works: [
      { type:'YouTube', icon:'🎬', title:'교육 콘텐츠 채널', desc:'프로그래밍, 기술 관련 영상 제작' },
      { type:'Blog', icon:'📰', title:'기술 블로그', desc:'개발 경험과 인사이트 공유' },
      { type:'Publication', icon:'📚', title:'출판 활동', desc:'전문 지식을 책으로 엮어 독자와 소통' },
      { type:'Project', icon:'🔬', title:'GIS 프로젝트', desc:'공간정보 분석 및 시각화' },
      { type:'Education', icon:'🎓', title:'교육 활동', desc:'지식 나눔과 멘토링' },
      { type:'Open Source', icon:'💻', title:'오픈소스 기여', desc:'커뮤니티와 함께 성장하는 개발' },
    ],
    filterAll: '전체',
    boardBack: '← 목록으로',
    boardTech: '기술 스택',
    boardLoading: '불러오는 중...',
  },
  en: {
    hero: { line1:"Hello, I'm", name:'Yonghyun Kim', line2:'',
      subtitle:'A creator who builds value through technology and content\nConstantly learning, sharing, and growing' },
    tabs: { about:'About', timeline:'Timeline', works:'Works', board:'Board' },
    aboutTitle: 'About Me',
    aboutP1: 'I am a creator who constantly challenges myself across diverse fields. Navigating through programming, GIS, and content creation, I continue to develop both technical skills and creative expression.',
    aboutP2: 'I share what I learn through YouTube and my blog, and deliver deeper knowledge through publications. I value growing together above all.',
    skills: ['Python','JavaScript','React','HTML/CSS','GIS','QGIS','Data Analysis','Content Creation','Presentation','Planning','Writing','Video Editing'],
    timeline: [
      { year:'2026', title:'Personal Hub Website', desc:'Built an integrated personal platform with scheduling, portfolio, and productivity tools' },
      { year:'2025', title:'Automated Presentation System', desc:'Developed a Python-based automatic PPT generation system' },
      { year:'2024', title:'GIS / Spatial Information Project', desc:'Terrain analysis and spatial data processing (DEM, Slope, Aspect)' },
      { year:'2023', title:'Content Creator Activities', desc:'Knowledge sharing and community building through YouTube and blog' },
    ],
    works: [
      { type:'YouTube', icon:'🎬', title:'Educational Channel', desc:'Creating programming and tech-related videos' },
      { type:'Blog', icon:'📰', title:'Tech Blog', desc:'Sharing development experiences and insights' },
      { type:'Publication', icon:'📚', title:'Publications', desc:'Communicating expertise through books' },
      { type:'Project', icon:'🔬', title:'GIS Projects', desc:'Spatial information analysis and visualization' },
      { type:'Education', icon:'🎓', title:'Education', desc:'Knowledge sharing and mentoring' },
      { type:'Open Source', icon:'💻', title:'Open Source', desc:'Growing together with the community' },
    ],
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

  return (
    <div className="fade-in">
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
      <div className="board-list">
        {sorted.map(item => (
          <div key={item.id} className="board-item board-item-clickable" onClick={() => setSelectedId(item.id)}>
            <div className="board-item-header">
              <span className="badge">{item.cat}</span>
              <span className="board-item-date">{item.date}</span>
            </div>
            <h3 className="board-item-title">{item.title}</h3>
            <p className="board-item-desc">{item.desc}</p>
          </div>
        ))}
      </div>
      <div className="board-count">{sorted.length} / {items.length}</div>
    </div>
  );
}

// ===== Portfolio Page =====
function Portfolio({ lang = 'ko' }) {
  const [tab, setTab] = useState('about');
  const t = TEXTS[lang];
  const posts = usePosts(lang);

  return (
    <div className="page container portfolio">
      <div className="hero slide-up">
        <div className="hero-row">
          <div className="hero-cell hero-cell-name">
            <h1 className="hero-title">{t.hero.line1} <span>{t.hero.name}</span>{t.hero.line2}</h1>
          </div>
          <div className="hero-cell hero-cell-desc">
            <p className="hero-subtitle">{t.hero.subtitle.split('\n').map((line, i) =>
              <React.Fragment key={i}>{line}{i === 0 && <br/>}</React.Fragment>
            )}</p>
          </div>
          <div className="hero-cell hero-cell-links">
            <a className="btn btn-primary" href="#" target="_blank" style={{borderBottom:'none'}}>YouTube</a>
            <a className="btn" href="#" target="_blank" style={{borderBottom:'none'}}>Blog</a>
            <a className="btn" href="#" target="_blank" style={{borderBottom:'none'}}>GitHub</a>
          </div>
        </div>
        <div className="hero-bar">
          <div className="hero-tabs">
            {[{id:'about',label:t.tabs.about},{id:'timeline',label:t.tabs.timeline},{id:'board',label:t.tabs.board}].map(tb => (
              <button key={tb.id} className={`hero-tab ${tab===tb.id?'active':''}`} onClick={()=>setTab(tb.id)}>{tb.label}</button>
            ))}
          </div>
          <VisitorCounter />
        </div>
      </div>

      {tab === 'about' && (
        <div className="fade-in">
          <div className="card">
            <div className="card-body">
              <h2 style={{marginBottom:16}}>{t.aboutTitle}</h2>
              <p className="text-muted" style={{lineHeight:1.8, fontSize:'1.05rem'}}>
                {t.aboutP1}<br/><br/>{t.aboutP2}
              </p>
              <div className="skill-tags">
                {t.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'timeline' && (
        <div className="fade-in">
          <div className="card">
            <div className="card-body">
              <div className="timeline">
                {t.timeline.map((item, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-date">{item.year}</div>
                    <div className="timeline-title">{item.title}</div>
                    <div className="timeline-desc">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'board' && <Board items={posts} filterAll={t.filterAll} texts={t} />}
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
  const [items, setItems] = useStore('ddays', [
    { id:1, name:'새해', date:'2027-01-01' },
  ]);
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
  const [bookmarks, setBookmarks] = useStore('bookmarks', [
    { id:1, title:'Google', url:'https://google.com', category:'검색' },
    { id:2, title:'GitHub', url:'https://github.com', category:'개발' },
  ]);
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
      const filename = generateFilename();
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
        cat: { ko: form.cat, en: form.cat === '프로그램' ? 'Program' : 'Article' },
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
      loadPosts();
    } catch (err) {
      setMessage({ type:'error', text: err.message });
    } finally {
      setPublishing(false);
    }
  };

  const editPost = async (post) => {
    setEditingId(post.id);
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
            {token && <p className="text-sm mt-sm" style={{color:'var(--text-muted)'}}>현재 토큰: {token.slice(0,8)}...</p>}
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
                  <option value="프로그램">프로그램</option>
                  <option value="글">글</option>
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
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📝 본문 (마크다운)</h3>
              <div className="flex gap-sm">
                <button className="btn btn-sm btn-ghost" onClick={loadTemplate}>템플릿 불러오기</button>
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
                <textarea className="textarea post-editor-body" rows={20}
                  placeholder="마크다운으로 작성하세요..."
                  value={form.body} onChange={e => setForm({...form, body:e.target.value})} />
              )}
            </div>
          </div>

          <div className="flex gap-sm mt-md" style={{justifyContent:'flex-end'}}>
            {editingId && (
              <button className="btn" onClick={() => { setForm(emptyForm); setEditingId(null); }}>
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

// ===== Footer =====
function Footer({ lang = 'ko' }) {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <span className="footer-copy">&copy; 2026 {lang === 'ko' ? '김용현' : 'Yonghyun Kim'} Personal Hub. All rights reserved.</span>
        <div className="footer-links">
          <a href="#">YouTube</a>
          <a href="#">Blog</a>
          <a href="#">GitHub</a>
        </div>
      </div>
    </footer>
  );
}

// ===== Main App =====
function App() {
  const lang = window.HUB_LANG || 'ko';
  const [section, setSection] = useState(() => ls.get('section', 'public'));
  const [page, setPage] = useState(() => {
    const s = ls.get('section', 'public');
    return s === 'public' ? 'portfolio' : 'dashboard';
  });
  const [dark, setDark] = useState(() => ls.get('dark', false));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    ls.set('dark', dark);
  }, [dark]);

  useEffect(() => { ls.set('section', section); }, [section]);

  // Hash-based routing — #private enters private mode
  useEffect(() => {
    const onHash = () => {
      const hash = location.hash.slice(1);
      if (hash === 'private') { setSection('private'); setPage('dashboard'); return; }
      const publicPages = ['portfolio'];
      const privatePages = ['dashboard', 'tools', 'diary', 'write'];
      if (publicPages.includes(hash)) { setSection('public'); setPage(hash); }
      else if (privatePages.includes(hash)) { setSection('private'); setPage(hash); }
    };
    window.addEventListener('hashchange', onHash);
    onHash();
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => { location.hash = page; }, [page]);

  const renderPage = () => {
    switch (page) {
      case 'portfolio': return <Portfolio lang={lang} />;
      case 'dashboard': return <Dashboard />;
      case 'tools': return <Tools />;
      case 'diary': return <Diary />;
      case 'write': return <PostEditor />;
      default: return <Portfolio lang={lang} />;
    }
  };

  return (
    <>
      <Nav page={page} setPage={setPage} dark={dark} setDark={setDark} section={section} setSection={setSection} lang={lang} />
      {renderPage()}
      <Footer lang={lang} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
