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
from models import SQLModel, Video, Activity, Payment, FoodRequest, Donor
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
        "icon": "ti ti-basket",
        "title": "Food & nutrition",
        "description": "Daily grocery distribution reaching 500+ doorsteps.",
        "stat": "500+ families served daily",
    },
    {
        "icon": "ti ti-school",
        "title": "Education support",
        "description": "After-school classes, scholarships, and career mentoring.",
        "stat": "200+ children supported",
    },
    {
        "icon": "ti ti-stethoscope",
        "title": "Healthcare access",
        "description": "Health camps, screenings, and medicine for low-income families.",
        "stat": "4 community camps monthly",
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
    {"title": "Registered trust", "value": "Section 12A registered"},
    {"title": "80G exemption", "value": "Tax benefit for donors"},
    {"title": "FCRA compliant", "value": "International funding ready"},
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
        "location": a.location, "reach": a.reach, "badge": a.badge,
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


@app.get("/api/health")
def health():
    return {"status": "ok", "message": "Swabhimaan API is running."}


@app.get("/api/activities")
def list_activities(session: SQLSession = Depends(get_session)):
    results = session.exec(select(Activity)).all()
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
def list_programs():
    return PROGRAMS


@app.get("/api/stories")
def list_stories():
    return STORIES


@app.get("/api/faqs")
def list_faqs():
    return FAQS


@app.get("/api/trust")
def list_trust():
    return TRUST


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
