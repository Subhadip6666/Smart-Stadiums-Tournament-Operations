// ═══════════════════════════════════════════════════════════════
// StadiumAI NOC — API Service Layer
// Typed HTTP client with SSE support and mock fallbacks
// ═══════════════════════════════════════════════════════════════

import type {
  StandardResponse,
  ChatRequest,
  ChatResponse,
  RouteResult,
  Zone,
  IncidentCreateRequest,
  HealthStatus,
  NavigationMode,
  Incident,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── HTTP Client ───────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  token?: string | null
): Promise<StandardResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── API Endpoints ─────────────────────────────────────────────

export const api = {
  // Health
  health: () => request<{ status: string }>('GET', '/health'),
  ready: () => request<HealthStatus>('GET', '/ready'),

  // Crowd
  getZoneDensity: (zoneId: string, token?: string | null) =>
    request<Zone>('GET', `/v1/crowd/zone/${zoneId}`, undefined, token),

  // Navigation
  getRoute: (from: string, to: string, stadiumId: string, mode: NavigationMode = 'shortest', token?: string | null) =>
    request<RouteResult>(
      'GET',
      `/v1/navigate/route?from_id=${encodeURIComponent(from)}&to_id=${encodeURIComponent(to)}&stadium_id=${encodeURIComponent(stadiumId)}&mode=${mode}`,
      undefined,
      token
    ),

  // Chat
  sendMessage: (data: ChatRequest, token?: string | null) =>
    request<ChatResponse>('POST', '/v1/chat/message', data, token),

  // Incidents
  createIncident: (data: IncidentCreateRequest, token?: string | null) =>
    request<unknown>('POST', '/v1/incidents', data, token),
};

// ── SSE Connection Factory ────────────────────────────────────

export interface SSEOptions {
  onMessage: (data: unknown) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
}

export function connectSSE(path: string, options: SSEOptions): () => void {
  const url = `${API_BASE}${path}`;
  let eventSource: EventSource | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let retryCount = 0;
  const maxRetries = 5;

  function connect() {
    eventSource = new EventSource(url);

    eventSource.onopen = () => {
      retryCount = 0;
      options.onOpen?.();
    };

    eventSource.addEventListener('density_update', (event) => {
      try {
        const data = JSON.parse(event.data);
        options.onMessage(data);
      } catch {
        // Malformed data, skip
      }
    });

    eventSource.onerror = (error) => {
      options.onError?.(error);
      eventSource?.close();

      if (retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        retryCount++;
        reconnectTimeout = setTimeout(connect, delay);
      }
    };
  }

  connect();

  // Return cleanup function
  return () => {
    eventSource?.close();
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
  };
}

// ── Mock Data Generators (for frontend-only demo) ─────────────

const MOCK_ZONES: Zone[] = [
  { zone_id: 'Z-CONC-N', name: 'North Concourse', density_bucket: 'low', x: 400, y: 120 },
  { zone_id: 'Z-GATE-E', name: 'East Gate (Main)', density_bucket: 'moderate', x: 680, y: 300 },
  { zone_id: 'Z-PLAZ-E', name: 'East Plaza', density_bucket: 'high', x: 630, y: 420 },
  { zone_id: 'Z-VIP-S', name: 'South VIP Lounge', density_bucket: 'low', x: 350, y: 480 },
  { zone_id: 'Z-ESC-S', name: 'South Escalators', density_bucket: 'critical', x: 450, y: 475 },
  { zone_id: 'Z-SEAT-W1', name: 'West Seating Tier 1', density_bucket: 'critical', x: 120, y: 300 },
  { zone_id: 'Z-CONC-W', name: 'West Concourse A', density_bucket: 'high', x: 150, y: 230 },
  { zone_id: 'Z-CORN-NW', name: 'NW Corner Access', density_bucket: 'moderate', x: 200, y: 170 },
  { zone_id: 'Z-CORN-NE', name: 'NE Corner Access', density_bucket: 'low', x: 600, y: 170 },
  { zone_id: 'Z-FOOD-N', name: 'North Food Court', density_bucket: 'high', x: 340, y: 100 },
  { zone_id: 'Z-MERC', name: 'Merchandise Hall', density_bucket: 'moderate', x: 500, y: 100 },
  { zone_id: 'Z-MED-1', name: 'Medical Station 1', density_bucket: 'low', x: 700, y: 200 },
];

const DENSITY_BUCKETS: Zone['density_bucket'][] = ['low', 'moderate', 'high', 'critical'];

