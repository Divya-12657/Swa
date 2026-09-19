import { useEffect, useState } from 'react';

function SettingsTab({ token }) {
  const SITE_SETTINGS = [
    {
      key: 'hero_video_url',
      type: 'video',
      label: 'Hero video',
      hint: 'Autoplays silently on the homepage hero. Upload an MP4 or WebM file (recommended: under 20 MB, landscape orientation).',
    },
    {
      key: 'hero_bg_url',
      type: 'image',
      label: 'Hero background image',
      hint: 'Shown as a subtle background behind the homepage quote & description.',
    },
  ];
  const [vals, setVals] = useState({});
  const [uploading, setUploading] = useState({});
  const [msgs, setMsgs] = useState({});

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setVals).catch(() => {});
  }, []);

  async function handleUpload(key, e) {
    const file = e.target.files?.[0]; if (!file) return; e.target.value = '';
    setUploading(u => ({ ...u, [key]: true }));
    setMsgs(m => ({ ...m, [key]: '⏳ Uploading…' }));
    const fd = new FormData(); fd.append('file', file);
    try {
      const uploadRes = await fetch('/api/upload-image', { method: 'POST', body: fd });
      const result = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(result.detail || 'Upload failed');
      const saveRes = await fetch(`/api/admin/settings/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
        body: JSON.stringify({ value: result.url }),
      });
      if (!saveRes.ok) {
        const b = await saveRes.json().catch(() => ({}));
        throw new Error(b.detail || `Settings save failed (${saveRes.status}) — check your admin token`);
      }
      setVals(v => ({ ...v, [key]: result.url }));
      setMsgs(m => ({ ...m, [key]: '✅ Saved — refresh the homepage to see it' }));
    } catch (err) { setMsgs(m => ({ ...m, [key]: `❌ ${err.message}` })); }
    finally { setUploading(u => ({ ...u, [key]: false })); }
  }

  async function handleClear(key) {
    await fetch(`/api/admin/settings/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
      body: JSON.stringify({ value: '' }),
    });
    setVals(v => ({ ...v, [key]: '' }));
    setMsgs(m => ({ ...m, [key]: '✅ Removed' }));
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <p style={{ fontSize: '0.875rem', color: 'var(--ink-mid)', marginBottom: 24 }}>Site-wide settings. Changes take effect after page refresh.</p>
      {SITE_SETTINGS.map(({ key, type, label, hint }) => (
        <div key={key} style={{ padding: '18px 20px', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--white)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <i className={type === 'video' ? 'ti ti-video' : 'ti ti-photo'} style={{ color: 'var(--saffron)', fontSize: '1.1rem' }} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-light)', marginBottom: 12 }}>{hint}</div>

          {vals[key] && (
            <div style={{ marginBottom: 12 }}>
              {type === 'video'
                ? <video src={vals[key]} controls muted style={{ width: '100%', maxHeight: 180, borderRadius: 8, background: '#000', display: 'block', marginBottom: 8 }} />
                : <img src={vals[key]} alt="" style={{ width: 140, height: 80, objectFit: 'cover', borderRadius: 8, display: 'block', marginBottom: 8 }} />
              }
              <div style={{ fontSize: '0.68rem', color: 'var(--ink-light)', wordBreak: 'break-all', marginBottom: 8, padding: '4px 8px', background: 'var(--surface)', borderRadius: 6 }}>
                {vals[key]}
              </div>
              <button onClick={() => handleClear(key)} style={{ fontSize: '0.78rem', color: '#c00', background: 'none', border: '1px solid #c00', borderRadius: 20, padding: '4px 12px', cursor: 'pointer' }}>
                Remove {type}
              </button>
            </div>
          )}

          {msgs[key] && <div style={{ fontSize: '0.75rem', marginBottom: 10, color: msgs[key].startsWith('❌') ? '#c00' : 'var(--ink-mid)' }}>{msgs[key]}</div>}

          <label>
            <input
              type="file"
              accept={type === 'video' ? 'video/mp4,video/webm,video/*' : 'image/*'}
              style={{ display: 'none' }}
              onChange={e => handleUpload(key, e)}
              disabled={uploading[key]}
            />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: uploading[key] ? 'var(--border)' : 'var(--saffron)', color: uploading[key] ? 'var(--ink-light)' : '#fff', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500, cursor: uploading[key] ? 'wait' : 'pointer', transition: 'background .2s' }}>
              <i className={uploading[key] ? 'ti ti-loader-2' : type === 'video' ? 'ti ti-upload' : 'ti ti-photo-up'} />
              {uploading[key] ? 'Uploading…' : vals[key] ? `Change ${type}` : `Upload ${type}`}
            </span>
          </label>
        </div>
      ))}
    </div>
  );
}

