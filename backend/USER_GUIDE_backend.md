# ⚙️ jhaGit Backend — Comprehensive User Guide & Developer Manual

Welcome to the official **Backend User Guide** for **jhaGit**. This document provides an exhaustive, step-by-step technical guide for configuring, running, testing, and integrating with the jhaGit backend system.

---

## 📋 Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Prerequisites & Environment Setup](#2-prerequisites--environment-setup)
3. [Quick Start Guide](#3-quick-start-guide)
4. [Authentication & OTP Verification Flow](#4-authentication--otp-verification-flow)
5. [REST API Endpoint Reference](#5-rest-api-endpoint-reference)
   - [User Management & Authentication](#51-user-management--authentication)
   - [Repository & File Management](#52-repository--file-management)
   - [Starring & Heatmap Activity](#53-starring--heatmap-activity)
   - [Issue Tracking](#54-issue-tracking)
   - [RESTful Git Engine Endpoints](#55-restful-git-engine-endpoints)
6. [CLI Engine Command Reference](#6-cli-engine-command-reference)
7. [Git Engine Internals & Cloud Sync](#7-git-engine-internals--cloud-sync)
8. [WebSocket Protocol (Socket.IO)](#8-websocket-protocol-socketio)
9. [Database Schemas & Data Models](#9-database-schemas--data-models)
10. [Test Suite Execution](#10-test-suite-execution)
11. [Troubleshooting & FAQs](#11-troubleshooting--faqs)

---

## 1. System Architecture Overview

The **jhaGit backend** is a hybrid Node.js application that serves two primary roles:

1. **REST & Real-Time HTTP/WebSocket Server**: Built with [Express v5](https://expressjs.com/), [Mongoose v9](https://mongoosejs.com/), and [Socket.IO](https://socket.io/), handling user management, authentication, repository metadata, issue tracking, and real-time client socket connections.
2. **Version Control Engine (CLI)**: Driven by [Yargs](https://yargs.js.org/), implementing local git operations (`.jhaGit` workspace, DAG snapshot commits, LCS 3-way branch merging, R2 cloud storage push/pull).

```
                      +----------------------------------+
                      |         User / Client            |
                      +----------------------------------+
                             /                  \
              REST API / Socket.IO               CLI Commands
                            /                    \
                           v                      v
             +-----------------------+   +-----------------------+
             |   Express Web Server  |   |    Yargs CLI Engine   |
             +-----------------------+   +-----------------------+
                |         |        |           |          |
                v         v        v           v          v
          +----------+ +-----+ +-------+  +---------+  +---------+
          | MongoDB  | | SMTP| |  R2   |  | .jhaGit |  | Cloud   |
          | Database | | Mail| |Storage|  | Local   |  | R2 Sync |
          +----------+ +-----+ +-------+  +---------+  +---------+
```

---

## 2. Prerequisites & Environment Setup

### Required Dependencies
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB Database**: MongoDB Atlas URI or local instance (`mongodb://localhost:27017`)
- **Cloud Storage**: Cloudflare R2 or AWS S3 bucket for remote commit object storage
- **SMTP Server**: Gmail App Password or custom SMTP server for OTP verification emails

### Environment Configuration (`.env`)

Create a `.env` file inside the `backend/` directory:

```env
# Server Port
PORT=3002

# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/GithubClone?retryWrites=true&w=majority

# JWT Authentication Secret
JWT_SECRET=your_jwt_secret_key_here

# Nodemailer / SMTP Credentials for OTP Emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password

# Cloudflare R2 / S3 Object Storage Config
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_ACCESS_KEY=<your_r2_access_key_id>
R2_SECRET_KEY=<your_r2_secret_access_key>
R2_BUCKET=<your_r2_bucket_name>
```

---

## 3. Quick Start Guide

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Start the REST API & WebSocket Server
To start the HTTP server on port `3002` (or the `PORT` specified in `.env`):
```bash
node index.js start
```

### 3. Run Version Control Commands via CLI
The backend entry point also acts as a CLI parser:
```bash
# Initialize a local jhaGit repository
node index.js init

# Stage files
node index.js add README.md

# Create a commit snapshot
node index.js commit "Initial commit"

# Check local working directory status
node index.js status
```

---

## 4. Authentication & OTP Verification Flow

jhaGit enforces a **secure 2-step email verification workflow** for user registration:

```
[User Signup] ──> [Save User (isVerified: false)] ──> [Send 6-Digit OTP via SMTP]
                                                               │
                                                               v
[JWT Token & Account Activation] <── [Verify OTP] <── [Enter OTP]
```

### Security Rules:
- **Password Complexity**: Minimum 6 characters, max 30 characters, requiring at least **one uppercase letter**, **one digit**, and **one special character** (`@$!%*?&^#()_+-=[]{};':"|,.<>/?~``).
- **OTP Hashing**: 6-digit random codes are hashed with **SHA-256** before saving to MongoDB (`user.otp`).
- **Expiration & Rate Limiting**: OTPs expire after **10 minutes**. A minimum **60-second cooldown** is enforced between resend requests, with a maximum of **5 failed attempts**.

---

## 5. REST API Endpoint Reference

All REST endpoints are exposed via `main.router.js` mounted at root `/`.

### 5.1 User Management & Authentication

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/signup` | No | Registers user & sends 6-digit OTP email |
| `POST` | `/verify-otp` | No | Validates OTP, activates account (`isVerified: true`), returns JWT |
| `POST` | `/resend-otp` | No | Resends OTP email if 60s cooldown period has elapsed |
| `POST` | `/login` | No | Authenticates verified user, returns JWT & `userId` |
| `GET` | `/allUsers` | No | Lists all registered users (passwords excluded) |
| `GET` | `/userProfile/:id` | No | Fetches public user profile details |
| `PUT` | `/updateProfile/:id` | **JWT** | Updates user email or password |
| `PATCH` | `/user/avatar` | **JWT** | Updates avatar URL (selected from preset avatar set) |
| `DELETE` | `/deleteProfile/:id` | **JWT** | Removes user profile from database |

#### Example: Signup Request
```http
POST /signup HTTP/1.1
Content-Type: application/json

{
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "SecurePassword123!"
}
```

#### Example: Verify OTP Request
```http
POST /verify-otp HTTP/1.1
Content-Type: application/json

{
  "email": "johndoe@example.com",
  "otp": "492015"
}
```

---

### 5.2 Repository & File Management

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/repo/create` | **JWT** | Creates a new repository with initial `README.md` |
| `GET` | `/repo/all` | No | Returns all public/accessible repositories |
| `GET` | `/repo/:id` | No | Fetches single repository by MongoDB `ObjectId` |
| `GET` | `/repo/name/:name` | No | Fetches repository by unique name |
| `GET` | `/repo/user/:UserId` | No | Fetches all repositories owned by a specific user |
| `PUT` | `/repo/update/:id` | **JWT** | Appends content or updates repo description |
| `POST` | `/repo/file/add/:id` | **JWT** | Adds or updates in-browser file content |
| `PATCH` | `/repo/toggle/:id` | **JWT** | Toggles repository visibility between Public & Private |
| `DELETE` | `/repo/delete/:id` | **JWT** | Deletes repository (restricted to repo owner) |

---

### 5.3 Starring & Heatmap Activity

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/repo/star/:id` | **JWT** | Stars a repository (idempotent increment) |
| `POST` | `/repo/unstar/:id` | **JWT** | Unstars a repository |
| `GET` | `/repo/starred/user/:userId` | No | Returns populated list of repositories starred by user |
| `GET` | `/user/activity/:userId` | No | Generates 365-day contribution heatmap activity data |

---

### 5.4 Issue Tracking

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/issue/create/:id` | **JWT** | Creates issue linked to repo `:id` |
| `GET` | `/issue/all` | No | Fetches all issues for a repository |
| `GET` | `/issue/:id` | No | Fetches single issue details by ID |
| `PUT` | `/issue/update/:id` | **JWT** | Updates issue title, description, or status |
| `DELETE` | `/issue/delete/:id` | **JWT** | Deletes an issue |

---

### 5.5 RESTful Git Engine Endpoints

The backend allows web clients to invoke core Version Control actions over REST:

| Method | Endpoint | Payload / Params | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/git/init` | None | Initializes `.jhaGit/` directory on server |
| `POST` | `/git/add` | `{ "filePath": "file.txt" }` | Stages file to `.jhaGit/staging/` |
| `POST` | `/git/commit` | `{ "message": "msg" }` | Snapshots staged files into `.jhaGit/commits/` |
| `GET` | `/git/status` | None | Returns tracked, staged, and untracked file arrays |
| `GET` | `/git/log` | None | Returns commit history array sorted chronologically |
| `POST` | `/git/branch` | `{ "branchName": "feature" }` | Creates new branch or lists existing branches |
| `POST` | `/git/checkout` | `{ "target": "main" }` | Switches active branch or commit |
| `POST` | `/git/merge` | `{ "targetBranch": "dev" }` | Merges target branch into current branch |
| `POST` | `/git/push` | None | Uploads local commits to Cloudflare R2 bucket |
| `POST` | `/git/pull` | None | Syncs remote R2 commits down to local repository |
| `POST` | `/git/revert` | `{ "commitID": "<hash>" }` | Restores files from commit to working tree |
| `GET` | `/git/files` | None | Returns list of files & content for web file explorer |

---

## 6. CLI Engine Command Reference

When working directly in the terminal, run commands via `node index.js <command>`:

```bash
# 1. Initialize Repository
node index.js init

# 2. Check Working Directory Status
node index.js status

# 3. Stage Files
node index.js add index.js

# 4. Commit Changes
node index.js commit "Initial codebase commit"

# 5. View Commit History
node index.js log

# 6. Branch Management
node index.js branch feature-login    # Create branch
node index.js branch                 # List branches

# 7. Switch Branch or Commit
node index.js checkout feature-login

# 8. Merge Branch (True 3-Way LCS Merge)
node index.js merge feature-login

# 9. View File Differences
node index.js diff index.js

# 10. Remote Synchronization
node index.js push                    # Upload to Cloudflare R2
node index.js pull                    # Download from Cloudflare R2

# 11. Clone Remote Repository
node index.js clone

# 12. Revert to Specific Commit
node index.js revert <commitID>
```

---

## 7. Git Engine Internals & Cloud Sync

### Workspace Structure (`.jhaGit/`)

```
.jhaGit/
├── HEAD              # Points to active branch (e.g. ref: refs/heads/main)
├── MERGE_HEAD        # Persists secondary commit ID during merge conflicts
├── config.json       # Repository metadata & settings
├── staging/          # Staging area for files queued for commit
├── commits/          # Commit object store
│   └── <commitID>/
│       ├── commit.json  # Metadata (message, date, parent, mergeParent)
│       └── <files...>   # Exact snapshot copies of committed files
└── refs/
    └── heads/        # Branch pointer files (main, feature, etc.)
```

### 3-Way LCS Branch Merging (`controllers/merge.js`)
1. **Lowest Common Ancestor (LCA)**: Traverses commit graph using BFS to find the common base commit between the current `HEAD` and `targetBranch`.
2. **Dynamic Programming Line-by-Line LCS**: Compares Base, Head, and Target lines.
3. **Conflict Detection**: If both HEAD and Target modify the same lines differently, conflict markers are written directly to the file:
   ```text
   <<<<<<< HEAD
   Current branch changes
   =======
   Incoming target branch changes
   >>>>>>> targetBranch
   ```
4. **MERGE_HEAD Tracking**: Saves the target commit ID in `.jhaGit/MERGE_HEAD` until resolved and committed, preserving multi-parent DAG commit history.

---

## 8. WebSocket Protocol (Socket.IO)

The backend runs a Socket.IO server on top of the Node HTTP server with wildcard CORS enabled (`origin: "*"`).

### Client Connection & Room Joining

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3002");

// Join user-specific socket room for real-time alerts
socket.emit("joinRoom", userId);
```

---

## 9. Database Schemas & Data Models

### User Schema (`models/userModel.js`)
- `username`: String (Required, Unique, Trimmed)
- `email`: String (Required, Unique, Lowercase)
- `password`: String (Required, Hashed with bcrypt)
- `avatar`: String (Preset URL string)
- `isVerified`: Boolean (Default: `false`)
- `otp`: String (SHA-256 Hashed 6-digit code)
- `otpExpires`: Date
- `otpAttempts`: Number
- `otpLastSentAt`: Date
- `starRepos`: Array of `ObjectId` references to `Repository`

### Repository Schema (`models/repoModel.js`)
- `name`: String (Required, Unique)
- `description`: String
- `visibility`: Boolean (Default: `true` for Public)
- `Owner`: `ObjectId` reference to `User`
- `content`: Array of objects `[{ name: String, content: String, updatedAt: Date }]`
- `issues`: Array of `ObjectId` references to `Issue`
- `starCount`: Number (Default: `0`)

### Issue Schema (`models/issueModel.js`)
- `title`: String (Required)
- `description`: String (Required)
- `status`: String (`open` | `closed`, Default: `open`)
- `repository`: `ObjectId` reference to `Repository`
- `author`: `ObjectId` reference to `User`
- `createdAt`: Date

---

## 10. Test Suite Execution

The backend contains dedicated automated test scripts:

```bash
# Test complete end-to-end CLI workflow (init, add, commit, branch, merge, revert)
node test_playbook.js

# Test deep multi-parent merge engine & conflict marker generation
node test_merge_deep.js

# Test complex graph ancestor discovery
node test_merge_probe.js
```

---

## 11. Troubleshooting & FAQs

### Q1: `MONGODB_URI is not defined` Warning
> Ensure `.env` is present in the `backend/` directory and contains a valid `MONGODB_URI`.

### Q2: OTP Verification email fails to send
> Check `SMTP_USER` and `SMTP_PASS` in `.env`. For Gmail, ensure you are using an **App Password** (16 characters) generated under Google Account Security settings.

### Q3: Cloudflare R2 `push` or `pull` fails
> Verify `R2_ENDPOINT`, `R2_ACCESS_KEY`, and `R2_SECRET_KEY` credentials in `.env`. Ensure your bucket name matches `R2_BUCKET`.

### Q4: Port 3002 is already in use
> Kill any existing Node process or specify a custom port in `.env`: `PORT=3003`.