export function getMockZones(): Zone[] {
  return MOCK_ZONES.map((z) => ({
    ...z,
    density_bucket: DENSITY_BUCKETS[Math.floor(Math.random() * 100) < 15 ? 3 : Math.floor(Math.random() * 100) < 35 ? 2 : Math.floor(Math.random() * 100) < 60 ? 1 : 0],
  }));
}

export function getStaticMockZones(): Zone[] {
  return [...MOCK_ZONES];
}

const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-001',
    type: 'MEDICAL',
    title: 'Fan collapsed near Section 204',
    description: 'Male, approximately 45, showing signs of heat exhaustion. Unresponsive.',
    severity: 'critical',
    status: 'open',
    zone_id: 'Z-SEAT-W1',
    triage: {
      recommended_severity: 5,
      reasoning: 'Heat stroke indicators in high-density zone. Immediate medical response required.',
      recommended_playbook: 'PB-HEAT-STROKE',
      nearest_teams: [{ team_id: 'MT-07', name: 'Medical Team 7', eta_seconds: 95, zone: 'Z-CONC-W' }],
    },
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-002',
    type: 'CROWD',
    title: 'Dense bottleneck forming at East Gate',
    description: 'Crowd density exceeding safe threshold. Incoming fans backed up to parking area.',
    severity: 'high',
    status: 'open',
    zone_id: 'Z-GATE-E',
    triage: {
      recommended_severity: 4,
      reasoning: 'Gate E density at 94%. Risk of crowd crush if not mitigated within 5 minutes.',
      recommended_playbook: 'PB-CROWD-SURGE',
      nearest_teams: [
        { team_id: 'ST-02', name: 'Security Team 2', eta_seconds: 45, zone: 'Z-PLAZ-E' },
        { team_id: 'ST-05', name: 'Security Team 5', eta_seconds: 120, zone: 'Z-CORN-NE' },
      ],
    },
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-003',
    type: 'FACILITY',
    title: 'Spill reported in Concourse B',
    description: 'Large liquid spill near food vendors. Slip hazard.',
    severity: 'low',
    status: 'in_progress',
    zone_id: 'Z-CONC-W',
    triage: {
      recommended_severity: 2,
      reasoning: 'Non-critical facility issue. Janitorial staff dispatched.',
      recommended_playbook: 'PB-FACILITY-CLEAN',
      nearest_teams: [{ team_id: 'JT-03', name: 'Janitorial Team 3', eta_seconds: 180, zone: 'Z-FOOD-N' }],
    },
    created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-004',
    type: 'SECURITY',
    title: 'Lost child at Info Desk 3',
    description: 'Girl, age ~6, wearing Brazil jersey. Separated from parents near East Plaza.',
    severity: 'moderate',
    status: 'open',
    zone_id: 'Z-PLAZ-E',
    triage: {
      recommended_severity: 3,
      reasoning: 'Lost child protocol activated. Security team dispatched. PA announcement queued.',
      recommended_playbook: 'PB-LOST-CHILD',
      nearest_teams: [{ team_id: 'ST-02', name: 'Security Team 2', eta_seconds: 60, zone: 'Z-PLAZ-E' }],
    },
    created_at: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-005',
    type: 'CROWD',
    title: 'South Escalators over capacity',
    description: 'Escalator bank at capacity. Queue building in south concourse.',
    severity: 'critical',
    status: 'open',
    zone_id: 'Z-ESC-S',
    triage: {
      recommended_severity: 5,
      reasoning: 'Escalator zone at critical density. Recommend halting escalator entry and rerouting to stairs.',
      recommended_playbook: 'PB-CROWD-SURGE',
      nearest_teams: [
        { team_id: 'ST-08', name: 'Security Team 8', eta_seconds: 30, zone: 'Z-VIP-S' },
      ],
    },
    created_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-006',
    type: 'MEDICAL',
    title: 'Minor injury — scrape on knee',
    description: 'Fan tripped on stairs. Minor abrasion. Conscious and alert.',
    severity: 'low',
    status: 'resolved',
    zone_id: 'Z-CORN-NW',
    triage: {
      recommended_severity: 1,
      reasoning: 'Minor first-aid case. Directed to nearest First Aid Station.',
      recommended_playbook: 'PB-FIRST-AID',
      nearest_teams: [{ team_id: 'MT-02', name: 'Medical Team 2', eta_seconds: 200, zone: 'Z-MED-1' }],
    },
    created_at: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
  },
];

export function getMockIncidents(): Incident[] {
  return [...MOCK_INCIDENTS];
}

