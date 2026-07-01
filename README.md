# CoFoundry — Server

Express + MongoDB API powering [CoFoundry](https://co-foundry-client.vercel.app), a platform connecting startup founders with collaborators.

**Live API:** [https://co-foundry-server.vercel.app](https://co-foundry-server.vercel.app) · **Client repo:** [cofoundry-client](https://github.com/shariful-ire)

---

## Tech Stack

- **Runtime:** Node.js, Express
- **Database:** MongoDB Atlas (Mongoose)
- **Auth:** Custom JWT (HTTPOnly cookie) + bcrypt for passwords, hand-rolled Google OAuth2 flow
- **Payments:** Stripe Checkout + webhooks
- **Security:** Helmet, express-rate-limit, express-mongo-sanitize, explicit CORS allowlist
- **Deployment:** Vercel (serverless functions)

## Architecture Notes

- Sessions are a self-issued JWT stored in an **HTTPOnly, Secure, SameSite** cookie — never exposed to client-side JavaScript. A companion non-HTTPOnly `has-session` flag cookie lets the client know whether to even bother checking session state, without leaking the token itself.
- Every protected route runs through `verifyToken` (validates the JWT) and `requireRole(...)` (authorizes by role). Role is always read from the verified token — never trusted from a request body.
- `founderEmail` / `applicantEmail` on Startups, Opportunities, and Applications are always set server-side from the authenticated session, never accepted as free client input.
- Google OAuth: the role for a brand-new account is only ever set at account creation (chosen on the client's Register page, or picked immediately after a login-initiated Google sign-up via a short-lived pending-signup token). An existing account's role is never overwritten by a later Google sign-in.

## API Reference

### Auth — `/api/auth`
| Method | Route | Description |
|---|---|---|
| POST | `/register` | Create an account (email/password + role) |
| POST | `/login` | Email/password login |
| GET | `/me` | Current session user |
| POST | `/signout` | Clear session |
| GET | `/google` | Kick off Google OAuth (`?role=` optional, Register-only) |
| GET | `/google/callback` | Google redirect target |
| POST | `/google/complete` | Exchange a short-lived token for a session cookie |
| POST | `/google/finish-signup` | Complete a brand-new Google account with a chosen role |

### Startups — `/api/startups`
| Method | Route | Description |
|---|---|---|
| GET | `/` | Browse approved startups (paginated, filterable) |
| GET | `/mine` | Founder's own startup |
| GET | `/:id` | Startup detail |
| POST | `/` | Create startup (founder) |
| PUT | `/:id` | Update own startup (founder) |
| DELETE | `/:id` | Delete own startup (founder) |

### Opportunities — `/api/opportunities`
| Method | Route | Description |
|---|---|---|
| GET | `/` | Browse opportunities — paginated; `search` ($regex on role title/skills), `workType`/`industry` ($in, comma-separated) |
| GET | `/mine` | Founder's own opportunities |
| GET | `/:id` | Opportunity detail |
| POST | `/` | Create opportunity (founder, gated at 3 free unless premium) |
| PUT | `/:id` | Update own opportunity (founder) |
| DELETE | `/:id` | Delete own opportunity (founder) |

### Applications — `/api/applications`
| Method | Route | Description |
|---|---|---|
| POST | `/` | Apply to an opportunity (collaborator) |
| GET | `/mine` | Collaborator's own applications |
| GET | `/founder` | All applications across a founder's opportunities |
| GET | `/opportunity/:oppId` | Applications for one opportunity (founder) |
| PATCH | `/:id` | Accept/reject an application (founder) |

### Payments — `/api/payment`
| Method | Route | Description |
|---|---|---|
| POST | `/create-checkout` | Create a Stripe Checkout session |
| POST | `/webhook` | Stripe webhook — marks payment paid, lifts the opportunity cap |

### Admin — `/api/admin` (admin only)
| Method | Route | Description |
|---|---|---|
| GET | `/users` | List all users |
| PATCH | `/users/:id/block` | Toggle block/unblock |
| GET | `/startups` | List all startups |
| PATCH | `/startups/:id` | Approve/reject a startup |
| DELETE | `/startups/:id` | Remove a startup |
| GET | `/transactions` | All payments + total revenue |
| GET | `/stats` | Platform overview counts |

### Users — `/api/users`
| Method | Route | Description |
|---|---|---|
| PATCH | `/profile` | Update own profile (name, image, bio, skills, phone) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster
- A Google OAuth 2.0 Client (for Google sign-in)
- A Stripe account (test mode is fine)

### Installation

```bash
git clone https://github.com/shariful-ire/cofoundry-server.git
cd cofoundry-server
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your own values:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `PORT` | Local dev port (unused on Vercel) |
| `CLIENT_URL` | Client origin — used for CORS and OAuth redirects |
| `JWT_SECRET` | Signing secret for session tokens |
| `JWT_EXPIRES_IN` | Session token lifetime (e.g. `7d`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 credentials |
| `GOOGLE_CALLBACK_URL` | Must exactly match an Authorized redirect URI on the Google Client |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe API credentials |
| `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL` | Premium plan prices, in cents |
| `NODE_ENV` | `development` \| `production` — controls secure/sameSite cookie flags |

### Seed an admin account

No public route can create an admin. Run once after setting up your database:

```bash
npm run seed:admin
```

### Run locally

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

---

## Security Checklist

- [x] Secrets only ever read from environment variables
- [x] Helmet security headers on every response
- [x] Rate limiting — global + a stricter limit on `/api/auth/*`
- [x] `express-mongo-sanitize` strips `$`/`.`-prefixed keys from body/query/params (NoSQL injection)
- [x] CORS restricted to an explicit origin allowlist, `credentials: true`
- [x] Passwords hashed with bcrypt; session token in an HTTPOnly/Secure/SameSite cookie
- [x] Stripe webhook signature verified against the **raw** request body
- [x] Consistent `{ message }` JSON error shape; no stack traces leaked in production

---

## Author

**Md Shariful Islam** — [GitHub](https://github.com/shariful-ire) · [LinkedIn](https://www.linkedin.com/in/shariful-ire) · [Twitter](https://x.com/shariful_ire)
