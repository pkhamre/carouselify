# SQLite + Port 4000 Migration Plan

> Sub-skill: Can be executed inline — small scope, tightly coupled changes.

**Goal:** Migrate from PostgreSQL to SQLite for resource-constrained deployment, and change frontend port from 3000 to 4000.

**Architecture:** Swap asyncpg for aiosqlite, replace PG-specific column types (UUID, JSONB, text("now()")) with SQLAlchemy portable equivalents, add WAL pragma for performance.

**Files changed:** 12 files

---

### Changes Summary

| # | File | Change |
|---|------|--------|
| 1 | `backend/requirements.txt` | `asyncpg` → `aiosqlite` |
| 2 | `backend/app/config.py` | Default `DATABASE_URL` → `sqlite+aiosqlite:///./carouselify.db` |
| 3 | `backend/app/models.py` | `UUID` → `Uuid`, `JSONB` → `JSON`, `text("now()")` → `func.now()` |
| 4 | `backend/app/database.py` | Add SQLite WAL + foreign_keys PRAGMA on connect |
| 5 | `backend/app/main.py` | CORS: `localhost:3000` → `localhost:4000`, `frontend:3000` → `frontend:4000` |
| 6 | `frontend/Dockerfile` | `EXPOSE 3000` → `EXPOSE 4000` + add `ENV PORT=4000` |
| 7 | `docker-compose.yml` | Remove postgres service, update frontend port to 4000, add `carouselify_data` volume |
| 8 | `.env.example` | `DATABASE_URL` updated |
| 9 | `README.md` | All port/database references |
| 10 | `AGENTS.md` | Commands + architecture references |
| 11 | `backend/Dockerfile` | `RUN mkdir -p /app/data` |

**Verification:** `cd frontend && npm run build` — must compile clean.
