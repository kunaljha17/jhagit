# ⚙️ jhaGit Backend — REST API Server & Version Control CLI Engine

The backend core for **jhaGit**, serving as both a **REST API server** (Express + MongoDB + Socket.IO) for the React web dashboard and a **standalone CLI Version Control Tool** (Node.js + Yargs). Includes true 3-way branch merging, Nodemailer OTP email verification, and Cloudflare R2 object storage integration.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js (v18+)
- **Web Framework**: Express.js (v5.x)
- **CLI Framework**: Yargs
- **Database / ORM**: MongoDB + Mongoose (v9.x)
- **Real-Time Communication**: Socket.IO
- **Email Service**: Nodemailer + SMTP (Gmail / Custom Relays)
- **Security & Cryptography**: Node `crypto` (SHA-256 OTP hashing), Bcrypt.js, JsonWebToken (JWT)
- **Cloud Storage SDK**: AWS S3 Client (`@aws-sdk/client-s3`) configured for Cloudflare R2

---

## 📁 Directory Architecture

```
backend/
├── config/
│   ├── mailer.js            # Nodemailer SMTP transporter setup & HTML email generator
│   ├── otp.js               # 6-digit OTP generator, SHA-256 hasher, expiry & 60s cooldown helpers
│   ├── r2_bucket.js         # S3 Client configured for Cloudflare R2 object storage
│   └── r2_bucket..js        # (Duplicate artifact file)
├── controllers/
│   ├── init.js              # git init: Creates .jhaGit/ folder & skeleton files
│   ├── add.js               # git add: Stages files into .jhaGit/staging/
│   ├── commit.js            # git commit: Full file snapshotting & MERGE_HEAD multi-parent tracking
│   ├── headUtils.js         # Single source of truth for HEAD state resolution (branch vs detached)
│   ├── status.js            # git status: Working tree set-difference classification
│   ├── log.js               # git log: BFS traversal over multi-parent commit graph
│   ├── diff.js              # git diff: Line array comparison viewer
│   ├── branch.js            # git branch: Branch ref management under refs/heads/
│   ├── checkout.js          # git checkout: HEAD pointer update & snapshot restoration
│   ├── merge.js             # 3-way merge engine (LCS dynamic programming + MERGE_HEAD persistence)
│   ├── push.js              # git push: Uploads commits to Cloudflare R2 bucket
│   ├── pull.js              # git pull: Downloads commit snapshots from Cloudflare R2
│   ├── revert.js            # git revert: Restores commit files to working directory
│   ├── clone.js             # git clone: Composition of init + pull + revert
│   ├── userController.js    # Auth, password strength validation, 2-step signup, OTP verification, avatar update
│   ├── repoController.js    # Repository REST metadata & embedded content[] array management
│   ├── starController.js    # Idempotent repository starring and unstarring logic
│   ├── issueController.js   # Issue tracker CRUD operations
│   └── activityController.js# 365-day contribution heatmap score aggregator
├── middleware/
│   ├── authMiddleware.js    # Express JWT Bearer token authorization middleware
│   └── authorizeMiddleware.js# Role gate authorization middleware
├── models/
│   ├── userModel.js         # User Mongoose Schema (with OTP security & avatar fields)
│   ├── repoModel.js         # Repository Mongoose Schema (with embedded file array)
│   └── issueModel.js        # Issue Mongoose Schema
├── routes/
│   ├── main.router.js       # Root router aggregator
│   ├── git.router.js        # Git engine REST API endpoints
│   ├── user.router.js       # User auth, OTP verification & avatar routes
│   ├── repo.router.js       # Repository, star & activity routes
│   └── issue.router.js      # Issue tracker routes
├── test_playbook.js         # End-to-end CLI workflow test suite
├── test_merge_deep.js       # Multi-parent merge & conflict marker test suite
├── test_merge_probe.js      # Complex ancestor discovery test suite
├── index.js                 # Unified entry point (Yargs CLI parser + Express server initializer)
└── package.json
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file in `backend/`:

```env
# Server Port
PORT=3002

# Database URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/GithubClone?retryWrites=true&w=majority

# JWT Authentication Secret
JWT_SECRET=your_jwt_secret_key_here

# Nodemailer / Email OTP Credentials
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password

# Cloudflare R2 / S3 Storage Credentials
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_ACCESS_KEY=<your_r2_access_key_id>
R2_SECRET_KEY=<your_r2_secret_access_key>
R2_BUCKET=<your_r2_bucket_name>
```

---

## 🚀 Running the Server & CLI

### 1. Install Dependencies
```bash
npm install
```

### 2. Start REST API Server & Socket.IO Listener
```bash
node index.js start
```
*Listens on `http://localhost:3002`.*

### 3. Run Version Control CLI Commands

Execute commands directly from terminal:

