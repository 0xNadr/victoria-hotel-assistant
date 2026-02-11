# Product Requirements Document: Viktoria Voice AI

## 1. Overview

**Project Name:** Viktoria
**Client:** Dormero Hotel Group
**Product Type:** Voice AI Agent + Control Center Dashboard

### Background

Dormero Hotels, a progressive hotel chain known for their distinctive brand (red shoes, pet-friendly policies), operates a support center in Berlin that is overwhelmed by customer inquiries. These inquiries span reservations, special requests, information queries, and complaints.

### Vision

Deploy "Viktoria," a Voice AI agent to handle Tier-1 customer inquiries via phone, reducing support center load while maintaining Dormero's brand personality—fancy, direct, and helpful.

---

## 2. Goals & Success Criteria

### Primary Goals

| Goal | Success Metric |
|------|----------------|
| Automate Tier-1 inquiries | Agent can answer common questions about hotels, policies, and reservations |
| Provide operational visibility | Support team can view call logs and monitor agent performance |
| Enable continuous improvement | Feedback mechanism captures quality signals for iteration |

### Non-Goals (Out of Scope)

- User authentication system
- Phone number provisioning/management
- Scraping all 60+ hotels (focus on 1-2 exemplary hotels)
- Production-grade deployment
- Perfect prompt engineering

---

## 3. User Personas

### Primary Users

1. **Hotel Customers** - Calling to inquire about reservations, hotel amenities, policies, or lodge complaints
2. **Support Team Operators** - Monitoring call quality, reviewing logs, providing feedback

### Secondary Users

- **Dormero Management** - Reviewing aggregate performance and system value

---

## 4. Feature Requirements

### Part A: Voice Agent (Viktoria)

**Platform:** ElevenLabs (Free tier)

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| A1 | Agent responds as "Viktoria" with defined persona | Must Have |
| A2 | Agent retrieves answers from knowledge base | Must Have |
| A3 | Agent handles general Dormero policy questions (pets, check-in times) | Must Have |
| A4 | Agent handles hotel-specific questions (parking, room types) | Must Have |
| A5 | Agent keeps responses concise (2-3 sentences) | Should Have |

#### Persona Definition

```
You are Viktoria, the helpful virtual assistant for Dormero Hotels.
You are the fancy, direct and helpful customer service agent handling
inbound requests, reservations and complaints from customers. You use
the tools at your disposal to access general Dormero knowledge and
hotel details to provide factual answers. You keep your answers short
to around 2-3 sentences max.
```

---

### Part B: Knowledge Base

**Data Source:** https://www.dormero.de/
**Scope:** 1 exemplary hotel (scalable architecture for 60+ hotels)

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| B1 | Store general Dormero policies (pets, check-in, cancellation) | Must Have |
| B2 | Store hotel-specific data (location, amenities, parking, rooms) | Must Have |
| B3 | Support efficient retrieval for agent queries | Must Have |
| B4 | Data model extensible to 60+ hotels | Should Have |
| B5 | Structured indexing for semantic search | Should Have |

#### Suggested Data Model

```
Hotel
├── id
├── name
├── location (city, address, coordinates)
├── contact (phone, email)
├── amenities[]
│   ├── type (parking, wifi, restaurant, spa, etc.)
│   ├── description
│   └── details (pricing, hours, capacity)
├── rooms[]
│   ├── type
│   ├── description
│   ├── capacity
│   └── features[]
└── policies (check-in, check-out, pets, cancellation)

GeneralPolicy
├── id
├── category (pets, booking, loyalty, etc.)
├── content
└── exceptions[]
```

#### Example Questions to Support

- "What are the parking opportunities at the Coburg hotel?"
- "Can I bring my dog to the hotel?"
- "What time is check-in?"
- "What room types are available?"

---

### Part C: Control Center Dashboard

**Stack:** Web application (React recommended)

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| C1 | Display list of recent calls with metadata | Must Have |
| C2 | Show call details (timestamp, duration, transcript) | Must Have |
| C3 | Allow users to rate calls (e.g., 1-5 stars) | Must Have |
| C4 | Allow users to leave comments on calls | Must Have |
| C5 | Persist feedback data for future analysis | Must Have |
| C6 | Clean, sleek, intuitive UI | Must Have |
| C7 | Filter/search call logs | Nice to Have |

