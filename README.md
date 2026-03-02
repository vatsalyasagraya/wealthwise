# WealthWise

> A personal finance platform that makes wealth-building simple, visual, and habit-forming for young Indians.

---

## Problem Statement

Young Indians (18–30) are financially aware but overwhelmed. They have SIPs on Groww, stocks on Zerodha, gold somewhere — but **no single place** that shows them the full picture. Most finance apps are either too complex or too shallow.

WealthWise bridges that gap.

---

## What It Does

WealthWise is a unified platform combining:
- **Portfolio Tracker** — Track stocks, mutual funds, ETFs, and gold in one place
- **Savings Goals** — Save toward trips, gadgets, emergency funds with visual progress
- **Smart Rebalancer** — Get suggestions to maintain your ideal asset allocation
- **Net Worth Dashboard** — See your complete financial picture at a glance

---

## App Structure

```
WealthWise
│
├── 🔐 Auth (Login / Signup)
│
├── 🏠 Dashboard
│   ├── Net worth summary
│   ├── Portfolio snapshot
│   └── Active savings goals
│
├── 📊 Portfolio Tracker
│   ├── Add investments (stocks, MF, ETF, gold)
│   ├── Asset allocation pie chart
│   ├── Performance over time
│   └── Risk level indicator
│
├── 🎯 Savings Goals
│   ├── Create goals (e.g. "Trip to Goa - ₹20,000")
│   ├── Visual progress tracking
│   └── Smart nudges
│
├── ⚖️ Rebalancer
│   └── Buy/sell suggestions to hit target allocation
│
└── 👤 Profile / Settings
```

---

## 🛠️ Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React + Vite |
| Backend / DB | Supabase |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Git
- A Supabase account

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/wealthwise.git
cd wealthwise

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase URL and anon key to .env

# Start the dev server
npm run dev
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Roadmap

- [x] Project setup (React + Vite + Supabase)
- [x] Authentication (Login / Signup)
- [ ] Dashboard — Net worth + summary cards
- [ ] Portfolio Tracker — Add & view investments
- [ ] Savings Goals — Create & track goals
- [ ] Charts & Visuals
- [ ] Smart Rebalancer
- [ ] Mobile responsive design
- [ ] Deploy to Vercel

---

## Project Structure

```
wealthwise/
├── public/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page-level components
│   ├── supabaseClient.js # Supabase initialization
│   ├── App.jsx
│   └── main.jsx
├── .env
├── index.html
└── package.json
```

---

## Contributing

This is a learning project. PRs and feedback welcome!

---

*Built with ❤️ by Vatsalya*