const PROGRAM_HIGHLIGHTS = {
  'food-nutrition': [
    { title: 'Monthly grocery distribution', icon: 'ti ti-shopping-cart' },
    { title: 'Community kitchens',           icon: 'ti ti-soup' },
    { title: 'Nutrition drives',             icon: 'ti ti-apple' },
    { title: 'Emergency food relief',        icon: 'ti ti-urgent' },
    { title: 'Nutrition awareness',          icon: 'ti ti-bulb' },
  ],
  'education-support': [
    { title: 'After-school learning centres', icon: 'ti ti-school' },
    { title: 'Scholarships',                  icon: 'ti ti-certificate' },
    { title: 'Career mentoring',              icon: 'ti ti-briefcase' },
    { title: 'Digital literacy',              icon: 'ti ti-device-laptop' },
    { title: 'Leadership & life skills',      icon: 'ti ti-star' },
  ],
  'healthcare-access': [
    { title: 'Community medical camps',  icon: 'ti ti-stethoscope' },
    { title: 'Preventive screenings',   icon: 'ti ti-heart-rate-monitor' },
    { title: "Women's health",          icon: 'ti ti-heart-handshake' },
    { title: 'Hygiene & sanitation',    icon: 'ti ti-droplet' },
    { title: 'Health education',        icon: 'ti ti-book-health' },
  ],
  'livelihood-skills': [
    { title: 'Vocational skill training',    icon: 'ti ti-tool' },
    { title: 'Computer & digital literacy', icon: 'ti ti-device-laptop' },
    { title: 'Entrepreneurship',            icon: 'ti ti-rocket' },
    { title: 'Financial literacy',          icon: 'ti ti-coins' },
    { title: 'Job placement support',       icon: 'ti ti-briefcase' },
  ],
  'women-empowerment': [
    { title: 'Self-help groups',        icon: 'ti ti-users-group' },
    { title: 'Entrepreneurship support', icon: 'ti ti-rocket' },
    { title: 'Skill development',       icon: 'ti ti-needle-thread' },
    { title: 'Financial literacy',      icon: 'ti ti-coins' },
    { title: 'Leadership programmes',   icon: 'ti ti-crown' },
  ],
};

const CATEGORY_META = {
  'Food drive':        { badge: 'b-food',   icon: 'ti ti-basket',           color: '#854F0B' },
  'Education':         { badge: 'b-edu',    icon: 'ti ti-school',           color: '#0F6E56' },
  'Health camp':       { badge: 'b-health', icon: 'ti ti-stethoscope',      color: '#185FA5' },
  'Women empowerment': { badge: 'b-women',  icon: 'ti ti-award',            color: '#993556' },
  'Micro-lending':     { badge: 'b-micro',  icon: 'ti ti-currency-rupee',   color: '#534AB7' },
  'Relief':            { badge: 'b-relief', icon: 'ti ti-heart-handshake',  color: '#3B6D11' },
};

const BLANK_ACTIVITY = {
  category: 'Food drive',
  title: '',
  location: '',
  reach: '',
  date: 'Today',
  image_url: '',
};

