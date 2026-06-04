# Trade Journal Pro

Modern trading journal application built with Next.js, Supabase, and Capacitor.

## Features

- **Trade Logging**: Record and track all your trades with detailed information
- **Analytics**: Deep dive into your trading performance with statistics and charts
- **Dashboard**: Quick overview of your trading metrics
- **Settings**: Manage master data (pairs, setups, mistakes, etc.)
- **Mobile Ready**: Can be built as a mobile APK using Capacitor
- **Dark Mode**: Clean, modern dark UI by default
- **Authentication**: Secure authentication with Supabase Auth

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Charts**: Recharts
- **Mobile**: Capacitor
- **Hosting**: Vercel

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project settings.

### 3. Database Setup

Run the SQL migration in your Supabase SQL Editor:

```sql
-- Copy the contents from src/lib/supabase/schema.sql
-- and run it in your Supabase SQL Editor
```

This will create:
- `trades` table with RLS policies
- Master data tables (pairs, trade_setups, mistakes, btc_contexts, oi_conditions, funding_conditions)
- Default data for master data tables

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## Mobile App Setup (Capacitor)

### 1. Initialize Capacitor

```bash
npm install @capacitor/cli @capacitor/core @capacitor/android @capacitor/ios
npx cap init
```

### 2. Build the App

```bash
npm run build
```

### 3. Sync with Capacitor

```bash
npx cap sync
```

### 4. Open in Android Studio / Xcode

```bash
npx cap open android
# or
npx cap open ios
```

### 5. Run on Device/Emulator

```bash
npx cap run android
# or
npx cap run ios
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # Dashboard page
│   ├── trades/             # Trade log and add trade
│   ├── analytics/          # Analytics page
│   ├── settings/           # Settings page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (redirects to dashboard)
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # Shadcn UI components
│   └── navigation.tsx      # Navigation component
├── lib/
│   ├── supabase/          # Supabase client and schema
│   └── utils.ts           # Utility functions
└── types/                 # TypeScript types
```

## Database Schema

### trades table
- id (UUID, primary key)
- user_id (UUID, foreign key to auth.users)
- trade_date (DATE)
- pair (TEXT)
- direction (TEXT: 'Long' | 'Short')
- setup (TEXT)
- btc_context (TEXT)
- oi (TEXT)
- funding (TEXT)
- trigger (TEXT)
- margin (NUMERIC)
- leverage (INTEGER)
- rr (NUMERIC)
- risk_percent (NUMERIC)
- result_percent (NUMERIC)
- result_usdt (NUMERIC)
- plan_followed (BOOLEAN)
- mistake (TEXT, nullable)
- notes (TEXT, nullable)
- before_entry_screenshot (TEXT, nullable)
- after_exit_screenshot (TEXT, nullable)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

### Master Data Tables
- pairs
- trade_setups
- mistakes
- btc_contexts
- oi_conditions
- funding_conditions

## Business Logic

- **Win Trade**: result_percent > 0
- **Loss Trade**: result_percent < 0
- **Break Even**: result_percent = 0
- **Result USDT**: margin * (result_percent / 100)
- **Win Rate**: wins / total_trades * 100
- **Profit Factor**: gross_profit / gross_loss

## Authentication

The app uses Supabase Auth with Row Level Security (RLS) to ensure users can only access their own data.

### RLS Policies
- Users can only view their own trades
- Users can only insert their own trades
- Users can only update their own trades
- Users can only delete their own trades
- Master data tables are read-only for all authenticated users

## Deployment

### Vercel (Web)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Google Play Store / App Store

1. Build the APK/IPA using Capacitor
2. Follow platform-specific submission guidelines
3. Submit to app stores

## License

MIT
