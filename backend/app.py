import json
import os
import uuid
from typing import List, Optional
from datetime import datetime
import hashlib
import hmac

from dotenv import load_dotenv

load_dotenv()

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from sqlmodel import select
import requests
import razorpay

from db import engine, get_session
from models import SQLModel, Video, Activity, Payment, FoodRequest, Donor, Volunteer, ProgramImage, HighlightImage, TrusteeProfile, SiteSetting
from sqlmodel import Session as SQLSession

AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "change-me")
AWS_ENDPOINT_URL = os.getenv("AWS_ENDPOINT_URL")
IG_USER_ID = os.getenv("IG_USER_ID")
IG_ACCESS_TOKEN = os.getenv("IG_ACCESS_TOKEN")
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

app = FastAPI(title="Swabhimaan NGO API", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PROGRAMS = [
    {
        "slug": "food-nutrition",
        "icon": "ti ti-basket",
        "color": "#854F0B",
        "image_url": "",
        "title": "Food & nutrition",
        "description": "A warm meal is more than food — it's comfort, dignity, and hope. We ensure no family goes to bed hungry.",
        "stat": "500+ families served daily",
        "details": [
            "Every day, Swabhimaan reaches families who struggle to put food on the table. Through monthly grocery distribution, community kitchens, nutrition drives, and emergency relief, we ensure that vulnerable households receive not just meals, but the assurance that someone cares.",
            "The concept of freebies is not encouraged in the current setup, but Swabhimaan's point of view is different. Freebies are not offered assuming that people are weak, incapable, or unable to fight their battles. They are offered to strengthen them enough to fight that battle.",
            "And when we say strength, we mean real physical/mental strength — the strength to wake up the next day, the zeal to keep fighting, to continue to fight, and to earn their next meal. It is about giving them the support/hope they need to reach that point.",
            "Because sometimes, a person does not need someone to fight their battle for them. They just need enough support to get back on their feet and find the strength to fight it themselves. That is what Swabhimaan is trying to provide — not a way out of the struggle, but a little strength to face it, survive it, and eventually overcome it on their own.",
        ],
    },
    {
        "slug": "education-support",
        "icon": "ti ti-school",
        "color": "#0F6E56",
        "image_url": "",
        "title": "Education support",
        "description": "Education doesn't just change report cards — it changes futures. We create learning environments where every child can dream.",
        "stat": "200+ children supported",
        "details": [
            "Swabhimaan treats education as a weapon — a powerful tool to eradicate this so-called helplessness. For over two decades, it has been working in the field of education with the belief that education can transform the current state of an individual as well as their entire family.",
            "With this belief at its core, Swabhimaan has taken up multiple programmes to address the different barriers that keep children and young people from moving forward. It runs NIOS programmes for school dropouts, giving them an opportunity to return to education and build a better future. Its after-school learning centres help strengthen their understanding and bridge the gaps in learning, especially for children who come from schools where quality education is often not provided in its truest form.",
            "Swabhimaan also provides scholarships to ease the financial burden on parents and ensure that children can continue their education without having to give it up because of circumstances. Alongside this, its youth empowerment programmes focus on preparing young people not just academically, but as confident, capable and responsible citizens of this country.",
            "For Swabhimaan, education is not merely about getting a certificate or completing school. It is about giving an individual the knowledge, confidence and ability to change the circumstances they were born into — and, in the process, change the future of their entire family.",
        ],
        "ps": "Behind all of this is a core team of teachers who keep bringing these children back to the classroom, time and again, without giving up on them or losing hope. There are also people from different walks of life and fields who come in to share their knowledge, experiences and perspectives, helping these children discover what they are capable of and what they can become.",
    },
    {
        "slug": "healthcare-access",
        "icon": "ti ti-stethoscope",
        "color": "#185FA5",
        "image_url": "",
        "title": "Healthcare access",
        "description": "Healthcare should never be a privilege — it should be a promise. We bring quality care closer to communities.",
        "stat": "4 community camps monthly",
        "details": [
            "Swabhimaan brings quality healthcare closer to communities through medical camps, preventive screenings, awareness programmes, and health consultations. We believe prevention is just as important as treatment.",
            "From children's health to women's wellness and senior citizen care, our initiatives empower individuals with knowledge, early intervention, and access to essential healthcare services.",
            "Our initiatives: Community medical camps · Preventive health screenings · Women's health programmes · Hygiene and sanitation awareness · Affordable healthcare support · Health education workshops.",
        ],
        "ps": "One might ask, what can we call affordable healthcare in today's world, when even a basic consultation can cost ₹500 or more? But this is where Swabhimaan is different. It is true — Swabhimaan provides healthcare at an affordable cost, sometimes for just a few tens of rupees. The aim is simple: healthcare should not become a burden that people have to choose between and their next meal.",
    },
    {
        "slug": "livelihood-skills",
        "icon": "ti ti-tool",
        "color": "#6D4AFF",
        "image_url": "",
        "title": "Livelihood & skill training",
        "description": "A skill is more than a livelihood — it's confidence, independence, and opportunity. We open doors for youth and adults.",
        "stat": "150+ adults trained",
        "details": [
            "Swabhimaan equips youth and adults with practical, industry-relevant skills that help them secure employment, start businesses, and become financially independent.",
            "Whether it's digital skills, tailoring, communication, entrepreneurship, or workplace readiness, our programmes empower individuals to build sustainable careers and brighter futures.",
            "Training includes: Vocational skill development · Computer and digital literacy · Communication and employability skills · Entrepreneurship training · Financial literacy · Job readiness and placement assistance.",
        ],
    },
    {
        "slug": "women-empowerment",
        "icon": "ti ti-heart-handshake",
        "color": "#C2185B",
        "image_url": "",
        "title": "Women empowerment",
        "description": "When a woman rises, an entire family rises with her. We support women in building independence and leading change.",
        "stat": "30+ self-help groups active",
        "details": [
            "Swabhimaan supports women in discovering their strengths, building financial independence, and becoming leaders within their communities. Through self-help groups, skill development, entrepreneurship, and financial literacy, we help women create lasting change for themselves and future generations.",
            "Swabhimaan's main and foremost goal has always been to empower women and create opportunities for them to thrive with dignity and confidence. It has created various programmes that help women build a livelihood of their own — from providing tailoring machines so they can earn through their skills, to beautician classes that enable them to pursue employment opportunities.",
            "Swabhimaan also creates women entrepreneurs by supporting them through microfinancing and providing the initial financial support they need to start something of their own.",
            "Most of the in house programmes like the nutrition drives, food distribution are supported by women of the same community, this way it creates jobs and responsibility.",
        ],
        "ps": "And Swabhimaan wants to say this out loud and clear: women have shown an extraordinary sense of responsibility and loyalty towards this support. In fact, 98% of the women supported through these initiatives have returned the principal amount. That 98% is more than just a number. It reflects their commitment, their responsibility and their determination to build something for themselves and their families. Women are the true pillars of their homes, and when they are given an opportunity, they prove that trust can be repaid with responsibility.",
    },
    {
        "slug": "community-environment",
        "icon": "ti ti-leaf",
        "color": "#2E7D32",
        "image_url": "",
        "title": "Community awareness & environment",
        "description": "Awareness drives on hygiene, sanitation, civic rights, and environmental sustainability to build healthier, cleaner neighborhoods.",
        "stat": "12+ awareness drives yearly",
        "details": [
            "We run regular campaigns on hygiene and sanitation, helping households adopt practices like handwashing, safe drinking water storage, and proper waste disposal.",
            "Our civic rights workshops help residents access entitlements like ration cards, Aadhaar-linked benefits, voter registration, and grievance redressal processes.",
            "On the environmental side, we organize tree plantation drives, waste segregation campaigns, and disaster-preparedness sessions ahead of monsoon season.",
        ],
    },
]

STORIES = [
    {
        "quote": "Swabhimaan helped me find work training and now I can send my child to school.",
        "name": "Prerna",
        "role": "Community parent",
    },
    {
        "quote": "The health camp made it possible for me to get medicine without any cost.",
        "name": "Ravi",
        "role": "Beneficiary",
    },
    {
        "quote": "I feel empowered after the tailoring workshop — I can support my family.",
        "name": "Shanti",
        "role": "Program graduate",
    },
]

FAQS = [
    {
        "question": "How can I donate regularly?",
        "answer": "Choose a monthly plan with the donation slider and click donate to register your support.",
        "tag": "Donation",
    },
    {
        "question": "Can I volunteer for neighborhood drives?",
        "answer": "Yes. We welcome volunteers for food distribution, tutoring, and health camps.",
        "tag": "Volunteer",
    },
    {
        "question": "Are donations tax-deductible?",
        "answer": "Swabhimaan is 80G certified and can provide donation receipts on request.",
        "tag": "Trust",
    },
]

TRUST = [
    {"title": "Registered trust", "value": "Section 12A registered", "doc_url": ""},
    {"title": "80G exemption", "value": "Tax benefit for donors", "doc_url": ""}
]

MAJOR_DONORS = [
    {"name": "Baker Hughes",                    "contribution": "Corporate sponsor",    "logo_url": ""},
    {"name": "Donatekart",                       "contribution": "Platform partner",     "logo_url": ""},
    {"name": "Global Calcium Pvt Ltd",           "contribution": "Corporate sponsor",    "logo_url": ""},
    {"name": "Vakil Housing & Development",      "contribution": "Development partner",  "logo_url": ""},
    {"name": "GCI",                              "contribution": "Corporate sponsor",    "logo_url": ""},
    {"name": "Vidya",                            "contribution": "Education sponsor",    "logo_url": ""},
    {"name": "Maargam",                          "contribution": "Community partner",    "logo_url": ""},
    {"name": "Missing Millions",                 "contribution": "CSR partner",          "logo_url": ""},
    {"name": "MCKS",                             "contribution": "Community sponsor",    "logo_url": ""},
    {"name": "BigBasket",                        "contribution": "Food distribution",    "logo_url": ""},
    {"name": "Fortinet",                         "contribution": "Technology sponsor",   "logo_url": ""},
    {"name": "Prohance",                         "contribution": "Corporate sponsor",    "logo_url": ""},
    {"name": "Sneha Mumbai",                     "contribution": "NGO partner",          "logo_url": ""},
    {"name": "Dwara",                            "contribution": "Community partner",    "logo_url": ""},
    {"name": "Rotary Midatown Charitable Trust", "contribution": "Charitable partner",   "logo_url": ""},
    {"name": "Rotary GenNext",                   "contribution": "Youth partner",        "logo_url": ""},
    {"name": "HopeWorks",                        "contribution": "Social impact partner","logo_url": ""},
    {"name": "Andulasia Foundation",             "contribution": "Foundation partner",   "logo_url": ""},
    {"name": "Sapiens Technologies",             "contribution": "Technology sponsor",   "logo_url": ""},
    {"name": "Automated Workflow Pvt Limited",   "contribution": "Technology partner",   "logo_url": ""},
    {"name": "Avalon Technologies",              "contribution": "Technology sponsor",   "logo_url": ""},
    {"name": "Protivity",                        "contribution": "Corporate sponsor",    "logo_url": ""},
    {"name": "Aveva",                            "contribution": "Technology sponsor",   "logo_url": ""},
]

TRUSTEES = [
    {"name": "Trustee Name 1", "role": "Founder & Managing Trustee", "photo_url": ""},
    {"name": "Trustee Name 2", "role": "Trustee", "photo_url": ""},
    {"name": "Trustee Name 3", "role": "Trustee", "photo_url": ""},
    {"name": "Trustee Name 4", "role": "Trustee", "photo_url": ""},
    {"name": "Trustee Name 5", "role": "Trustee", "photo_url": ""},
    {"name": "Trustee Name 6", "role": "Trustee", "photo_url": ""},
]

VIDEO_POSTS: List[dict] = []


class VideoPostCreate(BaseModel):
    title: str
    description: str
    video_url: HttpUrl
    thumbnail_url: Optional[HttpUrl]


class PaymentCreateRequest(BaseModel):
    amount: int  # in rupees
    donor_name: Optional[str] = None
    donor_email: Optional[str] = None
    donor_phone: Optional[str] = None


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class ActivityCreate(BaseModel):
    category: str
    title: str
    location: Optional[str] = None
    reach: Optional[str] = None
    badge: Optional[str] = None
    icon: Optional[str] = None
    date: Optional[str] = None
    color: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None


def _activity_dict(a: Activity) -> dict:
    d = {
        "id": a.id, "category": a.category, "title": a.title,
        "location": a.location, "reach": a.reach,
        "description": a.description,
        "badge": a.badge,
        "icon": a.icon, "date": a.date, "color": a.color,
        "image_url": a.image_url,
        "images": json.loads(a.images) if a.images else [],
    }
    return d


class FoodRequestCreate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    kit_type: str
    area: str
    preferred_date: Optional[str] = None
    qty: Optional[str] = None
    notes: Optional[str] = None


class VolunteerCreate(BaseModel):
    name: str
    phone: str
    purpose: str  # "donation" or "services"
    interest_area: Optional[str] = None
    availability: Optional[str] = None
    notes: Optional[str] = None


# Initialize Razorpay client if credentials are set
razorpay_client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


def get_s3_client():
    config = {}
    if AWS_ENDPOINT_URL:
        config["endpoint_url"] = AWS_ENDPOINT_URL
    return boto3.client(
        "s3",
        region_name=AWS_REGION,
        **config,
    )


def verify_admin_token(token: Optional[str]):
    if token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid admin token")


def get_or_create_donor(
    session: SQLSession,
    phone: Optional[str],
    name: Optional[str] = None,
    email: Optional[str] = None,
) -> Optional[Donor]:
    if not phone:
        return None
    donor = session.exec(select(Donor).where(Donor.phone == phone)).first()
    if donor:
        if name and not donor.name:
            donor.name = name
        if email and not donor.email:
            donor.email = email
        session.add(donor)
        return donor
    donor = Donor(phone=phone, name=name, email=email)
    session.add(donor)
    session.flush()
    return donor


def post_image_to_instagram(image_url: str, caption: str) -> Optional[dict]:
    """Create a media container for an image and publish it to the Instagram account.

    Requires IG_USER_ID and IG_ACCESS_TOKEN environment variables.
    Returns the publish response or None on failure.
    """
    placeholder = ("your_instagram_user_id", "your_long_lived_access_token", "", None)
    if not IG_USER_ID or not IG_ACCESS_TOKEN or IG_USER_ID in placeholder or IG_ACCESS_TOKEN in placeholder:
        return None

    base = f"https://graph.facebook.com/v17.0/{IG_USER_ID}"

    # Step 1: create media container
    create_url = f"{base}/media"
    params = {
        "image_url": image_url,
        "caption": caption,
        "access_token": IG_ACCESS_TOKEN,
    }
    try:
        r = requests.post(create_url, data=params, timeout=15)
        r.raise_for_status()
        creation = r.json()
        creation_id = creation.get("id")
        if not creation_id:
            return {"error": "no_creation_id", "body": creation}

        # Step 2: publish the container
        publish_url = f"{base}/media_publish"
        publish_params = {"creation_id": creation_id, "access_token": IG_ACCESS_TOKEN}
        p = requests.post(publish_url, data=publish_params, timeout=15)
        p.raise_for_status()
        return p.json()
    except Exception as exc:
        return {"error": str(exc)}


@app.get("/api/settings")
def get_settings(session: SQLSession = Depends(get_session)):
    return {s.key: s.value for s in session.exec(select(SiteSetting)).all()}

@app.post("/api/admin/settings/{key}")
def update_setting(key: str, payload: dict, session: SQLSession = Depends(get_session), token: str = Header(alias="X-Admin-Token")):
    verify_admin_token(token)
    existing = session.get(SiteSetting, key)
    if existing:
        existing.value = payload.get("value", "")
        session.add(existing)
    else:
        session.add(SiteSetting(key=key, value=payload.get("value", "")))
    session.commit()
    return {"key": key, "value": payload.get("value", "")}

@app.get("/api/health")
def health():
    return {"status": "ok", "message": "Swabhimaan API is running."}


@app.get("/api/activities")
def list_activities(session: SQLSession = Depends(get_session)):
    results = session.exec(select(Activity).order_by(Activity.created_at.desc())).all()
    if results:
        return [_activity_dict(a) for a in results]
    # fallback data
    return [
        {
            "category": "Food drive",
            "title": "Grocery kits — Neelasandra colony",
            "location": "Neelasandra",
            "reach": "320 families",
            "badge": "b-food",
            "icon": "ti ti-basket",
            "date": "Today",
            "color": "#854F0B",
        },
        {
            "category": "Education",
            "title": "Scholarship awards ceremony — LR Nagar",
            "location": "LR Nagar",
            "reach": "18 students",
            "badge": "b-edu",
            "icon": "ti ti-school",
            "date": "Yesterday",
            "color": "#0F6E56",
        },
        {
            "category": "Health camp",
            "title": "Free eye checkup & medicines — Karesandra",
            "location": "Karesandra",
            "reach": "84 patients",
            "badge": "b-health",
            "icon": "ti ti-stethoscope",
            "date": "2 days ago",
            "color": "#185FA5",
        },
    ]


@app.get("/api/programs")
def list_programs(session: SQLSession = Depends(get_session)):
    images = {p.slug: p.image_url for p in session.exec(select(ProgramImage)).all()}
    # Build highlight images map: {slug: {h_idx: {img_idx: url}}}
    hi_rows = session.exec(select(HighlightImage)).all()
    hi_map: dict = {}
    for hi in hi_rows:
        hi_map.setdefault(hi.program_slug, {}).setdefault(hi.highlight_idx, {})[hi.image_idx] = hi.image_url
    result = []
    for p in PROGRAMS:
        slug = p["slug"]
        slug_hi = hi_map.get(slug, {})
        highlight_images = {}
        for h_idx, imgs in slug_hi.items():
            urls = [imgs.get(0, ""), imgs.get(1, ""), imgs.get(2, "")]
            if any(urls):
                highlight_images[str(h_idx)] = urls
        result.append({**p, "image_url": images.get(slug, p.get("image_url", "")), "highlight_images": highlight_images})
    return result


class HighlightImagePayload(BaseModel):
    image_url: str


@app.post("/api/admin/programs/{slug}/highlights/{h_idx}/{img_idx}")
def set_highlight_image(
    slug: str, h_idx: int, img_idx: int,
    payload: HighlightImagePayload,
    session: SQLSession = Depends(get_session),
    token: str = Header(alias="X-Admin-Token"),
):
    verify_admin_token(token)
    existing = session.exec(
        select(HighlightImage).where(
            HighlightImage.program_slug == slug,
            HighlightImage.highlight_idx == h_idx,
            HighlightImage.image_idx == img_idx,
        )
    ).first()
    if existing:
        existing.image_url = payload.image_url
        existing.updated_at = datetime.utcnow()
        session.add(existing)
    else:
        session.add(HighlightImage(program_slug=slug, highlight_idx=h_idx, image_idx=img_idx, image_url=payload.image_url))
    session.commit()
    return {"ok": True}


@app.post("/api/admin/programs/{slug}/image")
def set_program_image(slug: str, payload: dict, session: SQLSession = Depends(get_session), token: str = Header(alias="X-Admin-Token")):
    verify_admin_token(token)
    image_url = payload.get("image_url", "")
    existing = session.get(ProgramImage, slug)
    if existing:
        existing.image_url = image_url
        existing.updated_at = datetime.utcnow()
        session.add(existing)
    else:
        session.add(ProgramImage(slug=slug, image_url=image_url))
    session.commit()
    return {"slug": slug, "image_url": image_url}


@app.get("/api/stories")
def list_stories():
    return STORIES


@app.get("/api/faqs")
def list_faqs():
    return FAQS


@app.get("/api/trust")
def list_trust():
    return TRUST


@app.get("/api/donors")
def list_donors():
    return MAJOR_DONORS


@app.get("/api/trustees")
def list_trustees(session: SQLSession = Depends(get_session)):
    profiles = session.exec(select(TrusteeProfile).order_by(TrusteeProfile.idx)).all()
    if not profiles:
        for i, t in enumerate(TRUSTEES):
            session.add(TrusteeProfile(idx=i, name=t["name"], role=t["role"], photo_url=t.get("photo_url", "")))
        session.commit()
        profiles = session.exec(select(TrusteeProfile).order_by(TrusteeProfile.idx)).all()
    return [{"idx": p.idx, "name": p.name or "", "role": p.role or "", "bio": p.bio or "", "photo_url": p.photo_url or ""} for p in profiles]


class TrusteeUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None


@app.post("/api/admin/trustees", status_code=201)
def add_trustee(payload: TrusteeUpdate, session: SQLSession = Depends(get_session), token: str = Header(alias="X-Admin-Token")):
    verify_admin_token(token)
    all_profiles = session.exec(select(TrusteeProfile)).all()
    next_idx = max((p.idx for p in all_profiles), default=-1) + 1
    new_p = TrusteeProfile(idx=next_idx, name=payload.name or "New Trustee", role=payload.role or "Trustee", bio=payload.bio or "", photo_url=payload.photo_url or "")
    session.add(new_p)
    session.commit()
    return {"idx": new_p.idx, "name": new_p.name, "role": new_p.role, "bio": new_p.bio, "photo_url": new_p.photo_url}


@app.post("/api/admin/trustees/{idx}")
def update_trustee(idx: int, payload: TrusteeUpdate, session: SQLSession = Depends(get_session), token: str = Header(alias="X-Admin-Token")):
    verify_admin_token(token)
    existing = session.get(TrusteeProfile, idx)
    if existing:
        if payload.name is not None: existing.name = payload.name
        if payload.role is not None: existing.role = payload.role
        if payload.bio is not None: existing.bio = payload.bio
        if payload.photo_url is not None: existing.photo_url = payload.photo_url
        existing.updated_at = datetime.utcnow()
        session.add(existing)
    else:
        session.add(TrusteeProfile(idx=idx, name=payload.name, role=payload.role, bio=payload.bio, photo_url=payload.photo_url))
    session.commit()
    return {"idx": idx}


@app.delete("/api/admin/trustees/{idx}")
def delete_trustee(idx: int, session: SQLSession = Depends(get_session), token: str = Header(alias="X-Admin-Token")):
    verify_admin_token(token)
    existing = session.get(TrusteeProfile, idx)
    if not existing:
        raise HTTPException(status_code=404, detail="Trustee not found")
    session.delete(existing)
    session.commit()
    return {"ok": True}


@app.get("/api/videos")
def list_videos():
    with SQLSession(engine) as session:
        rows = session.exec(select(Video).order_by(Video.created_at.desc())).all()
        return rows


@app.post("/api/upload-image")
def upload_image(file: UploadFile = File(...)):
    if not AWS_S3_BUCKET:
        raise HTTPException(status_code=500, detail="AWS storage is not configured")

    extension = file.filename.rsplit(".", 1)[-1].lower()
    key = f"images/{uuid.uuid4().hex}.{extension}"
    client = get_s3_client()

    try:
        client.upload_fileobj(
            file.file,
            AWS_S3_BUCKET,
            key,
            ExtraArgs={"ACL": "public-read", "ContentType": file.content_type},
        )
    except (BotoCoreError, ClientError) as exc:
        raise HTTPException(status_code=500, detail=f"Upload failed: {exc}")

    url = f"https://{AWS_S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{key}"
    return {"url": url}


@app.post("/api/admin/activities", status_code=201)
def create_activity(
    payload: ActivityCreate,
    x_admin_token: Optional[str] = Header(None, alias="X-Admin-Token"),
    session: SQLSession = Depends(get_session),
):
    verify_admin_token(x_admin_token)
    activity = Activity(
        category=payload.category,
        title=payload.title,
        location=payload.location,
        reach=payload.reach,
        badge=payload.badge,
        icon=payload.icon,
        date=payload.date,
        color=payload.color,
        image_url=payload.image_url or (payload.images[0] if payload.images else None),
        images=json.dumps(payload.images) if payload.images else None,
    )
    session.add(activity)
    session.commit()
    session.refresh(activity)
    return _activity_dict(activity)


@app.delete("/api/admin/activities/{activity_id}", status_code=204)
def delete_activity(
    activity_id: str,
    x_admin_token: Optional[str] = Header(None, alias="X-Admin-Token"),
    session: SQLSession = Depends(get_session),
):
    verify_admin_token(x_admin_token)
    activity = session.exec(select(Activity).where(Activity.id == activity_id)).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    session.delete(activity)
    session.commit()


@app.post("/api/admin/videos")
def create_video(
    payload: VideoPostCreate,
    x_admin_token: Optional[str] = Header(None, alias="X-Admin-Token"),
):
    verify_admin_token(x_admin_token)
    video = Video(
        title=payload.title,
        description=payload.description,
        video_url=str(payload.video_url),
        thumbnail_url=str(payload.thumbnail_url) if payload.thumbnail_url else None,
    )
    with SQLSession(engine) as session:
        session.add(video)
        session.commit()
        session.refresh(video)
        return video


@app.delete("/api/admin/videos/{video_id}", status_code=204)
def delete_video(
    video_id: str,
    x_admin_token: Optional[str] = Header(None, alias="X-Admin-Token"),
):
    verify_admin_token(x_admin_token)
    with SQLSession(engine) as session:
        video = session.exec(select(Video).where(Video.id == video_id)).first()
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        session.delete(video)
        session.commit()


@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)
    from sqlalchemy import text, inspect as sa_inspect
    with engine.connect() as conn:
        cols = [c["name"] for c in sa_inspect(engine).get_columns("activity")]
        if "images" not in cols:
            conn.execute(text("ALTER TABLE activity ADD COLUMN IF NOT EXISTS images TEXT"))
            conn.commit()


