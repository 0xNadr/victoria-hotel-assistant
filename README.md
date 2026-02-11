# Viktoria - Voice AI for Dormero Hotels

A Voice AI system with a Control Center dashboard for Dormero Hotels customer support.

## Project Overview

**Viktoria** is an AI-powered voice agent that handles Tier-1 customer inquiries for Dormero Hotels. The system includes:

- **Voice Agent**: ElevenLabs-powered conversational AI with the "Viktoria" persona
- **Knowledge Base**: ChromaDB-powered semantic search for hotel information
- **Control Center**: Next.js dashboard for monitoring calls and collecting feedback

## Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Customer   │────▶│  ElevenLabs     │────▶│  FastAPI        │
│  (Phone)    │     │  Voice Agent    │     │  Backend        │
└─────────────┘     └─────────────────┘     └────────┬────────┘
                                                     │
                           ┌─────────────────────────┼─────────────────────────┐
                           │                         │                         │
                           ▼                         ▼                         ▼
                    ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
                    │  SQLite     │          │  ChromaDB   │          │  Next.js    │
                    │  (Calls)    │          │  (Knowledge)│          │  Dashboard  │
                    └─────────────┘          └─────────────┘          └─────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Voice AI | ElevenLabs |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | SQLite |
| Vector DB | ChromaDB |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Charts | Recharts |

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- ElevenLabs account (free tier)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your ElevenLabs credentials

# Seed the knowledge base
python -m scripts.seed_knowledge

# Seed sample call data (for testing)
python -m scripts.seed_sample_calls

# Start the server
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Start development server
npm run dev
```

Frontend runs at `http://localhost:3000`

### 3. ElevenLabs Agent Setup

1. Create an account at [elevenlabs.io](https://elevenlabs.io)
2. Go to **Conversational AI** → Create Agent
3. Configure the agent:
   - **Name**: Viktoria
   - **System Prompt**:
     ```
     You are Viktoria, the helpful virtual assistant for Dormero Hotels.
     You are the fancy, direct and helpful customer service agent handling
     inbound requests, reservations and complaints from customers. You use
     the tools at your disposal to access general Dormero knowledge and
     hotel details to provide factual answers. You keep your answers short
     to around 2-3 sentences max.
     ```
4. Add a **Tool** for knowledge queries:
   - Name: `query_knowledge`
   - URL: `https://your-backend-url/api/webhooks/elevenlabs/tool`
   - Method: POST
5. Configure webhooks for call events:
   - URL: `https://your-backend-url/api/webhooks/elevenlabs`

## API Endpoints

### Calls
- `GET /api/calls` - List calls (paginated)
- `GET /api/calls/{id}` - Get call details
- `POST /api/calls` - Create call record
- `PATCH /api/calls/{id}` - Update call

### Feedback
- `GET /api/calls/{id}/feedback` - Get feedback
- `POST /api/calls/{id}/feedback` - Submit feedback
- `PATCH /api/calls/{id}/feedback` - Update feedback

### Knowledge Base
- `POST /api/knowledge/query` - Query the knowledge base

### Analytics
- `GET /api/analytics/summary` - Summary metrics
- `GET /api/analytics/calls-over-time` - Call volume data
- `GET /api/analytics/ratings` - Rating distribution

### Webhooks
- `POST /api/webhooks/elevenlabs` - Handle ElevenLabs events
- `POST /api/webhooks/elevenlabs/tool` - Handle tool calls

## Project Structure

```
clar-challenge/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app
│   │   ├── config.py         # Settings
│   │   ├── database.py       # SQLAlchemy setup
│   │   ├── models/           # Database models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── routers/          # API endpoints
│   │   ├── services/         # Business logic
│   │   └── data/hotels/      # Hotel JSON data
│   └── scripts/              # Seed scripts
│
├── frontend/
│   └── src/
│       ├── app/              # Next.js pages
│       ├── components/       # React components
│       ├── lib/              # Utilities & API client
│       └── types/            # TypeScript types
│
├── docs/
├── PRD.md
├── PLAN.md
└── README.md
```

## Decision Summary

### Why FastAPI + SQLite?
- **FastAPI**: Modern Python framework with automatic OpenAPI docs, async support, and excellent developer experience
- **SQLite**: Zero-configuration database, perfect for PoC. Easily upgradeable to PostgreSQL for production

### Why ChromaDB?
- Lightweight vector database that runs embedded (no separate service)
- Python-native, easy integration with FastAPI
- Handles semantic search out of the box

### Why Next.js?
- React-based with excellent developer experience
- App Router provides modern patterns (Server Components, streaming)
- Easy deployment to Vercel

### Why this architecture?
- **Separation of concerns**: Backend handles data/logic, frontend handles UI
- **API-first**: Clean REST API enables future integrations
- **Scalable**: Can easily add more hotels, upgrade database, or swap components

## Deployment

### Backend (Railway)

1. Push code to GitHub
2. Create new project on Railway
3. Connect GitHub repo
4. Set environment variables
5. Deploy

### Frontend (Vercel)

1. Push code to GitHub
2. Import project on Vercel
3. Set `NEXT_PUBLIC_API_URL` to Railway backend URL
4. Deploy

## Future Improvements

- [ ] Real-time call updates via WebSockets
- [ ] Multi-language support
- [ ] Call sentiment analysis
- [ ] Automated quality scoring
- [ ] Integration with CRM systems
- [ ] Admin dashboard for managing hotel data
