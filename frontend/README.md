# 🎨 jhaGit Frontend — React Web Dashboard & Code Collaboration UI

The frontend client for **jhaGit**, built with **React 19**, **Vite**, **React Router 7**, and **Axios**. Features a GitHub-inspired dark UI design system, live repository filtering (`Ctrl + K`), 2-step Email OTP verification UI, interactive 365-day contribution heatmap, code previewer with copy functionality, inline file committer, and accessible modal dialogs.

---

## 🛠️ Technology Stack

- **UI Framework**: React 19
- **Build Tool / Bundler**: Vite (v6.x)
- **Client-Side Routing**: React Router 7
- **HTTP Client**: Axios (with automatic JWT bearer token request interceptor)
- **Heatmap Visualization**: `@uiw/react-heat-map`
- **Styling**: CSS3 Design Tokens, CSS Modules, Flexbox/Grid layouts, Glassmorphism
- **Global State**: React Context API (`AuthProvider`)

---

## 📁 Directory Architecture

```
frontend/
├── index.html                   # Vite HTML entry template
├── vite.config.js               # Vite bundler configuration
├── package.json                 # Project dependencies & scripts
├── public/
│   ├── favicon.svg              # Browser tab icon
│   └── icons.svg                # SVG sprite icons
└── src/
    ├── main.jsx                 # React DOM render entry point (BrowserRouter + AuthProvider + Footer)
    ├── App.jsx                  # Main application shell component
    ├── App.css                  # App shell layout styling
    ├── index.css                # Global CSS variables, theme design tokens & resets
    ├── Routes.jsx               # Central client-side routing table with auth redirect guards
    ├── authContext.jsx          # React Context providing global currentUser state from localStorage
    ├── api/
    │   └── axiosClient.js       # Pre-configured Axios instance with JWT Authorization interceptor
    ├── assets/                  # Graphics (hero banners, GitHub logo, React & Vite SVGs)
    └── components/
        ├── Navbar.jsx           # Global navigation header (search, new repo button, profile link, logout)
        ├── Navbar.css
        ├── Footer.jsx           # Site footer with links to developer bio, docs, terms, and WhatsApp
        ├── Footer.css
        ├── NotFound.jsx         # Custom 404 Error page component
        ├── auth/
        │   ├── Login.jsx        # Email & password login form
        │   ├── Signup.jsx       # Account registration form with password strength rules
        │   ├── VerifyOtp.jsx    # 6-digit numeric OTP entry form with 60s resend timer
        │   └── auth.css
        ├── constants/
        │   └── avatars.js       # Whitelisted Cloudinary avatar image URLs
        ├── dashboard/
        │   ├── Dashboard.jsx    # Central dashboard (owned repos, live search, suggested public repos)
        │   └── Dashboard.css
        ├── info/
        │   ├── AboutMe.jsx      # Developer bio & online resume page
        │   ├── AboutProject.jsx # System architecture breakdown page
        │   ├── Terms.jsx        # Educational terms and disclaimer page
        │   └── infoPages.css
        ├── repos/
        │   ├── CreateRepo.jsx   # Form to initialize new public or private repository
        │   ├── RepoDetails.jsx  # Code explorer, inline file committer, issue list, star button, git controls
        │   ├── CreateRepo.css
        │   └── RepoDetails.css
        ├── ui/
        │   ├── ConfirmModal.jsx # Accessible deletion dialog requiring typed repo name confirmation
        │   ├── ConfirmModal.css
        │   ├── SkeletonLoader.jsx# Animated skeleton loading placeholder UI
        │   └── SkeletonLoader.css
        └── user/
            ├── Profile.jsx      # User profile, owned/starred repo tabs, account settings, heatmap
            ├── HeatMap.jsx      # 365-day contribution calendar component
            ├── AvatarPickerModal.jsx # Profile avatar selection modal
            ├── AvatarPickerModal.css
            └── Profile.css
```

---

