import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Admin from './pages/Admin';

function Gallery({ activity, onClose }) {
  const images = activity.images?.length
    ? activity.images
    : activity.image_url ? [activity.image_url] : [];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, onClose]);

  return (
    <div className="gallery-overlay" onClick={onClose}>
      <div className="gallery-modal" onClick={e => e.stopPropagation()}>
        <button className="gallery-close" onClick={onClose}><i className="ti ti-x" /></button>
        <div className="gallery-img-wrap">
          <img src={images[idx]} alt="" className="gallery-img" />
          {images.length > 1 && (
            <>
              <button className="gallery-arrow gallery-prev" onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}><i className="ti ti-chevron-left" /></button>
              <button className="gallery-arrow gallery-next" onClick={() => setIdx(i => (i + 1) % images.length)}><i className="ti ti-chevron-right" /></button>
              <div className="gallery-counter">{idx + 1} / {images.length}</div>
            </>
          )}
        </div>
        <div className="gallery-info">
          <span className={`act-badge ${activity.badge}`}>{activity.category}</span>
          <div className="gallery-title">{activity.title}</div>
          <div className="gallery-meta-row">
            {activity.location && <span><i className="ti ti-map-pin" /> {activity.location}</span>}
            {activity.reach && <span><i className="ti ti-users" /> {activity.reach}</span>}
            {activity.date && <span><i className="ti ti-calendar" /> {activity.date}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

const defaultActivities = [
  {
    category: 'Food drive',
    title: 'Grocery kits — Neelasandra colony',
    location: 'Neelasandra',
    reach: '320 families reached',
    badge: 'b-food',
    icon: 'ti ti-basket',
    date: 'Today',
    color: '#854F0B',
  },
  {
    category: 'Education',
    title: 'Scholarship awards ceremony — LR Nagar',
    location: 'LR Nagar',
    reach: '18 students',
    badge: 'b-edu',
    icon: 'ti ti-school',
    date: 'Yesterday',
    color: '#0F6E56',
  },
  {
    category: 'Health camp',
    title: 'Free eye checkup & medicines — Karesandra',
    location: 'Karesandra',
    reach: '84 patients',
    badge: 'b-health',
    icon: 'ti ti-stethoscope',
    date: '2 days ago',
    color: '#185FA5',
  },
];

const defaultPrograms = [
  {
    icon: 'ti ti-basket',
    title: 'Food & nutrition',
    description: 'Daily grocery distribution reaching 500+ doorsteps. We address malnutrition and ensure no family goes to bed hungry.',
    stat: '500+ families served daily',
  },
  {
    icon: 'ti ti-school',
    title: 'Education support',
    description: 'After-school classes, scholarships, and career mentoring for children from underserved neighborhoods.',
    stat: '200+ children supported',
  },
  {
    icon: 'ti ti-stethoscope',
    title: 'Healthcare access',
    description: 'Regular health camps, screenings, and medicine distribution for families in need.',
    stat: '4 community camps monthly',
  },
];

const defaultStories = [
  {
    quote: 'Swabhimaan helped me find work training and now I can send my child to school.',
    name: 'Prerna',
    role: 'Community parent',
  },
  {
    quote: 'The health camp made it possible for me to get medicine without any cost.',
    name: 'Ravi',
    role: 'Beneficiary',
  },
  {
    quote: 'I feel empowered after the tailoring workshop — I can support my family.',
    name: 'Shanti',
    role: 'Program graduate',
  },
];

const defaultFaqs = [
  {
    question: 'How can I donate regularly?',
    answer: 'Choose a monthly plan using the slider and donate directly on the website.',
    tag: 'Donation',
  },
  {
    question: 'Can I volunteer for neighborhood drives?',
    answer: 'Yes. We welcome volunteers for food distribution, tutoring, and health awareness programs.',
    tag: 'Volunteer',
  },
  {
    question: 'Are donations tax-deductible?',
    answer: 'Swabhimaan is 80G certified and provides donation receipts for eligible donors.',
    tag: 'Trust',
  },
];

const defaultTrust = [
  { title: 'Registered trust', value: 'Section 12A registered' },
  { title: '80G exemption', value: 'Tax benefit for donors' },
  { title: 'FCRA compliant', value: 'International funding ready' },
];

function getYoutubeEmbed(url) {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/live\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return null;
}

function Home({ activities, programs, stories, faqs, trust, videos }) {
  const [galleryActivity, setGalleryActivity] = useState(null);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [donationAmount, setDonationAmount] = useState(500);

  const impact = useMemo(() => {
    const meals = Math.max(1, Math.round(donationAmount / 55));
    const tuition = Math.max(1, Math.round(donationAmount / 80));
    const kits = Math.max(1, Math.round(donationAmount / 350));
    return { meals, tuition, kits };
  }, [donationAmount]);

  const [faqOpen, setFaqOpen] = useState(0);

  const kitOptions = [
    { icon: 'ti ti-package', name: 'Grocery kit', price: '~₹800 / family' },
    { icon: 'ti ti-soup', name: 'Cooked meals', price: '~₹60 / person' },
    { icon: 'ti ti-milk', name: "Children's pack", price: '~₹300 / child' },
    { icon: 'ti ti-wheat', name: 'Ration supplies', price: '~₹1,200 / month' },
    { icon: 'ti ti-currency-rupee', name: 'Cash donation', price: 'We procure & deliver' },
    { icon: 'ti ti-edit', name: 'Custom request', price: 'Tell us below' },
  ];
  const [selectedKit, setSelectedKit] = useState('Grocery kit');
  const [fdName, setFdName] = useState('');
  const [fdPhone, setFdPhone] = useState('');
  const [fdArea, setFdArea] = useState('Neelasandra');
  const [fdDate, setFdDate] = useState('');
  const [fdQty, setFdQty] = useState('');
  const [fdNotes, setFdNotes] = useState('');

  async function handleSendFood() {
    const lines = [
      `Hi Swabhimaan! I'd like to send food.`,
      ``,
      `Name: ${fdName || '(not provided)'}`,
      `WhatsApp: ${fdPhone || '(not provided)'}`,
      `Kit: ${selectedKit}`,
      `Area: ${fdArea}`,
      `Date: ${fdDate || '(flexible)'}`,
      `Families / people: ${fdQty || '(not specified)'}`,
      `Notes: ${fdNotes || 'None'}`,
    ];
    try {
      await fetch('/api/food-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fdName || null,
          phone: fdPhone || null,
          kit_type: selectedKit,
          area: fdArea,
          preferred_date: fdDate || null,
          qty: fdQty || null,
          notes: fdNotes || null,
        }),
      });
    } catch (_) {
      // still open WhatsApp even if DB save fails
    }
    window.open(`https://wa.me/9945277470?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
  }

  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [paying, setPaying] = useState(false);
  const [payStatus, setPayStatus] = useState(null);

  async function handleDonate() {
    setPaying(true);
    setPayStatus(null);
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: donationAmount,
          donor_name: donorName || null,
          donor_phone: donorPhone || null,
        }),
      });
      if (!res.ok) throw new Error('Could not create order');
      const order = await res.json();

      const options = {
        key: order.key_id,
        amount: order.amount * 100,
        currency: 'INR',
        name: 'Swabhimaan NGO',
        description: 'Donation',
        order_id: order.razorpay_order_id,
        handler: async function (response) {
          const verify = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          setPayStatus(verify.ok ? 'success' : 'failed');
          setPaying(false);
        },
        prefill: { name: donorName, contact: donorPhone },
        theme: { color: '#D4650B' },
        modal: { ondismiss: () => setPaying(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => { setPayStatus('failed'); setPaying(false); });
      rzp.open();
    } catch (err) {
      console.error(err);
      setPayStatus('failed');
      setPaying(false);
    }
  }

  return (
    <>
      <section className="hero" id="home">
        <div className="hero-content fade-up">
          <div className="hero-eyebrow">
            <i className="ti ti-map-pin" /> Bengaluru · Serving since 2000
          </div>
          <h1>
            Enabling dignity,
            <br />
            <em>one family</em>
            <br />
            at a time.
          </h1>
          <p>
            Swabhimaan works in the slum neighborhoods of Bengaluru — feeding 500+ people daily, educating children, empowering women through micro-lending, and providing healthcare to those who need it most.
          </p>
          <div className="hero-btns">
            <a href="#donate" className="btn btn-primary">
              <i className="ti ti-heart" /> Donate now
            </a>
            <a href="#food-delivery" className="btn btn-ghost">
              <i className="ti ti-basket" /> Send food
            </a>
            <a href="#help" className="btn btn-ghost">
              <i className="ti ti-users" /> Volunteer
            </a>
          </div>
        </div>
        <div className="hero-visual fade-up-2">
          <div className="hero-stat-grid">
            <div className="stat-card">
              <div className="num">500+</div>
              <div className="lbl">Meals served daily</div>
            </div>
            <div className="stat-card">
              <div className="num">24 yrs</div>
              <div className="lbl">Continuous service</div>
            </div>
            <div className="stat-card">
              <div className="num">1,200+</div>
              <div className="lbl">Micro-loans disbursed</div>
            </div>
            <div className="stat-card">
              <div className="num">5</div>
              <div className="lbl">Active neighborhoods</div>
            </div>
          </div>
          <div className="trust-strip">
            <div className="trust-item">
              <i className="ti ti-circle-check" /> Registered charitable trust
            </div>
            <div className="trust-item">
              <i className="ti ti-circle-check" /> 80G tax exemption
            </div>
            <div className="trust-item">
              <i className="ti ti-circle-check" /> FCRA compliant
            </div>
          </div>
        </div>
      </section>

      <section id="activities">
        <div className="section-header">
          <div>
            <div className="section-label">Live updates</div>
            <h2 className="section-title">
              Latest <em>activities</em>
            </h2>
          </div>
          {!showAllActivities && activities.length > 4 && (
            <button className="see-all" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowAllActivities(true)}>
              View all activities <i className="ti ti-arrow-right" />
            </button>
          )}
        </div>
        <div className="activity-grid">
          {(showAllActivities ? activities : activities.slice(0, 4)).map((activity) => {
            const imgs = activity.images?.length
              ? activity.images
              : activity.image_url ? [activity.image_url] : [];
            const hasImages = imgs.length > 0;
            return (
              <div
                key={activity.id || activity.title}
                className={`act-card ${activity.featured ? 'featured' : ''}`}
              >
                <div
                  className={`act-img-area ${!hasImages ? (activity.badge || 'act-img-food') : ''}`}
                  style={hasImages ? { backgroundImage: `url(${imgs[0]})` } : {}}
                >
                  {!hasImages && <i className={activity.icon} style={{ fontSize: '2.5rem', color: activity.color }} />}
                  <div className="act-date-badge">{activity.date}</div>
                  {imgs.length > 1 && <div className="act-img-count"><i className="ti ti-photo" /> {imgs.length}</div>}
                </div>
                <div className="act-body">
                  <span className={`act-badge ${activity.badge}`}>{activity.category}</span>
                  <div className="act-title">{activity.title}</div>
                  <div className="act-card-desc">
                    {activity.location && <span><i className="ti ti-map-pin" /> {activity.location}</span>}
                    {activity.reach && <span><i className="ti ti-users" /> {activity.reach}</span>}
                  </div>
                  {hasImages && (
                    <button className="act-action-btn" onClick={() => setGalleryActivity(activity)}>
                      View Pictures <i className="ti ti-arrow-right" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {showAllActivities && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button className="see-all" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowAllActivities(false)}>
              Show less <i className="ti ti-arrow-up" />
            </button>
          </div>
        )}
        {galleryActivity && <Gallery activity={galleryActivity} onClose={() => setGalleryActivity(null)} />}
      </section>

      <section id="impact">
        <div className="section-label">Your impact</div>
        <h2 className="section-title" style={{ color: '#fff', marginBottom: '10px' }}>
          See what your <em style={{ color: '#FAC775' }}>donation</em> does
        </h2>
        <p className="section-sub" style={{ marginBottom: '36px', color: 'rgba(255,255,255,0.6)' }}>
          Drag the slider to see exactly what your contribution provides to families in Bengaluru.
        </p>
        <div className="calc-wrap">
          <div className="calc-slider-row">
            <span className="calc-label">Monthly donation</span>
            <input
              type="range"
              min="100"
              max="20000"
              step="100"
              value={donationAmount}
              onChange={(event) => setDonationAmount(Number(event.target.value))}
            />
            <span className="calc-amount">₹{donationAmount}</span>
          </div>
          <div className="calc-outcomes">
            <div className="outcome-card">
              <div className="outcome-num">{impact.meals}</div>
              <div className="outcome-label">Meals provided</div>
            </div>
            <div className="outcome-card">
              <div className="outcome-num">{impact.tuition}</div>
              <div className="outcome-label">Days of tuition funded</div>
            </div>
            <div className="outcome-card">
              <div className="outcome-num">{impact.kits}</div>
              <div className="outcome-label">Hygiene kits</div>
            </div>
          </div>
          <p className="calc-note">₹55 = 1 meal · ₹80 = 1 day tuition · ₹350 = 1 hygiene kit</p>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <a href="#donate" className="btn btn-primary" style={{ borderRadius: 40, padding: '11px 28px', fontSize: '0.95rem' }}>
              Donate ₹{donationAmount}/month <i className="ti ti-arrow-right" />
            </a>
          </div>
        </div>
      </section>

      <section id="programs">
        <div className="section-label">What we do</div>
        <h2 className="section-title">
          Six pillars of <em>community care</em>
        </h2>
        <p className="section-sub">
          Every program is designed to create lasting self-reliance — not dependency. We build skills, connections, and confidence alongside food, health, and education.
        </p>
        <div className="programs-grid">
          {programs.map((program) => (
            <div key={program.title} className="prog-card">
              <div className="prog-icon">
                <i className={program.icon} />
              </div>
              <div className="prog-title">{program.title}</div>
              <div className="prog-desc">{program.description}</div>
              <div className="prog-stat">
                <i className="ti ti-trending-up" /> {program.stat}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="help">
        <div className="section-label">How to help</div>
        <h2 className="section-title">
          Join the movement <em>with purpose</em>
        </h2>
        <p className="section-sub">
          You can contribute as a donor, volunteer, or campaign partner. Every action supports our shared mission of dignity and stability.
        </p>
        <div className="help-grid">
          <a href="#donate" className="help-card featured">
            <div className="hc-icon">
              <i className="ti ti-heart" />
            </div>
            <div className="hc-title">Donate</div>
            <div className="hc-desc">Make a one-time or recurring contribution to keep programs running.</div>
            <div className="hc-cta">Support a program <i className="ti ti-arrow-right" /></div>
          </a>
          <a href="#food-delivery" className="help-card">
            <div className="hc-icon">
              <i className="ti ti-basket" />
            </div>
            <div className="hc-title">Send food</div>
            <div className="hc-desc">Donate grocery kits or coordinate delivery in local neighborhoods.</div>
            <div className="hc-cta">Send a kit <i className="ti ti-arrow-right" /></div>
          </a>
          <a href="#stories" className="help-card">
            <div className="hc-icon">
              <i className="ti ti-users" />
            </div>
            <div className="hc-title">Volunteer</div>
            <div className="hc-desc">Join our teams for distribution, teaching, and awareness programs.</div>
            <div className="hc-cta">Volunteer now <i className="ti ti-arrow-right" /></div>
          </a>
        </div>
      </section>

      <section id="food-delivery">
        <div className="section-label">Send food</div>
        <h2 className="section-title">Food delivery — <em>confirmed via WhatsApp</em></h2>
        <p className="section-sub">Fill the form below. We confirm within 2 hours via WhatsApp, coordinate delivery, and send you photos once families receive their food.</p>
        <div className="delivery-layout">
          <div className="form-panel">
            <div className="step-indicator">
              <div className="step-item active"><div className="step-dot">1</div><span>Request</span></div>
              <div className="step-line" />
              <div className="step-item"><div className="step-dot">2</div><span>WA confirm</span></div>
              <div className="step-line" />
              <div className="step-item"><div className="step-dot">3</div><span>Delivery</span></div>
              <div className="step-line" />
              <div className="step-item"><div className="step-dot">4</div><span>Photos posted</span></div>
            </div>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Your name</label>
                <input type="text" placeholder="Full name" value={fdName} onChange={(e) => setFdName(e.target.value)} />
              </div>
              <div className="field-group">
                <label className="field-label">WhatsApp number</label>
                <input type="tel" placeholder="+91 98765 43210" value={fdPhone} onChange={(e) => setFdPhone(e.target.value)} />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">What would you like to send?</label>
              <div className="kit-grid">
                {kitOptions.map((kit) => (
                  <div
                    key={kit.name}
                    className={`kit-card ${selectedKit === kit.name ? 'selected' : ''}`}
                    onClick={() => setSelectedKit(kit.name)}
                  >
                    <i className={kit.icon} />
                    <div className="kit-name">{kit.name}</div>
                    <div className="kit-price">{kit.price}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Delivery area</label>
                <select value={fdArea} onChange={(e) => setFdArea(e.target.value)}>
                  <option>Neelasandra</option>
                  <option>LR Nagar</option>
                  <option>Rajendranagar</option>
                  <option>Karesandra</option>
                  <option>Subhashnagar</option>
                  <option>Let Swabhimaan decide</option>
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Preferred date</label>
                <input type="date" value={fdDate} onChange={(e) => setFdDate(e.target.value)} />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Number of families / people</label>
              <input type="number" placeholder="e.g. 10" min="1" value={fdQty} onChange={(e) => setFdQty(e.target.value)} />
            </div>
            <div className="field-group">
              <label className="field-label">Special notes (dietary needs, specific items, etc.)</label>
              <textarea placeholder="Anything we should know..." value={fdNotes} onChange={(e) => setFdNotes(e.target.value)} />
            </div>
            <button className="wa-btn" type="button" onClick={handleSendFood}>
              <i className="ti ti-brand-whatsapp" /> Submit &amp; confirm via WhatsApp
            </button>
            <div className="info-note">
              <i className="ti ti-info-circle" /> We confirm within 2 hours. Post-delivery, photos are shared on WhatsApp and posted to the website.
            </div>
          </div>
          <div className="wa-preview-panel">
            <div className="preview-label">
              <i className="ti ti-brand-whatsapp" style={{ color: '#25D366' }} /> WhatsApp conversation preview
            </div>
            <div className="wa-phone">
              <div className="wa-top-bar">
                <div className="wa-avatar">SW</div>
                <div>
                  <div className="wa-contact-name">Swabhimaan</div>
                  <div className="wa-contact-status">Online</div>
                </div>
              </div>
              <div className="wa-messages">
                <div className="wa-bubble">
                  Hi! We received your <strong>{selectedKit}</strong> request for <strong>{fdQty || '10'} {fdArea === 'Let Swabhimaan decide' ? 'families' : `families in ${fdArea}`}</strong>{fdDate ? ` on ${fdDate}` : ''}.<br /><br />
                  Reply <strong>YES</strong> to confirm, or call us at 9945436757 to adjust.
                  <div className="wa-time">Just now ✓✓</div>
                </div>
                <div className="wa-bubble out">
                  YES, confirmed!
                  <div className="wa-time">Just now ✓✓</div>
                </div>
                <div className="wa-bubble">
                  Payment confirmed ✅ Your delivery is scheduled. We'll send photos once delivered! Thank you 🙏
                  <div className="wa-time">Just now ✓✓</div>
                </div>
              </div>
              <div className="wa-input-bar">
                <div className="wa-input-fake">Type a message</div>
                <div className="wa-send"><i className="ti ti-send" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="stories">
        <div className="section-label">Impact stories</div>
        <h2 className="section-title">
          What our <em>community</em> says
        </h2>
        <div className="stories-grid">
          {stories.map((story) => (
            <div key={story.name} className="story-card">
              <div className="story-quote">“{story.quote}”</div>
              <div className="story-person">
                <div className="story-avatar">{story.name.charAt(0)}</div>
                <div>
                  <div className="story-name">{story.name}</div>
                  <div className="story-role">{story.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {videos.length > 0 && (
        <section id="videos">
          <div className="section-header">
            <div>
              <div className="section-label">From the field</div>
              <h2 className="section-title">Watch us <em>in action</em></h2>
            </div>
          </div>
          <div className="videos-grid">
            {videos.map((v) => {
              const embedUrl = getYoutubeEmbed(v.video_url);
              return (
                <div key={v.id} className="video-card">
                  {embedUrl ? (
                    <div className="video-embed">
                      <iframe
                        src={embedUrl}
                        title={v.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <a href={v.video_url} target="_blank" rel="noreferrer" className="video-thumb-link">
                      {v.thumbnail_url
                        ? <img src={v.thumbnail_url} alt={v.title} className="video-thumb-img" />
                        : <div className="video-thumb-placeholder"><i className="ti ti-player-play" /></div>
                      }
                    </a>
                  )}
                  <div className="video-body">
                    <div className="video-title">{v.title}</div>
                    {v.description && <div className="video-desc">{v.description}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section id="faq">
        <div className="section-header">
          <div>
            <div className="section-label">Questions answered</div>
            <h2 className="section-title">
              Frequently <em>asked</em>
            </h2>
          </div>
        </div>
        <div className="faq-layout">
          <div className="faq-filters">
            <div className="faq-filter-title">Jump to</div>
            <div className="faq-filter-list">
              {['Donation', 'Volunteer', 'Trust'].map((tag, index) => (
                <button
                  key={tag}
                  className={`faq-filter-btn ${faqOpen === index ? 'active' : ''}`}
                  onClick={() => setFaqOpen(index)}
                >
                  <i className="ti ti-circle" /> {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={faq.question} className="faq-item">
                <button
                  type="button"
                  className={`faq-q ${faqOpen === index ? 'open' : ''}`}
                  onClick={() => setFaqOpen(index === faqOpen ? -1 : index)}
                >
                  <div>
                    <span className="faq-tag">{faq.tag}</span>
                    {faq.question}
                  </div>
                  <i className="ti ti-chevron-down" />
                </button>
                <div className={`faq-a ${faqOpen === index ? 'open' : ''}`}>{faq.answer}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="trust">
        <div className="section-header">
          <div>
            <div className="section-label">Verification</div>
            <h2 className="section-title">
              Trust and <em>transparency</em>
            </h2>
          </div>
        </div>
        <div className="trust-grid">
          {trust.map((item) => (
            <div key={item.title} className="trust-card">
              <i className="ti ti-shield-check" />
              <div className="trust-card-title">{item.title}</div>
              <div className="trust-card-val">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="donate">
        <div className="section-label">Give hope</div>
        <h2 className="section-title">Donate for a stronger <em>community</em></h2>
        <p>
          Your contributions sustain everyday essentials, education, healthcare, and livelihood programs for low-income families in Bengaluru.
        </p>
        <div className="donate-amounts">
          {[1, 2, 3, 4].map((amount) => (
            <button
              key={amount}
              type="button"
              className={`amt-btn ${donationAmount === amount ? 'selected' : ''}`}
              onClick={() => setDonationAmount(amount)}
            >
              ₹{amount}
            </button>
          ))}
        </div>
        <div className="donate-fields">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
          />
          <input
            type="tel"
            placeholder="Phone / WhatsApp (optional)"
            value={donorPhone}
            onChange={(e) => setDonorPhone(e.target.value)}
          />
        </div>
        <div className="donate-cta">
          <button className="btn-white" type="button" onClick={handleDonate} disabled={paying}>
            {paying ? 'Processing…' : `Donate ₹${donationAmount} now`}
            {!paying && <i className="ti ti-arrow-right" />}
          </button>
          {payStatus === 'success' && (
            <div style={{ color: '#0F6E56', fontWeight: 600, marginTop: 8 }}>
              Thank you! Your donation was successful.
            </div>
          )}
          {payStatus === 'failed' && (
            <div style={{ color: '#c00', marginTop: 8 }}>
              Payment failed. Please try again.
            </div>
          )}
          <div className="donate-note">Your payment will support food, education, and healthcare for families in need.</div>
        </div>
      </section>

      <footer>
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              Swabhi<span>maan</span>
            </div>
            <div className="footer-tagline">Serving Bengaluru's underprivileged neighborhoods with dignity, trust, and long-term care.</div>
            <div className="footer-social">
              <button className="social-btn"><i className="ti ti-brand-facebook" /></button>
              <button className="social-btn"><i className="ti ti-brand-instagram" /></button>
              <button className="social-btn"><i className="ti ti-brand-youtube" /></button>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Explore</div>
            <div className="footer-links">
              <a href="#activities">Activities</a>
              <a href="#programs">Programs</a>
              <a href="#donate">Donate</a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Support</div>
            <div className="footer-links">
              <a href="#help">Volunteer</a>
              <a href="#faq">FAQ</a>
              <a href="/Admin">Admin</a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Contact</div>
            <div className="footer-links">
              <a href="mailto:info@swabhimaan.org">info@swabhimaan.org</a>
              <a href="tel:+918000000000">+91 80000 00000</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 Swabhimaan NGO · Built for mobile and laptop users</div>
          <div className="cert-badges">
            <span className="cert-badge">80G</span>
            <span className="cert-badge">FCRA</span>
            <span className="cert-badge">12A</span>
          </div>
        </div>
      </footer>
    </>
  );
}

function App() {
  const [activities, setActivities] = useState(defaultActivities);
  const [programs, setPrograms] = useState(defaultPrograms);
  const [stories, setStories] = useState(defaultStories);
  const [faqs, setFaqs] = useState(defaultFaqs);
  const [trust, setTrust] = useState(defaultTrust);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    async function loadContent() {
      try {
        const responses = await Promise.all([
          fetch('/api/activities'),
          fetch('/api/programs'),
          fetch('/api/stories'),
          fetch('/api/faqs'),
          fetch('/api/trust'),
          fetch('/api/videos'),
        ]);
        const [activitiesData, programsData, storiesData, faqsData, trustData, videosData] = await Promise.all(
          responses.map((res) => (res.ok ? res.json() : null))
        );
        if (activitiesData) setActivities(activitiesData);
        if (programsData) setPrograms(programsData);
        if (storiesData) setStories(storiesData);
        if (faqsData) setFaqs(faqsData);
        if (trustData) setTrust(trustData);
        if (videosData) setVideos(videosData);
      } catch (err) {
        console.warn('Backend fetch failed:', err);
      }
    }

    loadContent();
  }, []);

  return (
    <div className="app">
      <nav>
        <a href="#home" className="nav-logo">
          Swabhi<span>maan</span>
        </a>
        <ul className="nav-links">
          <li><a href="#activities">Activities</a></li>
          <li><a href="#programs">Programs</a></li>
          <li><a href="#help">How to help</a></li>
          <li><a href="#food-delivery">Send food</a></li>
          <li><a href="#donate">Donate</a></li>
          <li><a href="#stories">Stories</a></li>
          <li><a href="#videos">Videos</a></li>
          <li><a href="#faq">FAQ</a></li>
          <li><a href="#trust">Trust</a></li>
        </ul>
        <div className="nav-actions">
          <a href="#help" className="btn btn-ghost">
            <i className="ti ti-users" /> Volunteer
          </a>
          <a href="#donate" className="btn btn-primary">
            <i className="ti ti-heart" /> Donate
          </a>
        </div>
      </nav>
      <Routes>
        <Route
          path="/"
          element={<Home activities={activities} programs={programs} stories={stories} faqs={faqs} trust={trust} videos={videos} />}
        />
        <Route path="/Admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;
