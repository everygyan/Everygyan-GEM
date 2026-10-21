import React, { useState } from 'react'
import {
  Webhook,
  Copy,
  Check,
  Send,
  Sparkles,
  Key,
  ShieldCheck,
  FileCode,
  Layers,
  ExternalLink,
  Code2,
  RefreshCw,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'

export const SAMPLE_N8N_WORKFLOW_JSON = {
  name: "EveryGyan Autonomous Ingest Pipeline",
  nodes: [
    {
      parameters: {
        rule: {
          interval: [{ field: "cronExpression", expression: "0 9 * * 0" }]
        }
      },
      id: "schedule-trigger-1",
      name: "Schedule Weekly Ingest",
      type: "n8n-nodes-base.scheduleTrigger",
      typeVersion: 1.2,
      position: [250, 300]
    },
    {
      parameters: {
        url: "https://news.ycombinator.com/rss",
        options: {}
      },
      id: "rss-reader-1",
      name: "Fetch Tech & Architecture RSS",
      type: "n8n-nodes-base.rssFeedRead",
      typeVersion: 1.1,
      position: [470, 300]
    },
    {
      parameters: {
        model: "gpt-4o",
        messages: {
          values: [
            {
              role: "system",
              content: "You are an executive technology editor for EveryGyan. Synthesize the provided topic into a deep-dive editorial article in GitHub Flavored Markdown. Return JSON: { title, excerpt, content, category, tags, status, metadata }."
            },
            {
              role: "user",
              content: "Title: {{$json.title}}\nLink: {{$json.link}}\nDescription: {{$json.contentSnippet}}"
            }
          ]
        },
        jsonOutput: true
      },
      id: "ai-article-generator-1",
      name: "Synthesize Article (OpenAI / Claude)",
      type: "@n8n/n8n-nodes-langchain.openAi",
      typeVersion: 1.4,
      position: [700, 300]
    },
    {
      parameters: {
        method: "POST",
        url: "https://<YOUR-SUPABASE-PROJECT-REF>.supabase.co/functions/v1/n8n-ingest",
        sendHeaders: true,
        headerParameters: {
          parameters: [
            {
              name: "x-api-key",
              value: "YOUR_N8N_INGEST_SECRET"
            },
            {
              name: "Content-Type",
              value: "application/json"
            }
          ]
        },
        sendBody: true,
        bodyParameters: {
          parameters: [
            {
              name: "title",
              value: "={{ $json.message.content.title }}"
            },
            {
              name: "category",
              value: "={{ $json.message.content.category || 'blog' }}"
            },
            {
              name: "excerpt",
              value: "={{ $json.message.content.excerpt }}"
            },
            {
              name: "content",
              value: "={{ $json.message.content.content }}"
            },
            {
              name: "tags",
              value: "={{ $json.message.content.tags }}"
            },
            {
              name: "status",
              value: "published"
            }
          ]
        },
        options: {}
      },
      id: "everygyan-http-webhook-1",
      name: "POST to EveryGyan Webhook",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [930, 300]
    }
  ],
  connections: {
    "Schedule Weekly Ingest": {
      main: [[{ node: "Fetch Tech & Architecture RSS", type: "main", index: 0 }]]
    },
    "Fetch Tech & Architecture RSS": {
      main: [[{ node: "Synthesize Article (OpenAI / Claude)", type: "main", index: 0 }]]
    },
    "Synthesize Article (OpenAI / Claude)": {
      main: [[{ node: "POST to EveryGyan Webhook", type: "main", index: 0 }]]
    }
  }
}

const PRESET_PAYLOADS = {
  blog: {
    title: "Autonomous Edge Runtimes: Modern Web Infrastructure in 2027",
    category: "blog",
    tags: ["Edge Computing", "Serverless", "Architecture", "n8n"],
    excerpt: "Why modern compute platforms are moving toward isolated V8 contexts at global points of presence.",
    cover_image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    status: "published",
    content: `## The Edge Shift

Edge isolates have fundamentally reduced cold-start penalties to sub-millisecond durations.

### Core Metrics

1. **Sub-15ms TTFB**: Worldwide latency optimization.
2. **Zero Kubernetes Overheads**: Pure serverless execution.

> Automated via EveryGyan n8n Pipeline.`,
  },
  learning: {
    title: "Tutorial: Building Resilient Webhooks with Supabase & n8n",
    category: "learning",
    tags: ["Tutorial", "n8n", "Webhooks", "TypeScript"],
    excerpt: "A hands-on module exploring idempotent webhook handlers, signature verification, and automated retries.",
    cover_image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
    status: "published",
    metadata: {
      difficulty: "Intermediate",
      moduleNumber: 3,
      totalModules: 6,
      estimatedHours: "2 Hours",
      prerequisites: ["REST APIs", "n8n basics", "JSON schemas"],
      takeaways: [
        "Implement secure x-api-key header validation",
        "Generate collision-free slug indices at runtime",
        "Handle automated rollbacks on validation failures"
      ]
    },
    content: `## Module 3: Webhook Architecture

Learn how to safely ingest content from autonomous n8n workflows into PostgreSQL.

### Step 1: Endpoint Authentication
Always verify the shared secret before processing request payloads.`,
  },
  travel: {
    title: "Field Notes: The Secluded Coastal Trails of Algarve",
    category: "travel",
    tags: ["Portugal", "Slow Travel", "Coastal", "Field Notes"],
    excerpt: "Hidden limestone caves, quiet fishing villages, and winter hiking routes along southern Portugal.",
    cover_image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
    status: "published",
    metadata: {
      location: "Algarve, Portugal",
      bestSeason: "Spring (March–May) or Autumn (Sept–Nov)",
      budgetLevel: "$$",
      duration: "5 Days",
      highlights: [
        "Seven Hanging Valleys coastal trek",
        "Fresh grilled sea bass in Ferragudo harbor",
        "Sunset cliffs at Ponta da Piedade"
      ]
    },
    content: `## Exploring the Southern Coast

Far from high-density resort zones, western Algarve preserves quiet cobblestone streets and dramatic Atlantic bluffs.

### Best Viewpoints
Check out Ponta da Piedade during evening golden hour.`,
  }
}

export const AdminIntegrations: React.FC = () => {
  const [copiedWorkflow, setCopiedWorkflow] = useState(false)
  const [copiedEndpoint, setCopiedEndpoint] = useState(false)

  // Webhook Testing Console State
  const [testMode, setTestMode] = useState<'simulated' | 'live'>('simulated')
  const [selectedPillar, setSelectedPillar] = useState<'blog' | 'learning' | 'travel'>('blog')
  const [payloadText, setPayloadText] = useState(JSON.stringify(PRESET_PAYLOADS.blog, null, 2))
  const [apiKeyInput, setApiKeyInput] = useState('everygyan_secret_key_demo')
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    status: number
    ok: boolean
    data: any
    latencyMs: number
  } | null>(null)

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
  const endpointUrl = `${supabaseUrl}/functions/v1/n8n-ingest`

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(JSON.stringify(SAMPLE_N8N_WORKFLOW_JSON, null, 2))
    setCopiedWorkflow(true)
    setTimeout(() => setCopiedWorkflow(false), 3000)
  }

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(endpointUrl)
    setCopiedEndpoint(true)
    setTimeout(() => setCopiedEndpoint(false), 3000)
  }

  const handleSelectPreset = (pillar: 'blog' | 'learning' | 'travel') => {
    setSelectedPillar(pillar)
    setPayloadText(JSON.stringify(PRESET_PAYLOADS[pillar], null, 2))
  }

  const handleRunTestWebhook = async () => {
    setIsTesting(true)
    setTestResult(null)
    const startTime = performance.now()

    try {
      const parsedBody = JSON.parse(payloadText)

      // Live Edge Function Mode
      if (testMode === 'live') {
        try {
          const res = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKeyInput,
            },
            body: JSON.stringify(parsedBody),
          })

          const data = await res.json().catch(() => ({ statusText: res.statusText }))
          const latencyMs = Math.round(performance.now() - startTime)

          setTestResult({
            status: res.status,
            ok: res.ok,
            data,
            latencyMs,
          })
          return
        } catch (fetchErr: unknown) {
          const latencyMs = Math.round(performance.now() - startTime)
          setTestResult({
            status: 503,
            ok: false,
            data: {
              error: 'Edge Function Connection Failed',
              hint: 'Deploy with: npx supabase functions deploy n8n-ingest --no-verify-jwt',
              details: (fetchErr as Error).message,
            },
            latencyMs,
          })
          return
        }
      }

      // Simulated local test for instant verification & sandbox development
      await new Promise((r) => setTimeout(r, 100))
      const latencyMs = Math.round(performance.now() - startTime)

      if (!apiKeyInput || apiKeyInput.trim().length === 0) {
        setTestResult({
          status: 401,
          ok: false,
          data: {
            error: "Unauthorized: Missing 'x-api-key' header.",
            hint: "Provide your n8n integration secret in the 'x-api-key' request header.",
          },
          latencyMs,
        })
        return
      }

      const words = (parsedBody.content || '').split(/\s+/).filter(Boolean).length
      const readingTime = Math.max(1, Math.ceil(words / 200))
      const slug = (parsedBody.title || 'untitled')
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 6)

      setTestResult({
        status: 200,
        ok: true,
        data: {
          success: true,
          message: "Article ingested successfully via n8n automation webhook.",
          post_id: `post-auto-${Date.now()}`,
          slug,
          category: parsedBody.category || 'blog',
          status: parsedBody.status || 'published',
          reading_time_minutes: readingTime,
          url: `https://everygyan.com/post/${slug}`,
          created_at: new Date().toISOString(),
        },
        latencyMs,
      })
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - startTime)
      setTestResult({
        status: 400,
        ok: false,
        data: {
          error: "Invalid JSON format in payload editor.",
          message: (err as Error).message,
        },
        latencyMs,
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="blog" size="sm" dot>
              Autonomous Pipelines
            </Badge>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold font-serif tracking-tight text-foreground">
            n8n Automation & Ingest Webhook
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-foreground-muted">
            Connect AI workflows, RSS aggregators, or custom scripts to publish directly to EveryGyan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleCopyWorkflow}
            variant="blog"
            size="sm"
            leftIcon={copiedWorkflow ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          >
            {copiedWorkflow ? 'Copied n8n Workflow JSON!' : 'Copy Sample n8n Workflow'}
          </Button>
        </div>
      </div>

      {/* Connection Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-foreground-muted uppercase tracking-wider">
            <span>Webhook Endpoint</span>
            <Webhook className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="font-mono text-xs text-foreground break-all bg-surface-subtle p-2.5 rounded-xl border border-border">
            POST /functions/v1/n8n-ingest
          </p>
          <button
            onClick={handleCopyEndpoint}
            className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            {copiedEndpoint ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            <span>Copy Full Supabase Endpoint URL</span>
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-foreground-muted uppercase tracking-wider">
            <span>Security Header</span>
            <Key className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="font-mono text-xs text-foreground bg-surface-subtle p-2.5 rounded-xl border border-border flex items-center justify-between">
            <span>x-api-key: [SECRET]</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          </div>
          <p className="text-[11px] text-foreground-muted">
            Configured in Supabase Secrets as <code className="font-bold">N8N_INGEST_SECRET</code>.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-foreground-muted uppercase tracking-wider">
            <span>Supported Pillars</span>
            <Layers className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <Badge variant="blog" size="sm">blog</Badge>
            <Badge variant="learning" size="sm">learning</Badge>
            <Badge variant="travel" size="sm">travel</Badge>
          </div>
          <p className="text-[11px] text-foreground-muted">
            Auto-calculates read time and extracts structured metadata.
          </p>
        </div>
      </div>

      {/* Interactive Webhook Testing Console */}
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-bold font-serif text-foreground">
              Interactive Webhook Testing Console
            </h2>
            <p className="text-xs text-foreground-muted mt-0.5">
              Simulate or send a live test payload to verify ingestion, schema parsing, and metadata indexing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Mode Switcher */}
            <div className="flex items-center rounded-xl border border-border bg-surface-subtle p-1 text-xs">
              <button
                type="button"
                onClick={() => setTestMode('simulated')}
                className={`rounded-lg px-2.5 py-1 font-bold transition-colors cursor-pointer ${
                  testMode === 'simulated'
                    ? 'bg-surface text-foreground shadow-xs'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                Simulated Sandbox
              </button>
              <button
                type="button"
                onClick={() => setTestMode('live')}
                className={`rounded-lg px-2.5 py-1 font-bold transition-colors cursor-pointer ${
                  testMode === 'live'
                    ? 'bg-surface text-foreground shadow-xs'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                Live Edge Function
              </button>
            </div>

            {/* Preset Buttons */}
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-subtle p-1 text-xs">
              {(['blog', 'learning', 'travel'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => handleSelectPreset(p)}
                  className={`rounded-lg px-2.5 py-1 font-bold capitalize transition-colors cursor-pointer ${
                    selectedPillar === p
                      ? 'bg-surface text-foreground shadow-xs'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  {p} Template
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payload Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5 text-indigo-500" />
                <span>JSON Request Body</span>
              </label>
              <span className="text-[11px] text-foreground-muted font-mono">
                application/json
              </span>
            </div>

            <textarea
              aria-label="JSON Request Body"
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              rows={16}
              className="w-full rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-y"
            />

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-foreground-muted mb-1">
                  x-api-key Header Value
                </label>
                <Input
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Enter API Key secret..."
                  className="font-mono text-xs"
                />
              </div>

              <div className="sm:self-end">
                <Button
                  onClick={handleRunTestWebhook}
                  disabled={isTesting}
                  variant="blog"
                  leftIcon={isTesting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                >
                  {isTesting ? 'Sending Request...' : 'Send Test Ingest'}
                </Button>
              </div>
            </div>
          </div>

          {/* Response Console */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Webhook Response Output</span>
              </label>

              {testResult && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-foreground-muted font-mono">
                    {testResult.latencyMs}ms
                  </span>
                  <Badge
                    variant={testResult.ok ? 'learning' : 'outline'}
                    size="sm"
                  >
                    {testResult.status} {testResult.ok ? 'OK' : 'Error'}
                  </Badge>
                </div>
              )}
            </div>

            <div className="h-[360px] rounded-2xl border border-border bg-background p-4 font-mono text-xs overflow-auto">
              {testResult ? (
                <pre className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-foreground-muted text-center p-6 space-y-2">
                  <Sparkles className="h-6 w-6 text-indigo-500/60" />
                  <p className="font-semibold text-xs">Ready for Webhook Simulation</p>
                  <p className="text-[11px] max-w-xs leading-relaxed">
                    Click <strong>"Send Test Ingest"</strong> to verify how EveryGyan parses, auto-slugs, and indexes incoming articles.
                  </p>
                </div>
              )}
            </div>

            {testResult?.data?.url && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
                <span className="font-medium">Ingested article published:</span>
                <a
                  href={testResult.data.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold inline-flex items-center gap-1 hover:underline text-emerald-600 dark:text-emerald-400"
                >
                  <span>View Post</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step-by-Step Connection Guide */}
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-5">
        <h2 className="text-lg font-bold font-serif text-foreground">
          How to Setup Your n8n Autonomous Workflow in 3 Steps
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-border bg-surface-subtle/50 p-5 space-y-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
              1
            </div>
            <h3 className="font-bold text-sm text-foreground">Import n8n Workflow</h3>
            <p className="text-xs text-foreground-muted leading-relaxed">
              In your n8n workspace, click <strong>"Import from Clipboard"</strong> and paste the EveryGyan sample JSON above.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface-subtle/50 p-5 space-y-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
              2
            </div>
            <h3 className="font-bold text-sm text-foreground">Configure Webhook URL</h3>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Inside the <strong>HTTP Request node</strong>, paste your Supabase Edge Function URL and set the <code className="font-bold">x-api-key</code> header.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface-subtle/50 p-5 space-y-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-white font-bold text-xs">
              3
            </div>
            <h3 className="font-bold text-sm text-foreground">Activate Autonomous Ingest</h3>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Toggle the workflow to <strong>Active</strong>. n8n will query your RSS/AI triggers on schedule and publish articles directly!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
