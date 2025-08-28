# CityOps – Smart City Issue Reporting

CityOps helps residents report city problems (potholes, broken lights, missed garbage) and lets staff triage & fix them. Planned features include AI-based classification (type + priority), maps for exact location, community votes/comments, and a staff dashboard.

**Stack:** React, Node.js/Express, MongoDB (Socket.IO, OpenAI GPT, Google Maps planned)

---

## Current Progress
- Project scaffolded with separate **frontend** and **backend**.
- **UI only** for: **Home**, **Register**, **Login** (designs added).
- Auth logic & Mongo DB wiring.
- **UI only** for: **Community`s issues**, **Issue submit**, **Issue detail** (designs added)
- **UI Only** for: Authority Dashboard & Basic admin page.
- **Backend logic**: Added issue submission basic route with logic (not using AI classification yet)

## Roadmap (next steps)
- Implement auth (API, MongoDB Users, JWT) and connect Register/Login forms.
- “Create Report” flow: description, photo upload, Google Maps autocomplete.
- Basic Staff Dashboard: list/filter by priority/type/status.
- AI classification stub → replace with GPT integration.

## Run (dev)
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd ../frontend
npm install
npm start
