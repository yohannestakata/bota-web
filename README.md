# Bota Review

A platform for discovering and reviewing the best restaurants, cafes, and places to shop in Ethiopia. Built with modern web technologies for a seamless user experience.

**Live Site**: [https://botareview.com](https://botareview.com)

## Features

- 🍽️ **Place Discovery**: Browse restaurants, cafes, and shops across Ethiopia
- ⭐ **Reviews & Ratings**: Read and write reviews with star ratings
- 📸 **Photo Sharing**: Upload and view photos of places
- 🔍 **Advanced Search**: Search places by name, category, location, and more
- 👤 **User Profiles**: Create profiles to track your reviews and favorites
- ❤️ **Favorites**: Save your favorite places for quick access
- 📍 **Location-based**: Filter places by location (GPS coordinates)
- 🗺️ **Interactive Maps**: View places on maps using Leaflet
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: [Supabase](https://supabase.com)
- **Authentication**: Supabase Auth
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Maps**: Leaflet + React Leaflet
- **Analytics**: PostHog
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Package Manager**: pnpm (see `package.json`)

## Getting Started

### Prerequisites

- Node.js 20+ 
- pnpm 9.15.4+ (or your preferred package manager)
- Supabase account and project
- (Optional) Cloudinary account for media uploads

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bota-web
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# PostHog (optional, for analytics)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Cloudinary (optional, for media uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the production application
- `pnpm start` - Start the production server (after building)
- `pnpm lint` - Run ESLint to check for code issues
- `pnpm refresh-featured` - Refresh featured places data

## Project Structure

```
bota-web/
├── src/
│   ├── app/              # Next.js App Router pages and routes
│   │   ├── (auth)/       # Authentication pages
│   │   ├── account/      # User account pages
│   │   ├── api/          # API routes
│   │   ├── place/        # Place detail pages
│   │   └── ...
│   ├── components/       # Reusable React components
│   │   ├── layout/       # Layout components (header, footer)
│   │   ├── ui/           # UI primitives
│   │   └── ...
│   ├── features/         # Feature-based components
│   │   ├── home/         # Home page features
│   │   ├── place/        # Place-related features
│   │   ├── reviews/      # Review features
│   │   └── ...
│   ├── lib/              # Utility libraries
│   │   ├── supabase/     # Supabase client and queries
│   │   └── ...
│   └── hooks/            # Custom React hooks
├── public/               # Static assets
├── scripts/              # Utility scripts
└── docs/                 # Documentation
```

## Environment Variables

### Required

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)

### Optional

- `NEXT_PUBLIC_APP_URL` - Base URL of the application (default: `https://botareview.com` for production)
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog analytics key
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog instance host
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

## Deployment

This project is configured for deployment on Netlify. The `netlify.toml` file contains the deployment configuration.

### Production Environment

- Set `NEXT_PUBLIC_APP_URL` to `https://botareview.com` in production
- Ensure all environment variables are configured in your deployment platform
- Supabase keys should be set server-side for security

## Key Features Implementation

- **Authentication**: Supabase Auth with Google OAuth support
- **Image Handling**: Supabase Storage with Next.js Image Optimization
- **Search**: Server-side search with filtering and location-based queries
- **Reviews**: User-generated content with reactions and moderation
- **Analytics**: PostHog integration for user behavior tracking
- **SEO**: Optimized metadata, Open Graph, and structured data

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Supabase Documentation](https://supabase.com/docs) - Learn about Supabase features
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Learn about Tailwind CSS

## License

Private project - All rights reserved.
