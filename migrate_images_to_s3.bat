@echo off
cd C:\Users\divya\swa
call venv\Scripts\activate.bat
cd backend
python migrate_images_to_s3.py
pause
