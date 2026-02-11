# Implementation Plan: Viktoria Voice AI

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│    ┌──────────────┐         ┌─────────────────────────────────────┐    │
│    │   Customer   │────────▶│         ElevenLabs Agent            │    │
│    │   (Phone)    │         │          "Viktoria"                 │    │
│    └──────────────┘         └───────────────┬─────────────────────┘    │
│                                             │                           │
│                               Tool Calls &  │  Webhooks                 │
│                               Knowledge     │                           │
│                               Queries       ▼                           │
│                             ┌─────────────────────────────────────┐    │
│                             │      FastAPI Backend (Railway)      │    │
│                             │  ┌─────────────────────────────────┐│    │
│                             │  │  /api/knowledge  - KB queries   ││    │
│                             │  │  /api/calls      - Call logs    ││    │
│                             │  │  /api/feedback   - Ratings      ││    │
│                             │  │  /api/analytics  - Metrics      ││    │
│                             │  │  /api/webhooks   - 11Labs hooks ││    │
│                             │  └─────────────────────────────────┘│    │
│                             │                 │                   │    │
│                             │    ┌────────────┴────────────┐      │    │
│                             │    ▼                         ▼      │    │
│                             │ ┌────────┐            ┌──────────┐  │    │
│                             │ │ SQLite │            │ ChromaDB │  │    │
│                             │ │(Calls, │            │ (Vector  │  │    │
│                             │ │Feedback)            │   KB)    │  │    │
│                             │ └────────┘            └──────────┘  │    │
│                             └─────────────────────────────────────┘    │
│                                             │                           │
│                                             │ REST API                  │
│                                             ▼                           │
│                             ┌─────────────────────────────────────┐    │
│                             │    Next.js Frontend (Vercel)        │    │
│                             │  ┌─────────────────────────────────┐│    │
│                             │  │  /              - Dashboard     ││    │
│                             │  │  /calls         - Call Logs     ││    │
│                             │  │  /calls/[id]    - Call Detail   ││    │
│                             │  │  /analytics     - Metrics View  ││    │
│                             │  └─────────────────────────────────┘│    │
│                             └─────────────────────────────────────┘    │
│                                             │                           │
│                                             ▼                           │
│                                    ┌──────────────┐                     │
│                                    │ Support Team │                     │
│                                    └──────────────┘                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
clar-challenge/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI app entry
│   │   ├── config.py          # Settings & env vars
│   │   ├── database.py        # SQLAlchemy setup
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── call.py        # Call log model
│   │   │   └── feedback.py    # Feedback model
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── call.py        # Pydantic schemas
│   │   │   └── feedback.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── calls.py       # Call log endpoints
│   │   │   ├── feedback.py    # Feedback endpoints
│   │   │   ├── knowledge.py   # KB query endpoint
│   │   │   ├── webhooks.py    # ElevenLabs webhooks
│   │   │   └── analytics.py   # Metrics endpoints
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── knowledge_base.py  # ChromaDB integration
│   │   │   └── elevenlabs.py      # 11Labs API helpers
│   │   └── data/
│   │       └── hotels/
│   │           └── berlin.json    # Hotel data
│   ├── scripts/
│   │   └── seed_knowledge.py  # Populate ChromaDB
│   ├── requirements.txt
│   ├── Dockerfile
│   └── railway.toml
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           # Dashboard home
│   │   │   ├── calls/
│   │   │   │   ├── page.tsx       # Call list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Call detail
│   │   │   └── analytics/
│   │   │       └── page.tsx       # Analytics view
│   │   ├── components/
│   │   │   ├── ui/                # Shared UI components
│   │   │   ├── CallList.tsx
│   │   │   ├── CallDetail.tsx
│   │   │   ├── FeedbackForm.tsx
│   │   │   ├── RatingStars.tsx
│   │   │   ├── AnalyticsCharts.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── lib/
│   │   │   ├── api.ts             # API client
│   │   │   └── utils.ts
│   │   └── types/
│   │       └── index.ts           # TypeScript types
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.js
│
├── docs/
│   └── ANNOUNCEMENT.md        # Slack message for Dormero
├── PRD.md
├── PLAN.md
├── README.md
└── doc.md                     # Original challenge
```

---

## Implementation Phases

### Phase 1: Backend Foundation
**Goal:** Set up FastAPI with database models and basic endpoints

- [ ] Initialize FastAPI project structure
- [ ] Configure SQLAlchemy with SQLite
- [ ] Create data models (Call, Feedback)
- [ ] Create Pydantic schemas
- [ ] Implement CRUD endpoints for calls
- [ ] Implement feedback endpoints
- [ ] Add CORS configuration

### Phase 2: Knowledge Base
**Goal:** Set up ChromaDB and populate with Dormero Berlin data

- [ ] Research Dormero Hotel Berlin (website scrape/manual)
- [ ] Structure hotel data as JSON
- [ ] Set up ChromaDB integration
- [ ] Create embedding and indexing logic
- [ ] Implement `/api/knowledge` query endpoint
- [ ] Seed the knowledge base with hotel data
- [ ] Add general Dormero policies

### Phase 3: ElevenLabs Integration
**Goal:** Configure Viktoria agent and connect to backend

- [ ] Create ElevenLabs account and agent
- [ ] Configure Viktoria persona/prompt
- [ ] Set up tool for knowledge base queries
- [ ] Implement webhook handler for call events
- [ ] Test voice interactions via preview
- [ ] Store call transcripts from webhooks

### Phase 4: Frontend - Core UI
**Goal:** Build the Control Center dashboard

- [ ] Initialize Next.js project with Tailwind
- [ ] Create app layout with sidebar navigation
- [ ] Build Call List page with table/cards
- [ ] Build Call Detail page with transcript view
- [ ] Implement rating component (stars)
- [ ] Implement feedback comment form
- [ ] Connect to backend API

### Phase 5: Analytics Dashboard
**Goal:** Add metrics and charts view

- [ ] Create analytics API endpoints
- [ ] Build metrics cards (total calls, avg rating, etc.)
- [ ] Implement charts (call volume over time, rating distribution)
- [ ] Add filtering by date range
- [ ] Polish the dashboard home page

### Phase 6: Deployment & Polish
**Goal:** Deploy and finalize deliverables

- [ ] Deploy FastAPI to Railway
- [ ] Deploy Next.js to Vercel
- [ ] Update ElevenLabs webhook URLs
- [ ] End-to-end testing
- [ ] Write README with setup instructions
- [ ] Write Slack announcement for Dormero
- [ ] Final UI polish and responsiveness

---

## Data Models

### Call (SQLite)

```python
class Call(Base):
    __tablename__ = "calls"

    id: str                    # UUID
    elevenlabs_call_id: str    # External ID from 11Labs
    started_at: datetime
    ended_at: datetime | None
    duration_seconds: int | None
    status: str                # "completed", "dropped", "in_progress"
    caller_id: str | None      # Phone number if available
    transcript: str | None     # Full conversation
    summary: str | None        # AI-generated summary
    created_at: datetime
    updated_at: datetime

    # Relationship
    feedback: Feedback
