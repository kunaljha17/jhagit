# jhaGit — Full-Stack Project Analysis & Planning Instructions
 
Use this document as a prompt/checklist for an AI coding assistant (or yourself) to
analyze the FULL jhaGit codebase — React frontend + backend/CLI — find bugs, check
frontend/backend consistency, and plan remaining feature implementation in sequence.
 
## Project Context (fill in / confirm before starting)
- Project: jhaGit — a Git clone tool with a CLI backend and a React frontend
- Remote storage backend: Cloudflare R2 (S3-compatible), via `@aws-sdk/client-s3`
- Local repo structure: commits stored under `.jhaGit/commits`
- Commands implemented so far: `init`, `add`, `commit`, `push`, `pull`
- Commands NOT yet implemented: (list all remaining — status, log, diff, branch,
  checkout, merge, clone, etc.)
- Frontend: React (confirm — plain React / Next.js / Vite, state management used)
- How frontend and backend communicate: (confirm — REST API? local IPC? does the
  frontend call the CLI directly, or is there a server layer in between?)
---
 
## Phase 1 — Full Codebase Inventory
Goal: build a complete map of the project before judging anything. Do this for
BOTH the frontend and backend, then map how they connect.
 
### 1a. Backend/CLI inventory
1. List every backend file with its purpose in one line.
2. For each core command (`init`, `add`, `commit`, `push`, `pull`, and every
   unimplemented one) note: implemented / partial / missing, and which file(s)
   hold the logic.
3. Map the data flow: local commit creation → `.jhaGit/` storage → R2 upload on
   `push` → R2 fetch on `pull`.
### 1b. Frontend inventory
1. List every React component/page/hook with its purpose in one line.
2. For each screen/view, note what backend command or data it's meant to
   trigger or display (e.g. a "Commit History" view → should read local commit
   log; a "Push" button → should trigger the push flow).
3. Identify all places the frontend calls the backend (API endpoints, function
   calls, IPC, CLI subprocess calls — whatever the actual mechanism is).
4. Note state management approach and where server/CLI data lives in that state.
### 1c. Frontend ↔ Backend integration map
Produce a table:
```
Frontend piece | Calls / expects | Backend endpoint or command | Status (wired up / stubbed / missing)
```
This is the most important artifact of Phase 1 — it shows exactly where the two
sides are connected, half-connected, or not connected at all.
 
Output of this phase: **Project Map** (backend command status table) +
**Frontend Component Map** + **Integration Map** (above).
 
---
 
## Phase 2 — Bug Finding
Goal: find real, concrete bugs — not style preferences. Cover backend, frontend,
and the integration layer separately.
 
### Backend bugs — check for:
1. Correctness bugs (wrong hash/comparison logic, off-by-one in commit ordering,
   wrong path joins across OS).
2. Error handling gaps (missing try/catch around R2 calls, unhandled network
   failures, no validation that `.jhaGit` exists before running a command).
3. State/consistency bugs (local metadata vs. what's actually on R2; partial
   writes if push/pull is interrupted).
4. Path/OS bugs (hardcoded `/` vs `path.join`).
5. Security/config bugs (R2 credentials logged, missing `.gitignore` for
   secrets).
6. Edge cases (empty repo, first commit, empty commit, large files, duplicate
   pushes).
### Frontend bugs — check for:
1. Components that call a backend command that doesn't exist yet or is
   unimplemented (dead/broken buttons or forms).
2. Missing loading/error states around async calls (push/pull can be slow or
   fail — does the UI reflect that, or fail silently?).
3. Stale state after an action (e.g. UI doesn't refresh commit list after a
   new commit).
4. Props/state bugs, incorrect conditional rendering, key warnings in lists.
5. Hardcoded data/mocked responses left in place instead of real calls.
### Integration bugs — check for:
1. Mismatched data shapes between what backend returns and what frontend
   expects.
