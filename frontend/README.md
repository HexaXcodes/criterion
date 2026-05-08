# CRITERION — Frontend

> *your taste, refined*

A cinematic movie review platform with AI-powered recommendations, live communities, real-time chat, and a pet companion. Built with React + Vite + Tailwind.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + Vite 5 |
| Routing | React Router v6 |
| Styling | Tailwind CSS v3 + custom CSS |
| API | Axios with JWT interceptor |
| Real-time | Socket.io-client |
| Fonts | Space Grotesk + Inter (Google Fonts) |

---

## Prerequisites

Make sure your backend is running first:

```bash
# In your backend folder
cd Movierevproj/backend
node server.js          # Express API on :5000

# In a second terminal — ML service
cd Movierevproj/backend/ml
python recommender.py   # Flask ML on :5001
```

---

## Setup

### 1. Install dependencies

```bash
cd criterion-frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` if your backend runs on a different port:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Start the dev server

```bash
npm run dev
```

App opens at **http://localhost:3000**

---

## Project Structure

```
criterion-frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   ├── client.js          # Axios instance + JWT interceptor
│   │   ├── auth.js            # Login / Signup
│   │   ├── movies.js          # Movie endpoints + AI recommendations
│   │   ├── reviews.js         # Review CRUD
│   │   ├── users.js           # Profile, watchlist, streak, leaderboard
│   │   ├── communities.js     # Communities, posts, comments
│   │   ├── chat.js            # Chat rooms + messages
│   │   └── socket.js          # Socket.io singleton
│   ├── components/
│   │   ├── pets/
│   │   │   ├── MimiPet.jsx    # Black cat (lazy, sleeps)
│   │   │   ├── JeebiePet.jsx  # Orange tabby (tail wag)
│   │   │   ├── ToffeePet.jsx  # Calico (stays at edges)
│   │   │   └── BiscuitPet.jsx # Golden retriever (energetic)
│   │   ├── PetCompanion.jsx   # Spring physics movement engine
│   │   ├── BottomNav.jsx      # Feed/Discover/Clubs/Profile tabs
│   │   ├── TopBar.jsx         # Brand + streak counter
│   │   ├── ToastStack.jsx     # Notification system
│   │   ├── GenreBackground.jsx# Dynamic colour bg per genre
│   │   ├── StarRating.jsx     # Interactive + display star ratings
│   │   ├── MoviePoster.jsx    # Poster with fallback
│   │   └── ProtectedRoute.jsx # Auth guard wrapper
│   ├── context/
│   │   ├── AuthContext.jsx    # User, token, login/logout, toasts
│   │   └── PetContext.jsx     # Pet type + name persistence
│   ├── pages/
│   │   ├── LandingPage.jsx    # Entry with guest mode modal
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx     # 3-step: account → genres → companion
│   │   ├── FeedPage.jsx       # Swipeable full-screen feed
│   │   ├── DiscoverPage.jsx   # Search + genre filter + sections
│   │   ├── MovieDetailPage.jsx# Movie + reviews + add review
│   │   ├── CommunitiesPage.jsx# List + create community
│   │   ├── CommunityDetailPage.jsx # Posts + comments + chat button
│   │   ├── ChatPage.jsx       # Real-time Socket.io chat
│   │   └── ProfilePage.jsx    # Stats + streak + companion + prefs
│   ├── utils/
│   │   └── helpers.js         # GENRES, genreToBgClass, timeAgo
│   ├── App.jsx                # Router + providers
│   ├── main.jsx               # Entry point
│   └── index.css              # Design system + Tailwind base
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## All Backend Endpoints Used

| Page | Endpoint |
|---|---|
| Login | POST /api/auth/login |
| Signup | POST /api/auth/signup |
| Feed | GET /api/movies/recommendations/explained |
| Feed like | POST /api/reviews |
| Feed save | POST /api/users/watchlist |
| Discover search | GET /api/movies/search |
| Discover top rated | GET /api/movies |
| Discover for you | GET /api/movies/recommendations/explained |
| Movie detail | GET /api/movies/:id |
| Reviews list | GET /api/reviews/:movieId |
| Add review | POST /api/reviews |
| Watchlist | POST /api/users/watchlist |
| Mark watched | POST /api/users/watched |
| Communities list | GET /api/communities |
| Community detail | GET /api/communities/:id |
| Join/Leave | POST /api/communities/:id/join \| leave |
| Posts | GET /api/communities/:id/posts |
| Create post | POST /api/communities/:id/posts |
| Upvote post | POST /api/communities/:id/posts/:postId/upvote |
| Comments | GET /api/communities/:id/posts/:postId/comments |
| Add comment | POST /api/communities/:id/posts/:postId/comments |
| Chat rooms | GET /api/communities/:communityId/chatrooms |
| Chat messages | GET /api/communities/:communityId/chatrooms/:roomId/messages |
| Socket join | emit: joinRoom(roomId) |
| Socket send | emit: sendMessage({ roomId, content }) |
| Socket receive | on: newMessage |
| Profile | GET /api/users/profile |
| Streak | GET /api/users/streak |
| Leaderboard | GET /api/users/leaderboard |
| Edit preferences | PUT /api/users/preferences |

---

## Design System

- **Background**: `#0a0a0a` → `#131313`
- **Primary pink**: `#ff4b89` gradient to `#ffb1c3`
- **Teal accent**: `#00dbe9`
- **Glassmorphism**: `backdrop-blur(24px)` + `rgba(255,255,255,0.04)`
- **Fonts**: Space Grotesk (headings) + Inter (body)
- **Genre backgrounds**: each genre triggers a radial gradient theme
- **Pet z-index**: 5 (behind all UI content at 10+)

---

## Build for Production

```bash
npm run build
# Output in /dist — serve with any static host (Vercel, Netlify, etc.)
```

---

## Common Issues

| Problem | Fix |
|---|---|
| API calls fail | Make sure backend is on :5000 and VITE_API_URL is correct in .env |
| Socket not connecting | Check VITE_SOCKET_URL and that Socket.io is enabled in backend |
| Recommendations empty | Ensure ML service is running on :5001 |
| No movies in feed | Seed the database: `node backend/src/scripts/seedMovies.js` |
| Fonts not loading | Check internet connection (Google Fonts CDN) |