```

### Feedback (SQLite)

```python
class Feedback(Base):
    __tablename__ = "feedback"

    id: str                    # UUID
    call_id: str               # FK to calls
    rating: int                # 1-5 stars
    comment: str | None
    created_by: str | None     # Operator name (optional)
    created_at: datetime
    updated_at: datetime
```

### Hotel Knowledge (ChromaDB Documents)

```json
{
  "id": "berlin-overview",
  "content": "Dormero Hotel Berlin is located in the heart of Berlin...",
  "metadata": {
    "hotel_id": "berlin",
    "category": "overview",
    "hotel_name": "Dormero Hotel Berlin"
  }
}
```

Categories for chunking:
- `overview` - General hotel description
- `location` - Address, directions, nearby attractions
- `rooms` - Room types and descriptions
- `amenities` - Parking, WiFi, restaurant, spa, etc.
- `policies` - Check-in/out, pets, cancellation
- `contact` - Phone, email, booking info

---

## API Endpoints

### Calls
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calls` | List all calls (paginated) |
| GET | `/api/calls/{id}` | Get call details |
| POST | `/api/calls` | Create call (from webhook) |
| PATCH | `/api/calls/{id}` | Update call |

### Feedback
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calls/{id}/feedback` | Get feedback for call |
| POST | `/api/calls/{id}/feedback` | Add/update feedback |

### Knowledge
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/knowledge/query` | Query knowledge base |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/elevenlabs` | Handle 11Labs events |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary` | Get summary metrics |
| GET | `/api/analytics/calls-over-time` | Call volume data |
| GET | `/api/analytics/ratings` | Rating distribution |

---

## Tech Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Voice AI | ElevenLabs | Viktoria agent |
| Backend | FastAPI | REST API |
| ORM | SQLAlchemy | Database access |
| Database | SQLite | Calls & feedback storage |
| Vector DB | ChromaDB | Knowledge base |
| Frontend | Next.js 14 | Control Center UI |
| Styling | Tailwind CSS | UI styling |
| Charts | Recharts | Analytics visualizations |
| Deployment | Railway + Vercel | Hosting |

---

## Timeline Estimate

| Phase | Components |
|-------|-----------|
| Phase 1 | Backend Foundation |
| Phase 2 | Knowledge Base |
| Phase 3 | ElevenLabs Integration |
| Phase 4 | Frontend Core UI |
| Phase 5 | Analytics Dashboard |
| Phase 6 | Deployment & Polish |

---

## Open Items / Decisions Made

- [x] Backend: FastAPI + SQLAlchemy
- [x] Database: SQLite (simple, no setup)
- [x] Vector DB: ChromaDB (lightweight, Python-native)
- [x] Frontend: Next.js + Tailwind
- [x] Deployment: Railway (backend) + Vercel (frontend)
- [x] Hotel: Dormero Hotel Berlin
- [x] Bonus: Analytics/metrics view

---

## Next Steps

1. **Approve this plan** - Review and confirm the approach
2. **Start Phase 1** - Set up backend foundation
3. **Research hotel data** - Gather Dormero Berlin info while building

Ready to start building?
