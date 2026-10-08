# FindDoctor

Find the nearest doctors and clinics by **name** or **disease/symptom**, see which **hospital** they belong to, filter by **rating**, get a **recommended hospital**, and get **turn-by-turn directions**.

**100% free: no API keys, no card, no sign-up.** It's built with Next.js and free OpenStreetMap services.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 and allow location access. If you don't allow it, the app starts in Mumbai and you can click the map to set your location.

## What it uses

| Feature | Free service |
|---|---|
| Map | OpenStreetMap tiles via Leaflet |
| Doctor / clinic / hospital search | Overpass API (OpenStreetMap data) |
| Directions (car / cycle / walk) | OSRM at routing.openstreetmap.de |
| Ratings | The app's own: users rate places 1–5★, stored in `.data/ratings.json` |
| "Open in Google Maps" button | A plain link, no API key |

## Code map

| Piece | Where |
|---|---|
| `POST /api/search` finds places near you, filters by name / specialty / rating, links clinics to hospitals, and ranks doctors and hospitals | `src/app/api/search/route.ts` |
| `POST /api/directions` returns a route with steps | `src/app/api/directions/route.ts` |
| `GET/POST /api/ratings` reads or saves a user's rating (one vote per browser, which can be changed) | `src/app/api/ratings/route.ts` |
| OpenStreetMap search and routing | `src/lib/osm.ts` |
| Disease → specialty, and specialty → OSM tags | `src/lib/specialties.ts` |
| Degree extraction (MBBS, MD, MS, DM, MCh…) | `src/lib/degrees.ts` |
| Scoring | `src/lib/scoring.ts` |

## Ranking

- **Ratings** use a weighted average, so one 5★ vote doesn't beat a 4.6★ from 40 people.
- **Doctor score** = 55% rating + 25% highest degree + 20% distance.
- **Hospital score** = 45% rating + 30% distance + 25% care (offers the chosen specialty, 24×7 emergency, number of specialities, specialist doctors). When a specialty is chosen, hospitals that offer it are listed first. The top hospital is shown as **Recommended for you**, with the reasons.

## Limitations

- **Ratings start empty.** They fill up as people use the app. Until then, ranking relies mostly on distance and specialty.
- **OpenStreetMap coverage varies.** Big cities have many hospitals and clinics, but individual doctors are often missing and small towns may have few entries.
- **Degrees** only show when they're written in the place's name or description.
- **Public servers can be busy.** The app retries other mirrors and reuses saved results for 6 hours. For heavy or production use, run your own Overpass and OSRM servers, or set `OVERPASS_URL`.
- **Ratings are saved to a local file.** If you deploy to a serverless host like Vercel, move them to a database.