function Admin() {
  const [token, setToken] = useState('');
  const [tab, setTab] = useState('activities');

  // ── Activities ──────────────────────────────────────────
  const [activities, setActivities] = useState([]);
  const [actForm, setActForm] = useState(BLANK_ACTIVITY);
  const [actMsg, setActMsg] = useState(null);
  const [actLoading, setActLoading] = useState(false);

  useEffect(() => {
    fetch('/api/activities').then(r => r.json()).then(setActivities).catch(() => {});
  }, []);

  function handleActChange(e) {
    setActForm({ ...actForm, [e.target.name]: e.target.value });
  }

  async function handleActSubmit(e) {
    e.preventDefault();
    setActMsg(null);
    setActLoading(true);
    const meta = CATEGORY_META[actForm.category];
    try {
      const res = await fetch('/api/admin/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
        body: JSON.stringify({ ...actForm, ...meta, images: actImages, image_url: actImages[0] || actForm.image_url }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.detail || 'Failed to post activity');
      }
      const created = await res.json();
      setActivities([created, ...activities]);
      setActForm(BLANK_ACTIVITY);
      setActImages([]);
      setActMsg({ type: 'ok', text: 'Activity posted to the website.' });
    } catch (err) {
      setActMsg({ type: 'err', text: err.message });
    } finally {
      setActLoading(false);
    }
  }

  async function handleActDelete(id) {
    if (!window.confirm('Delete this activity?')) return;
    await fetch(`/api/admin/activities/${id}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Token': token },
    });
    setActivities(activities.filter(a => a.id !== id));
  }

  // ── Activity image upload ────────────────────────────────
  const [actImages, setActImages] = useState([]);
  const [actImgUploading, setActImgUploading] = useState(false);

  async function handleActImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setActImgUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Upload failed');
      setActImages(imgs => [...imgs, result.url]);
    } catch (err) {
      setActMsg({ type: 'err', text: err.message });
    } finally {
      setActImgUploading(false);
    }
  }

  function removeActImage(idx) {
    setActImages(imgs => imgs.filter((_, i) => i !== idx));
  }

  // ── Programs ─────────────────────────────────────────────
  const [programs, setPrograms] = useState([]);
  const [progMsg, setProgMsg] = useState({});
  const [progUploading, setProgUploading] = useState({});
  const [expandedProg, setExpandedProg] = useState(null);
  const [hlImages, setHlImages] = useState({});   // {slug: {h_idx: [url0,url1,url2]}}
  const [hlUploading, setHlUploading] = useState({});
  const [hlMsg, setHlMsg] = useState({});

  useEffect(() => {
    fetch('/api/programs').then(r => r.json()).then(data => {
      setPrograms(data);
      const map = {};
      data.forEach(p => { map[p.slug] = p.highlight_images || {}; });
      setHlImages(map);
    }).catch(() => {});
  }, []);

  async function handleProgImageUpload(slug, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setProgUploading(p => ({ ...p, [slug]: true }));
    setProgMsg(m => ({ ...m, [slug]: '⏳ Uploading…' }));
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Upload failed');
      await fetch(`/api/admin/programs/${slug}/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
        body: JSON.stringify({ image_url: result.url }),
      });
      setPrograms(prev => prev.map(p => p.slug === slug ? { ...p, image_url: result.url } : p));
      setProgMsg(m => ({ ...m, [slug]: '✅ Saved — visible on the program page' }));
    } catch (err) {
      setProgMsg(m => ({ ...m, [slug]: `❌ ${err.message}` }));
    } finally {
      setProgUploading(p => ({ ...p, [slug]: false }));
    }
  }

  async function handleProgImageRemove(slug) {
    try {
      await fetch(`/api/admin/programs/${slug}/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
        body: JSON.stringify({ image_url: '' }),
      });
      setPrograms(prev => prev.map(p => p.slug === slug ? { ...p, image_url: '' } : p));
      setProgMsg(m => ({ ...m, [slug]: '✅ Removed' }));
    } catch (err) {
      setProgMsg(m => ({ ...m, [slug]: `❌ ${err.message}` }));
    }
  }

  async function handleHlUpload(slug, hIdx, imgIdx, e) {
    const file = e.target.files?.[0]; if (!file) return; e.target.value = '';
    const key = `${slug}_${hIdx}_${imgIdx}`;
    setHlUploading(u => ({ ...u, [key]: true }));
    setHlMsg(m => ({ ...m, [`${slug}_${hIdx}`]: '⏳ Uploading…' }));
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Upload failed');
      await fetch(`/api/admin/programs/${slug}/highlights/${hIdx}/${imgIdx}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
        body: JSON.stringify({ image_url: result.url }),
      });
      setHlImages(prev => {
        const updated = { ...prev };
        if (!updated[slug]) updated[slug] = {};
        const imgs = [...(updated[slug][hIdx] || [])];
        while (imgs.length <= imgIdx) imgs.push('');
        imgs[imgIdx] = result.url;
        updated[slug] = { ...updated[slug], [hIdx]: imgs };
        return updated;
      });
      setHlMsg(m => ({ ...m, [`${slug}_${hIdx}`]: '✅ Saved' }));
    } catch (err) {
      setHlMsg(m => ({ ...m, [`${slug}_${hIdx}`]: `❌ ${err.message}` }));
    } finally {
      setHlUploading(u => ({ ...u, [key]: false }));
    }
  }

  async function handleHlRemove(slug, hIdx, imgIdx) {
    try {
      await fetch(`/api/admin/programs/${slug}/highlights/${hIdx}/${imgIdx}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
        body: JSON.stringify({ image_url: '' }),
      });
      setHlImages(prev => {
        const updated = { ...prev };
        const imgs = [...(updated[slug]?.[hIdx] || [])];
        imgs[imgIdx] = '';
        updated[slug] = { ...updated[slug], [hIdx]: imgs };
        return updated;
      });
      setHlMsg(m => ({ ...m, [`${slug}_${hIdx}`]: '✅ Removed' }));
    } catch (err) {
      setHlMsg(m => ({ ...m, [`${slug}_${hIdx}`]: `❌ ${err.message}` }));
    }
  }

  // ── Trustees ─────────────────────────────────────────────
  const [trustees, setTrustees] = useState([]);
  const [trusteeMsg, setTrusteeMsg] = useState({});
  const [trusteeUploading, setTrusteeUploading] = useState({});

  useEffect(() => {
    fetch('/api/trustees').then(r => r.json()).then(setTrustees).catch(() => {});
  }, []);

  async function handleTrusteePhotoUpload(idx, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setTrusteeUploading(p => ({ ...p, [idx]: true }));
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Upload failed');
      await fetch(`/api/admin/trustees/${idx}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
        body: JSON.stringify({ photo_url: result.url }),
      });
      setTrustees(prev => prev.map(t => t.idx === idx ? { ...t, photo_url: result.url } : t));
      setTrusteeMsg(m => ({ ...m, [idx]: '✅ Photo updated' }));
    } catch (err) {
      setTrusteeMsg(m => ({ ...m, [idx]: `❌ ${err.message}` }));
    } finally {
      setTrusteeUploading(p => ({ ...p, [idx]: false }));
    }
  }

  async function handleTrusteeNameUpdate(idx, name, role) {
    try {
      await fetch(`/api/admin/trustees/${idx}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
        body: JSON.stringify({ name, role }),
      });
      setTrusteeMsg(m => ({ ...m, [idx]: '✅ Saved' }));
    } catch (err) {
      setTrusteeMsg(m => ({ ...m, [idx]: `❌ ${err.message}` }));
    }
  }

  async function handleAddTrustee() {
    try {
      const res = await fetch('/api/admin/trustees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
        body: JSON.stringify({ name: 'New Trustee', role: 'Trustee' }),
      });
      if (!res.ok) { const b = await res.json(); throw new Error(b.detail || 'Failed'); }
      const data = await res.json();
      setTrustees(prev => [...prev, data]);
    } catch (err) {
      alert(`❌ ${err.message}`);
    }
  }

  async function handleRemoveTrustee(idx) {
    if (!window.confirm('Remove this trustee? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/trustees/${idx}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': token },
      });
      if (!res.ok) { const b = await res.json(); throw new Error(b.detail || 'Failed'); }
      setTrustees(prev => prev.filter(t => t.idx !== idx));
    } catch (err) {
      alert(`❌ ${err.message}`);
    }
  }

  // ── Videos ──────────────────────────────────────────────
  const [vidForm, setVidForm] = useState({ title: '', description: '', videoUrl: '', thumbnailUrl: '' });
  const [vidMsg, setVidMsg] = useState('');
  const [uploadState, setUploadState] = useState({ status: '', url: '' });
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetch('/api/videos').then(r => r.json()).then(setVideos).catch(() => {});
  }, []);

  function handleVidChange(e) {
    setVidForm({ ...vidForm, [e.target.name]: e.target.value });
  }

  async function handleVidSubmit(e) {
    e.preventDefault();
    setVidMsg('');
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
        body: JSON.stringify({
          title: vidForm.title,
          description: vidForm.description,
          video_url: vidForm.videoUrl,
          thumbnail_url: vidForm.thumbnailUrl,
        }),
      });
      if (!res.ok) { const b = await res.json(); throw new Error(b.detail || 'Failed'); }
      const data = await res.json();
      setVideos(v => [data, ...v]);
      setVidMsg(`Published: ${data.title}`);
      setVidForm({ title: '', description: '', videoUrl: '', thumbnailUrl: '' });
    } catch (err) {
      setVidMsg(err.message);
    }
  }

  async function handleVidDelete(id) {
    if (!window.confirm('Delete this video?')) return;
    const res = await fetch(`/api/admin/videos/${id}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Token': token },
    });
    if (res.ok || res.status === 204) {
      setVideos(v => v.filter(x => x.id !== id));
    } else {
      const body = await res.json().catch(() => ({}));
      setVidMsg(body.detail || `Delete failed (${res.status}) — check your token`);
    }
  }

  async function handleUpload(e) {
    setUploadState({ status: 'uploading', url: '' });
    const file = e.target.files?.[0];
    if (!file) { setUploadState({ status: 'error', url: '' }); return; }
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Upload failed');
      setUploadState({ status: 'done', url: result.url });
      setVidForm(f => ({ ...f, thumbnailUrl: result.url }));
    } catch (err) {
      setUploadState({ status: 'error', url: '' });
      setVidMsg(err.message);
    }
  }

  return (
    <main className="admin-page">
      <section className="hero" style={{ minHeight: 'auto', padding: '50px 5% 36px' }}>
        <div className="hero-content fade-up" style={{ maxWidth: '860px' }}>
          <div className="hero-eyebrow"><i className="ti ti-lock" /> Admin Dashboard</div>
          <h1>Manage website content</h1>
          <div className="field-row" style={{ marginTop: 20, maxWidth: 480 }}>
            <div className="field-group" style={{ marginBottom: 0 }}>
              <label className="field-label">Admin token</label>
              <input
                type="password"
                placeholder="Enter token once, use all forms"
                value={token}
                onChange={e => setToken(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 5% 60px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          {['activities', 'programs', 'trustees', 'videos', 'settings'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                padding: '10px 22px', border: 'none', background: 'transparent',
                fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 500,
                cursor: 'pointer', color: tab === t ? 'var(--saffron)' : 'var(--ink-mid)',
                borderBottom: tab === t ? '2px solid var(--saffron)' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {t === 'activities' ? 'Activities' : t === 'programs' ? 'Programs' : t === 'trustees' ? 'Trustees' : t === 'settings' ? 'Settings' : 'Videos'}
            </button>
          ))}
        </div>

        {/* ── ACTIVITIES TAB ─────────────────────────── */}
        {tab === 'activities' && (
          <div className="admin-activities-grid">
            <div className="prog-card">
              <div className="prog-title" style={{ marginBottom: 20 }}>Post a new activity</div>
              <form onSubmit={handleActSubmit}>
                <div className="field-group">
                  <label className="field-label">Category</label>
                  <select name="category" value={actForm.category} onChange={handleActChange}>
                    {Object.keys(CATEGORY_META).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label className="field-label">Title</label>
                  <input name="title" value={actForm.title} onChange={handleActChange} placeholder="e.g. Grocery kits — Neelasandra colony" required />
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label">Location</label>
                    <input name="location" value={actForm.location} onChange={handleActChange} placeholder="e.g. Neelasandra" />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Date label</label>
                    <input name="date" value={actForm.date} onChange={handleActChange} placeholder="Today / Yesterday / …" />
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label">Reach</label>
                  <input name="reach" value={actForm.reach} onChange={handleActChange} placeholder="e.g. 320 families reached" />
                </div>
                <div className="field-group">
                  <label className="field-label">Photos ({actImages.length} added)</label>
                  {actImages.length < 6 && (
                    <input type="file" accept="image/*" onChange={handleActImageUpload} disabled={actImgUploading} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', width: '100%' }} />
                  )}
                  {actImgUploading && <p style={{ fontSize: '0.8rem', marginTop: 6, color: 'var(--ink-light)' }}>Uploading…</p>}
                  {actImages.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 8 }}>
                      {actImages.map((url, i) => (
                        <div key={i} style={{ position: 'relative', height: 72, borderRadius: 6, overflow: 'hidden' }}>
                          <div style={{ width: '100%', height: '100%', backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                          <button type="button" onClick={() => removeActImage(i)} style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: 20, height: 20, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0 16px', padding: '10px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)' }}>
                  <i className={CATEGORY_META[actForm.category].icon} style={{ color: CATEGORY_META[actForm.category].color, fontSize: '1.4rem' }} />
                  <span className={`act-badge ${CATEGORY_META[actForm.category].badge}`}>{actForm.category}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--ink-light)' }}>auto-assigned</span>
                </div>
                <button className="btn btn-primary" type="submit" disabled={actLoading} style={{ width: '100%' }}>
                  {actLoading ? 'Posting…' : 'Post to website'}
                </button>
              </form>
              {actMsg && (
                <div style={{ marginTop: 12, fontSize: '0.85rem', color: actMsg.type === 'ok' ? '#0F6E56' : '#993C1D', fontWeight: 500 }}>
                  {actMsg.type === 'ok' ? <i className="ti ti-circle-check" /> : <i className="ti ti-alert-circle" />} {actMsg.text}
                </div>
              )}
            </div>

            <div>
              <div className="section-label" style={{ marginBottom: 14 }}>Posted activities ({activities.length})</div>
              {activities.length === 0 && <p style={{ color: 'var(--ink-light)', fontSize: '0.875rem' }}>No activities yet.</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activities.map(a => (
                  <div key={a.id} className="act-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', cursor: 'default' }}>
                    <i className={a.icon} style={{ color: a.color, fontSize: '1.6rem', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className={`act-badge ${a.badge}`}>{a.category}</span>
                      <div className="act-title" style={{ marginTop: 4 }}>{a.title}</div>
                      <div className="act-meta" style={{ marginTop: 2 }}>
                        {a.location && <><i className="ti ti-map-pin" /> {a.location} · </>}
                        {a.date}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleActDelete(a.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--ink-light)', cursor: 'pointer', fontSize: '1.1rem', flexShrink: 0 }}
                      title="Delete"
                    >
                      <i className="ti ti-trash" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PROGRAMS TAB ───────────────────────────── */}
        {tab === 'programs' && (
          <div style={{ maxWidth: 720 }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-mid)', marginBottom: 24 }}>
              Upload a hero image for each program. It appears as the full-width background on the program detail page.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {programs.map(prog => (
                <div key={prog.slug} style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'var(--white)', overflow: 'hidden' }}>
                  {/* header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: prog.image_url ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 9, background: `${prog.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: prog.color, flexShrink: 0 }}>
                      <i className={prog.icon} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{prog.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-light)' }}>{prog.slug}</div>
                    </div>
                    {prog.image_url
                      ? <span style={{ fontSize: '0.72rem', background: '#E8F5E9', color: '#2E7D32', borderRadius: 20, padding: '3px 10px', fontWeight: 500 }}>✅ Image set</span>
                      : <span style={{ fontSize: '0.72rem', background: 'var(--surface)', color: 'var(--ink-light)', borderRadius: 20, padding: '3px 10px' }}>No image</span>
                    }
                  </div>

                  {/* image preview */}
                  {prog.image_url && (
                    <div style={{ position: 'relative' }}>
                      <img src={prog.image_url} alt={prog.title} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)', display: 'flex', alignItems: 'flex-end', padding: '12px 14px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)' }}>This will appear as the program hero background</span>
                      </div>
                    </div>
                  )}

                  {/* actions */}
                  <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <label>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleProgImageUpload(prog.slug, e)} disabled={progUploading[prog.slug]} />
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: progUploading[prog.slug] ? 'var(--border)' : 'var(--saffron)', color: progUploading[prog.slug] ? 'var(--ink-light)' : '#fff', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500, cursor: progUploading[prog.slug] ? 'wait' : 'pointer' }}>
                        <i className="ti ti-photo-up" />
                        {progUploading[prog.slug] ? 'Uploading…' : prog.image_url ? 'Change hero image' : 'Upload hero image'}
                      </span>
                    </label>
                    {prog.image_url && (
                      <button onClick={() => handleProgImageRemove(prog.slug)} style={{ padding: '7px 14px', borderRadius: 20, border: '1px solid #e57373', background: 'transparent', color: '#c62828', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer' }}>
                        Remove
                      </button>
                    )}
                    {progMsg[prog.slug] && (
                      <span style={{ fontSize: '0.75rem', color: progMsg[prog.slug].startsWith('❌') ? '#c00' : 'var(--ink-mid)' }}>{progMsg[prog.slug]}</span>
                    )}
                  </div>

                  {/* gallery images */}
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    <button
                      onClick={() => setExpandedProg(expandedProg === prog.slug ? null : prog.slug)}
                      style={{ width: '100%', padding: '11px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 600, color: 'var(--ink-mid)' }}
                    >
                      <span><i className="ti ti-photo-plus" style={{ marginRight: 6 }} />Gallery images</span>
                      <i className={`ti ti-chevron-${expandedProg === prog.slug ? 'up' : 'down'}`} />
                    </button>

                    {expandedProg === prog.slug && (() => {
                      const uploaded = hlImages[prog.slug]?.[0] || [];
                      const filledCount = uploaded.filter(Boolean).length;
                      const nextIdx = uploaded.findIndex(u => !u);
                      const addIdx = nextIdx !== -1 ? nextIdx : uploaded.length;
                      const canAdd = filledCount < 12;
                      const addKey = `${prog.slug}_0_${addIdx}`;
                      return (
                        <div style={{ padding: '0 18px 18px' }}>
                          <p style={{ fontSize: '0.75rem', color: 'var(--ink-light)', margin: '0 0 12px' }}>
                            These appear in the gallery on the program page.
                          </p>
                          {hlMsg[`${prog.slug}_0`] && (
                            <p style={{ fontSize: '0.75rem', color: hlMsg[`${prog.slug}_0`].startsWith('❌') ? '#c00' : '#2E7D32', margin: '0 0 10px' }}>
                              {hlMsg[`${prog.slug}_0`]}
                            </p>
                          )}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                            {uploaded.map((url, imgIdx) => url ? (
                              <div key={imgIdx} style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, display: 'block' }} />
                                <button
                                  onClick={() => handleHlRemove(prog.slug, 0, imgIdx)}
                                  style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#fff', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.65rem', color: '#c00', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', padding: 0 }}
                                >
                                  <i className="ti ti-x" />
                                </button>
                              </div>
                            ) : null)}
                            {canAdd && (
                              <label style={{ width: 80, height: 80, borderRadius: 8, border: `2px dashed ${prog.color}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: hlUploading[addKey] ? 'wait' : 'pointer', background: `${prog.color}08`, flexShrink: 0 }}>
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleHlUpload(prog.slug, 0, addIdx, e)} disabled={hlUploading[addKey]} />
                                {hlUploading[addKey]
                                  ? <i className="ti ti-loader-2" style={{ fontSize: '1.3rem', color: prog.color, opacity: 0.6 }} />
                                  : <i className="ti ti-plus" style={{ fontSize: '1.5rem', color: prog.color, opacity: 0.7 }} />
                                }
                              </label>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TRUSTEES TAB ───────────────────────────── */}
        {tab === 'trustees' && (
          <div style={{ maxWidth: 720 }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-mid)', marginBottom: 24 }}>
              Update trustee names, roles, and upload their photos.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {trustees.map(t => (
                <div key={t.idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 18px', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--white)', position: 'relative' }}>
                  {t.photo_url
                    ? <img src={t.photo_url} alt={t.name} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    : <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--saffron-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: 'var(--saffron)', fontWeight: 700, flexShrink: 0 }}>
                        {(t.name || '?').charAt(0)}
                      </div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                      <input
                        defaultValue={t.name}
                        placeholder="Full name"
                        style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.85rem' }}
                        onBlur={e => handleTrusteeNameUpdate(t.idx, e.target.value, t.role)}
                        id={`trustee-name-${t.idx}`}
                      />
                      <input
                        defaultValue={t.role}
                        placeholder="Role"
                        style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.85rem' }}
                        onBlur={e => handleTrusteeNameUpdate(t.idx, document.getElementById(`trustee-name-${t.idx}`)?.value || t.name, e.target.value)}
                      />
                    </div>
                    {trusteeMsg[t.idx] && <div style={{ fontSize: '0.75rem', marginBottom: 6 }}>{trusteeMsg[t.idx]}</div>}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <label>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleTrusteePhotoUpload(t.idx, e)} disabled={trusteeUploading[t.idx]} />
                        <span style={{ display: 'inline-block', padding: '5px 12px', background: 'var(--saffron)', color: '#fff', borderRadius: 20, fontSize: '0.78rem', fontWeight: 500, cursor: trusteeUploading[t.idx] ? 'wait' : 'pointer' }}>
                          {trusteeUploading[t.idx] ? 'Uploading…' : t.photo_url ? 'Change photo' : 'Upload photo'}
                        </span>
                      </label>
                      <button
                        onClick={() => handleRemoveTrustee(t.idx)}
                        style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid #e57373', background: 'transparent', color: '#c62828', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddTrustee}
              style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 40, border: '1.5px dashed var(--saffron)', background: 'var(--saffron-light)', color: 'var(--saffron-dark)', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', width: '100%', justifyContent: 'center' }}
            >
              + Add trustee
            </button>
          </div>
        )}

        {/* ── SETTINGS TAB ───────────────────────────── */}
        {tab === 'settings' && <SettingsTab token={token} />}

        {/* ── VIDEOS TAB ─────────────────────────────── */}
        {tab === 'videos' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, maxWidth: 640 }}>
            <div className="prog-card">
              <div className="prog-title">Upload thumbnail image</div>
              <p className="prog-desc" style={{ marginBottom: 12 }}>Stored in AWS S3. URL is auto-filled below.</p>
              <input type="file" accept="image/*" onChange={handleUpload} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)' }} />
              {uploadState.status === 'uploading' && <p style={{ marginTop: 8, fontSize: '0.85rem' }}>Uploading…</p>}
              {uploadState.status === 'done' && <p style={{ marginTop: 8, fontSize: '0.85rem', color: '#0F6E56' }}>Uploaded ✓</p>}
            </div>
            <div className="prog-card">
              <div className="prog-title" style={{ marginBottom: 16 }}>Publish a video update</div>
              <form onSubmit={handleVidSubmit}>
                <div className="field-group"><label className="field-label">Title</label><input name="title" value={vidForm.title} onChange={handleVidChange} required /></div>
                <div className="field-group"><label className="field-label">Description</label><textarea name="description" value={vidForm.description} onChange={handleVidChange} required /></div>
                <div className="field-group"><label className="field-label">Video URL</label><input name="videoUrl" value={vidForm.videoUrl} onChange={handleVidChange} required /></div>
                <div className="field-group"><label className="field-label">Thumbnail URL</label><input name="thumbnailUrl" value={vidForm.thumbnailUrl} onChange={handleVidChange} placeholder="Auto-filled after upload" required /></div>
                <button className="btn btn-primary" type="submit" style={{ marginTop: 12 }}>Publish video</button>
              </form>
              {vidMsg && <p style={{ marginTop: 12, fontSize: '0.85rem', color: vidMsg.startsWith('Published') ? '#0F6E56' : '#993C1D' }}>{vidMsg}</p>}
            </div>
            <div className="prog-card" style={{ marginTop: 20 }}>
              <div className="prog-title" style={{ marginBottom: 14 }}>Posted videos ({videos.length})</div>
              {videos.length === 0 && <p style={{ color: 'var(--ink-light)', fontSize: '0.875rem' }}>No videos yet.</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {videos.map(v => (
                  <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }}>
                    <i className="ti ti-brand-youtube" style={{ color: '#FF0000', fontSize: '1.4rem', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-light)', marginTop: 2 }}>{v.description}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleVidDelete(v.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--ink-light)', cursor: 'pointer', fontSize: '1.1rem', flexShrink: 0 }}
                      title="Delete"
                    >
                      <i className="ti ti-trash" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default Admin;
