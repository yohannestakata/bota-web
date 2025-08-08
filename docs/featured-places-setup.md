# Featured Places Automatic Refresh Setup

This document explains how to set up automatic refresh of the featured places materialized view in production.

## 🎯 Overview

The featured places system uses a materialized view with a hybrid scoring algorithm that combines:

- **40%** Rating score
- **30%** Review count score
- **20%** Recency score (recent activity)
- **10%** Photo score (visual content)

## 🔄 Automatic Refresh

### GitHub Actions Setup

1. **Add Repository Secrets**

   Go to your GitHub repository → Settings → Secrets and variables → Actions

   Add these secrets:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SECRET_KEY=your_service_role_key_here
   ```

2. **Get Service Role Key**

   In your Supabase dashboard:

   - Go to Settings → API
   - Copy the "service_role" key (not the anon key)
   - This key has elevated permissions to refresh materialized views

3. **Workflow Activation**

   The workflow (`.github/workflows/refresh-featured-places.yml`) will:

   - Run automatically every hour
   - Can be triggered manually via GitHub UI
   - Log success/failure status

### Manual Refresh

You can also refresh manually:

```bash
# Local development
cd web
npm run refresh-featured

# Or directly
node scripts/refresh-featured-places.js
```

### Alternative Cron Services

If you prefer not to use GitHub Actions:

#### Vercel Cron Jobs

```typescript
// api/cron/refresh-featured.ts
export default async function handler(req, res) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  await supabase.rpc("refresh_featured_places");
  res.status(200).json({ message: "Refreshed" });
}
```

#### Railway Cron Jobs

```json
// railway.json
{
  "cron": {
    "refresh-featured": {
      "schedule": "0 * * * *",
      "command": "npm run refresh-featured"
    }
  }
}
```

#### External Services

- **Cron-job.org** (free tier)
- **EasyCron** (free tier)
- **SetCronJob** (free tier)

## 📊 Monitoring

### Check Refresh Status

```sql
-- Check when the view was last refreshed
SELECT schemaname, matviewname, last_vacuum, last_autovacuum
FROM pg_stat_user_tables
WHERE schemaname = 'public' AND tablename = 'featured_places';
```

### View Featured Places

```sql
-- See current featured places with scores
SELECT
  name,
  average_rating,
  review_count,
  featured_score,
  last_reviewed_at
FROM featured_places
ORDER BY featured_score DESC
LIMIT 10;
```

## 🔧 Troubleshooting

### Common Issues

1. **Permission Denied**

   - Ensure you're using the `service_role` key, not `anon` key
   - Check that the function has `SECURITY DEFINER`

2. **No Featured Places**

   - Verify places have 2+ reviews (minimum requirement)
   - Check that places are `is_active = true`

3. **Scores Not Updating**
   - Materialized views don't auto-refresh
   - Run the refresh function manually or check cron job

### Debug Commands

```bash
# Test the refresh function
psql $DATABASE_URL -c "SELECT refresh_featured_places();"

# Check featured places count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM featured_places;"

# View scoring breakdown
psql $DATABASE_URL -c "
SELECT
  name,
  average_rating,
  review_count,
  featured_score,
  (average_rating * 0.4) as rating_score,
  (LEAST(review_count / 10.0, 1.0) * 0.3) as popularity_score
FROM featured_places
ORDER BY featured_score DESC
LIMIT 5;
"
```

## 🚀 Performance

- **Query Time**: ~1-5ms (pre-calculated)
- **Refresh Time**: ~100-500ms (depends on data size)
- **Storage**: Minimal (just the view, no duplicate data)
- **Scalability**: Works with millions of places

## 📈 Optimization

### For Large Datasets

```sql
-- Add more indexes if needed
CREATE INDEX CONCURRENTLY featured_places_category_idx
ON featured_places(category_id);

CREATE INDEX CONCURRENTLY featured_places_city_idx
ON featured_places(city);
```

### Refresh Frequency

- **Hourly**: Good for most apps
- **Every 15 minutes**: For high-traffic apps
- **Daily**: For low-traffic apps

Adjust the cron schedule in `.github/workflows/refresh-featured-places.yml` as needed.
