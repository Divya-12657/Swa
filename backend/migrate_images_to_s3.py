"""Migrate blog images from Webflow to S3"""
import os
import json
import requests
from io import BytesIO
from dotenv import load_dotenv
from sqlmodel import Session, select
from models import Activity
from db import engine
import boto3
from botocore.exceptions import BotoCoreError, ClientError
import urllib3

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()

AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
AWS_ENDPOINT_URL = os.getenv("AWS_ENDPOINT_URL")

def get_s3_client():
    config = {}
    if AWS_ENDPOINT_URL:
        config["endpoint_url"] = AWS_ENDPOINT_URL
    return boto3.client(
        "s3",
        region_name=AWS_REGION,
        verify=False,  # Disable SSL verification to avoid certificate issues
        **config,
    )

def upload_image_to_s3(image_url):
    """Download image from Webflow and upload to S3"""
    if not image_url or not image_url.startswith('http'):
        return None
    
    try:
        # Download image from Webflow
        print(f"  Downloading: {image_url[:60]}...")
        response = requests.get(image_url, timeout=10, verify=False)
        response.raise_for_status()
        
        # Determine file extension
        content_type = response.headers.get('content-type', 'image/jpeg')
        ext = content_type.split('/')[-1].split(';')[0]
        if ext == 'jpeg':
            ext = 'jpg'
        
        # Upload to S3
        filename = image_url.split('/')[-1].split('?')[0]
        if not filename.endswith(f'.{ext}'):
            filename = f"{filename}.{ext}"
        
        key = f"blogs/{filename}"
        
        print(f"  Uploading to S3: {key}")
        client = get_s3_client()
        client.upload_fileobj(
            BytesIO(response.content),
            AWS_S3_BUCKET,
            key,
            ExtraArgs={"ACL": "public-read", "ContentType": content_type},
        )
        
        s3_url = f"https://{AWS_S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{key}"
        print(f"  ✅ Uploaded to: {s3_url[:60]}...")
        return s3_url
    
    except Exception as e:
        print(f"  ❌ Failed to upload: {str(e)}")
        return None

def migrate_images_to_s3():
    """Migrate all blog images to S3"""
    with Session(engine) as session:
        # Get all blog activities
        blogs = session.exec(select(Activity).where(Activity.badge == 'blog')).all()
        
        total = len(blogs)
        migrated = 0
        failed = 0
        
        for i, blog in enumerate(blogs, 1):
            print(f"\n[{i}/{total}] Processing: {blog.title[:50]}")
            
            updated = False
            
            # Migrate main image
            if blog.image_url and blog.image_url.startswith('https://uploads-ssl.webflow.com'):
                print("  Main image:")
                new_url = upload_image_to_s3(blog.image_url)
                if new_url:
                    blog.image_url = new_url
                    updated = True
                else:
                    failed += 1
            
            # Migrate gallery images
            if blog.images:
                try:
                    images = json.loads(blog.images)
                    new_images = []
                    for img in images:
                        if img.startswith('https://uploads-ssl.webflow.com'):
                            print(f"  Gallery image:")
                            new_url = upload_image_to_s3(img)
                            if new_url:
                                new_images.append(new_url)
                                updated = True
                            else:
                                new_images.append(img)  # Keep original if migration fails
                                failed += 1
                        else:
                            new_images.append(img)
                    
                    blog.images = json.dumps(new_images)
                except:
                    pass
            
            if updated:
                migrated += 1
        
        # Commit all changes
        session.commit()
        
        print(f"\n✅ Migration complete!")
        print(f"   Blogs processed: {total}")
        print(f"   Blogs updated: {migrated}")
        print(f"   Failed uploads: {failed}")

if __name__ == '__main__':
    if not AWS_S3_BUCKET:
        print("❌ AWS_S3_BUCKET not configured")
        exit(1)
    
    print(f"Migrating blog images to S3 bucket: {AWS_S3_BUCKET}")
    print("=" * 60)
    migrate_images_to_s3()
