// Supabase Edge Function: n8n Automation Ingest
// Endpoint: POST /functions/v1/n8n-ingest
// Security: Requires valid 'x-api-key' header

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface IngestPayload {
  title: string
  slug?: string
  excerpt?: string
  content: string
  category: "blog" | "learning" | "travel"
  tags?: string[]
  cover_image?: string
  metadata?: Record<string, unknown>
  status?: "draft" | "published" | "archived"
  featured?: boolean
  author_id?: string
}

serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  // 2. Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Please use POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }

  try {
    // 3. Security Verification via x-api-key header
    const apiKey = req.headers.get("x-api-key")
    const envSecret = Deno.env.get("N8N_INGEST_SECRET") || Deno.env.get("API_SECRET_KEY")

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized: Missing 'x-api-key' header.",
          hint: "Provide your n8n integration secret in the 'x-api-key' request header.",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (envSecret && apiKey !== envSecret) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized: Invalid 'x-api-key'.",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 4. Parse & Validate Payload
    const body: IngestPayload = await req.json()

    if (!body.title || !body.title.trim()) {
      return new Response(
        JSON.stringify({ error: "Missing required field: 'title'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (!body.content || !body.content.trim()) {
      return new Response(
        JSON.stringify({ error: "Missing required field: 'content'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 5. Sanitize & Normalize Inputs
    const title = body.title.trim()
    const content = body.content.trim()

    // Auto-generate clean slug if not explicitly provided
    let slug = body.slug?.trim().toLowerCase()
    if (!slug) {
      const baseSlug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 80)
      const uniqueSuffix = Math.random().toString(36).substring(2, 7)
      slug = `${baseSlug}-${uniqueSuffix}`
    } else {
      slug = slug.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
    }

    // Category fallback
    const validCategories = ["blog", "learning", "travel"]
    const category = validCategories.includes(body.category) ? body.category : "blog"

    // Reading time calculation (standard 200 wpm)
    const words = content.split(/\s+/).filter(Boolean).length
    const readingTimeMinutes = Math.max(1, Math.ceil(words / 200))

    // Excerpt fallback
    const excerpt = body.excerpt?.trim() || content.replace(/^[#*`\s-]+/gm, "").slice(0, 160) + "..."

    // Status
    const status = body.status === "draft" ? "draft" : "published"
    const publishedAt = status === "published" ? new Date().toISOString() : null

    // 6. Connect to Supabase using Admin Service Role
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({
          error: "Edge Function configuration missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // 7. Upsert post into public.posts
    const postRecord = {
      title,
      slug,
      excerpt,
      content,
      category,
      tags: Array.isArray(body.tags) ? body.tags : ["Automated", "n8n"],
      reading_time_minutes: readingTimeMinutes,
      cover_image: body.cover_image || null,
      metadata: body.metadata || {},
      status,
      featured: Boolean(body.featured),
      published_at: publishedAt,
      author_id: body.author_id || null,
      updated_at: new Date().toISOString(),
    }

    const { data: insertedPost, error: dbError } = await supabaseAdmin
      .from("posts")
      .upsert(postRecord, { onConflict: "slug" })
      .select("id, slug, title, category, status, published_at, created_at")
      .single()

    if (dbError) {
      return new Response(
        JSON.stringify({ error: "Database upsert failed", details: dbError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 8. Return Success Response
    const baseUrl = Deno.env.get("SITE_URL") || "https://everygyan.com"
    const articleUrl = `${baseUrl}/post/${insertedPost.slug}`

    return new Response(
      JSON.stringify({
        success: true,
        message: "Article ingested successfully via n8n automation webhook.",
        post_id: insertedPost.id,
        slug: insertedPost.slug,
        category: insertedPost.category,
        status: insertedPost.status,
        reading_time_minutes: readingTimeMinutes,
        url: articleUrl,
        created_at: insertedPost.created_at,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err: unknown) {
    const error = err as Error
    return new Response(
      JSON.stringify({ error: "Internal processing error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
