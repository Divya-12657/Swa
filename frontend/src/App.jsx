import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Route, Routes, useParams, useLocation } from 'react-router-dom';
import Admin from './pages/Admin';
import CalendarPage from './pages/Calendar';

function ScrollToHash() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) { window.scrollTo({ top: 0 }); return; }
    const timer = setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 80);
    return () => clearTimeout(timer);
  }, [hash, pathname]);
  return null;
}

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

  const desc = activity.description
    ? activity.description.replace(/<[^>]*>/g, '').trim()
    : null;

  return (
    <div className="gallery-overlay" onClick={onClose}>
      <div className="gallery-modal" onClick={e => e.stopPropagation()}>
        <button className="gallery-close" onClick={onClose}><i className="ti ti-x" /></button>
        {images.length > 0 && (
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
        )}
        <div className="gallery-info">
          <span className={`act-badge ${activity.badge}`}>{activity.category}</span>
          <div className="gallery-title">{activity.title}</div>
          <div className="gallery-meta-row">
            {activity.location && <span><i className="ti ti-map-pin" /> {activity.location}</span>}
            {activity.reach && <span><i className="ti ti-users" /> {activity.reach}</span>}
            {activity.date && <span><i className="ti ti-calendar" /> {activity.date}</span>}
          </div>
          {desc && <div className="gallery-desc">{desc}</div>}
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
      <div className="pdp-wrap">
        <Link to="/#programs" className="back-link"><i className="ti ti-arrow-left" /> Back to programs</Link>
        <h1>Program not found</h1>
      </div>
    );
  }

  const allImages = (program.highlight_images?.['0'] || []).filter(Boolean);

  return (
    <div className="pdp-wrap">
      {/* ── HERO ── */}
      <div className="pdp-hero" style={
        program.image_url
          ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.52), rgba(0,0,0,0.62)), url(${program.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: `linear-gradient(135deg, ${program.color}cc, ${program.color}88)` }
      }>
        <div className="pdp-hero-body">
          <div className="pdp-eyebrow"><i className={program.icon} /> {program.title}</div>
          <h1 className="pdp-hero-title">{program.description}</h1>
          <div className="pdp-hero-stat"><i className="ti ti-trending-up" /> {program.stat}</div>
          <div className="pdp-hero-actions">
            <Link to="/#donate" className="btn btn-primary"><i className="ti ti-heart" /> Support this program</Link>
            <Link to="/#volunteer" className="btn pdp-ghost"><i className="ti ti-users" /> Volunteer</Link>
          </div>
        </div>
      </div>

      {/* ── WRITE-UP ── */}
      <div className="pdp-content">
        <div className="pdp-about-label">
          <span className="pdp-dot" style={{ background: program.color }} />
          {program.aboutLabel || 'About this programme'}
        </div>
        <p className="pdp-about-lead">{typeof program.details?.[0] === 'string' ? program.details[0] : program.details?.[0]?.paras?.[0]}</p>
        {program.details?.slice(1).map((item, i) =>
          typeof item === 'string'
            ? <p key={i} className="pdp-about-body">{item}</p>
            : item.sectionTitle
            ? <div key={i} className="pdp-section-title">{item.sectionTitle}</div>
            : item.bullets
            ? (
              <ul key={i} className="pdp-bullet-list">
                {item.bullets.map((b, j) => (
                  <li key={j} className="pdp-bullet-item">
                    <span className="pdp-bullet-title">{b.title}</span> — {b.desc}
                  </li>
                ))}
              </ul>
            )
            : (
              <div key={i} className="pdp-section-block">
                <h3 className="pdp-section-heading">{item.heading}</h3>
                {item.paras.map((para, j) => <p key={j} className="pdp-about-body">{para}</p>)}
              </div>
            )
        )}

        {program.ps && (
          <div className="pdp-ps">
            <span className="pdp-ps-label">P.S.</span>
            {program.ps}
          </div>
        )}

        {/* ── POINTER CARDS ── */}
        {program.highlights?.length > 0 && (
          <div className="pdp-pointers">
            <div className="pdp-highlights-label">What we do</div>
            <div className="pdp-pointer-grid">
              {program.highlights.map((h, i) => (
                <div key={i} className="pdp-pointer-card" style={{ borderLeftColor: program.color }}>
                  <div className="pdp-pointer-icon" style={{ background: `${program.color}18`, color: program.color }}>
                    <i className={h.icon} />
                  </div>
                  <div className="pdp-pointer-title">{h.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MEDIA GALLERY ── */}
        {allImages.length > 0 && (
          <div className="pdp-gallery">
            <div className="pdp-highlights-label">Gallery</div>
            <div className="pdp-gallery-grid">
              {allImages.map((src, i) => (
                <div key={i} className="pdp-gallery-item">
                  <img src={src} alt={`${program.title} ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM: All Programs link ── */}
      <div className="pdp-footer">
        <Link to="/#programs" className="pdp-all-programs">
          <i className="ti ti-grid-dots" /> View all programs
        </Link>
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
    description: "A warm meal is more than food — it's comfort, dignity, and hope. We ensure no family goes to bed hungry.",
    stat: '500+ families served daily',
    highlights: [
      { title: 'Monthly grocery distribution', icon: 'ti ti-shopping-cart', images: [] },
      { title: 'Community kitchens', icon: 'ti ti-soup', images: [] },
      { title: 'Nutrition drives', icon: 'ti ti-apple', images: [] },
      { title: 'Nutrition awareness', icon: 'ti ti-bulb', images: [] },
    ],
    details: [
      'Every day, Swabhimaan stands beside families who struggle to put food on the table. Through monthly grocery support, community kitchens, nutrition drives, and emergency relief, we make sure vulnerable households receive more than just a meal — they receive the reassurance that someone is looking out for them.',
      { heading: 'Our Philosophy', paras: [
        "Swabhimaan's approach is rooted in dignity, not dependency. We don't offer support because we believe people are weak, incapable, or unable to fight their own battles. We offer it because we believe everyone deserves the strength to fight that battle themselves.",
        "By strength, we mean something real — the physical and mental resilience to wake up the next day, the will to keep going, and the ability to earn tomorrow's meal. Our role is to provide the support and hope needed to get there.",
        "Because sometimes, a person doesn't need someone to fight their battle for them. They simply need enough support to get back on their feet and find their own strength to carry on. That's what Swabhimaan offers — not a way around the struggle, but the strength to face it, survive it, and ultimately overcome it on their own terms.",
      ]},
      { sectionTitle: "Swabhimaan's Key Initiatives" },
      { heading: 'Nutrition Drives', paras: [
        "Swabhimaan runs a dedicated community outreach program to identify newborns and pregnant women across the areas we serve. Our team assesses the nutritional needs of both mother and child, ensuring they receive the care that matters most during these formative years — because we believe the health of India's youngest generation shapes the country's future. This outreach is conducted periodically, paired with awareness sessions that equip mothers with the knowledge to fight malnutrition head-on.",
      ]},
      { heading: 'Monthly Grocery Distribution', paras: [
        "Swabhimaan also ensures that families who cannot afford quality ration have consistent access to it. Today, this support reaches over 200 families every month.",
      ]},
    ],
  },
  {
    slug: 'education-support',
    icon: 'ti ti-school',
    color: '#0F6E56',
    image_url: '',
    title: 'Education support',
    description: 'Education doesn\'t just change report cards — it changes futures. We create learning environments where every child can dream.',
    stat: '200+ children supported',
    highlights: [
      { title: 'After-school learning centres', icon: 'ti ti-school', images: [] },
      { title: 'NIOS', icon: 'ti ti-certificate', images: [] },
      { title: 'Youth Empowerment', icon: 'ti ti-briefcase', images: [] },
      { title: 'Digital literacy', icon: 'ti ti-device-laptop', images: [] },
      { title: 'Leadership & life skills', icon: 'ti ti-star', images: [] },
    ],
    aboutLabel: 'Education as Empowerment',
    details: [
      'Swabhimaan treats education as a weapon — a powerful force to break the cycle of so-called helplessness. For over two decades, we have worked in this field with one core belief - education has the power to transform not just an individual, but their entire family.',
      'Guided by this belief, Swabhimaan runs multiple programmes designed to address the different barriers that hold children and young people back.',
      { sectionTitle: "Swabhimaan's Key Initiatives" },
      { heading: 'NIOS Programme', paras: [
        'Our NIOS programmes give school dropouts a second chance at education and a path toward a better future.',
      ]},
      { heading: 'After-School Learning Centres', paras: [
        'Our after-school learning centres help strengthen foundational understanding and bridge learning gaps — especially for children coming from schools where quality education often falls short.',
      ]},
      { heading: 'Scholarships', paras: [
        'We provide scholarships to ease the financial burden on families, ensuring that no child has to give up their education because of circumstances beyond their control.',
      ]},
      { heading: 'Youth Empowerment', paras: [
        'Our youth empowerment programmes prepare young people not just academically, but as confident, capable, and responsible citizens.',
      ]},
      'For Swabhimaan, education is never just about a certificate or completing school. It is about equipping individuals with the knowledge, confidence, and ability to change the circumstances they were born into — and, in doing so, change the future of their entire family.',
      { heading: 'The Team Behind It', paras: [
        'Behind all of this is a dedicated core team of teachers who keep bringing these children back to the classroom, again and again, without ever losing hope in them. Alongside them are individuals from different walks of life who step in to share their knowledge, experiences, and perspectives — helping these children discover what they are truly capable of becoming.',
      ]},
    ],
    ps: null,
  },
  {
    slug: 'healthcare-access',
    icon: 'ti ti-stethoscope',
    color: '#185FA5',
    image_url: '',
    title: 'Healthcare access',
    description: 'Healthcare should never be a privilege — it should be a promise. We bring quality care closer to communities.',
    stat: '4 community camps monthly',
    highlights: [
      { title: 'Community medical camps', icon: 'ti ti-stethoscope', images: [] },
      { title: 'Preventive screenings', icon: 'ti ti-heart-rate-monitor', images: [] },
      { title: "Women's health", icon: 'ti ti-heart-handshake', images: [] },
      { title: 'Hygiene & sanitation', icon: 'ti ti-droplet', images: [] },
      { title: 'Health education', icon: 'ti ti-book-health', images: [] },
    ],
    aboutLabel: 'Healthcare for All',
    details: [
      'Swabhimaan brings quality healthcare closer to communities through medical camps, preventive screenings, awareness programmes, and health consultations. We believe prevention is just as important as treatment — because early intervention today means fewer crises tomorrow.',
      'From children\'s health to women\'s wellness and senior citizen care, our initiatives empower individuals with knowledge, timely intervention, and access to essential healthcare services.',
      { sectionTitle: "Swabhimaan's Key Initiatives" },
      { heading: 'Community Medical Camps', paras: [
        'We organise regular medical camps that bring doctors and healthcare services directly into underserved communities, removing the barriers of distance and cost.',
      ]},
      { heading: 'Preventive Health Screenings', paras: [
        'Through routine screenings, we help identify health issues early — before they become larger, harder-to-treat conditions.',
      ]},
      { heading: "Women's Health Programmes", paras: [
        "Dedicated initiatives focus on women's wellness, addressing health needs that are often overlooked or deprioritised.",
      ]},
      { heading: 'Hygiene & Sanitation Awareness', paras: [
        'We run awareness drives to promote hygiene and sanitation practices that prevent illness before it starts.',
      ]},
      { heading: 'Health Education Workshops', paras: [
        'These workshops equip individuals and families with the knowledge to make informed decisions about their own health and wellbeing.',
      ]},
      { heading: 'Affordable Healthcare Support', paras: [
        'One might ask — what does "affordable healthcare" even mean today, when a basic consultation can cost ₹500 or more? This is where Swabhimaan is different. We provide healthcare at a genuinely accessible cost, sometimes for just a few tens of rupees. Our aim is simple: healthcare should never become a burden that forces someone to choose between treatment and their next meal.',
      ]},
    ],
    ps: null,
  },
  {
    slug: 'livelihood-skills',
    hidden: true,
    icon: 'ti ti-tool',
    color: '#6D4AFF',
    image_url: '',
    title: 'Livelihood & skill training',
    description: 'A skill is more than a livelihood — it\'s confidence, independence, and opportunity. We open doors for youth and adults.',
    stat: '150+ adults trained',
    highlights: [
      { title: 'Vocational skill training', icon: 'ti ti-tool', images: [] },
      { title: 'Computer & digital literacy', icon: 'ti ti-device-laptop', images: [] },
      { title: 'Entrepreneurship', icon: 'ti ti-rocket', images: [] },
      { title: 'Financial literacy', icon: 'ti ti-coins', images: [] },
      { title: 'Job placement support', icon: 'ti ti-briefcase', images: [] },
    ],
    details: [
      'Swabhimaan equips youth and adults with practical, industry-relevant skills that help them secure employment, start businesses, and become financially independent.',
      'Whether it\'s digital skills, tailoring, communication, entrepreneurship, or workplace readiness, our programmes empower individuals to build sustainable careers and brighter futures.',
      'Training includes: Vocational skill development · Computer and digital literacy · Communication and employability skills · Entrepreneurship training · Financial literacy · Job readiness and placement assistance.',
    ],
  },
  {
    slug: 'women-empowerment',
    icon: 'ti ti-heart-handshake',
    color: '#C2185B',
    image_url: '',
    title: 'Women empowerment',
    description: 'When a woman rises, an entire family rises with her. We support women in building independence and leading change.',
    stat: '30+ self-help groups active',
    highlights: [
      { title: 'Skill Development', icon: 'ti ti-users-group', images: [] },
      { title: 'Microfinancing and Entrepreneurship', icon: 'ti ti-rocket', images: [] },
      { title: 'Community Employment', icon: 'ti ti-needle-thread', images: [] },
      { title: 'Creche', icon: 'ti ti-coins', images: [] },
    ],
    aboutLabel: 'Women Empowerment',
    details: [
      'Swabhimaan supports women in discovering their strengths, building financial independence, and becoming leaders within their communities. Through self-help groups, skill development, entrepreneurship, and financial literacy, we help women create lasting change — for themselves and for the generations that follow.',
      "Empowering women has always been Swabhimaan's foremost goal, creating opportunities for them to thrive with dignity and confidence.",
      { sectionTitle: "Swabhimaan's Key Initiatives" },
      { heading: 'Skill Development', paras: [
        'We help women build a livelihood of their own — from providing tailoring machines so they can earn through their craft, to beautician training that opens doors to employment.',
      ]},
      { heading: 'Microfinancing & Entrepreneurship', paras: [
        'Swabhimaan supports women in becoming entrepreneurs by offering microfinancing and the initial financial push they need to start something of their own.',
      ]},
      { heading: 'Community Employment', paras: [
        'Many of our in-house initiatives — including nutrition drives and food distribution — are run by women from the same community. This creates not just jobs, but a sense of ownership and responsibility within the community itself.',
      ]},
      { heading: 'Creche', paras: [
        'An initiative that gives mothers the freedom to focus on their own growth or take up employment, knowing their child is in a safe space. At the creche, children are nurtured and encouraged to build early learning skills, giving mothers the confidence to step forward without compromising their child\'s care.',
      ]},
      { heading: 'A Testament to Trust', paras: [
        "Women  supported by Swabhimaan have shown an extraordinary sense of responsibility and loyalty. In fact, 98% of the women supported through these initiatives have returned their principal amount in full.",
        "That 98% is more than a statistic — it reflects commitment, accountability, and a determination to build something for themselves and their families. Women are the true pillars of their homes, and when given the opportunity, they prove that trust, when placed in them, is always repaid with responsibility.",
        'If 98% of women have demonstrated that level of commitment, is there a stronger testament to one simple truth: investing in a woman is investing in an entire family.',
      ]},
    ],
    ps: null,
  },
  {
    slug: 'community-environment',
    icon: 'ti ti-leaf',
    color: '#2E7D32',
    image_url: '',
    title: 'Community awareness & environment',
    description: 'The environment cannot be an afterthought. In a world where the planet fights to survive each day, sustainability isn\'t a choice — it\'s the only way forward.',
    stat: '12+ awareness drives yearly',
    highlights: [],
    aboutLabel: 'Environmental Responsibility',
    details: [
      'Swabhimaan runs multiple environmental campaigns aimed at keeping communities clean, hygienic, and sustainable.',
      { sectionTitle: "Swabhimaan's Key Initiatives" },
      { heading: 'Plastic-Free Practices', paras: ['We actively discourage the use of plastic and promote cloth bags as a sustainable alternative.'] },
      { heading: 'Plogging Drives', paras: ['We encourage plogging (picking up litter while walking/jogging) to build a stronger sense of environmental responsibility within the community.'] },
      { heading: 'Plastic-Free Centre', paras: ['The Swabhimaan centre itself operates as a plastic-free space, reflecting our commitment in practice, not just in words.'] },
      { heading: 'Early Habit-Building', paras: ['We believe the best environmental habits are the ones instilled early, so we work closely with children to build these values right from the start.'] },
      { heading: 'Waste Segregation', paras: ['We place strong emphasis on waste segregation, working hand-in-hand with local municipal bodies (Pourakarmikas) to ensure these efforts create real, lasting impact.'] },
      { heading: 'Community Hygiene', paras: ['Ongoing awareness efforts help keep community spaces clean and hygienic for everyone.'] },
    ],
    ps: null,
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
  { name: 'Baker Hughes', contribution: 'Corporate sponsor', logo_url: '' },
  { name: 'Donatekart', contribution: 'Platform partner', logo_url: '' },
  { name: 'Global Calcium Pvt Ltd', contribution: 'Corporate sponsor', logo_url: '' },
  { name: 'Vakil Housing & Development', contribution: 'Development partner', logo_url: '' },
  { name: 'GCI', contribution: 'Corporate sponsor', logo_url: '' },
  { name: 'Vidya', contribution: 'Education sponsor', logo_url: '' },
  { name: 'Maargam', contribution: 'Community partner', logo_url: '' },
  { name: 'Missing Millions', contribution: 'CSR partner', logo_url: '' },
  { name: 'MCKS', contribution: 'Community sponsor', logo_url: '' },
  { name: 'BigBasket', contribution: 'Food distribution', logo_url: '' },
  { name: 'Fortinet', contribution: 'Technology sponsor', logo_url: '' },
  { name: 'Prohance', contribution: 'Corporate sponsor', logo_url: '' },
  { name: 'Sneha Mumbai', contribution: 'NGO partner', logo_url: '' },
  { name: 'Dwara', contribution: 'Community partner', logo_url: '' },
  { name: 'Rotary Midatown Charitable Trust', contribution: 'Charitable partner', logo_url: '' },
  { name: 'Rotary GenNext', contribution: 'Youth partner', logo_url: '' },
  { name: 'HopeWorks', contribution: 'Social impact partner', logo_url: '' },
  { name: 'Andulasia Foundation', contribution: 'Foundation partner', logo_url: '' },
  { name: 'Sapiens Technologies', contribution: 'Technology sponsor', logo_url: '' },
  { name: 'Automated Workflow Pvt Limited', contribution: 'Technology partner', logo_url: '' },
  { name: 'Avalon Technologies', contribution: 'Technology sponsor', logo_url: '' },
  { name: 'Protivity', contribution: 'Corporate sponsor', logo_url: '' },
  { name: 'Aveva', contribution: 'Technology sponsor', logo_url: '' },
];

const defaultTrust = [
  { title: 'Registered trust', value: 'Section 12A registered', doc_url: '' },
  { title: '80G exemption', value: 'Tax benefit for donors', doc_url: '' }
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

function Home({ activities, programs, stories, faqs, trust, trustees, donors, videos, settings = {}, fdOpen, setFdOpen, volOpen, setVolOpen }) {
  const [galleryActivity, setGalleryActivity] = useState(null);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef(null);
  const actRibbonRef = useRef(null);
  useEffect(() => { if (videoRef.current) videoRef.current.muted = videoMuted; }, [videoMuted]);

  useEffect(() => {
    const el = actRibbonRef.current;
    if (!el) return;
    let frame;
    const tick = () => {
      el.scrollLeft += 0.7;
      if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const scrollActRibbon = (dir) => {
    actRibbonRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };
  const [showCalendar, setShowCalendar] = useState(false);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selectedCalDate, setSelectedCalDate] = useState(null);

  function parseActDate(str) {
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
      const d = parseActDate(a.date);
      if (d) { const k = d.toDateString(); map[k] = (map[k] || []).concat(a); }
    });
    return map;
  }, [activities]);

  const [donationAmount, setDonationAmount] = useState(500);

  const impact = useMemo(() => {
    const meals = Math.max(1, Math.round(donationAmount / 55));
    const tuition = Math.max(1, Math.round(donationAmount / 80));
    const kits = Math.max(1, Math.round(donationAmount / 350));
    return { meals, tuition, kits };
  }, [donationAmount]);

  const [faqOpen, setFaqOpen] = useState(-1);
  const [faqFilter, setFaqFilter] = useState('All');

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

  function handleDonate() {
    const amountPaise = (donationAmount || 100) * 100;
    const url = `https://rzp.io/l/TP4lsYMy?amount=${amountPaise}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      <section className="hero" id="home" style={settings.hero_bg_url ? {
        backgroundImage: `linear-gradient(rgba(249,247,243,0.72), rgba(249,247,243,0.72)), url(${settings.hero_bg_url})`,
        backgroundSize: 'cover', backgroundPosition: 'center'
      } : {}}>
        <div className="hero-content fade-up">
          <a href={OFFICE_MAP_URL} target="_blank" rel="noopener noreferrer" className="hero-eyebrow hero-eyebrow-link">
            <i className="ti ti-map-pin" /> Bengaluru · Serving since 2000
          </a>
          <h1>
            To be kind is more important than to be right.
            <br />
            <em>Many times what people need is not brilliant mind that speaks,</em>
            <br />
            But a special heart that listens.
            <br />
            -F. Scott Fitzgerald
          </h1>
          <div className={`hero-about-text${aboutExpanded ? ' hero-about-expanded' : ''}`}>
            <p>Swabhimaan is more than an organization—it is a space where every individual is nurtured, supported, and cared for, regardless of their circumstances or background. At its heart is a simple yet powerful belief: every person deserves to live with dignity, respect, and opportunity.</p>
            <p>Swabhimaan is built on the belief of "by the community, for the community." Its work grows from an understanding of the needs, aspirations, and challenges of the people it serves. By working alongside communities rather than simply working for them, Swabhimaan strives to create solutions that are meaningful, sustainable, and rooted in real lives.</p>
            {aboutExpanded && <>
              <p>Swabhimaan works to empower individuals by helping them discover their potential, build confidence, and create pathways toward a better future. With a special focus on women and children—the foundation of strong families and communities—Swabhimaan creates opportunities that can lead to lasting and positive change.</p>
              <p>What began with a vision centered on education has grown into a broader mission addressing multiple aspects of community well-being. Over the years, Swabhimaan has expanded its initiatives to include food and ration support, nutrition programs, micro-lending, healthcare, education, and a school-like learning environment designed to help children grow, learn, and thrive.</p>
              <p className="hero-about-subhead">Investing in the Young of Tomorrow</p>
              <p>Swabhimaan recognizes that a stronger future begins with healthy, well-nourished, and educated children. Through its nutrition programs, the organization works to ensure that children receive the nourishment they need during their formative years. The aim goes beyond addressing immediate hunger—it is about laying the foundation for the young people who will shape tomorrow's communities.</p>
              <p>By investing in children's nutrition, education, health, and overall development today, Swabhimaan strives to build a stronger, healthier, and more capable generation for the future.</p>
              <p>Swabhimaan also believes that empowerment goes hand in hand with economic independence. Through initiatives such as paper-making and other livelihood opportunities, it has created avenues for employment, skill development, and self-reliance. Its crèche provides a safe and caring environment for children while enabling women to pursue learning, develop new skills, and work toward greater independence.</p>
              <p>Every initiative at Swabhimaan is rooted in the same purpose—to create opportunities, restore dignity, strengthen communities, and help individuals build better lives for themselves and their families.</p>
              <p>At Swabhimaan, we believe that meaningful change is not created by one person or one initiative. It is built together, by the community and for the community. By nurturing people, empowering families, investing in children, and creating opportunities for growth, Swabhimaan continues to touch lives and build a stronger, more dignified, and more inclusive future—one person, one family, and one community at a time.</p>
            </>}
          </div>
          <button className="hero-about-toggle" onClick={() => setAboutExpanded(e => !e)}>
            {aboutExpanded ? <><i className="ti ti-chevron-up" /> Read less</> : <><i className="ti ti-chevron-down" /> Read more</>}
          </button>
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
          <div className="hero-img-wrap">
            {settings?.hero_video_url
              ? <>
                  <video
                    ref={videoRef}
                    key={settings.hero_video_url}
                    autoPlay muted loop playsInline
                    className="hero-video"
                    src={settings.hero_video_url}
                  >
                    <source
                      src={settings.hero_video_url}
                      type={settings.hero_video_url.endsWith('.webm') ? 'video/webm' : 'video/mp4'}
                    />
                  </video>
                  <button
                    className="video-mute-btn"
                    onClick={() => setVideoMuted(m => !m)}
                    title={videoMuted ? 'Unmute' : 'Mute'}
                  >
                    <i className={videoMuted ? 'ti ti-volume-off' : 'ti ti-volume'} />
                  </button>
                </>
              : <div className="hero-img-placeholder">
                  <i className="ti ti-video" />
                  <span>Add a hero video</span>
                </div>
            }
          </div>
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
            <div className="trust-item"><i className="ti ti-circle-check" /> Registered charitable trust</div>
            <div className="trust-item"><i className="ti ti-circle-check" /> 80G tax exemption</div>
          </div>
        </div>
      </section>

      <section id="activities">
        <div className="section-header">
          <div>
            <div className="section-label">Live updates</div>
            <h2 className="section-title">Latest <em>activities</em></h2>
          </div>
          <Link to="/calendar" className="see-all"><i className="ti ti-calendar" /> Calendar</Link>
        </div>

        <div className="ribbon-wrapper act-ribbon-wrapper" ref={actRibbonRef}>
          <button className="ribbon-arrow ribbon-arrow-left" onClick={() => scrollActRibbon(-1)} title="Scroll left">
            <i className="ti ti-chevron-left" />
          </button>
          <div className="ribbon-track act-ribbon-track">
            {[...activities, ...activities].map((activity, i) => {
              const imgs = activity.images?.length
                ? activity.images
                : activity.image_url ? [activity.image_url] : [];
              const hasImages = imgs.length > 0;
              return (
                <div
                  key={i}
                  className="act-ribbon-card"
                  onClick={() => setGalleryActivity(activity)}
                >
                  {hasImages
                    ? <img src={imgs[0]} alt={activity.title} className="act-ribbon-img" />
                    : <div className={`act-ribbon-placeholder ${activity.badge || ''}`}>
                        <i className={activity.icon} style={{ color: activity.color }} />
                      </div>
                  }
                  <div className="act-ribbon-body">
                    <span className={`act-badge ${activity.badge}`}>{activity.category}</span>
                    <div className="act-ribbon-title">{activity.title}</div>
                    {(activity.description || activity.reach) && (() => {
                      const text = activity.description
                        ? activity.description.replace(/<[^>]*>/g, '').trim()
                        : activity.reach;
                      const isLong = text.length > 160;
                      return (
                        <div className="act-ribbon-desc-wrap">
                          <div className="act-ribbon-desc">{text}</div>
                          {isLong && (
                            <button className="act-ribbon-readmore" onClick={e => { e.stopPropagation(); setGalleryActivity(activity); }}>
                              Read more <i className="ti ti-arrow-right" />
                            </button>
                          )}
                        </div>
                      );
                    })()}
                    <div className="act-ribbon-date">
                      {activity.date && <><i className="ti ti-calendar" /> {activity.date}</>}
                      {activity.location && <><i className="ti ti-map-pin" /> {activity.location}</>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {galleryActivity && <Gallery activity={galleryActivity} onClose={() => setGalleryActivity(null)} />}
      </section>

      <section id="impact">
        <div className="section-label">Your impact</div>
        <h2 className="section-title">
          See what your <em style={{ color: '#FAC775' }}>donation</em> does
        </h2>
        <p className="section-sub">
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
        <div className="programs-bento">
          {programs.filter(p => !p.hidden).map((program, idx) => (
            <Link
              key={program.slug}
              to={`/programs/${program.slug}`}
              className={`prog-bento-card${idx === 0 ? ' prog-bento-featured' : ''}${idx === programs.length - 1 ? ' prog-bento-banner' : ''}${program.image_url ? ' prog-bento-has-image' : ''}`}
              style={program.image_url
                ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.6)), url(${program.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', color: '#fff' }
                : { background: `${program.color}35` }
              }
            >
              <div className="prog-bento-icon" style={program.image_url
                ? { background: 'rgba(255,255,255,0.2)', color: '#fff' }
                : { background: `${program.color}55`, color: program.color }
              }>
                <i className={program.icon} />
              </div>
              <div className="prog-bento-body">
                <div className="prog-bento-title" style={!program.image_url ? { color: program.color } : {}}>{program.title}</div>
                <div className="prog-bento-stat"><i className="ti ti-trending-up" /> {program.stat}</div>
                <div className="prog-bento-desc">{program.description}</div>
                <div className="prog-bento-link">View program <i className="ti ti-arrow-right" /></div>
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
        <div className="help-grid">
          <a href="#donate" className="help-card featured">
            <div className="hc-icon"><i className="ti ti-heart" /></div>
            <div className="hc-body">
              <div className="hc-title">Donate</div>
              <div className="hc-desc">Make a one-time or recurring contribution to keep programs running.</div>
              <div className="hc-cta">Support a program <i className="ti ti-arrow-right" /></div>
            </div>
          </a>
          <a href="#food-delivery" className="help-card" onClick={() => setFdOpen(true)}>
            <div className="hc-icon"><i className="ti ti-basket" /></div>
            <div className="hc-body">
              <div className="hc-title">Send food</div>
              <div className="hc-desc">Donate grocery kits or coordinate delivery in local neighborhoods.</div>
              <div className="hc-cta">Send a kit <i className="ti ti-arrow-right" /></div>
            </div>
          </a>
          <a href="#volunteer" className="help-card" onClick={() => setVolOpen(true)}>
            <div className="hc-icon"><i className="ti ti-users" /></div>
            <div className="hc-body">
              <div className="hc-title">Volunteer</div>
              <div className="hc-desc">Join our teams for distribution, teaching, and awareness programs.</div>
              <div className="hc-cta">Volunteer now <i className="ti ti-arrow-right" /></div>
            </div>
          </a>
        </div>
      </section>

      <section id="food-delivery" style={fdOpen ? {} : { padding: '0 5%' }}>
        {fdOpen && <div className="delivery-layout">
          <button className="form-collapse-btn" onClick={() => setFdOpen(false)}>
            <i className="ti ti-x" /> Close
          </button>
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
        </div>}
      </section>

      <section id="volunteer" style={volOpen ? {} : { padding: '0 5%' }}>
        {volOpen && <div className="delivery-layout">
          <button className="form-collapse-btn" onClick={() => setVolOpen(false)}>
            <i className="ti ti-x" /> Close
          </button>
          <div className="form-panel">
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
                <div className="step-indicator">
                  <div className="step-item active"><div className="step-dot">1</div><span>Sign up</span></div>
                  <div className="step-line" />
                  <div className="step-item"><div className="step-dot">2</div><span>WA confirm</span></div>
                  <div className="step-line" />
                  <div className="step-item"><div className="step-dot">3</div><span>Join team</span></div>
                </div>
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
                    <div className={`purpose-card ${volPurpose === 'services' ? 'selected' : ''}`} onClick={() => setVolPurpose('services')}>
                      <i className="ti ti-users-group" />
                      <div className="kit-name">On-ground services</div>
                      <div className="kit-price">Time, skills, presence</div>
                    </div>
                    <div className={`purpose-card ${volPurpose === 'donation' ? 'selected' : ''}`} onClick={() => setVolPurpose('donation')}>
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
                        {interestAreas.map((area) => <option key={area}>{area}</option>)}
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
                  Hi{volName ? ` ${volName}` : ''}! Thanks for signing up to volunteer with Swabhimaan.
                  {volPurpose === 'services'
                    ? <> You've chosen <strong>on-ground services</strong>{volInterest ? ` in ${volInterest}` : ''}.</>
                    : <> You've chosen <strong>donation support</strong>.</>}
                  {' '}We'll add you to the right WhatsApp group shortly.
                  <div className="wa-time">Just now ✓✓</div>
                </div>
                <div className="wa-bubble out">
                  Looking forward to contributing! 🙏
                  <div className="wa-time">Just now ✓✓</div>
                </div>
                <div className="wa-bubble">
                  Welcome to the team! ✅ Check your groups — you'll get your first task soon.
                  <div className="wa-time">Just now ✓✓</div>
                </div>
              </div>
              <div className="wa-input-bar">
                <div className="wa-input-fake">Type a message</div>
                <div className="wa-send"><i className="ti ti-send" /></div>
              </div>
            </div>
          </div>
        </div>}
      </section>

      <section id="stories">
        <div className="section-label">Impact stories</div>
        <h2 className="section-title">
          What our <em>community</em> says
        </h2>
        <div className="stories-grid">
          {stories.map((story) => (
            <div key={story.name} className="story-card">
              <div className="story-quote">"{story.quote}"</div>
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
        <div className="faq-tag-bar">
          {['All', 'Donation', 'Volunteer', 'Trust'].map((tag) => (
            <button
              key={tag}
              className={`faq-tag-pill ${faqFilter === tag ? 'active' : ''}`}
              onClick={() => setFaqFilter(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="faq-list">
          {faqs.filter(f => faqFilter === 'All' || f.tag === faqFilter).map((faq, index) => (
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
      </section>

      {trustees.length > 0 && (
        <section id="about">
          <div className="section-header">
            <div>
              <div className="section-label">About us</div>
              <h2 className="section-title">
                Meet our <em>pillars</em>
              </h2>
            </div>
          </div>
          <div className="trustees-grid">
            {trustees.map((person, index) => (
              <div key={`${person.name}-${index}`} className="trustee-card">
                <div className="trustee-photo-wrap">
                  {person.photo_url
                    ? <img src={person.photo_url} alt={person.name} className="trustee-photo" />
                    : <div className="trustee-photo trustee-photo-placeholder">{person.name.charAt(0)}</div>
                  }
                </div>
                <div className="trustee-info">
                  {person.role && <div className="trustee-role">{person.role}</div>}
                  <div className="trustee-name">{person.name}</div>
                  {person.bio && <p className="trustee-bio">{person.bio}</p>}
                </div>
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
          <div className="donors-bottom-text">
            <div className="section-label">Our partners</div>
            <h2 className="section-title">Trusted by organisations <em>that care</em></h2>
            <p className="section-sub">Our work is powered by forward-thinking companies and foundations who believe in long-term community change.</p>
          </div>
          {(() => {
            const COLORS = ['#854F0B','#0F6E56','#185FA5','#6D4AFF','#993556','#3B6D11','#D85A30','#0B6B8C'];
            const Chip = ({ donor, idx }) => {
              const bg = COLORS[idx % COLORS.length];
              return (
                <div className="sponsor-chip">
                  {donor.logo_url
                    ? <img src={donor.logo_url} alt={donor.name} className="sponsor-chip-logo" />
                    : <div className="sponsor-chip-avatar" style={{ background: bg }}>{donor.name.charAt(0)}</div>
                  }
                  <span className="sponsor-chip-name">{donor.name}</span>
                </div>
              );
            };
            const row1 = donors.slice(0, Math.ceil(donors.length / 2));
            const row2 = donors.slice(Math.ceil(donors.length / 2));
            return (
              <>
                <div className="ribbon-wrapper">
                  <div className="ribbon-track">
                    {[...row1, ...row1].map((d, i) => <Chip key={i} donor={d} idx={i} />)}
                  </div>
                </div>
                <div className="ribbon-wrapper" style={{ marginTop: 12 }}>
                  <div className="ribbon-track ribbon-track-reverse">
                    {[...row2, ...row2].map((d, i) => <Chip key={i} donor={d} idx={i + 5} />)}
                  </div>
                </div>
              </>
            );
          })()}
        </section>
      )}

      <section id="donate">
        <div className="section-label">Give hope</div>
        <h2 className="section-title">Donate for a stronger <em>community</em></h2>
        <p>
          Your contributions sustain everyday essentials, education, healthcare, and livelihood programs for low-income families in Bengaluru.
        </p>
        <div className="donate-amount-hero">
          <div className="donate-amount-label">I want to donate</div>
          <div className="donate-amount-display">
            <span className="donate-currency">₹</span>
            <input
              type="number"
              min="1"
              placeholder="0"
              value={donationAmount || ''}
              onChange={(e) => setDonationAmount(Number(e.target.value))}
              className="donate-amount-input"
            />
          </div>
          <div className="donate-quick-label">Quick select</div>
          <div className="donate-amounts">
            {[500, 1000, 2000, 5000].map((amount) => (
              <button
                key={amount}
                type="button"
                className={`amt-btn ${donationAmount === amount ? 'selected' : ''}`}
                onClick={() => setDonationAmount(amount)}
              >
                ₹{amount.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
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
          <button className="btn-white" type="button" onClick={handleDonate}>
            Donate ₹{donationAmount} now <i className="ti ti-arrow-right" />
          </button>
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
              <a className="social-btn" href="https://www.instagram.com/swabhimaan.charitabletrust?igsh=ZWx5Zm84bjd4N3Ax" target="_blank" rel="noopener noreferrer"><i className="ti ti-brand-instagram" /></a>
              <button className="social-btn"><i className="ti ti-brand-youtube" /></button>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Explore</div>
            <div className="footer-links">
              <Link to="/#activities">Activities</Link>
              <Link to="/#programs">Programs</Link>
              <Link to="/#donate">Donate</Link>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Support</div>
            <div className="footer-links">
              <Link to="/#volunteer">Volunteer</Link>
              <Link to="/#faq">FAQ</Link>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Contact</div>
            <div className="footer-links">
              <a href="mailto:swabhimaan2000@gmail.com">swabhimaan2000@gmail.com</a>
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
            <span className="cert-badge">12A</span>
          </div>
        </div>
      </footer>
    </>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [fdOpen, setFdOpen] = useState(false);
  const [volOpen, setVolOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const [activities, setActivities] = useState(defaultActivities);
  const [programs, setPrograms] = useState(defaultPrograms);
  const [stories, setStories] = useState(defaultStories);
  const [faqs, setFaqs] = useState(defaultFaqs);
  const [trust, setTrust] = useState(defaultTrust);
  const [trustees, setTrustees] = useState(defaultTrustees);
  const [donors, setDonors] = useState(defaultDonors);
  const [videos, setVideos] = useState([]);
  const [settings, setSettings] = useState({});

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
          fetch('/api/settings'),
        ]);
        const [activitiesData, programsData, storiesData, faqsData, trustData, trusteesData, donorsData, videosData, settingsData] = await Promise.all(
          responses.map((res) => (res.ok ? res.json() : null))
        );
        if (activitiesData) setActivities(activitiesData);
        if (programsData) setPrograms(programsData.map(p => {
          const def = defaultPrograms.find(d => d.slug === p.slug);
          return def ? {
            ...def,
            image_url: p.image_url || def.image_url,
            highlight_images: p.highlight_images,
            highlights: def.highlights.map((h, i) => ({
              ...h,
              images: (p.highlight_images?.[String(i)]?.filter(Boolean).length > 0
                ? p.highlight_images[String(i)].filter(Boolean)
                : h.images),
            })),
          } : p;
        }));
        if (storiesData) setStories(storiesData);
        if (faqsData) setFaqs(faqsData);
        if (trustData) setTrust(trustData);
        if (trusteesData) setTrustees(trusteesData);
        if (donorsData) setDonors(donorsData);
        if (videosData) setVideos(videosData);
        if (settingsData) { setSettings(settingsData); }
      } catch (err) {
        console.warn('Backend fetch failed:', err);
      }
    }

    loadContent();
  }, []);

  const [notifDismissed, setNotifDismissed] = useState(() => {
    try { return sessionStorage.getItem('notif_dismissed') === '1'; } catch { return false; }
  });
  const notifText = settings.notification_text || '';
  const notifLink = settings.notification_link || '';

  return (
    <div className="app">
      {notifText && !notifDismissed && (
        <div className="notif-float">
          <button className="notif-float-dismiss" onClick={() => { setNotifDismissed(true); try { sessionStorage.setItem('notif_dismissed', '1'); } catch {} }} title="Dismiss">
            <i className="ti ti-x" />
          </button>
          <div className="notif-float-header">
            <i className="ti ti-bell-ringing" /> Upcoming
          </div>
          <div className="notif-float-body">
            {notifLink
              ? <a href={notifLink} target="_blank" rel="noopener noreferrer">{notifText}</a>
              : notifText
            }
          </div>
        </div>
      )}
      <nav>
        <Link to="/" className="nav-logo">
          Swabhi<span>maan</span>
        </Link>
        <ul className="nav-links">
          <li><Link to="/#about">About</Link></li>
          <li><Link to="/#activities">Activities</Link></li>
          <li><Link to="/#programs">Programs</Link></li>
          <li><Link to="/#help">How to help</Link></li>
          <li><Link to="/#food-delivery" onClick={() => setFdOpen(true)}>Send food</Link></li>
          <li><Link to="/#volunteer" onClick={() => setVolOpen(true)}>Volunteer</Link></li>
          <li><Link to="/#donate">Donate</Link></li>
          <li><Link to="/#stories">Stories</Link></li>
          <li><Link to="/#videos">Videos</Link></li>
          <li><Link to="/#faq">FAQ</Link></li>
          <li><Link to="/#trust">Trust</Link></li>
          <li><Link to="/#donors">Donors</Link></li>
        </ul>
        <div className="nav-actions">
          <Link to="/#volunteer" className="btn btn-ghost" onClick={() => setVolOpen(true)}>
            <i className="ti ti-users" /> Volunteer
          </Link>
          <Link to="/#donate" className="btn btn-primary">
            <i className="ti ti-heart" /> Donate
          </Link>
        </div>
        <button className="nav-hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
          <i className={menuOpen ? 'ti ti-x' : 'ti ti-menu-2'} />
        </button>
      </nav>
      {menuOpen && (
        <div className="mobile-menu">
          <ul>
            <li><Link to="/#about" onClick={closeMenu}>About</Link></li>
            <li><Link to="/#activities" onClick={closeMenu}>Activities</Link></li>
            <li><Link to="/#programs" onClick={closeMenu}>Programs</Link></li>
            <li><Link to="/#help" onClick={closeMenu}>How to help</Link></li>
            <li><Link to="/#food-delivery" onClick={() => { setFdOpen(true); closeMenu(); }}>Send food</Link></li>
            <li><Link to="/#volunteer" onClick={() => { setVolOpen(true); closeMenu(); }}>Volunteer</Link></li>
            <li><Link to="/#stories" onClick={closeMenu}>Stories</Link></li>
            <li><Link to="/#videos" onClick={closeMenu}>Videos</Link></li>
            <li><Link to="/#faq" onClick={closeMenu}>FAQ</Link></li>
            <li><Link to="/#trust" onClick={closeMenu}>Trust</Link></li>
            <li><Link to="/#donors" onClick={closeMenu}>Donors</Link></li>
          </ul>
          <div className="mobile-menu-actions">
            <Link to="/#donate" className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={closeMenu}>
              <i className="ti ti-heart" /> Donate now
            </Link>
            <Link to="/#volunteer" className="btn btn-ghost" style={{ justifyContent: 'center' }} onClick={() => { setVolOpen(true); closeMenu(); }}>
              <i className="ti ti-users" /> Volunteer
            </Link>
          </div>
        </div>
      )}
      <ScrollToHash />
      <Routes>
        <Route
          path="/"
          element={<Home activities={activities} programs={programs} stories={stories} faqs={faqs} trust={trust} trustees={trustees} donors={donors} videos={videos} settings={settings} fdOpen={fdOpen} setFdOpen={setFdOpen} volOpen={volOpen} setVolOpen={setVolOpen} />}
        />
        <Route path="/programs/:slug" element={<ProgramDetail programs={programs} />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Routes>
    </div>
  );
}

export default App;
