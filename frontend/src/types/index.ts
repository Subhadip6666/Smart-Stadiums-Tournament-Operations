// ═══════════════════════════════════════════════════════════════
// StadiumAI NOC — Core TypeScript Types
// Mirrors backend Pydantic schemas for full type safety
// ═══════════════════════════════════════════════════════════════

// ── Crowd Monitoring ──────────────────────────────────────────

export type DensityBucket = 'low' | 'moderate' | 'high' | 'critical';

export interface Zone {
  zone_id: string;
  name: string;
  density_bucket: DensityBucket;
  capacity_pct?: number;
  x: number;
  y: number;
  updated_at?: string;
}

export interface CrowdUpdate {
  zones: Zone[];
  timestamp: string;
}

export const DENSITY_ORDER: Record<DensityBucket, number> = {
  low: 0,
  moderate: 1,
  high: 2,
  critical: 3,
};

export const DENSITY_COLORS: Record<DensityBucket, { bg: string; text: string; fill: string; stroke: string }> = {
  low: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', fill: '#22c55e', stroke: '#4ade80' },
  moderate: { bg: 'bg-amber-500/15', text: 'text-amber-400', fill: '#f59e0b', stroke: '#fbbf24' },
  high: { bg: 'bg-orange-500/15', text: 'text-orange-400', fill: '#f97316', stroke: '#fb923c' },
  critical: { bg: 'bg-red-500/15', text: 'text-red-400', fill: '#ef4444', stroke: '#f87171' },
};

// ── Incidents ─────────────────────────────────────────────────

export type IncidentSeverity = 'critical' | 'high' | 'moderate' | 'low';
export type IncidentType = 'MEDICAL' | 'CROWD' | 'SECURITY' | 'FACILITY';
export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'escalated';

export interface TriageRecommendation {
  recommended_severity: number;
  reasoning: string;
  recommended_playbook: string;
  nearest_teams: TeamAssignment[];
}

export interface TeamAssignment {
  team_id: string;
  name: string;
  eta_seconds: number;
  zone: string;
}

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  description?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  zone_id: string;
  triage?: TriageRecommendation;
  created_at: string;
  updated_at?: string;
  reporter_role?: string;
}

export interface IncidentCreateRequest {
  type: string;
  severity: number;
  description: string;
  zone_id: string;
  stadium_id: string;
  reporter_role: string;
}

// ── Chat ──────────────────────────────────────────────────────

export type SupportedLanguage =
  | 'en' | 'es' | 'ar' | 'fr' | 'de'
  | 'it' | 'pt' | 'zh' | 'ja' | 'ko' | 'ru' | 'hi';

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  ar: 'العربية',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ru: 'Русский',
  hi: 'हिन्दी',
};

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  language: SupportedLanguage;
  timestamp: string;
  confidence?: number;
  sources?: string[];
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface ChatRequest {
  session_id: string;
  message: string;
  language: SupportedLanguage;
}

export interface ChatResponse {
  session_id: string;
  reply: string;
  language: string;
  suggested_actions?: { type: string; label: string; endpoint: string }[];
  confidence: number;
  sources: string[];
}

// ── Navigation ────────────────────────────────────────────────

export type NavigationMode = 'shortest' | 'accessible' | 'eco_transit';

export interface RouteSegment {
  id: string;
  name: string;
  type: string;
}

export interface RouteResult {
  route_id: string;
  mode: string;
  segments: RouteSegment[];
  total_walk_time_s: number;
}

export interface StadiumLocation {
  id: string;
  name: string;
  type: 'gate' | 'zone' | 'facility' | 'exit';
  is_accessible?: boolean;
}

// ── API Responses ─────────────────────────────────────────────

export interface StandardResponse<T = unknown> {
  data: T;
  meta?: Record<string, string>;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    reference_id?: string;
    details?: string[];
  };
}

// ── System Status ─────────────────────────────────────────────

export type SystemStatus = 'operational' | 'degraded' | 'critical';

export interface HealthStatus {
  status: string;
  dependencies: {
    neo4j: string;
    redis?: string;
    gemini?: string;
  };
}

// ── Match Info ─────────────────────────────────────────────────

export interface MatchInfo {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  elapsed_minutes: number;
  phase: 'pre_match' | 'first_half' | 'half_time' | 'second_half' | 'full_time';
  stadium: string;
  attendance: number;
  capacity: number;
}