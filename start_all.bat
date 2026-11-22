@echo off
echo ====================================================
echo Starting FinRelief AI Platform (Backend + Frontend)
echo ====================================================
start "FinRelief AI - Backend" cmd /k "start_backend.bat"
start "FinRelief AI - Frontend" cmd /k "start_frontend.bat"
echo Services are starting in separate windows...
echo Backend:  http://127.0.0.1:8000 (Docs: http://127.0.0.1:8000/docs)
echo Frontend: http://127.0.0.1:5173