```bash
node index.js init           # Initialize repository
node index.js status         # View working directory status
node index.js add <file>     # Stage a file
node index.js commit "msg"   # Commit staged files
node index.js log            # View commit history
node index.js diff <file>    # Show line-by-line diff
node index.js branch <name>  # Create a new branch
node index.js branch         # List all branches
node index.js checkout <target> # Checkout branch or commit ID
node index.js merge <branch> # Merge target branch into active branch
node index.js push           # Upload commits to Cloudflare R2 remote
node index.js pull           # Download commits from Cloudflare R2 remote
node index.js clone          # Clone remote repository from Cloudflare R2
```

---

## 📡 REST API Endpoint Reference

### 1. User & OTP Authentication (`/`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/signup` | Public | Register user & dispatch 6-digit OTP email |
| `POST` | `/verify-otp` | Public | Verify 6-digit OTP, mark `isVerified: true` & issue JWT |
| `POST` | `/resend-otp` | Public | Resend OTP code (enforces 60s cooldown) |
| `POST` | `/login` | Public | Authenticate credentials & enforce `isVerified` gate |
| `GET` | `/allUsers` | Public | Fetch list of registered users |
| `GET` | `/userProfile/:id` | Public | Fetch user profile by ID |
| `PUT` | `/updateProfile/:id` | ✅ JWT | Update email or password |
| `PATCH` | `/user/avatar` | ✅ JWT | Update user profile avatar URL |
| `DELETE` | `/deleteProfile/:id` | ✅ JWT | Delete user account |

### 2. Repository & Star Management (`/repo`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/repo/create` | ✅ JWT | Create new repository with default README.md |
| `GET` | `/repo/all` | Public | Fetch all repositories with populated owners |
| `GET` | `/repo/:id` | Public | Fetch single repository details by ID |
| `GET` | `/repo/name/:name` | Public | Fetch repository by name |
| `GET` | `/repo/user/:UserId` | Public | Fetch all repositories owned by user |
| `POST` | `/repo/file/add/:id` | ✅ JWT | Add or edit file inline in repository `content[]` array |
| `PATCH` | `/repo/toggle/:id` | ✅ JWT | Toggle repository visibility (Public/Private) |
| `DELETE` | `/repo/delete/:id` | ✅ JWT | Delete repository & remove from all users' stars |
| `POST` | `/repo/star/:id` | ✅ JWT | Star repository (idempotent) |
| `POST` | `/repo/unstar/:id` | ✅ JWT | Unstar repository |
| `GET` | `/repo/starred/user/:userId` | Public | Fetch user's starred repositories |
| `GET` | `/user/activity/:userId` | Public | Fetch 365-day contribution heatmap data |

### 3. Issue Tracker (`/issue`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/issue/create/:id` | ✅ JWT | Create issue linked to repository |
| `PUT` | `/issue/update/:id` | ✅ JWT | Update issue title, description, or status (`open`/`closed`) |
| `DELETE` | `/issue/delete/:id` | ✅ JWT | Delete issue |
| `GET` | `/issue/all` | Public | Fetch all issues |
| `GET` | `/issue/:id` | Public | Fetch single issue by ID |

### 4. Web Git Engine Trigger API (`/git`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/git/init` | Triggers `initRepo()` on disk |
| `POST` | `/git/add` | Triggers `add(filePath)` on disk |
| `POST` | `/git/commit` | Triggers `commit(message)` on disk |
| `POST` | `/git/branch` | Triggers `createBranch(branchName)` on disk |
| `POST` | `/git/checkout` | Triggers `checkout(target)` on disk |
| `POST` | `/git/merge` | Triggers `mergeBranch(targetBranch)` on disk |
| `POST` | `/git/push` | Triggers `pushRepo()` to Cloudflare R2 |
| `POST` | `/git/pull` | Triggers `pullRepo()` from Cloudflare R2 |
| `GET` | `/git/status` | Returns working directory status object |
| `GET` | `/git/log` | Returns commit history array |
| `GET` | `/git/files` | Returns latest commit files & contents for web preview |

---

## 🧪 Running Automated Test Suites

The backend contains 3 comprehensive automated test scripts to validate version control operations:

```bash
# Run full CLI workflow test (init, add, commit, branch, checkout, merge, push, pull)
node test_playbook.js

# Run deep merge & conflict resolution test suite
node test_merge_deep.js

# Run multi-branch ancestor discovery probe test suite
node test_merge_probe.js
```

---

## 👤 Author

**Kunal Kumar (Kunal Jha)**
- **Role**: 3rd Year Information Technology Student at Haldia Institute of Technology (2024–2028)
- **GitHub**: [@kunaljha17](https://github.com/kunaljha17)
- **Email**: [jhakunal124@gmail.com](mailto:jhakunal124@gmail.com)
- **WhatsApp**: [+91 8789625512](https://wa.me/918789625512)
- **Resume**: [View Resume on Google Drive](https://drive.google.com/file/d/117rkWSYQNnI7TTd82QmSWimPVQrpsUXY/view?usp=sharing)

