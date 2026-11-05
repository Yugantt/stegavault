# 🛡️ StegaVault — Secure Steganography Vault

> A full-stack web application that hides encrypted secrets inside images using LSB Steganography. 
> Built with **FastAPI (Python)** on the backend and **React + TypeScript + Tailwind CSS** on the frontend.

---

## 📂 Project Structure
This repository contains two main parts:
- **[`app/`](./app/)**: Backend API (FastAPI, SQLAlchemy, AES-GCM, Argon2id). See [`README-BACKEND-APP.md`](./README-BACKEND-APP.md).
- **[`frontend/`](./frontend/)**: Web Client (React 19, Vite, Zustand, React Three Fiber). See [`README-FRONTEND.md`](./README-FRONTEND.md).

---

## ✨ Current Features (Stable)
- **Authentication:** Secure JWT-based login/register with Argon2id password hashing.
- **Image Hide:** Embed text or images inside carrier images (PNG/JPG/BMP) with optional AES-256-GCM encryption.
- **Image Extract:** Extract hidden payloads from stego-images with password verification.
- **Operation History:** Paginated log of all hide/extract actions with success/failure stats.
- **Settings:** Profile view, preferences (saved locally), and security settings.
- **UI/UX:** Premium cinematic dark theme, Matrix+Truck loaders, full mobile responsiveness.

---

## 🚧 Pending Roadmap (Backend dependent)
These features are currently disabled or mocked on the frontend because the backend endpoints are pending:
- [ ] **Profile Update:** `PATCH /auth/profile`
- [ ] **Change Password:** `POST /auth/change-password`
- [ ] **Delete Account:** `DELETE /auth/account`
- [ ] **Audio/Video Stego:** Currently routes to `ComingSoon` page.
- [ ] **Contact Form:** Currently falls back to `mailto:`.

---

## 🚦 Quick Start Guide

### 1. Start Backend
```bash
cd app
# Setup .env with DATABASE_URL and JWT_SECRET
uvicorn app.main:app --reload --port 8618

cd frontend
npm install
npm run dev