2. Endpoints/commands the frontend calls that don't exist on the backend (or
   vice versa — backend features with no UI at all).
3. Auth/config mismatches (e.g. R2 credentials needed by backend not available
   in the environment the frontend triggers it from).
For every bug found, record:
```
BUG-<n>
Layer:       backend | frontend | integration
File:        <path>
Location:    <function/component/line>
Description: <what's wrong>
Impact:      <what breaks / how severe>
Repro:       <steps or condition that triggers it>
```
 
---
 
## Phase 3 — Bug Fix Plan
Goal: turn Phase 2's bug list into an actionable, ordered fix plan.
 
1. Rank bugs by severity:
   - **Blocking** — breaks core functionality (e.g. pull corrupts data, push
     button does nothing)
   - **Major** — works but unreliable (e.g. fails silently on network error)
   - **Minor** — cosmetic or edge-case only
2. Group bugs sharing a root cause (e.g. all bugs caused by one mismatched API
   shape, fixed together).
3. Order so blocking bugs go first, and integration bugs that block frontend
   work from being testable are fixed before frontend polish.
4. For each bug, write a one-line proposed fix approach (not full code yet).
Output: a **Fix Sequence** numbered list, each item referencing its BUG-<n>.
 
---
 
## Phase 4 — Remaining Feature Analysis
Goal: identify what's left to build, on both sides, to make jhaGit a usable tool.
 
1. From the Integration Map, list every frontend piece that's stubbed or
   missing a backend connection, and every backend command with no frontend at
   all.
2. From the Project Map, list every backend command still unimplemented
   (status, log, diff, branch, checkout, merge, clone, etc.).
3. For each missing piece (backend command OR frontend feature), describe:
   - What it needs to do (scope, 2–3 sentences).
   - What it depends on (e.g. a "Branch" UI depends on the backend `branch`
     command existing first).
   - Rough complexity (small / medium / large).
4. Flag anything needing a design decision before it can be built (e.g. how
   branches map to R2 storage, how the frontend will show merge conflicts).
---
 
## Phase 5 — Implementation Sequencing
Goal: produce one final ordered roadmap combining bug fixes and new features,
across backend and frontend together.
 
Rules for ordering:
1. Blocking bug fixes always come first.
2. A backend command must exist (or at least have a defined contract) before
   the frontend feature that depends on it is built.
3. Integration/wiring bugs between an already-built frontend piece and its
   backend command are fixed before adding new features on top of that piece.
4. Features needing an open design decision are flagged and placed after a
   "decide X" step, not silently assumed.
5. Group into milestones, e.g.:
   - **Milestone 1 — Stabilize core loop**: fix blocking bugs in
     init/add/commit/push/pull (backend + frontend + integration)
   - **Milestone 2 — Complete core commands**: implement status, log, diff
     (backend), then wire up their frontend views
   - **Milestone 3 — Branching**: backend `branch`/`checkout`, then frontend
   - **Milestone 4 — Collaboration**: merge, conflict handling, backend then UI
   - **Milestone 5 — Polish**: error messages, loading states, edge cases,
     minor bugs on both sides
Final output: a single ordered list/table:
```
Step | Layer (backend/frontend/integration) | Type (bugfix/feature) | Item | Depends on | Milestone
```
 
---
 
## How to Run This Analysis
1. Read every source file in the repo — backend and React frontend — not just
   the ones you assume matter.
2. Do Phase 1 fully (including the Integration Map) before starting Phase 2 —
   don't judge code you haven't mapped.
3. Do not propose fixes or features while still in the "finding" phases —
   keep finding and planning separate.
4. Keep bug reports and feature descriptions concrete and file/line/component
   referenced, not generic.
5. Explicitly call out every place the frontend and backend disagree or don't
   connect — this is usually where the most impactful bugs and gaps are.
6. End with the Phase 5 roadmap as the single source of truth for what to
   build next, in what order.
 