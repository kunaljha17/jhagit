# 🐙 jhaGit — Distributed Version Control & Web Platform

A full-stack, lightweight Git clone tool and code collaboration platform built from scratch with a custom **Node.js CLI Version Control Engine**, a **React Web Dashboard**, **MongoDB**, **Nodemailer Email OTP Verification**, and **Cloudflare R2 (S3-compatible)** object storage integration.

[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![React Router 7](https://img.shields.io/badge/React_Router-7-CA4245?logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9.x-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Nodemailer](https://img.shields.io/badge/Nodemailer-SMTP-009688?logo=nodemailer&logoColor=white)](https://nodemailer.com/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-S3_Compatible-F38020?logo=cloudflare&logoColor=white)](https://www.cloudflare.com/developer-platform/r2/)

---

## 🌟 Overview

**jhaGit** provides both a developer-friendly command-line interface (CLI) for versioning local files and a web dashboard for browsing repositories, inspecting file content, visualizing contribution activity, tracking issues, starring repositories, managing account settings, and verifying user identity via email OTP codes.

The project features a **3-way merge engine with dynamic programming LCS diffing**, multi-parent commit graph traversal, detached HEAD state resolution, **cryptographic 6-digit OTP email authentication**, and Cloudflare R2 cloud synchronization.

---

## ✨ Features

### ⚡ Custom Git CLI Engine
- **Local Repository Initialization (`init`)**: Initialize version tracking structure via `.jhaGit/`.
- **Staging & Commits (`add`, `commit`)**: Copy target files to staging and package commits into UUID-backed snapshot directories with `commit.json` metadata (supporting multi-parent merge commits and `MERGE_HEAD` conflict tracking).
- **Status & Working Tree Inspection (`status`)**: Report staged, modified, and untracked files relative to active branch or detached HEAD.
- **Commit History Logs (`log`)**: Graph traversal of multi-parent commits from HEAD.
- **Line-by-Line File Diffing (`diff`)**: Compare working directory files against staged or committed snapshots using line array comparisons.
- **Branching & Checkout (`branch`, `checkout`)**: Lightweight branch ref management (`refs/heads/`), detached HEAD support, and automatic working tree restoration.
- **3-Way Merge Engine (`merge`)**: Dynamic programming LCS line diffing, multi-parent BFS common ancestor resolution (`findCommonAncestor`), automatic conflict marker insertion (`<<<<<<<` / `=======` / `>>>>>>>`), and `MERGE_HEAD` state persistence.
- **Revert & Snapshot Restore (`revert`)**: Restore working directory files from any historical commit snapshot.

### 🔐 2-Step Email Verification & Security
- **Nodemailer SMTP Integration**: Automated dispatch of HTML verification emails containing 6-digit verification codes.
- **Crypto-Secure OTP Generation**: Uses Node's `crypto.randomInt` for unbiased numeric OTP generation and SHA-256 hashing before storing in MongoDB.
- **Rate-Limiting & Expiry Protection**: Enforces 10-minute code expiration, 5-attempt failure limit (`otpAttempts`), and a 60-second resend cooldown (`otpLastSentAt`).
- **Email Verification Gate**: Restricts login access for unverified users with a `403 Forbidden` response.
- **Password Strength Validator**: Client and server-side validation requiring 6-30 characters with at least one uppercase letter, one digit, and one special character.

### ☁️ Cloud Remote Synchronization
- **Cloudflare R2 / AWS S3 Integration**: Upload (`push`) local commit snapshots to Cloudflare R2 object storage and download remote commits (`pull` / `clone`) directly into local `.jhaGit/` directories via `@aws-sdk/client-s3`.

### 🌐 Modern React Web Interface
- **Developer-Focused Dark UI**: GitHub-inspired design system with dark themes, CSS design tokens, custom monospace code fonts, and glassmorphism.
- **Debounced Repository Search**: Live repository filtering with a 300ms debounce, clear button (✕), and `Ctrl + K` keyboard shortcut.
- **Repository File Explorer & Code Viewer**: Browse repository files, preview raw text content, and copy file contents with a single click ("📋 Copy").
- **Web Git Engine Controls**: Trigger `git init`, `git push`, and `git pull` CLI commands straight from the web interface.
- **In-Browser File Creation**: Create and commit new files directly to target repositories from the browser.
- **Repository Star System**: Star/unstar repositories with optimistic UI updates and live star counts.
- **Contribution Activity Heatmap**: 12-month GitHub-style contribution calendar reflecting daily commits, issue creations, file edits, and repository creations.
- **Avatar Selection Modal**: Custom avatar picker modal (`AvatarPickerModal`) allowing users to choose Cloudinary profile avatars.
- **Owner Settings & Accessible Confirm Modal**: Dedicated Settings panel allowing repository owners to toggle visibility (Public/Private) and safely delete repositories using an accessible modal (`ConfirmModal`) with name confirmation.
- **Issue Tracker**: Full issue lifecycle management per repository with `open`/`closed` status badges.
- **Persistent Footer & Dedicated Info Pages**: Persistent site footer with links to **About Me** (`/about-me`), **About This Project** (`/about-project`), **Terms and Conditions** (`/terms`), and WhatsApp integration.
- **Skeleton Loading & Error Boundary**: Animated skeleton loaders (`SkeletonLoader`), custom 404 Not Found page (`NotFound.jsx`), and accessibility focus rings (`:focus-visible`).

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router 7, Axios, `@uiw/react-heat-map`, CSS3 Variables |
| **Backend / API** | Node.js, Express.js (v5), Mongoose / MongoDB, Socket.IO, Yargs CLI Parser |
| **Email Service** | Nodemailer, SMTP (Gmail / Custom Relay), Node `crypto` (SHA-256) |
| **Cloud Storage** | Cloudflare R2 (S3-compatible Object Storage via `@aws-sdk/client-s3`) |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt.js password hashing, Email OTP Verification |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       React Web Frontend (Vite)                         │
│  (Dashboard, RepoDetails, Profile, CreateRepo, Login, VerifyOtp, Terms) │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP REST API (axiosClient + JWT)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       Express.js / Node.js Backend                      │
│     (user.router, repo.router, issue.router, git.router, main.router)   │
└─────────┬──────────────────────────┬─────────────────────────┬──────────┘
          │                          │                         │
          ▼                          ▼                         ▼
┌──────────────────┐    ┌───────────────────────────┐    ┌────────────────┐
│ MongoDB Database │    │      Git CLI Engine       │    │ Email Service  │
│ (Users, Repos,   │    │ (.jhaGit/, staging/,      │    │ (Nodemailer +  │
│  Issues, Stars)  │    │  commits/, refs/heads/)   │    │  SMTP Relay)   │
└──────────────────┘    └────────────┬──────────────┘    └────────────────┘
                                     │ S3 Protocol
                                     ▼
                        ┌───────────────────────────┐
                        │   Cloudflare R2 Storage   │
                        │ (commits/<UUID>/<file>)   │
                        └───────────────────────────┘
```

---

## 📁 Repository Structure

```
Major-project-2/
├── backend/
│   ├── config/
│   │   ├── mailer.js            # Nodemailer SMTP transporter
│   │   ├── otp.js               # 6-digit OTP generator, SHA-256 hasher & cooldown helpers
│   │   └── r2_bucket.js         # AWS S3 Client setup for Cloudflare R2
│   ├── controllers/
│   │   ├── init.js              # git init controller
│   │   ├── add.js               # git add controller
│   │   ├── commit.js            # git commit controller (with MERGE_HEAD support)
│   │   ├── headUtils.js         # resolveHead helper (branch vs detached HEAD)
│   │   ├── status.js            # git status controller
│   │   ├── log.js               # git log controller
│   │   ├── diff.js              # git diff controller
│   │   ├── branch.js            # git branch controller
│   │   ├── checkout.js          # git checkout controller (branch & detached HEAD)
│   │   ├── merge.js             # 3-way merge engine (LCS diff + MERGE_HEAD persistence)
│   │   ├── push.js              # R2 push controller
│   │   ├── pull.js              # R2 pull controller
│   │   ├── revert.js            # git revert controller
│   │   ├── clone.js             # git clone controller
│   │   ├── repoController.js    # Repository REST metadata CRUD
│   │   ├── userController.js    # User Auth, Password Gate, OTP Verification & Avatar update
│   │   ├── starController.js    # Star/Unstar repository logic
│   │   ├── issueController.js   # Issue Tracker CRUD
│   │   └── activityController.js# Heatmap activity aggregation
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT authorization middleware
│   │   └── authorizeMiddleware.js# Role gate middleware
│   ├── models/
│   │   ├── userModel.js         # Mongoose User Schema (with OTP & Avatar fields)
│   │   ├── repoModel.js         # Mongoose Repository Schema
│   │   └── issueModel.js        # Mongoose Issue Schema
│   ├── routes/
│   │   ├── main.router.js       # Express main router
│   │   ├── user.router.js       # User auth, OTP & profile routes
│   │   ├── repo.router.js       # Repository & Star routes
│   │   ├── issue.router.js      # Issue tracker routes
│   │   └── git.router.js        # Git engine web REST routes
│   ├── test_playbook.js         # End-to-end CLI workflow tests
│   ├── test_merge_deep.js       # Multi-parent merge conflict tests
│   ├── test_merge_probe.js      # Multi-branch ancestor discovery tests
│   ├── index.js                 # Entry point (Express server + Yargs CLI)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosClient.js   # Central Axios client with JWT interceptor
│   │   ├── components/
│   │   │   ├── auth/            # Login.jsx, Signup.jsx & VerifyOtp.jsx
│   │   │   ├── constants/       # avatars.js (Cloudinary image URLs)
│   │   │   ├── dashboard/       # Dashboard.jsx & Dashboard.css
│   │   │   ├── repos/           # CreateRepo.jsx & RepoDetails.jsx
│   │   │   ├── user/            # Profile.jsx, HeatMap.jsx & AvatarPickerModal.jsx
│   │   │   ├── info/            # AboutMe.jsx, AboutProject.jsx, Terms.jsx
│   │   │   ├── ui/              # SkeletonLoader.jsx & ConfirmModal.jsx
│   │   │   ├── Footer.jsx       # Persistent site footer
│   │   │   ├── Navbar.jsx       # Mobile-responsive top navigation bar
│   │   │   └── NotFound.jsx     # 404 Error page
│   │   ├── authContext.jsx      # React Auth Context provider
│   │   ├── Routes.jsx           # Client-side routing table
│   │   ├── index.css            # Global CSS design tokens & reset
│   │   └── main.jsx             # React DOM entry point with persistent Footer wrapper
│   └── package.json
├── USER_GUIDE.md                # Step-by-step user manual with concrete examples
├── StudyProject.md               # Deep-dive architectural & file-by-file study guide
└── GEMINI.md                    # Verification playbook & scenario documentation
```

---

## ⚙️ Environment Configuration

Create a `.env` file inside the `backend/` directory with the following configuration:

```env
PORT=3002
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/GithubClone?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here

# Nodemailer / Email OTP Credentials
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password

# Cloudflare R2 / S3 Credentials
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_ACCESS_KEY=<your_r2_access_key_id>
R2_SECRET_KEY=<your_r2_secret_access_key>
R2_BUCKET=<your_r2_bucket_name>
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB Database** (Local instance or MongoDB Atlas)
- **SMTP Credentials / Gmail App Password** (for Email OTP verification)
- **Cloudflare R2 / AWS S3 Bucket** (for remote push/pull features)

### 2. Installation

Clone the repository and install dependencies for both `backend` and `frontend`:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Start the Backend Server

```bash
cd backend
node index.js start
```
*The REST API server and Socket.IO listener will start on `http://localhost:3002`.*

### 4. Start the Frontend Application

In a new terminal window:

```bash
cd frontend
npm run dev
```
*Open your browser and navigate to `http://localhost:5173`.*

---

## 💻 CLI Usage Guide

Run CLI commands directly inside the `backend/` directory:

```bash
# Initialize a new jhaGit repository
node index.js init

# Check the working tree status (staged, modified, untracked)
node index.js status

# Add a file to the staging area
node index.js add <filename>

# Commit staged files with a message
node index.js commit "Your commit message"

# View commit history log
node index.js log

# Show line-by-line file differences
node index.js diff <filename>

# Create a new branch
node index.js branch <branch-name>

# List all branches
node index.js branch

# Switch to a branch or checkout a commit ID
node index.js checkout <branch-or-commitID>

# Merge a branch into working tree
node index.js merge <branch-name>

# Push commits to remote Cloudflare R2 storage
node index.js push

# Pull commits from remote Cloudflare R2 storage
node index.js pull

# Clone a remote repository from Cloudflare R2
node index.js clone
```

---


## 👤 Author

**Kunal Kumar (Kunal Jha)**
- **Role**: 3rd Year Information Technology Student at Haldia Institute of Technology (2024–2028)
- **GitHub**: [@kunaljha17](https://github.com/kunaljha17)
- **Email**: [jhakunal124@gmail.com](mailto:jhakunal124@gmail.com)
- **WhatsApp**: [+91 8789625512](https://wa.me/918789625512)
- **Resume**: [View Resume on Google Drive](https://drive.google.com/file/d/117rkWSYQNnI7TTd82QmSWimPVQrpsUXY/view?usp=sharing)