#### Call Log Fields (Suggested)

| Field | Description |
|-------|-------------|
| Call ID | Unique identifier |
| Timestamp | When the call occurred |
| Duration | Length of call |
| Caller Info | Phone number or identifier |
| Status | Completed, Dropped, Transferred |
| Summary | AI-generated or extracted topic |
| Transcript | Full conversation text |
| Rating | User-provided quality score |
| Comments | User feedback text |

#### UI Components

1. **Call List View**
   - Sortable table/list of recent calls
   - Quick status indicators
   - Click to expand details

2. **Call Detail View**
   - Full transcript display
   - Metadata sidebar
   - Rating input (stars/thumbs)
   - Comment text area
   - Save feedback action

3. **Dashboard Overview** (Nice to Have)
   - Call volume metrics
   - Average rating
   - Common topics

---

## 5. Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         CUSTOMER                                │
│                            │                                    │
│                            ▼                                    │
│                    ┌──────────────┐                             │
│                    │  ElevenLabs  │                             │
│                    │  Voice Agent │                             │
│                    └──────┬───────┘                             │
│                           │                                     │
│              ┌────────────┼────────────┐                        │
│              ▼            ▼            ▼                        │
│     ┌─────────────┐ ┌──────────┐ ┌──────────────┐              │
│     │  Tool API   │ │ Webhook  │ │  Knowledge   │              │
│     │  (Actions)  │ │ Handler  │ │  Base API    │              │
│     └─────────────┘ └────┬─────┘ └──────────────┘              │
│                          │                                      │
│                          ▼                                      │
│                    ┌───────────┐                                │
│                    │  Database │                                │
│                    │  (Calls,  │                                │
│                    │  Feedback)│                                │
│                    └─────┬─────┘                                │
│                          │                                      │
│                          ▼                                      │
│                 ┌─────────────────┐                             │
│                 │ Control Center  │                             │
│                 │   (React App)   │                             │
│                 └─────────────────┘                             │
│                          │                                      │
│                          ▼                                      │
│                   SUPPORT TEAM                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Considerations

| Layer | Options | Notes |
|-------|---------|-------|
| Voice Agent | ElevenLabs | Required per challenge |
| Backend API | Node.js/Express, Python/FastAPI, etc. | Developer choice |
| Database | SQLite, PostgreSQL, or simple JSON store | Focus on structure over production-readiness |
| Frontend | React (recommended) | Clean, component-based UI |
| Public Endpoint | ngrok, Replit, Railway, etc. | For ElevenLabs tool callbacks |

---

## 6. Integration Points

### ElevenLabs Agent

- Configure agent via GUI or API
- Set system prompt with Viktoria persona
- Connect knowledge base retrieval as tool
- Capture conversation data via webhooks

### Knowledge Base

- Provide API endpoint for agent to query
- Support natural language questions
- Return structured, concise responses

### Webhooks / Event Handling

- Capture call start/end events
- Store conversation transcripts
- Log metadata for dashboard display

---

## 7. Constraints & Assumptions

### Constraints

- Use ElevenLabs Free tier
- No authentication required (assume logged-in users)
- No phone number management (use ElevenLabs preview)
- Limited to 1-2 hotels for data

### Assumptions

- Users have basic familiarity with call center operations
- Internet connectivity is stable
- ElevenLabs API remains available

---

## 8. Deliverables

| Deliverable | Description |
|-------------|-------------|
| Source Code | GitHub repo or zip file |
| Slack Announcement | Customer-facing launch message for Dormero management |
| README | Setup instructions + architecture decision summary |

---

## 9. Evaluation Criteria

The solution will be evaluated across three dimensions:

1. **Interaction & Interface** - UX quality, engineering craft, intuitive design
2. **Integration** - API handling, third-party service connectivity, data flow
3. **System Design** - Data modeling, backend logic, architectural decisions

---

## 10. Open Questions / Decisions to Make

- [ ] Which hotel to use as exemplary data sample?
- [ ] Backend framework choice (Node.js vs Python vs other)?
- [ ] Database choice (SQLite for simplicity vs PostgreSQL for robustness)?
- [ ] How to expose public endpoint for ElevenLabs (ngrok vs deployed service)?
- [ ] Knowledge base approach (vector DB vs structured queries vs hybrid)?
- [ ] What "cherry on top" feature to showcase creativity?
