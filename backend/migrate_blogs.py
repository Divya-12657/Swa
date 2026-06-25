#!/usr/bin/env python3
"""
Migrate Webflow blog CSV into the Activity table.

Usage (on EC2, inside /home/ec2-user/SWA/Swa/backend):
    python migrate_blogs.py "blog_posts.csv"
"""
import csv
import json
import sys
import uuid
from datetime import datetime

from sqlalchemy import text
from sqlmodel import Session, select

from db import engine
from models import Activity


DUMMY_SLUGS = {
    "10-quick-tips-about-blogging",
    "10-web-design-blogs-you-cant-miss",
    "20-myths-about-web-design",
    "5-web-design-blogs-you-should-be-reading",
    "the-history-of-web-design",
}


def ensure_columns():
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE activity ADD COLUMN IF NOT EXISTS description TEXT"))
        conn.commit()


def parse_date(date_str):
    if not date_str or not date_str.strip():
        return None
    try:
        clean = date_str.split("GMT")[0].strip()
        dt = datetime.strptime(clean, "%a %b %d %Y %H:%M:%S")
        return dt.strftime("%-d %b %Y")  # e.g. "20 Feb 2023"
    except Exception:
        return None


def parse_gallery(gallery_str):
    if not gallery_str or not gallery_str.strip():
        return []
    return [u.strip() for u in gallery_str.split(";") if u.strip()]


def migrate(csv_path: str):
    ensure_columns()

    added = skipped_flag = skipped_dummy = 0

    with Session(engine) as session:
        with open(csv_path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                slug = row.get("Slug", "").strip()

                # Skip lorem-ipsum template rows
                if slug in DUMMY_SLUGS:
                    skipped_dummy += 1
                    continue

                # Skip archived / still-draft posts
                if row.get("Archived", "false").lower() == "true":
                    skipped_flag += 1
                    continue
                if row.get("Draft", "false").lower() == "true":
                    skipped_flag += 1
                    continue

                title = row.get("Name", "").strip()
                if not title:
                    skipped_flag += 1
                    continue

                gallery = parse_gallery(row.get("Gallery", ""))
                main_image = row.get("Main Image", "").strip() or (gallery[0] if gallery else None)

                # Deduplicate: main image + gallery
                all_imgs = []
                if main_image:
                    all_imgs.append(main_image)
                for img in gallery:
                    if img not in all_imgs:
                        all_imgs.append(img)

                activity = Activity(
                    id=str(uuid.uuid4()),
                    category=row.get("Category", "General").strip() or "General",
                    title=title,
                    description=row.get("Post Body", "").strip() or None,
                    reach=row.get("Post Summary", "").strip() or None,
                    badge="blog",
                    icon="ti ti-news",
                    date=parse_date(row.get("Published On") or row.get("Created On", "")),
                    color=row.get("Color", "#666666").strip() or "#666666",
                    image_url=main_image,
                    images=json.dumps(all_imgs) if all_imgs else None,
                )

                session.add(activity)
                added += 1
                print(f"  + {title[:60]}")

        session.commit()

    print(f"\nDone.")
    print(f"  Inserted : {added}")
    print(f"  Skipped (archived/draft) : {skipped_flag}")
    print(f"  Skipped (template/dummy) : {skipped_dummy}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python migrate_blogs.py <path-to-csv>")
        sys.exit(1)
    migrate(sys.argv[1])
