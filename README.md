# Campus Lost & Found

A MERN web app where college students report lost items, post found items and claim them back. An admin verifies every claim.

**Stack:** React (Vite) + Tailwind CSS + React Router + Axios · Node.js + Express · MongoDB + Mongoose · JWT + bcryptjs · Multer

## Screenshots

> _Add screenshots here: Home, Item detail, Post item, My posts, Admin panel._

## Features

| Role | Can do |
| --- | --- |
| Guest | Browse, search and filter items, view item details |
| Student | Everything a guest can, plus post lost/found items with a photo, edit/delete own posts, claim items with a proof message, see own posts and claims |
| Admin | Everything a student can, plus view all claims, approve/reject them, delete any post, see stats |

- Passwords are hashed with bcrypt and are never returned by the API.
- Login gives a JWT (valid 7 days), saved in `localStorage`, so you stay logged in after a refresh.
- Search uses a MongoDB text index on title and description, combined with type, category and location filters. Results are newest first, 9 per page.
- A user can claim an item only once (unique index on `{ item, claimedBy }`) and cannot claim their own post.
- Approving a claim marks the item **Claimed** and automatically rejects the other pending claims for it.

## Prerequisites

- Node.js 18 or newer
- That's it. **MongoDB does not need to be installed.** When `MONGO_URI` in `server/.env` is empty, the server starts a built-in MongoDB automatically (using the `mongodb-memory-server-core` package) and saves its data in `server/data/db`.
  - The first start on a new computer downloads the MongoDB program once (about 750 MB, cached in `~/.cache/mongodb-binaries`), so it can take a few minutes. Later starts take a few seconds.
  - To use your own MongoDB or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster instead, just put its connection string in `MONGO_URI`.
  - Stop the server before running `npm run seed`, because only one program can use the `server/data/db` folder at a time.

## Setup and running

```bash
# 1. Backend
cd server
npm install
cp .env.example .env      # on Windows: copy .env.example .env
npm run seed              # creates the demo admin, student and 8 sample items
npm run dev               # API on http://localhost:5000

# 2. Frontend (in a second terminal)
cd client
npm install
cp .env.example .env
npm run dev               # app on http://localhost:5173
```

> `npm run seed` **deletes all existing users, items and claims** before adding the demo data.

### Demo accounts (created by the seed script)

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@college.edu | admin123 |
| Student | student@college.edu | student123 |

## Environment variables

`server/.env`

| Variable | Example | Meaning |
| --- | --- | --- |
| `PORT` | `5000` | Port the API listens on |
| `MONGO_URI` | _(empty)_ or `mongodb://127.0.0.1:27017/lostfound` | Leave empty for the built-in MongoDB, or set your local/Atlas connection string |
| `JWT_SECRET` | `change_this_secret` | Secret used to sign login tokens. Change it! |
| `CLIENT_URL` | `http://localhost:5173` | Frontend URL allowed by CORS |

`client/.env`

| Variable | Example | Meaning |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000/api` | Base URL of the API |

## API

All routes start with `/api` and return JSON. Errors look like `{ "message": "..." }` with status 400, 401, 403, 404 or 500.
Protected routes need the header `Authorization: Bearer <token>`.

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/health` | Public | Health check |
| POST | `/auth/register` | Public | Create account, returns `{ token, user }` |
| POST | `/auth/login` | Public | Login, returns `{ token, user }` |
| GET | `/auth/me` | Student | Current user from the token |
| GET | `/items` | Public | List items. Query: `search`, `type`, `category`, `location`, `page` |
| GET | `/items/mine` | Student | Logged-in user's items |
| GET | `/items/:id` | Public | Single item with the poster's name |
| POST | `/items` | Student | Create item (multipart form, optional `image` field) |
| PUT | `/items/:id` | Owner | Update own item (multipart form) |
| DELETE | `/items/:id` | Owner or Admin | Delete item and its claims |
| POST | `/claims` | Student | Create claim `{ itemId, proofMessage }` |
| GET | `/claims/mine` | Student | Logged-in user's claims |
| GET | `/claims?status=` | Admin | All claims, optional status filter |
| PATCH | `/claims/:id` | Admin | `{ status: "approved" \| "rejected" }` |
| GET | `/admin/stats` | Admin | Counts: total items, lost, found, claimed, pending claims |

Uploaded photos are served at `/uploads/<filename>` (jpg/png only, max 2 MB).

## Project structure

```
lost-and-found/
  client/                     React app
    src/
      api/axios.js            axios instance: base URL + adds the JWT to every request
      components/             Navbar, ItemCard, FilterBar, ProtectedRoute, Badge, Spinner
      context/AuthContext.jsx logged-in user, login() and logout()
      pages/                  Home, Login, Register, PostItem (also used to edit), ItemDetail, MyPosts, AdminPanel
      constants.js            category list and date formatting
  server/                     Express API
    config/db.js              MongoDB connection (starts the built-in MongoDB if MONGO_URI is empty)
    data/                     built-in MongoDB's data files (created automatically, not in git)
    models/                   User, Item, Claim (Mongoose schemas)
    routes/                   auth, item, claim and admin routes
    controllers/              the logic for each route
    middleware/               auth.js (verify JWT), admin.js (admin only), upload.js (Multer)
    uploads/                  uploaded photos
    seed.js                   demo data
    server.js                 app entry point
```

## How a request flows (useful for the viva)

1. React calls the API through `client/src/api/axios.js`, which adds `Authorization: Bearer <token>`.
2. Express matches the route in `server/routes/`.
3. Middleware runs first: `auth.js` verifies the JWT and puts the user on `req.user`, `admin.js` checks `req.user.role`, and `upload.js` saves the photo.
4. The controller validates the input, talks to MongoDB through the Mongoose model and sends JSON back.
5. Any error goes to the error handler in `server.js`, which turns it into `{ message }` with the right status code.