const MOCK_LOCATIONS: { id: string; name: string; type: string }[] = [
  { id: 'GATE-N', name: 'North Gate', type: 'gate' },
  { id: 'GATE-E', name: 'East Gate (Main)', type: 'gate' },
  { id: 'GATE-S', name: 'South Gate', type: 'gate' },
  { id: 'GATE-W', name: 'West Gate', type: 'gate' },
  { id: 'Z-CONC-N', name: 'North Concourse', type: 'zone' },
  { id: 'Z-CONC-W', name: 'West Concourse A', type: 'zone' },
  { id: 'Z-PLAZ-E', name: 'East Plaza', type: 'zone' },
  { id: 'Z-VIP-S', name: 'South VIP Lounge', type: 'zone' },
  { id: 'Z-FOOD-N', name: 'North Food Court', type: 'zone' },
  { id: 'Z-MERC', name: 'Merchandise Hall', type: 'zone' },
  { id: 'Z-MED-1', name: 'Medical Station 1', type: 'facility' },
  { id: 'Z-SEAT-W1', name: 'West Seating Tier 1', type: 'zone' },
  { id: 'Z-ESC-S', name: 'South Escalators', type: 'zone' },
  { id: 'EXIT-N', name: 'North Exit', type: 'exit' },
  { id: 'EXIT-E', name: 'East Exit', type: 'exit' },
];

export function getMockLocations() {
  return MOCK_LOCATIONS;
}

export function getMockRoute(fromId: string, toId: string, mode: NavigationMode): RouteResult {
  const from = MOCK_LOCATIONS.find((l) => l.id === fromId) || MOCK_LOCATIONS[0];
  const to = MOCK_LOCATIONS.find((l) => l.id === toId) || MOCK_LOCATIONS[1];

  const intermediates = MOCK_LOCATIONS
    .filter((l) => l.id !== fromId && l.id !== toId)
    .slice(0, 2 + Math.floor(Math.random() * 2));

  return {
    route_id: `rt-${fromId}-${toId}`,
    mode,
    segments: [
      { id: from.id, name: from.name, type: from.type },
      ...intermediates.map((l) => ({ id: l.id, name: l.name, type: l.type })),
      { id: to.id, name: to.name, type: to.type },
    ],
    total_walk_time_s: 120 + Math.floor(Math.random() * 240),
  };
}

const AI_RESPONSES: Record<string, string> = {
  en: "The nearest restroom is located at North Concourse, Section 108. It's about a 2-minute walk from your current location. Follow the signs marked 'Facilities' on your right.",
  es: "El baño más cercano está en el Pasillo Norte, Sección 108. Está a unos 2 minutos caminando desde su ubicación actual. Siga las señales marcadas 'Instalaciones' a su derecha.",
  fr: "Les toilettes les plus proches se trouvent au Couloir Nord, Section 108. C'est environ 2 minutes à pied de votre position actuelle.",
  ar: "أقرب دورة مياه تقع في الممر الشمالي، القسم 108. على بعد حوالي دقيقتين سيرًا على الأقدام من موقعك الحالي.",
  de: "Die nächste Toilette befindet sich im Nordkorridor, Abschnitt 108. Es sind etwa 2 Gehminuten von Ihrem aktuellen Standort.",
  hi: "निकटतम शौचालय उत्तरी गलियारे, सेक्शन 108 में स्थित है। यह आपके वर्तमान स्थान से लगभग 2 मिनट की पैदल दूरी पर है।",
  zh: "最近的洗手间位于北走廊108区。距离您当前位置步行约2分钟。",
  ja: "最寄りのトイレはノースコンコース、セクション108にあります。現在地から徒歩約2分です。",
  ko: "가장 가까운 화장실은 북쪽 복도 108구역에 있습니다. 현재 위치에서 도보로 약 2분 거리입니다.",
  pt: "O banheiro mais próximo está localizado no Corredor Norte, Seção 108. Fica a cerca de 2 minutos a pé da sua localização atual.",
  it: "Il bagno più vicino si trova nel Corridoio Nord, Sezione 108. Dista circa 2 minuti a piedi dalla vostra posizione attuale.",
  ru: "Ближайший туалет находится в Северном коридоре, секция 108. Это примерно 2 минуты ходьбы от вашего текущего местоположения.",
};

export function getMockChatResponse(message: string, language: string): ChatResponse {
  return {
    session_id: 'demo-session',
    reply: AI_RESPONSES[language] || AI_RESPONSES['en'],
    language,
    confidence: 0.92,
    sources: ['gemini-2.5-flash'],
    suggested_actions: [
      { type: 'navigate', label: 'Get Directions', endpoint: '/v1/navigate/route' },
      { type: 'info', label: 'View Map', endpoint: '/v1/crowd/heatmap' },
    ],
  };
}