@app.post("/api/food-requests", status_code=201)
def create_food_request(
    payload: FoodRequestCreate,
    session: SQLSession = Depends(get_session),
):
    donor = get_or_create_donor(session, payload.phone, payload.name)
    req = FoodRequest(
        donor_id=donor.id if donor else None,
        kit_type=payload.kit_type,
        area=payload.area,
        preferred_date=payload.preferred_date,
        qty=payload.qty,
        notes=payload.notes,
    )
    session.add(req)
    session.commit()
    session.refresh(req)
    return {"id": req.id, "status": req.status, "donor_id": req.donor_id}


@app.get("/api/food-requests")
def list_food_requests(
    x_admin_token: Optional[str] = Header(None, alias="X-Admin-Token"),
    session: SQLSession = Depends(get_session),
):
    verify_admin_token(x_admin_token)
    return session.exec(select(FoodRequest).order_by(FoodRequest.created_at.desc())).all()


@app.post("/api/volunteers", status_code=201)
def create_volunteer(
    payload: VolunteerCreate,
    session: SQLSession = Depends(get_session),
):
    donor = get_or_create_donor(session, payload.phone, payload.name)
    volunteer = Volunteer(
        donor_id=donor.id if donor else None,
        name=payload.name,
        phone=payload.phone,
        purpose=payload.purpose,
        interest_area=payload.interest_area,
        availability=payload.availability,
        notes=payload.notes,
    )
    session.add(volunteer)
    session.commit()
    session.refresh(volunteer)
    return {"id": volunteer.id, "status": volunteer.status, "donor_id": volunteer.donor_id}


