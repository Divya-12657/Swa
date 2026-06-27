import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Column, String
from sqlmodel import SQLModel, Field


class Video(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    title: str
    description: str
    video_url: str
    thumbnail_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Activity(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    category: str
    title: str
    description: Optional[str] = None  # Blog content or activity description
    location: Optional[str] = None
    reach: Optional[str] = None
    badge: Optional[str] = None
    icon: Optional[str] = None
    date: Optional[str] = None
    color: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[str] = None  # JSON-encoded list of URLs
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Donor(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    # phone is the unique key — one row per person
    phone: str = Field(sa_column=Column(String, unique=True, index=True, nullable=False))
    name: Optional[str] = None
    email: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class FoodRequest(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    donor_id: Optional[str] = Field(default=None, foreign_key="donor.id")
    kit_type: str
    area: str
    preferred_date: Optional[str] = None
    qty: Optional[str] = None
    notes: Optional[str] = None
    status: str = "new"  # new, confirmed, delivered
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Volunteer(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    donor_id: Optional[str] = Field(default=None, foreign_key="donor.id")
    name: str
    phone: str
    purpose: str  # "donation" or "services"
    interest_area: Optional[str] = None
    availability: Optional[str] = None
    notes: Optional[str] = None
    status: str = "new"  # new, contacted, active
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ProgramImage(SQLModel, table=True):
    slug: str = Field(primary_key=True)  # matches program slug
    image_url: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SiteSetting(SQLModel, table=True):
    key: str = Field(primary_key=True)
    value: str = ""


class TrusteeProfile(SQLModel, table=True):
    idx: int = Field(primary_key=True)  # 0-5 position
    name: Optional[str] = None
    role: Optional[str] = None
    photo_url: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Payment(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    donor_id: Optional[str] = Field(default=None, foreign_key="donor.id")
    razorpay_order_id: str
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    amount: int  # stored in rupees
    status: str = "pending"  # pending, success, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
