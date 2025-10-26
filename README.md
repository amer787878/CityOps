# CityOps – Smart City Issue Reporting

CityOps helps residents report city problems (potholes, broken lights, missed garbage) and enables municipal staff to triage, assign, and resolve them efficiently.

**Stack:** React • Node.js/Express • MongoDB (Mongoose) • OpenAI GPT (AI classification)  
**Docs:** Swagger UI available at `/api-docs`, run it from backend: http://localhost:3009/api-docs

---

## Features

### For Citizens
- **Register & Login** (JWT-based auth).
- **Submit Issues** with title, description, photos, and location.
- **Auto Classification (AI):** type & priority suggested via OpenAI (manual override supported).
- **My Dashboard:** track issue status and updates.
- **Community View:** browse all issues, filter & sort.
- **Comments:** discuss specific issues.
- **Notifications:** get updates when status or assignments change.

### For Municipal Staff / Authority
- **Authority Dashboard:** KPIs for open/in-progress/resolved issues.
- **Team Management:** create teams and manage members.
- **Assignments:** assign issues to teams or staff.
- **Status Workflow:** update lifecycle (e.g., New → In Progress → Resolved).
- **Analytics:** trends, volumes, SLA-style views.
- **Moderation:** admin tools for moderating community comments.
- **Admin Reports:** consolidated reports for oversight and auditing.

---

## Architecture (High Level)
- **Frontend:** React SPA communicating with REST API.
- **Backend:** Node.js/Express with modular routes & controllers.
- **Database:** MongoDB with Mongoose models (Users, Issues, Comments, Notifications, Teams).
- **Auth:** JWT Bearer (documented in Swagger security schemes).
- **AI:** OpenAI endpoint for issue classification (type + priority).
- **CORS:** Restricted to configured allowed origins (defaults include `http://localhost:9000`, `https://localhost:9000`).

## Run (dev)
```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm start
