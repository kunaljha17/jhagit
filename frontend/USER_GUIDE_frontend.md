# jhaGit Web Platform & CLI — User Guide & Demonstration Manual

Welcome to **jhaGit**, a full-stack, GitHub-inspired version control platform, CLI tool, and web application. This guide provides step-by-step instructions on how to use all features of the web platform and CLI engine, including explicit details on how `git init`, `git push`, `git pull`, and object restoration work.

---

## Table of Contents

1. [Prerequisites & Accessing the Web Application](#1-prerequisites--accessing-the-web-application)
2. [Step 1: Account Registration (Signup)](#step-1-account-registration-signup)
3. [Step 2: Sign In (Login)](#step-2-sign-in-login)
4. [Step 3: Navigating the Dashboard](#step-3-navigating-the-dashboard)
5. [Step 4: Creating a New Repository](#step-4-creating-a-new-repository)
6. [Step 5: File Explorer & In-Browser File Creation](#step-5-file-explorer--in-browser-file-creation)
7. [Step 6: Git Engine Commands — `init`, `push`, `pull` Explained](#step-6-git-engine-commands--init-push-pull-explained)
   - 7.1 [How `git init` Works](#71-how-git-init-works)
   - 7.2 [How `git push` Works](#72-how-git-push-works)
   - 7.3 [What Happens When `git pull` Is Used (File Destinations & Code Restoration)](#73-what-happens-when-git-pull-is-used-file-destinations--code-restoration)
   - 7.4 [Web Control Panel vs Terminal CLI Workflow](#74-web-control-panel-vs-terminal-cli-workflow)
8. [Step 7: Full CLI Terminal Command Examples](#step-7-full-cli-terminal-command-examples)
9. [Step 8: Issue Tracking](#step-8-issue-tracking)
10. [Step 9: Starring Repositories](#step-9-starring-repositories)
11. [Step 10: User Profile & Contribution Heatmap](#step-10-user-profile--contribution-heatmap)
12. [Step 11: Repository Deletion (Owner Settings)](#step-11-repository-deletion-owner-settings)
13. [Step 12: Info Pages & Footer Navigation](#step-12-info-pages--footer-navigation)

---

## 1. Prerequisites & Accessing the Web Application

Before starting, ensure both the backend server and frontend development server are running:

- **Backend Server**: Starts on `http://localhost:3002` (via `node index.js start`)
- **Frontend App**: Starts on `http://localhost:5173` (via `npm run dev`)

Open your browser and navigate to `http://localhost:5173`. If you are not signed in, you will be automatically directed to the login page (`/auth`).

---

## Step 1: Account Registration (Signup)

If you do not have an account, click **"Create an account"** at the bottom of the sign-in box or navigate to `http://localhost:5173/signup`.

### Example Registration Credentials:
| Field | Example Value |
| :--- | :--- |
| **Username** | `kunal_tester` |
| **Email address** | `kunal_tester@example.com` |
| **Password** | `SecurePass123!` |

1. Fill in the **Username**, **Email address**, and **Password** fields.
2. Click the green **"Sign up"** button.
3. Upon success, jhaGit generates a JWT authentication token, saves it securely in `localStorage`, and automatically logs you in to the **Dashboard** (`/`).

---

## Step 2: Sign In (Login)

If you already have an account:

1. Go to `http://localhost:5173/auth`.
2. Enter your credentials:
   - **Email address**: `kunal_tester@example.com`
   - **Password**: `SecurePass123!`
3. Click **"Sign in"**.
4. You will be redirected to your dashboard with all your repositories loaded.

---

## Step 3: Navigating the Dashboard

The Dashboard (`/`) is your central hub for project management.

### Features on the Dashboard:
- **Repository List**: Displays all repositories owned by you, complete with visibility tags (`Public` or `Private`), star count, description, and relative update times (e.g. *"Updated 5 min ago"*).
- **Live Search Bar**:
  - Type in the input box to instantly filter your repositories by name.
  - **Keyboard Shortcut**: Press `Ctrl + K` (or `Cmd + K` on Mac) anywhere on the page to focus the search bar.
  - Click the **✕** button to clear your search query.
- **Sidebar**:
  - **Suggested Repositories**: Displays public repositories created by other users. Clicking any suggested repository opens its detailed view.
  - **Latest Activity**: Quick tips for exploring commits, branches, and issues.

---

## Step 4: Creating a New Repository

To create a new repository:

1. Click the green **"+ New Repository"** button in the top Navbar or on the Dashboard header.
2. Fill out the creation form using these example values:

### Example Repository Details:
| Field | Example Value | Notes |
| :--- | :--- | :--- |
| **Repository name** | `demo-web-app` | Required. URL slug will preview as `jhaGit.com/owner/demo-web-app` |
| **Description** | `A full-stack demonstration repository on jhaGit platform` | Optional short description |
| **Visibility** | `Public` (Selected) | Choose between **Public** (visible to all) or **Private** |

3. Click **"Create repository"**.
4. jhaGit will automatically initialize the repository in MongoDB, generate a default `README.md` file, and redirect you to the Repository Details page (`/repo/:id`).

---

## Step 5: File Explorer & In-Browser File Creation

Inside a repository (`/repo/:id`), click the **"Code"** tab to view files and project structure.

### 1. Viewing Files
- Click on any file in the **Repository Files** list (e.g., `README.md`).
- The content preview box below displays the raw file text.
- Click the **"📋 Copy"** button in the top-right corner of the file box to copy the file content to your clipboard (displays **"✓ Copied"** confirmation).

### 2. Creating & Committing a New File Inline
1. Click the **"+ Add File"** button above the file list.
2. Fill in the inline commit form:

#### Example New File 1:
- **Filename**: `index.js`
- **File Content**:
  ```javascript
  // jhaGit Web Application Entry Point
  console.log("Welcome to jhaGit version control system!");
  ```
- Click **"Commit File"**.

#### Example New File 2:
- **Filename**: `config.json`
- **File Content**:
  ```json
  {
    "projectName": "demo-web-app",
    "version": "1.0.0",
    "environment": "production"
  }
  ```
- Click **"Commit File"**.

The file list and 12-month activity heatmap will update immediately.

---

## Step 6: Git Engine Commands — `init`, `push`, `pull` Explained

Inside the **Code** tab of any repository, you will find the **Git Engine Controls** panel with three command triggers: `$ git init`, `$ git push`, and `$ git pull`. Here is a detailed breakdown of how each command works under the hood and how to use them.

### 7.1 How `git init` Works
- **Purpose**: Initializes a new jhaGit version control repository on disk.
- **Under the Hood**:
  1. Creates the hidden `.jhaGit/` directory structure inside the repository folder.
  2. Creates subdirectories `.jhaGit/commits/` (stores full file snapshots) and `.jhaGit/refs/heads/`.
  3. Writes `.jhaGit/HEAD` file setting default branch pointer to `main`.
  4. Creates `.jhaGit/refs/heads/main` reference file.
  5. Generates `.jhaGit/config.json` containing Cloudflare R2 / S3 remote storage bucket configuration.
- **How to Use**:
  - **In Web UI**: Click the `$ git init` button under Git Engine Controls. A banner will confirm `Command 'git init' completed!`.
  - **In Terminal**: Run `node index.js init`.

### 7.2 How `git push` Works
- **Purpose**: Uploads all local commits and file snapshots to Cloudflare R2 remote storage (S3-compatible bucket).
- **Under the Hood**:
  1. Scans the local `.jhaGit/commits/` directory for all commit snapshot folders.
  2. Iterates over every file inside each commit directory (including `commit.json` metadata).
  3. Uses AWS S3 SDK (`PutObjectCommand`) to stream files to Cloudflare R2 using the key format:
     `commits/<commitUUID>/<filename>`
  4. Ensures remote cloud storage matches local commit history.
- **How to Use**:
  - **In Web UI**: Click the `$ git push` button under Git Engine Controls. A banner will display `Command 'git push' completed!`.
  - **In Terminal**: Run `node index.js push`. Output will log `All commits push to S3.`.

---

### 7.3 What Happens When `git pull` Is Used (File Destinations & Code Restoration)

When a user executes `git pull` (or `$ git pull` in Web UI / `clone`), here is the exact sequence of what happens, **where the files are pulled**, and **how actual code files end up in your working directory**:

```
┌─────────────────────────────────────────────────────────────┐
│             Cloudflare R2 Bucket Remote Storage             │
│  Key: commits/a1b2c3d4-xxxx/index.js                         │
│  Key: commits/a1b2c3d4-xxxx/README.md                        │
│  Key: commits/a1b2c3d4-xxxx/commit.json                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ 1. ListObjectsV2Command & GetObjectCommand
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          Local Repository Snapshot Storage (.jhaGit/)        │
│  Path: .jhaGit/commits/a1b2c3d4-xxxx/index.js               │
│  Path: .jhaGit/commits/a1b2c3d4-xxxx/README.md              │
│  Path: .jhaGit/commits/a1b2c3d4-xxxx/commit.json            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ 2. Code Restoration (revertRepo / checkout)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            Actual Working Directory (Your Project)          │
│  Path: ./index.js   <── (Copied from commit snapshot)        │
│  Path: ./README.md  <── (Copied from commit snapshot)        │
└─────────────────────────────────────────────────────────────┘
```

#### Step-by-Step Pull Breakdown:

1. **Remote Key Inspection**:
   - `pull.js` sends `ListObjectsV2Command` to Cloudflare R2 bucket with prefix `"commits/"`.
   - It retrieves a list of all remote commit keys (e.g., `commits/a1b2c3d4-xxxx/index.js`, `commits/a1b2c3d4-xxxx/commit.json`).

2. **File Pull Destination (`.jhaGit/commits/`)**:
   - For each object found, `pull.js` strips the `"commits/"` prefix and builds the local destination path:
     `path.join(process.cwd(), ".jhaGit/commits", relativePath)`
   - **Exact Disk Location**: `.jhaGit/commits/<commitUUID>/`
   - It creates the folder if missing (`fs.mkdir(..., { recursive: true })`) and downloads the exact file bytes using `GetObjectCommand` + `fs.writeFile()`.

3. **How Actual Code Files Reach Your Working Directory (`revertRepo`)**:
   - Downloading files into `.jhaGit/commits/<UUID>/` updates the repository's historical snapshot database.
   - To place the **actual code files** into your active working directory (e.g., `./index.js`, `./README.md`), `clone` or `checkout` calls `revertRepo(latestCommitID)`:
     ```javascript
     // revert.js loops through files in .jhaGit/commits/<latestCommitID>/
     for (const file of files) {
         if (file === "commit.json") continue; // Skip metadata
         await fs.copyFile(
             path.join(commitDir, file),       // Source: .jhaGit/commits/<id>/<file>
             path.join(parentDir, file)        // Destination: ./<file> (Working Directory)
         );
     }
     ```
   - **Result**: Your actual working project directory is populated with the exact code files from the latest commit!

4. **How the Web Dashboard Reflects Pulled Files**:
   - When `$ git pull` completes in the browser, the web page re-fetches `GET /git/log` and repository details.
   - The file list, code previewer, and commit timeline render the newly pulled files dynamically.

---

### 7.4 Web Control Panel vs Terminal CLI Workflow

| Action | Web UI Trigger | Terminal Command | Backend API Endpoint | File Location on Disk |
| :--- | :--- | :--- | :--- | :--- |
| **Initialize Repo** | Click `$ git init` button | `node index.js init` | `POST /git/init` | `.jhaGit/`, `.jhaGit/HEAD`, `.jhaGit/config.json` |
| **Push Commits** | Click `$ git push` button | `node index.js push` | `POST /git/push` | Uploads `.jhaGit/commits/` to Cloudflare R2 bucket |
| **Pull Commits** | Click `$ git pull` button | `node index.js pull` | `POST /git/pull` | Downloads from R2 into `.jhaGit/commits/<UUID>/` |
| **Restore Code** | View repo / switch branch | `node index.js checkout` | `POST /git/checkout` | Copies `.jhaGit/commits/<UUID>/<file>` ➔ `./<file>` |

---

## Step 7: Full CLI Terminal Command Examples

In addition to using the web dashboard, jhaGit provides a complete CLI interface using Node.js and Yargs. Open your terminal in the backend directory (`c:\Users\jhaku\Desktop\sigma\Major-project-2\backend`) to run commands:

### 1. Initialize Repository
```bash
$ node index.js init
# Output: repository initialised!
```

### 2. Stage a File for Commit
```bash
$ echo "console.log('Hello jhaGit CLI!');" > app.js
$ node index.js add app.js
# Output: File app.js added to staging area!
```

### 3. Commit Staged Files
```bash
$ node index.js commit "Initial commit via CLI"
# Output: Commit a1b2c3d4-xxxx-xxxx-xxxx created with message: Initial commit via CLI
```

### 4. Check Working Directory Status
```bash
$ node index.js status
# Output: On branch main, staged files: [], modified files: []
```

### 5. View Commit History Log
```bash
$ node index.js log
# Output: Displays list of commits, authors, dates, and parent commit UUIDs
```

### 6. Create and Switch Branches
```bash
# Create new branch named 'feature-login'
$ node index.js branch feature-login

# Switch to 'feature-login' branch
$ node index.js checkout feature-login
# Output: Switched to branch 'feature-login'
```

### 7. Merge Branches (3-Way Merge Engine)
```bash
# Switch to main branch
$ node index.js checkout main

# Merge feature-login into main
$ node index.js merge feature-login
# Output: Merged branch 'feature-login' into 'main' successfully.
```

### 8. Push Local Commits to Cloudflare R2 Remote Storage
```bash
$ node index.js push
# Output: All commits push to S3.
```

### 9. Pull Remote Commits from Cloud Storage
```bash
$ node index.js pull
# Output: Downloads commit objects from R2 into .jhaGit/commits/
```

### 10. Clone Remote Repository
```bash
$ node index.js clone
# Output: Initializes repo, pulls remote commits, and checks out latest snapshot to working directory
```

---

## Step 8: Issue Tracking

Click the **"Issues"** tab in your repository to track bugs, tasks, and feature requests.

### 1. Creating a New Issue
Use the **New Issue** form on the right side of the Issues tab:

#### Example Issue 1:
- **Issue Title**: `Add dark mode toggle for code preview`
- **Description**: `The code box should support syntax highlighting and theme customization for JavaScript and JSON files.`
- Click **"Submit new issue"**.

#### Example Issue 2:
- **Issue Title**: `Update dependencies in package.json`
- **Description**: `Ensure all backend packages are using the latest security patches.`
- Click **"Submit new issue"**.

The new issue will immediately appear in the **Repository Issues** list with a green `open` badge.

---

## Step 9: Starring Repositories

Starring repositories allows you to bookmark interesting projects and increase their popularity score:

1. Click the **"☆ Star"** button on any repository card (on the Dashboard, Profile, or Repo Header).
2. The button will change to a yellow **"★ Starred"** state, and the star count will increment instantly (e.g. from `0` to `1`).
3. To view all projects you have starred, go to **Profile** (`/profile`) and click the **"Starred Repositories"** tab.

---

## Step 10: User Profile & Contribution Heatmap

Click **"Profile"** in the top Navbar or navigate to `/profile`.

### Profile Features:
1. **User Avatar & Bio**: Displays your avatar initial, username (`kunal_tester`), email, and developer bio.
2. **Contribution Activity (Heatmap)**:
   - A 12-month calendar grid (powered by `@uiw/react-heat-map`).
   - Tracks repository creations (+3 points), issue submissions (+2 points), file commits (+1 point), and local CLI commits (+1 point).
   - Shows your total annual contribution count.
3. **Overview Tab**: Lists all repositories created and owned by you.
4. **Starred Repositories Tab**: Lists all projects you have starred.
5. **Account Settings Tab**:
   - Update your registered email address.
   - Update your password.
   - Sign out of your current session.

---

## Step 11: Repository Deletion (Owner Settings)

If you are the owner of a repository, you can safely delete it:

1. Open your repository (`/repo/:id`) and click the **"Settings"** tab.
2. Locate the red **"Danger Zone"** box at the bottom.
3. Click **"Delete this repository"**.
4. An accessible confirmation modal (**ConfirmModal**) will pop up.
5. To prevent accidental deletion, type the exact name of the repository (e.g. `demo-web-app`) into the text box.
6. Once the name matches, click **"I understand, delete this repository"**.
7. The repository, its files, issues, and star entries will be permanently deleted from the database, and you will be redirected to the Dashboard.

---

## Step 12: Info Pages & Footer Navigation

At the bottom of every page, a persistent footer provides direct links to project information:

- **About Me** (`/about-me`): View developer bio for Kunal Kumar (IT Student at Haldia Institute of Technology), links to featured projects (*Nestify*, *Weather App*), and an online Resume link.
- **About This Project** (`/about-project`): Technical breakdown of jhaGit's architecture, web dashboard features, CLI command list, and GitHub repository source code link (`https://github.com/kunaljha17/jhaGit.git`).
- **Terms and Conditions** (`/terms`): Educational project disclaimer, trademark non-affiliation statement, and contact email.
- **Contact Me 💬**: Click to open a direct WhatsApp chat with the developer in a new tab (`https://wa.me/918789625512`).

---

## Summary of Example Data for Quick Reference

```
User Account:
  Email: kunal_tester@example.com
  Password: SecurePass123!
  Username: kunal_tester

Repository:
  Name: demo-web-app
  Visibility: Public
  Files: README.md, index.js, config.json

Git Commands:
  Init: node index.js init (or $ git init button)
  Push: node index.js push (or $ git push button)
  Pull: node index.js pull (or $ git pull button)

Issue:
  Title: Add dark mode toggle for code preview
  Status: open
```

Enjoy building and managing your code repositories with **jhaGit**!
