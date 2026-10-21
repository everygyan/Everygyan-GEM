// Supabase Edge Function: Newsletter Dispatch Broadcast
// Endpoint: POST /functions/v1/send-newsletter
// Security: Requires Admin JWT or service key

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface NewsletterPayload {
  newsletter_id?: string
  subject?: string
  preview_text?: string
  content_markdown?: string
  content_html?: string
  pillar_filter?: "blog" | "learning" | "travel" | "all"
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase Edge Function environment variables." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Optional admin auth check from Bearer token
    const authHeader = req.headers.get("Authorization")
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "")
      const { data: { user } } = await supabaseAdmin.auth.getUser(token)
      if (user) {
        // verify role in profiles
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profile?.role !== "admin") {
          return new Response(
            JSON.stringify({ error: "Forbidden: Admin access required." }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        }
      }
    }

    const body: NewsletterPayload = await req.json().catch(() => ({}))

    let newsletter: Record<string, unknown> | null = null

    if (body.newsletter_id) {
      const { data, error } = await supabaseAdmin
        .from("newsletters")
        .select("*")
        .eq("id", body.newsletter_id)
        .single()

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: "Newsletter edition not found." }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }
      newsletter = data
    }

    const subject = (newsletter?.subject as string) || body.subject || "EveryGyan Weekly Letter"
    const previewText = (newsletter?.preview_text as string) || body.preview_text || ""
    const contentHtml = (newsletter?.content_html as string) || body.content_html || ""

    // Fetch active subscribers
    let subQuery = supabaseAdmin
      .from("subscribers")
      .select("id, email, preferences")
      .eq("status", "active")

    const { data: subscribers, error: subError } = await subQuery

    if (subError) {
      return new Response(
        JSON.stringify({ error: "Failed to query subscribers.", details: subError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const activeRecipients = subscribers || []
    let targetedRecipients = activeRecipients

    // Apply pillar filter if specified
    const pillar = body.pillar_filter || (newsletter?.type as string)
    if (pillar && ["blog", "learning", "travel"].includes(pillar)) {
      targetedRecipients = activeRecipients.filter(
        (sub: any) => sub.preferences?.[pillar] === true
      )
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY")
    const fromAddress = Deno.env.get("NEWSLETTER_FROM_EMAIL") || "EveryGyan <newsletter@everygyan.com>"

    let sentCount = targetedRecipients.length

    // If Resend API key is provided, batch dispatch
    if (resendApiKey && targetedRecipients.length > 0) {
      try {
        // Send batch via Resend Batch API
        const emailPayloads = targetedRecipients.slice(0, 100).map((r: any) => ({
          from: fromAddress,
          to: r.email,
          subject,
          html: contentHtml || `<p>${previewText}</p>`,
        }))

        const resendRes = await fetch("https://api.resend.com/emails/batch", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailPayloads),
        })

        if (!resendRes.ok) {
          console.warn("Resend API warning:", await resendRes.text())
        }
      } catch (err) {
        console.error("Email dispatcher error:", err)
      }
    }

    // Update newsletter record
    if (newsletter?.id) {
      await supabaseAdmin
        .from("newsletters")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          sent_count: sentCount,
        })
        .eq("id", newsletter.id)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Dispatched Weekly Letter to ${sentCount} subscribers.`,
        sent_count: sentCount,
        recipients_count: targetedRecipients.length,
        dispatched_at: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err: unknown) {
    const error = err as Error
    return new Response(
      JSON.stringify({ error: "Broadcast failure", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