@app.get("/api/volunteers")
def list_volunteers(
    x_admin_token: Optional[str] = Header(None, alias="X-Admin-Token"),
    session: SQLSession = Depends(get_session),
):
    verify_admin_token(x_admin_token)
    return session.exec(select(Volunteer).order_by(Volunteer.created_at.desc())).all()


@app.post("/api/payments/create")
def create_payment(
    payload: PaymentCreateRequest,
    session: SQLSession = Depends(get_session),
):
    """Create a Razorpay payment order."""
    if not razorpay_client:
        raise HTTPException(
            status_code=500,
            detail="Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
        )

    if payload.amount < 1:
        raise HTTPException(status_code=400, detail="Minimum donation amount is ₹1.")

    try:
        order_data = {
            "amount": payload.amount * 100,  # Razorpay requires paise
            "currency": "INR",
            "receipt": f"donation-{uuid.uuid4().hex[:8]}",
        }
        order = razorpay_client.order.create(data=order_data)

        donor = get_or_create_donor(
            session, payload.donor_phone, payload.donor_name, payload.donor_email
        )
        payment = Payment(
            donor_id=donor.id if donor else None,
            razorpay_order_id=order["id"],
            amount=payload.amount,  # stored in rupees
            status="pending",
        )
        session.add(payment)
        session.commit()
        session.refresh(payment)

        return {
            "id": payment.id,
            "razorpay_order_id": order["id"],
            "key_id": RAZORPAY_KEY_ID,
            "amount": payload.amount,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Payment creation failed: {str(exc)}")


@app.post("/api/payments/verify")
def verify_payment(
    payload: PaymentVerifyRequest,
    session: SQLSession = Depends(get_session),
):
    """Verify a Razorpay payment signature."""
    if not razorpay_client or not RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Razorpay is not configured.",
        )

    try:
        # Verify the payment signature
        razorpay_client.utility.verify_payment_signature(
            {
                "razorpay_order_id": payload.razorpay_order_id,
                "razorpay_payment_id": payload.razorpay_payment_id,
                "razorpay_signature": payload.razorpay_signature,
            }
        )

        # Update payment status in DB
        payment = session.exec(
            select(Payment).where(Payment.razorpay_order_id == payload.razorpay_order_id)
        ).first()

        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")

        payment.razorpay_payment_id = payload.razorpay_payment_id
        payment.razorpay_signature = payload.razorpay_signature
        payment.status = "success"
        payment.updated_at = datetime.utcnow()
        session.add(payment)
        session.commit()

        return {
            "status": "success",
            "message": "Payment verified successfully",
            "payment_id": payment.id,
        }
    except razorpay.BadRequestsError as exc:
        raise HTTPException(status_code=400, detail=f"Signature verification failed: {str(exc)}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Payment verification failed: {str(exc)}")


@app.get("/api/payments/{payment_id}")
def get_payment(
    payment_id: str,
    session: SQLSession = Depends(get_session),
):
    """Get payment details."""
    payment = session.exec(select(Payment).where(Payment.id == payment_id)).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment
