import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useParams } from 'react-router-dom';
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

function ProgramDetail({ programs }) {
  const { slug } = useParams();
  const program = programs.find((p) => p.slug === slug);

  if (!program) {
    return (
      <div className="program-detail-page">
        <div className="program-detail-content">
          <Link to="/#programs" className="back-link"><i className="ti ti-arrow-left" /> Back to programs</Link>
          <h1 className="program-detail-title">Program not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="program-detail-page">
      <div className="program-detail-hero" style={{ backgroundColor: program.color }}>
        {program.image_url
          ? <img src={program.image_url} alt={program.title} />
          : <i className={program.icon} />}
      </div>
      <div className="program-detail-content">
        <Link to="/#programs" className="back-link"><i className="ti ti-arrow-left" /> Back to programs</Link>
        <h1 className="program-detail-title">{program.title}</h1>
        <div className="program-detail-meta">
          <i className="ti ti-trending-up" /> {program.stat}
        </div>
        {(program.details || [program.description]).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
        <div className="program-detail-cta">
          <Link to="/#donate" className="btn btn-primary"><i className="ti ti-heart" /> Support this program</Link>
          <Link to="/#volunteer" className="btn btn-ghost"><i className="ti ti-users" /> Volunteer with us</Link>
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
    slug: 'food-nutrition',
    icon: 'ti ti-basket',
    color: '#854F0B',
    image_url: '',
    title: 'Food & nutrition',
    description: 'Daily grocery distribution reaching 500+ doorsteps. We address malnutrition and ensure no family goes to bed hungry.',
    stat: '500+ families served daily',
    details: [
      "Our food and nutrition program is the backbone of Swabhimaan's daily work. Every morning, our teams pack and deliver grocery kits, cooked meals, and ration supplies to families across Neelasandra, LR Nagar, Rajendranagar, Karesandra, and Subhashnagar.",
      'Each grocery kit provides a family of four with essential staples for up to two weeks. For households with infants or elderly members, we add nutrition-dense supplements based on need assessments done by our field volunteers.',
      "Donors can sponsor a single grocery kit, fund a month of cooked meals for a family, or set up a recurring monthly contribution. Every food request raised through our 'Send food' form is verified by a local volunteer before delivery, with photo updates shared afterwards.",
    ],
  },
  {
    slug: 'education-support',
    icon: 'ti ti-school',
    color: '#0F6E56',
    image_url: '',
    title: 'Education support',
    description: 'After-school classes, scholarships, and career mentoring for children from underserved neighborhoods.',
    stat: '200+ children supported',
    details: [
      'We run free after-school tuition centers staffed by trained volunteers and part-time teachers, covering core subjects for students from grade 1 through grade 10.',
      'Each year, Swabhimaan awards need-based scholarships to high-performing students to cover school fees, books, uniforms, and exam costs, with progress reviewed every term.',
      'Our career mentoring track connects students in grades 9-12 with volunteer professionals who run monthly sessions on career options, college applications, and digital and English-language skills.',
    ],
  },
  {
    slug: 'healthcare-access',
    icon: 'ti ti-stethoscope',
    color: '#185FA5',
    image_url: '',
    title: 'Healthcare access',
    description: 'Regular health camps, screenings, and medicine distribution for families in need.',
    stat: '4 community camps monthly',
    details: [
      'Our healthcare access program brings basic diagnostic and treatment services directly to neighborhoods through monthly camps held in partnership with local clinics, hospitals, and volunteer doctors.',
      'A typical camp includes general health checkups, blood pressure and blood sugar screening, eye checkups, and basic dental screening, with referrals to partner hospitals where needed.',
      'We maintain a small revolving stock of common medicines distributed free of cost, and run awareness sessions on hygiene, maternal health, and preventive care.',
    ],
  },
  {
    slug: 'livelihood-skills',
    icon: 'ti ti-tool',
    color: '#6D4AFF',
    image_url: '',
    title: 'Livelihood & skill training',
    description: 'Vocational training in tailoring, computer skills, and trades that help adults build sustainable income.',
    stat: '150+ adults trained',
    details: [
      'Our livelihood program runs short, practical vocational courses — tailoring and embroidery, basic computer operation, mobile repair, and beauty & wellness — designed around skills with real, local demand.',
      'Each batch runs for 6-10 weeks and participants receive the tools or starter kits they need to begin working immediately after completing the course.',
      'We connect graduates with local job openings and support a few participants each year in setting up micro-enterprises with small seed grants and ongoing mentorship.',
    ],
  },
  {
    slug: 'women-empowerment',
    icon: 'ti ti-heart-handshake',
    color: '#C2185B',
    image_url: '',
    title: 'Women empowerment',
    description: 'Self-help groups, financial literacy, and leadership programs that help women become decision-makers in their families and communities.',
    stat: '30+ self-help groups active',
    details: [
      'We organize women into self-help groups (SHGs) of 10-15 members each, who meet weekly to save small amounts collectively and access low-interest group loans.',
      'Financial literacy sessions cover budgeting, banking, digital payments, and government schemes for women entrepreneurs.',
      'SHG members are prioritized for our livelihood training batches, creating a direct path from financial literacy to income generation to leadership.',
    ],
  },
  {
    slug: 'community-environment',
    icon: 'ti ti-leaf',
    color: '#2E7D32',
    image_url: '',
    title: 'Community awareness & environment',
    description: 'Awareness drives on hygiene, sanitation, civic rights, and environmental sustainability to build healthier, cleaner neighborhoods.',
    stat: '12+ awareness drives yearly',
    details: [
      'We run regular campaigns on hygiene and sanitation, helping households adopt practices like handwashing, safe drinking water storage, and proper waste disposal.',
      'Our civic rights workshops help residents access entitlements like ration cards, Aadhaar-linked benefits, voter registration, and grievance redressal processes.',
      'On the environmental side, we organize tree plantation drives, waste segregation campaigns, and disaster-preparedness sessions ahead of monsoon season.',
    ],
  },
];

const OFFICE_MAP_URL = 'https://www.google.com/maps/search/?api=1&query=12.945959314441675,77.61914860797097';

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

const defaultTrustees = [
  { name: 'Trustee Name 1', role: 'Founder & Managing Trustee', photo_url: '' },
  { name: 'Trustee Name 2', role: 'Trustee', photo_url: '' },
  { name: 'Trustee Name 3', role: 'Trustee', photo_url: '' },
  { name: 'Trustee Name 4', role: 'Trustee', photo_url: '' },
  { name: 'Trustee Name 5', role: 'Trustee', photo_url: '' },
  { name: 'Trustee Name 6', role: 'Trustee', photo_url: '' },
];

const defaultDonors = [
  { name: 'Acme Corporation', contribution: 'Platinum partner', logo_url: '' },
  { name: 'Example Foundation', contribution: 'CSR program sponsor', logo_url: '' },
  { name: 'Sunrise Industries', contribution: 'Annual food drive sponsor', logo_url: '' },
];

const defaultTrust = [
  { title: 'Registered trust', value: 'Section 12A registered', doc_url: '' },
  { title: '80G exemption', value: 'Tax benefit for donors', doc_url: '' },
  { title: 'FCRA compliant', value: 'International funding ready', doc_url: '' },
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

function Home({ activities, programs, stories, faqs, trust, trustees, donors, videos }) {
  const [galleryActivity, setGalleryActivity] = useState(null);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const toggleExpand = (id) => setExpandedCards(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
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
  const [fdSubmitted, setFdSubmitted] = useState(false);

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
    setFdSubmitted(true);
  }

  const interestAreas = [
    'Food distribution',
    'Teaching & tutoring',
    'Health awareness camps',
    'Event support',
    'Fundraising & outreach',
    'Other',
  ];
  const [volName, setVolName] = useState('');
  const [volPhone, setVolPhone] = useState('');
  const [volPurpose, setVolPurpose] = useState('services');
  const [volInterest, setVolInterest] = useState(interestAreas[0]);
  const [volAvailability, setVolAvailability] = useState('Weekends');
  const [volNotes, setVolNotes] = useState('');
  const [volSubmitted, setVolSubmitted] = useState(false);

  async function handleVolunteer() {
    const lines = [
      `Hi Swabhimaan! I'd like to volunteer.`,
      ``,
      `Name: ${volName || '(not provided)'}`,
      `WhatsApp: ${volPhone || '(not provided)'}`,
      `Purpose: ${volPurpose === 'donation' ? 'Donation support' : 'On-ground services'}`,
    ];
    if (volPurpose === 'services') {
      lines.push(`Area of interest: ${volInterest}`);
      lines.push(`Availability: ${volAvailability}`);
    }
    lines.push(`Notes: ${volNotes || 'None'}`);
    try {
      await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: volName,
          phone: volPhone,
          purpose: volPurpose,
          interest_area: volPurpose === 'services' ? volInterest : null,
          availability: volPurpose === 'services' ? volAvailability : null,
          notes: volNotes || null,
        }),
      });
    } catch (_) {
      // still open WhatsApp even if DB save fails
    }
    window.open(`https://wa.me/9945436757?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
    setVolSubmitted(true);
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
          <a href={OFFICE_MAP_URL} target="_blank" rel="noopener noreferrer" className="hero-eyebrow hero-eyebrow-link">
            <i className="ti ti-map-pin" /> Bengaluru · Serving since 2000
          </a>
          <h1>
            To be kind is more important than to be right.
            <br />
            <em>Many times what people need is not brilliant mind that speaks,</em>
            <br />
            But a speacial heart that listens.
            <br />
            -F. Scott Fitzgerald,
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
          {activities.length > 4 && (
            <button className="see-all" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowAllActivities(v => !v)}>
              {showAllActivities ? 'Show less' : `View all ${activities.length}`} <i className={`ti ti-arrow-${showAllActivities ? 'up' : 'right'}`} />
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
                <div className="act-body">
                  <span className={`act-badge ${activity.badge}`}>{activity.category}</span>
                  <div className="act-title-xl">
                    {activity.title} <i className="ti ti-arrow-right act-title-arrow" />
                  </div>
                  <div
                    className={`act-stack${hasImages ? ' act-stack-clickable' : ''}`}
                    onClick={() => hasImages && setGalleryActivity(activity)}
                  >
                    {hasImages
                      ? imgs.slice(0, 3).map((url, i) => (
                          <div key={i} className="act-stack-img" style={{ backgroundImage: `url(${url})` }} />
                        ))
                      : <div className={`act-stack-placeholder ${activity.badge || ''}`}>
                          <i className={activity.icon} style={{ color: activity.color }} />
                        </div>
                    }
                    {hasImages && imgs.length > 1 && (
                      <div className="act-stack-count"><i className="ti ti-photo" /> {imgs.length}</div>
                    )}
                  </div>
                  <div className="act-pills">
                    {activity.date && <span><i className="ti ti-calendar" /> {activity.date}</span>}
                    {activity.location && <span><i className="ti ti-map-pin" /> {activity.location}</span>}
                  </div>
                  {(activity.description || activity.reach) && (() => {
                    const key = (activity.id || activity.title) + '-desc';
                    const isExpanded = expandedCards.has(key);
                    const fullText = activity.description
                      ? activity.description.replace(/<[^>]*>/g, '').trim()
                      : activity.reach;
                    const isLong = fullText.length > 120;
                    return (
                      <div className="act-card-desc act-card-desc-text">
                        {isExpanded || !isLong ? fullText : fullText.substring(0, 120) + '…'}
                        {isLong && (
                          <button className="read-more-btn" type="button" onClick={() => toggleExpand(key)}>
                            {isExpanded ? ' Show less' : ' Read more'}
                          </button>
                        )}
                      </div>
                    );
                  })()}
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
            <input
              type="range"
              min="100"
              max="20000"
              step="100"
              value={donationAmount}
              onChange={(event) => setDonationAmount(Number(event.target.value))}
            />
            <div className="calc-slider-label-row">
              <span className="calc-label">Monthly donation</span>
              <span className="calc-amount">₹{donationAmount}</span>
            </div>
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
            <Link key={program.slug} to={`/programs/${program.slug}`} className="prog-card">
              <div className="prog-thumb" style={{ backgroundColor: program.color }}>
                {program.image_url
                  ? <img src={program.image_url} alt={program.title} />
                  : <i className={program.icon} />}
              </div>
              <div className="prog-body">
                <div className="prog-title">{program.title}</div>
                <div className="prog-stat">
                  <i className="ti ti-trending-up" /> {program.stat}
                </div>
                <div className="prog-desc">{program.description}</div>
                <div className="prog-link">View program <i className="ti ti-arrow-right" /></div>
              </div>
            </Link>
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
          <a href="#volunteer" className="help-card">
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
            {fdSubmitted ? (
              <div className="form-success">
                <div className="form-success-icon"><i className="ti ti-circle-check" /></div>
                <h3>Request sent!</h3>
                <p>We've opened WhatsApp with your food delivery details. Send the message to confirm — our team will reply within 2 hours and share photos once it's delivered.</p>
                <button className="btn btn-ghost" type="button" onClick={() => setFdSubmitted(false)}>
                  <i className="ti ti-edit" /> Submit another request
                </button>
              </div>
            ) : (
              <>
            <div className="step-indicator">
              <div className="step-item active"><div className="step-dot">1</div><span>Request</span></div>
              <div className="step-line" />
              <div className="step-item"><div className="step-dot">2</div><span>WA confirm</span></div>
              <div className="step-line" />
              <div className="step-item"><div className="step-dot">3</div><span>Delivery</span></div>
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
              </>
            )}
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
                  Reply <strong>YES</strong> to confirm, or call us at 9945277470 to adjust.
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

      <section id="volunteer">
        <div className="section-label">Volunteer</div>
        <h2 className="section-title">Join the team — <em>confirmed via WhatsApp</em></h2>
        <p className="section-sub">Tell us how you'd like to help. We'll add you to the right WhatsApp group and follow up within 2 hours.</p>
        <div className="form-panel volunteer-panel">
          {volSubmitted ? (
            <div className="form-success">
              <div className="form-success-icon"><i className="ti ti-circle-check" /></div>
              <h3>You're in!</h3>
              <p>We've opened WhatsApp with your details. Send the message and we'll add you to the right group and follow up within 2 hours.</p>
              <button className="btn btn-ghost" type="button" onClick={() => setVolSubmitted(false)}>
                <i className="ti ti-edit" /> Submit another response
              </button>
            </div>
          ) : (
            <>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Your name</label>
              <input type="text" placeholder="Full name" value={volName} onChange={(e) => setVolName(e.target.value)} />
            </div>
            <div className="field-group">
              <label className="field-label">WhatsApp number</label>
              <input type="tel" placeholder="+91 98765 43210" value={volPhone} onChange={(e) => setVolPhone(e.target.value)} />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">How would you like to help?</label>
            <div className="purpose-grid">
              <div
                className={`purpose-card ${volPurpose === 'services' ? 'selected' : ''}`}
                onClick={() => setVolPurpose('services')}
              >
                <i className="ti ti-users-group" />
                <div className="kit-name">On-ground services</div>
                <div className="kit-price">Time, skills, presence</div>
              </div>
              <div
                className={`purpose-card ${volPurpose === 'donation' ? 'selected' : ''}`}
                onClick={() => setVolPurpose('donation')}
              >
                <i className="ti ti-gift" />
                <div className="kit-name">Donation support</div>
                <div className="kit-price">Funds, goods, sponsorship</div>
              </div>
            </div>
          </div>
          {volPurpose === 'services' && (
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Area of interest</label>
                <select value={volInterest} onChange={(e) => setVolInterest(e.target.value)}>
                  {interestAreas.map((area) => (
                    <option key={area}>{area}</option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Availability</label>
                <select value={volAvailability} onChange={(e) => setVolAvailability(e.target.value)}>
                  <option>Weekdays</option>
                  <option>Weekends</option>
                  <option>Flexible / anytime</option>
                </select>
              </div>
            </div>
          )}
          <div className="field-group">
            <label className="field-label">Anything else we should know?</label>
            <textarea placeholder="Skills, preferred areas, what you'd like to contribute..." value={volNotes} onChange={(e) => setVolNotes(e.target.value)} />
          </div>
          <button className="wa-btn" type="button" onClick={handleVolunteer}>
            <i className="ti ti-brand-whatsapp" /> Submit &amp; join via WhatsApp
          </button>
          <div className="info-note">
            <i className="ti ti-info-circle" /> We'll add you to our volunteer WhatsApp group and confirm next steps within 2 hours.
          </div>
            </>
          )}
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
              {['Donation', 'Volunteer', 'Trust'].map((tag) => {
                const index = faqs.findIndex((f) => f.tag === tag);
                return (
                  <button
                    key={tag}
                    className={`faq-filter-btn ${faqOpen === index ? 'active' : ''}`}
                    onClick={() => setFaqOpen(index)}
                  >
                    <i className="ti ti-circle" /> {tag}
                  </button>
                );
              })}
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
                    <span className={`faq-tag faq-tag-${faq.tag.toLowerCase()}`}>{faq.tag}</span>
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

      {trustees.length > 0 && (
        <section id="about">
          <div className="section-header">
            <div>
              <div className="section-label">About us</div>
              <h2 className="section-title">
                Meet our <em>trustees</em>
              </h2>
            </div>
          </div>
          <div className="trustees-grid">
            {trustees.map((person, index) => (
              <div key={`${person.name}-${index}`} className="trustee-card">
                {person.photo_url ? (
                  <img src={person.photo_url} alt={person.name} className="trustee-photo" />
                ) : (
                  <div className="trustee-photo trustee-photo-placeholder">{person.name.charAt(0)}</div>
                )}
                <div className="trustee-name">{person.name}</div>
                <div className="trustee-role">{person.role}</div>
              </div>
            ))}
          </div>
        </section>
      )}

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
          {trust.map((item) => {
            const Card = item.doc_url ? 'a' : 'div';
            const linkProps = item.doc_url
              ? { href: item.doc_url, target: '_blank', rel: 'noopener noreferrer' }
              : {};
            return (
              <Card key={item.title} className={`trust-card ${item.doc_url ? 'has-doc' : ''}`} {...linkProps}>
                <i className="ti ti-shield-check" />
                <div className="trust-card-title">{item.title}</div>
                <div className="trust-card-val">{item.value}</div>
                {item.doc_url && (
                  <div className="trust-card-link">
                    View certificate <i className="ti ti-external-link" />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {donors.length > 0 && (
        <section id="donors">
          <div className="section-label">Our partners</div>
          <h2 className="section-title">
            Major donors &amp; <em>partners</em>
          </h2>
          <div className="donors-grid">
            {donors.map((donor, index) => (
              <div key={`${donor.name}-${index}`} className="donor-card">
                {donor.logo_url ? (
                  <img src={donor.logo_url} alt={donor.name} className="donor-logo" />
                ) : (
                  <div className="donor-avatar">{donor.name.charAt(0)}</div>
                )}
                <div>
                  <div className="donor-name">{donor.name}</div>
                  <div className="donor-since">{donor.contribution}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
              <a href="#volunteer">Volunteer</a>
              <a href="#faq">FAQ</a>
              <a href="/Admin">Admin</a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Contact</div>
            <div className="footer-links">
              <a href="mailto:info@swabhimaan.org">info@swabhimaan.org</a>
              <a href="tel:+919945436757">+91 99454 36757</a>
              <a href={OFFICE_MAP_URL} target="_blank" rel="noopener noreferrer">
                <i className="ti ti-map-pin" /> Find us on map
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 Swabhimaan NGO · Built for users</div>
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
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const [activities, setActivities] = useState(defaultActivities);
  const [programs, setPrograms] = useState(defaultPrograms);
  const [stories, setStories] = useState(defaultStories);
  const [faqs, setFaqs] = useState(defaultFaqs);
  const [trust, setTrust] = useState(defaultTrust);
  const [trustees, setTrustees] = useState(defaultTrustees);
  const [donors, setDonors] = useState(defaultDonors);
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
          fetch('/api/trustees'),
          fetch('/api/donors'),
          fetch('/api/videos'),
        ]);
        const [activitiesData, programsData, storiesData, faqsData, trustData, trusteesData, donorsData, videosData] = await Promise.all(
          responses.map((res) => (res.ok ? res.json() : null))
        );
        if (activitiesData) setActivities(activitiesData);
        if (programsData) setPrograms(programsData);
        if (storiesData) setStories(storiesData);
        if (faqsData) setFaqs(faqsData);
        if (trustData) setTrust(trustData);
        if (trusteesData) setTrustees(trusteesData);
        if (donorsData) setDonors(donorsData);
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
          <li><a href="#about">About</a></li>
          <li><a href="#activities">Activities</a></li>
          <li><a href="#programs">Programs</a></li>
          <li><a href="#help">How to help</a></li>
          <li><a href="#food-delivery">Send food</a></li>
          <li><a href="#volunteer">Volunteer</a></li>
          <li><a href="#donate">Donate</a></li>
          <li><a href="#stories">Stories</a></li>
          <li><a href="#videos">Videos</a></li>
          <li><a href="#faq">FAQ</a></li>
          <li><a href="#trust">Trust</a></li>
          <li><a href="#donors">Donors</a></li>
        </ul>
        <div className="nav-actions">
          <a href="#volunteer" className="btn btn-ghost">
            <i className="ti ti-users" /> Volunteer
          </a>
          <a href="#donate" className="btn btn-primary">
            <i className="ti ti-heart" /> Donate
          </a>
        </div>
        <button className="nav-hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
          <i className={menuOpen ? 'ti ti-x' : 'ti ti-menu-2'} />
        </button>
      </nav>
      {menuOpen && (
        <div className="mobile-menu">
          <ul>
            <li><a href="#about" onClick={closeMenu}>About</a></li>
            <li><a href="#activities" onClick={closeMenu}>Activities</a></li>
            <li><a href="#programs" onClick={closeMenu}>Programs</a></li>
            <li><a href="#help" onClick={closeMenu}>How to help</a></li>
            <li><a href="#food-delivery" onClick={closeMenu}>Send food</a></li>
            <li><a href="#volunteer" onClick={closeMenu}>Volunteer</a></li>
            <li><a href="#stories" onClick={closeMenu}>Stories</a></li>
            <li><a href="#videos" onClick={closeMenu}>Videos</a></li>
            <li><a href="#faq" onClick={closeMenu}>FAQ</a></li>
            <li><a href="#trust" onClick={closeMenu}>Trust</a></li>
            <li><a href="#donors" onClick={closeMenu}>Donors</a></li>
          </ul>
          <div className="mobile-menu-actions">
            <a href="#donate" className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={closeMenu}>
              <i className="ti ti-heart" /> Donate now
            </a>
            <a href="#volunteer" className="btn btn-ghost" style={{ justifyContent: 'center' }} onClick={closeMenu}>
              <i className="ti ti-users" /> Volunteer
            </a>
          </div>
        </div>
      )}
      <Routes>
        <Route
          path="/"
          element={<Home activities={activities} programs={programs} stories={stories} faqs={faqs} trust={trust} trustees={trustees} donors={donors} videos={videos} />}
        />
        <Route path="/programs/:slug" element={<ProgramDetail programs={programs} />} />
        <Route path="/Admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;
