# 📚 Worldpedia Education Backend

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
![Express](https://img.shields.io/badge/Express-v5.0-lightgrey.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green.svg)
![License](https://img.shields.io/badge/license-ISC-blue.svg)

Backend API untuk platform **Worldpedia Education**, sebuah sistem manajemen pembelajaran (LMS) yang mencakup manajemen kursus, pendaftaran siswa, pembayaran, dan penerbitan sertifikat otomatis.

Dibangun menggunakan arsitektur **Layered MVC** dengan **TypeScript** untuk skalabilitas dan kemudahan pemeliharaan.

## 📋 Daftar Isi
- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Prasyarat](#-prasyarat)
- [Instalasi & Setup](#-instalasi--setup)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Dokumentasi API](#-dokumentasi-api)
- [Struktur Folder](#-struktur-folder)

## 🚀 Fitur Utama
* **Autentikasi & Otorisasi**: JWT (Access & Refresh Token), Login via Google OAuth2.
* **Manajemen User**: Role-based access control (Admin, Student, Instructor).
* **Manajemen Kursus**: CRUD kursus, filter level, dan materi.
* **Pendaftaran & Pembayaran**: Integrasi Payment Gateway (Midtrans).
* **Sertifikat Otomatis**: Integrasi Google Drive API untuk generate & hosting sertifikat.
* **Media Storage**: Upload gambar ke Cloudinary.
* **Notifikasi Email**: SMTP Email service untuk aktivasi dan reset password.
* **Keamanan**: Rate limiting, Helmet, Data Sanitization, HPP.

## 🛠 Teknologi yang Digunakan
* **Runtime**: Node.js
* **Language**: TypeScript
* **Framework**: Express.js
* **Database**: MongoDB (via Mongoose)
* **Documentation**: Swagger / OpenAPI 3.0
* **Third-Party Services**:
    * Google Cloud Platform (OAuth, Drive)
    * Midtrans (Payment)
    * Cloudinary (Image Storage)

## Vk Prasyarat
Sebelum memulai, pastikan Anda telah menginstal:
* [Node.js](https://nodejs.org/) (v18 atau lebih baru)
* [MongoDB](https://www.mongodb.com/) (Local atau Atlas)
* Akun layanan terkait (Google Cloud, Midtrans, Cloudinary)

## ⚙️ Instalasi & Setup

1.  **Clone repositori ini:**
    ```bash
    git clone [https://github.com/Kyyy45/Worldpedia-Education-Backend.git](https://github.com/username-anda/worldpedia-education-backend.git)
    cd worldpedia-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Duplikasi file `.env.example` menjadi `.env` dan isi konfigurasi Anda.
    ```bash
    cp .env.example .env
    ```

## gf Konfigurasi Environment

Berikut adalah penjelasan variabel yang harus diisi di file `.env`:

| Kategori | Variable | Deskripsi |
| :--- | :--- | :--- |
| **Server** | `PORT` | Port aplikasi berjalan (Default: 5000) |
| | `NODE_ENV` | `development` atau `production` |
| **Database** | `MONGODB_URI` | Connection string MongoDB |
| **JWT** | `JWT_ACCESS_SECRET` | Secret key untuk Access Token |
| | `JWT_REFRESH_SECRET` | Secret key untuk Refresh Token |
| **Email** | `SMTP_HOST` | Host SMTP (misal: smtp.gmail.com) |
| | `SMTP_USER` | Email pengirim |
| | `SMTP_PASS` | Password aplikasi email (App Password) |
| **Cloudinary** | `CLOUDINARY_CLOUD_NAME` | Cloud name dari dashboard Cloudinary |
| | `CLOUDINARY_API_KEY` | API Key Cloudinary |
| | `CLOUDINARY_API_SECRET` | API Secret Cloudinary |
| **Midtrans** | `MIDTRANS_SERVER_KEY` | Server Key dari Midtrans |
| | `MIDTRANS_CLIENT_KEY` | Client Key dari Midtrans |
| **Google** | `GOOGLE_CLIENT_ID` | OAuth Client ID |
| | `GOOGLE_CLIENT_SECRET` | OAuth Client Secret |
| | `GOOGLE_DRIVE_FOLDER_ID` | ID Folder Drive untuk simpan sertifikat |
| | `GOOGLE_SERVICE_ACCOUNT_KEY`| JSON String dari Service Account Key |

> **Catatan:** Untuk `GOOGLE_SERVICE_ACCOUNT_KEY`, pastikan formatnya adalah JSON string satu baris.

## ▶️ Menjalankan Aplikasi

**Mode Development (dengan Hot-Reload):**
```bash
npm run dev