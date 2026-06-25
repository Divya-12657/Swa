@echo off
cd C:\Users\divya\swa
call venv\Scripts\activate.bat
cd backend
python migrate_blogs.py
pause
