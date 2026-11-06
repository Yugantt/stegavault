# 🛡️ StegaVault — Secure Steganography Vault

> A full-stack web application that hides encrypted secrets (Text & Images) inside Images and Audio files using LSB Steganography. 
> Built with **FastAPI (Python)** on the backend and **React + TypeScript + Tailwind CSS** on the frontend.

---

## 📂 Project Structure
This repository contains two main parts:
- **`/app`**: Backend API (FastAPI, SQLAlchemy, AES-GCM, Argon2id, FFmpeg).
- **`/frontend`**: Web Client (React 19, Vite, Zustand, Tailwind CSS).

---

## 🚀 Tech Stack

### Backend
- **Framework:** FastAPI, Uvicorn
- **Database:** PostgreSQL (Async SQLAlchemy 2)
- **Auth:** JWT (python-jose), Argon2id (argon2-cffi)
- **Encryption:** AES-GCM (cryptography)
- **Steganography:** Pillow, NumPy (Image LSB) | Pydub, SoundFile, FFmpeg (Audio LSB)

### Frontend
- **Framework:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4, Custom Dark Cinematic Theme
- **State Management:** Zustand
- **HTTP Client:** Axios (with auto token refresh queue)
- **Animations:** Framer Motion

---

## ✨ Key Features (Stable)

- **🖼️ Image Studio:** Hide/Extract text or images inside PNG/JPG/BMP.
- **🎵 Audio Studio:** Hide/Extract text or images inside WAV/MP3 (Auto-converts MP3 to WAV for processing).
- **🔄 Cross-Media:** Extract hidden payloads from Audio and automatically detect if the result is Text or an Image.
- **🔐 Security:** AES-256-GCM encryption, Argon2id password hashing, JWT Auth.
- **📊 Dashboard & History:** Live statistics separated by module (Image vs Audio), recent activity logs, and accurate success rates.
- **⚙️ Account Management:** Update Profile, Change Password, and Delete Account.
- **🎨 Premium UI:** Dark theme, glowing cards, Matrix+Truck loaders, and full mobile responsiveness.

---

## 🚧 Pending Roadmap (Coming Soon)
- [ ] **Video Steganography:** MP4/AVI support.
- [ ] **Contact Form:** Backend endpoint (currently falls back to `mailto:`).
- [ ] **3D Landing Page:** React Three Fiber scene integration.

---

## 🚦 Quick Start Guide

### 1. System Requirements
- **Python 3.10+**
- **Node.js 18+**
- **FFmpeg** (Required for Audio MP3 processing)
  - **Windows:** `winget install ffmpeg` or download from [gyan.dev](https://www.gyan.dev/ffmpeg/builds/)
  - **Mac:** `brew install ffmpeg`
  - **Linux:** `sudo apt install ffmpeg`

### 2. Start Backend
```bash
cd app
# Activate virtual environment (Windows: .venv\Scripts\activate)
pip install -r requirements.txt
# Setup .env with DATABASE_URL and JWT_SECRET
uvicorn app.main:app --reload --port 8618

cd frontend
npm install
# Create .env file with: VITE_API_URL=http://127.0.0.1:8618
npm run dev