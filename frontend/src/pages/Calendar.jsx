import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CalendarPage() {
  const [activities, setActivities] = useState([]);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetch('/api/activities').then(r => r.json()).then(setActivities).catch(() => {});
  }, []);

  function parseDate(str) {
    if (!str) return null;
    const s = str.toLowerCase().trim();
    const now = new Date();
    if (s === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (s === 'yesterday') return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const m = s.match(/(\d+)\s*days?\s*ago/);
    if (m) return new Date(now.getFullYear(), now.getMonth(), now.getDate() - parseInt(m[1]));
    const d = new Date(str);
    return isNaN(d) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  const actDateMap = useMemo(() => {
    const map = {};
    activities.forEach(a => {
      const d = parseDate(a.date);
      if (d) { const k = d.toDateString(); map[k] = (map[k] || []).concat(a); }
    });
    return map;
  }, [activities]);

  const yr = calMonth.getFullYear(), mo = calMonth.getMonth();
  const firstDay = new Date(yr, mo, 1).getDay();
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  while (cells.length % 7 !== 0) cells.push(null);
  const todayKey = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).toDateString();
  const selectedActs = selectedDate ? (actDateMap[selectedDate.toDateString()] || []) : [];

  return (
    <main style={{ padding: '60px 5%', maxWidth: 1100, margin: '0 auto' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--ink-mid)', textDecoration: 'none', marginBottom: 28 }}>
        <i className="ti ti-arrow-left" /> Back to home
      </Link>
      <div className="section-label">Schedule</div>
      <h1 className="section-title" style={{ marginBottom: 8 }}>Activity <em>calendar</em></h1>
      <p className="section-sub">Browse all activities by date. Click a highlighted day to see details.</p>

      <div className="act-calendar">
        <div className="cal-header">
          <button className="cal-nav" onClick={() => setCalMonth(new Date(yr, mo - 1, 1))}><i className="ti ti-chevron-left" /></button>
          <span className="cal-month-label">{MONTHS[mo]} {yr}</span>
          <button className="cal-nav" onClick={() => setCalMonth(new Date(yr, mo + 1, 1))}><i className="ti ti-chevron-right" /></button>
        </div>
        <div className="cal-editorial-grid">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="cal-editorial-day-name">{d}</div>
          ))}
          {cells.map((day, i) => {
            if (!day) return <div key={i} className="cal-editorial-cell cal-editorial-empty" />;
            const key = new Date(yr, mo, day).toDateString();
            const dayActs = actDateMap[key] || [];
            const isSel = selectedDate?.toDateString() === key;
            return (
              <div key={i}
                className={`cal-editorial-cell${dayActs.length ? ' has-events' : ''}${isSel ? ' is-selected' : ''}${key === todayKey ? ' is-today' : ''}`}
                onClick={() => dayActs.length && setSelectedDate(isSel ? null : new Date(yr, mo, day))}
              >
                <div className={`cal-editorial-num${key === todayKey ? ' today-num' : ''}`}>{day}</div>
                {dayActs.slice(0, 2).map((a, ai) => (
                  <div key={ai} className="cal-editorial-event">
                    {a.image_url && <img src={a.image_url} alt="" className="cal-editorial-img" />}
                    <div className="cal-editorial-title">{a.title}</div>
                  </div>
                ))}
                {dayActs.length > 2 && <div className="cal-editorial-more">+{dayActs.length - 2} more</div>}
              </div>
            );
          })}
        </div>
        {selectedDate && (
          <div className="cal-selected-label">
            <i className="ti ti-filter" /> {selectedActs.length} activit{selectedActs.length === 1 ? 'y' : 'ies'} on {selectedDate.toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
            <button onClick={() => setSelectedDate(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--saffron)', marginLeft:8 }}>Clear ×</button>
          </div>
        )}
      </div>

      {selectedActs.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 className="section-title" style={{ fontSize: '1.2rem', marginBottom: 20 }}>
            Activities on {selectedDate?.toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
          </h2>
          <div className="activity-grid">
            {selectedActs.map((a, i) => (
              <div key={i} className="act-card">
                <div className="act-body">
                  <span className={`act-badge ${a.badge}`}>{a.category}</span>
                  <div className="act-title-xl">{a.title}</div>
                  <div className="act-pills">
                    {a.date && <span><i className="ti ti-calendar" /> {a.date}</span>}
                    {a.location && <span><i className="ti ti-map-pin" /> {a.location}</span>}
                  </div>
                  {a.reach && <div className="act-card-desc act-card-desc-text">{a.reach}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
