#!/usr/bin/env node

/**
 * Script to refresh the featured places materialized view
 * Run this periodically (e.g., every hour) to keep featured places up to date
 *
 * Usage:
 *   bun run refresh-featured
 *
 * Or add to cron:
 *   0 * * * * cd /path/to/project/web && bun run refresh-featured
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables:");
  console.error("- NEXT_PUBLIC_SUPABASE_URL");
  console.error("- SUPABASE_SECRET_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function refreshFeaturedPlaces() {
  try {
    console.log("🔄 Refreshing featured places materialized view...");

    const { error } = await supabase.rpc("refresh_featured_places");

    if (error) {
      throw error;
    }

    console.log("✅ Featured places refreshed successfully!");

    // Optional: Get count of featured places
    const { data: featuredPlaces, error: countError } = await supabase
      .from("featured_places")
      .select("id", { count: "exact" });

    if (!countError) {
      console.log(`📊 Total featured places: ${featuredPlaces?.length || 0}`);
    }
  } catch (error) {
    console.error("❌ Error refreshing featured places:", error);
    process.exit(1);
  }
}

// Run the refresh
refreshFeaturedPlaces();