## 🗺️ Client-Side Routing Table

Defined in [`src/Routes.jsx`](file:///c:/Users/jhaku/Desktop/sigma/Major-project-2/frontend/src/Routes.jsx):

| Path | Component | Access Type | Description |
| :--- | :--- | :--- | :--- |
| `/` | `Dashboard` | Private | Main dashboard with repository listing & search |
| `/auth` | `Login` | Public | User sign-in page (auto-redirects to `/` if logged in) |
| `/signup` | `Signup` | Public | Account registration page |
| `/verify-otp` | `VerifyOtp` | Public | 6-digit OTP email verification page |
| `/profile` | `Profile` | Private | User profile, starred repos, settings & contribution heatmap |
| `/create` | `CreateRepo` | Private | New repository creation form |
| `/repo/:id` | `RepoDetails` | Private | Code explorer, issue tracker, git triggers & repo settings |
| `/about-me` | `AboutMe` | Public | Developer bio page |
| `/about-project` | `AboutProject` | Public | Technical architecture overview page |
| `/terms` | `Terms` | Public | Terms and conditions page |
| `*` | `NotFound` | Public | 404 error page for unmatched routes |

---

## 🔑 Key Features & User Interface Details

1. **Email OTP Verification (`VerifyOtp.jsx`)**:
   - Accepts 6-digit numeric verification code sent to user's email during signup.
   - Preserves leading zeros (`String(otp)` prevents truncation of codes like `042931`).
   - Includes a 60-second countdown timer for resending OTP codes.
   - Saves JWT token and user ID to `localStorage` upon successful verification.

2. **Debounced Live Repository Search (`Dashboard.jsx`)**:
   - Filters repository list in real-time with a 300ms debounce.
   - Supports quick keyboard shortcut: Press `Ctrl + K` (or `Cmd + K`) anywhere to focus search.
   - Includes clear search query button (✕).

3. **Code Viewer & One-Click Copy (`RepoDetails.jsx`)**:
   - Inspect repository files and raw code content directly in the browser.
   - Copy file contents instantly with feedback banner ("📋 Copy" ➔ "✓ Copied").
   - Add and commit new files directly to target repository via inline form.

4. **Web Git Engine Control Panel (`RepoDetails.jsx`)**:
   - Trigger backend `$ git init`, `$ git push`, and `$ git pull` operations straight from the browser.

5. **365-Day Contribution Heatmap (`HeatMap.jsx`)**:
   - Visualizes annual contributions across repo creations, file edits, issue submissions, and local CLI commits using `@uiw/react-heat-map`.

6. **Accessible Deletion Modal (`ConfirmModal.jsx`)**:
   - Requires users to type the exact repository name before enabling the red deletion button to prevent accidental data loss.

7. **Profile Avatar Selection (`AvatarPickerModal.jsx`)**:
   - Custom modal allowing users to select profile avatars from a curated list of Cloudinary image URLs.

---

## ⚙️ Environment Variables Setup

Create a `.env` file inside `frontend/` (optional, defaults to `http://localhost:3002`):

```env
VITE_API_BASE_URL=http://localhost:3002
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
*Navigates to `http://localhost:5173`.*

### 3. Build for Production
```bash
npm run build
```
*Outputs production bundle to `frontend/dist/`.*

### 4. Preview Production Build
```bash
npm run preview
```

---

## 👤 Author

**Kunal Kumar (Kunal Jha)**
- **Role**: 3rd Year Information Technology Student at Haldia Institute of Technology (2024–2028)
- **GitHub**: [@kunaljha17](https://github.com/kunaljha17)
- **Email**: [jhakunal124@gmail.com](mailto:jhakunal124@gmail.com)
- **WhatsApp**: [+91 8789625512](https://wa.me/918789625512)
- **Resume**: [View Resume on Google Drive](https://drive.google.com/file/d/117rkWSYQNnI7TTd82QmSWimPVQrpsUXY/view?usp=sharing)

