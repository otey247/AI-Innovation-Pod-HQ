import { useState, useMemo, type Dispatch, type SetStateAction } from 'react'
import {
  Users,
  Search,
  Plus,
  Star,
  MapPin,
  Briefcase,
  Award,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
} from 'lucide-react'
import {
  CONSULTANTS,
  ALL_SKILLS,
  ALL_INDUSTRIES,
  ALL_PLATFORMS,
  type Consultant,
  type SkillLevel,
} from '../data/mockData'

const SKILL_SCORE: Record<SkillLevel, number> = {
  Expert: 4,
  Proficient: 3,
  Beginner: 2,
  None: 0,
}

// ── Types ─────────────────────────────────────────────────────────────

interface OpportunityNeed {
  id: string
  title: string
  client: string
  industry: string
  platform: string
  durationWeeks: number
  travelRequired: string
  requiredSkills: string[]
  niceToHaveSkills: string[]
  description: string
}

// ── Matching logic ────────────────────────────────────────────────────

interface MatchResult {
  consultant: Consultant
  score: number           // 0-100
  reasons: string[]
  cautions: string[]
  skillBreakdown: { skill: string; level: SkillLevel; required: boolean }[]
}

function computeMatch(need: OpportunityNeed, consultant: Consultant): MatchResult {
  const reasons: string[] = []
  const cautions: string[] = []
  let score = 0

  // Required skills (60 pts max)
  const reqSkillWeight = need.requiredSkills.length > 0 ? 60 / need.requiredSkills.length : 0
  need.requiredSkills.forEach((s) => {
    const level = (consultant.skills[s] ?? 'None') as SkillLevel
    const lvlScore = SKILL_SCORE[level]
    score += (lvlScore / 4) * reqSkillWeight
    if (lvlScore >= 3) reasons.push(`${level} in ${s}`)
    else if (lvlScore === 2) cautions.push(`Only Beginner in ${s}`)
    else cautions.push(`No coverage for ${s}`)
  })

  // Nice-to-have skills (15 pts max)
  const nthWeight = need.niceToHaveSkills.length > 0 ? 15 / need.niceToHaveSkills.length : 0
  need.niceToHaveSkills.forEach((s) => {
    const level = (consultant.skills[s] ?? 'None') as SkillLevel
    const lvlScore = SKILL_SCORE[level]
    score += (lvlScore / 4) * nthWeight
    if (lvlScore >= 3) reasons.push(`Bonus: ${level} in ${s}`)
  })

  // Industry match (10 pts)
  if (consultant.industries.includes(need.industry)) {
    score += 10
    reasons.push(`Industry experience in ${need.industry}`)
  } else {
    cautions.push(`No ${need.industry} industry background`)
  }

  // Platform match (10 pts)
  if (consultant.platforms.includes(need.platform)) {
    score += 10
    reasons.push(`Platform expertise: ${need.platform}`)
  }

  // Availability (5 pts)
  if (consultant.available) {
    score += 5
    reasons.push('Available now (low utilisation)')
  } else {
    cautions.push(`Currently ${consultant.utilizationPct}% utilised`)
  }

  // Travel compatibility (bonus)
  const travelRank: Record<string, number> = {
    'Any': 4,
    'Domestic': 3,
    'Limited': 2,
    'Remote Only': 1,
  }
  const needRank = travelRank[need.travelRequired] ?? 2
  const conRank = travelRank[consultant.travelWillingness] ?? 2
  if (conRank >= needRank) {
    reasons.push(`Travel: ${consultant.travelWillingness}`)
  } else {
    cautions.push(`Travel preference mismatch (needs ${need.travelRequired}, prefers ${consultant.travelWillingness})`)
    score = Math.max(score - 8, 0)
  }

  const skillBreakdown = need.requiredSkills.map((s) => ({
    skill: s,
    level: (consultant.skills[s] ?? 'None') as SkillLevel,
    required: true,
  })).concat(
    need.niceToHaveSkills.map((s) => ({
      skill: s,
      level: (consultant.skills[s] ?? 'None') as SkillLevel,
      required: false,
    }))
  )

  return {
    consultant,
    score: Math.min(Math.round(score), 100),
    reasons,
    cautions,
    skillBreakdown,
  }
}

// ── Components ────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#059669' : score >= 60 ? '#2563eb' : score >= 40 ? '#d97706' : '#dc2626'
  const bg = score >= 80 ? '#dcfce7' : score >= 60 ? '#dbeafe' : score >= 40 ? '#fef9c3' : '#fee2e2'
  const label = score >= 80 ? 'Strong Match' : score >= 60 ? 'Good Match' : score >= 40 ? 'Partial Match' : 'Weak Match'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: bg,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '0.95rem',
          flexShrink: 0,
        }}
      >
        {score}
      </div>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color }}>{label}</span>
    </div>
  )
}

function ConsultantMatchCard({ match, expanded, onToggle }: {
  match: MatchResult
  expanded: boolean
  onToggle: () => void
}) {
  const c = match.consultant
  return (
    <div
      className="card"
      style={{ marginBottom: '0.75rem', transition: 'box-shadow 0.2s' }}
    >
      <div
        style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer' }}
        onClick={onToggle}
      >
        {/* Avatar */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: `hsl(${(c.id.charCodeAt(1) * 40) % 360}, 65%, 55%)`,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1.1rem',
            flexShrink: 0,
          }}
        >
          {c.name.split(' ').map((n) => n[0]).join('')}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700 }}>{c.name}</span>
            {c.available && <span className="badge badge-green">Available</span>}
            {!c.available && (
              <span className="badge badge-yellow">{c.utilizationPct}% utilised</span>
            )}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{c.title}</div>
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '0.25rem',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              flexWrap: 'wrap',
            }}
          >
            <span>
              <MapPin size={11} style={{ verticalAlign: 'middle' }} /> {c.location}
            </span>
            <span>
              <Briefcase size={11} style={{ verticalAlign: 'middle' }} /> {c.yearsExp}y exp
            </span>
            <span>
              <Award size={11} style={{ verticalAlign: 'middle' }} /> {c.certifications.length} certs
            </span>
            <span>✈️ {c.travelWillingness}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <ScoreBadge score={match.score} />
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
            {/* Reasoning */}
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.4rem', color: 'var(--success)' }}>
                ✓ Why this match works
              </div>
              {match.reasons.slice(0, 6).map((r) => (
                <div key={r} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  • {r}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.4rem', color: 'var(--warning)' }}>
                ⚠ Considerations
              </div>
              {match.cautions.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>No major concerns</div>
              ) : (
                match.cautions.slice(0, 4).map((r) => (
                  <div key={r} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    • {r}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Skill breakdown */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.5rem' }}>Skill Assessment</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {match.skillBreakdown.map(({ skill, level, required }) => {
                const levelColors: Record<SkillLevel, string> = {
                  Expert: 'badge-green',
                  Proficient: 'badge-blue',
                  Beginner: 'badge-yellow',
                  None: 'badge-red',
                }
                return (
                  <span
                    key={skill}
                    className={`badge ${levelColors[level]}`}
                    style={{ fontSize: '0.72rem', opacity: required ? 1 : 0.7 }}
                  >
                    {!required && '⋄ '}
                    {skill}: {level}
                  </span>
                )
              })}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              ⋄ = nice-to-have skill
            </div>
          </div>

          {/* Certs & profile */}
          <div className="grid-2" style={{ gap: '0.75rem', fontSize: '0.8rem' }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Certifications</div>
              {c.certifications.map((cert) => (
                <div key={cert} style={{ color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
                  🏅 {cert}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Industries & Platforms</div>
              <div style={{ marginBottom: '0.25rem' }}>
                {c.industries.map((i) => (
                  <span key={i} className="badge badge-gray" style={{ marginRight: '0.25rem', fontSize: '0.7rem' }}>
                    {i}
                  </span>
                ))}
              </div>
              {c.platforms.map((p) => (
                <span key={p} className="badge badge-purple" style={{ marginRight: '0.25rem', fontSize: '0.7rem' }}>
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.6rem 0.75rem',
              background: '#f0f9ff',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
            }}
          >
            <strong>Career Goal:</strong> {c.careerGoal}
          </div>
        </div>
      )}
    </div>
  )
}

function ConsultantProfileCard({ c }: { c: Consultant }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card" style={{ marginBottom: '0.6rem' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        onClick={() => setOpen((x) => !x)}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: `hsl(${(c.id.charCodeAt(1) * 40) % 360}, 65%, 55%)`,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.95rem',
            flexShrink: 0,
          }}
        >
          {c.name.split(' ').map((n) => n[0]).join('')}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.title}</div>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {c.available ? (
            <span className="badge badge-green">Available</span>
          ) : (
            <span className="badge badge-yellow">{c.utilizationPct}%</span>
          )}
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {open && (
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem' }}>
          <div className="grid-2" style={{ gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Location: </span>{c.location}
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Travel: </span>{c.travelWillingness}
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Exp: </span>{c.yearsExp} years
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Cases: </span>{c.caseCount}
            </div>
          </div>
          <div style={{ marginBottom: '0.4rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Goal: </span>{c.careerGoal}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {Object.entries(c.skills)
              .filter(([, v]) => v !== 'None')
              .map(([skill, level]) => (
                <span
                  key={skill}
                  className={`badge ${level === 'Expert' ? 'badge-green' : level === 'Proficient' ? 'badge-blue' : 'badge-yellow'}`}
                  style={{ fontSize: '0.68rem' }}
                >
                  {skill}: {level}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Default / empty need ──────────────────────────────────────────────

const EMPTY_NEED: Omit<OpportunityNeed, 'id'> = {
  title: '',
  client: '',
  industry: '',
  platform: '',
  durationWeeks: 12,
  travelRequired: 'Domestic',
  requiredSkills: [],
  niceToHaveSkills: [],
  description: '',
}

// ── Main ──────────────────────────────────────────────────────────────

export default function ConsultantMarketplace() {
  const [needs, setNeeds] = useState<OpportunityNeed[]>([
    {
      id: 'n1',
      title: 'GenAI Pilot — Retail Co-pilot',
      client: 'RetailMax Corp',
      industry: 'Retail',
      platform: 'OpenAI / Azure OpenAI',
      durationWeeks: 16,
      travelRequired: 'Limited',
      requiredSkills: ['Generative AI', 'Machine Learning / AI', 'UI / UX Design'],
      niceToHaveSkills: ['Business Analysis', 'Agile / Scrum'],
      description: 'Build an AI co-pilot for frontline retail associates. Must have GenAI production experience.',
    },
    {
      id: 'n2',
      title: 'Cloud Migration & Security Uplift',
      client: 'State Digital Office',
      industry: 'Government',
      platform: 'Azure',
      durationWeeks: 24,
      travelRequired: 'Domestic',
      requiredSkills: ['Cloud Architecture', 'Cybersecurity', 'Change Management'],
      niceToHaveSkills: ['Integration / APIs', 'Agile / Scrum'],
      description: 'Migrate on-prem workloads to Azure with FedRAMP compliance. Security clearance preferred.',
    },
  ])

  const [selectedNeed, setSelectedNeed] = useState<OpportunityNeed | null>(needs[0])
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newNeed, setNewNeed] = useState<Omit<OpportunityNeed, 'id'>>(EMPTY_NEED)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'matches' | 'profiles'>('matches')

  const matches = useMemo(() => {
    if (!selectedNeed) return []
    return CONSULTANTS.map((c) => computeMatch(selectedNeed, c))
      .sort((a, b) => b.score - a.score)
  }, [selectedNeed])

  const filteredConsultants = useMemo(() => {
    const q = searchQuery.toLowerCase()
    if (!q) return CONSULTANTS
    return CONSULTANTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.certifications.some((cert) => cert.toLowerCase().includes(q)) ||
        c.industries.some((i) => i.toLowerCase().includes(q)) ||
        c.platforms.some((p) => p.toLowerCase().includes(q)) ||
        Object.keys(c.skills).some((s) => s.toLowerCase().includes(q)),
    )
  }, [searchQuery])

  const handleAddNeed = () => {
    const need: OpportunityNeed = { ...newNeed, id: `n${Date.now()}` }
    setNeeds((prev) => [...prev, need])
    setSelectedNeed(need)
    setNewNeed(EMPTY_NEED)
    setShowNewForm(false)
  }

  const handleSkillToggle = (
    skill: string,
    type: 'requiredSkills' | 'niceToHaveSkills',
    setter: Dispatch<SetStateAction<Omit<OpportunityNeed, 'id'>>>,
  ) => {
    setter((prev) => ({
      ...prev,
      [type]: prev[type].includes(skill)
        ? prev[type].filter((s) => s !== skill)
        : [...prev[type], skill],
    }))
  }

  return (
    <div>
      <div className="section-header">
        <span style={{ background: '#fce7f3', color: '#9d174d', borderRadius: '0.6rem', padding: '0.5rem', display: 'flex' }}>
          <Users size={22} />
        </span>
        <div>
          <h2>Consultant Matching Marketplace</h2>
          <p>Post opportunity needs and get AI-powered consultant matches with explainable reasoning.</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: '1.5rem' }}>
        {/* ── Left: opportunities ───────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Open Opportunities</h3>
            <button className="btn btn-primary" style={{ fontSize: '0.8rem' }} onClick={() => setShowNewForm(true)}>
              <Plus size={14} />
              Post Need
            </button>
          </div>

          {needs.map((need) => (
            <div
              key={need.id}
              className="card"
              style={{
                cursor: 'pointer',
                marginBottom: '0.75rem',
                border:
                  selectedNeed?.id === need.id
                    ? '2px solid var(--primary)'
                    : '2px solid transparent',
              }}
              onClick={() => {
                setSelectedNeed(need)
                setActiveTab('matches')
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{need.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{need.client}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <span className="badge badge-blue">{need.industry}</span>
                  <span className="badge badge-gray">{need.durationWeeks}w</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.5rem' }}>
                {need.requiredSkills.map((s) => (
                  <span key={s} className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* New opportunity form */}
          {showNewForm && (
            <div className="card" style={{ border: '2px solid var(--primary)', position: 'relative' }}>
              <button
                className="btn btn-ghost"
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.3rem' }}
                onClick={() => setShowNewForm(false)}
              >
                <X size={16} />
              </button>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Post New Opportunity Need</h4>

              <div className="form-row">
                <label>Opportunity Title</label>
                <input
                  placeholder="e.g. Cloud Migration Lead"
                  value={newNeed.title}
                  onChange={(e) => setNewNeed((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className="grid-2" style={{ gap: '0.75rem' }}>
                <div className="form-row">
                  <label>Client</label>
                  <input
                    placeholder="Client name"
                    value={newNeed.client}
                    onChange={(e) => setNewNeed((p) => ({ ...p, client: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label>Duration (weeks)</label>
                  <input
                    type="number"
                    value={newNeed.durationWeeks}
                    onChange={(e) => setNewNeed((p) => ({ ...p, durationWeeks: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="grid-2" style={{ gap: '0.75rem' }}>
                <div className="form-row">
                  <label>Industry</label>
                  <select
                    value={newNeed.industry}
                    onChange={(e) => setNewNeed((p) => ({ ...p, industry: e.target.value }))}
                  >
                    <option value="">Select…</option>
                    {ALL_INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <label>Platform</label>
                  <select
                    value={newNeed.platform}
                    onChange={(e) => setNewNeed((p) => ({ ...p, platform: e.target.value }))}
                  >
                    <option value="">Select…</option>
                    {ALL_PLATFORMS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <label>Travel Required</label>
                <select
                  value={newNeed.travelRequired}
                  onChange={(e) => setNewNeed((p) => ({ ...p, travelRequired: e.target.value }))}
                >
                  <option>Any</option>
                  <option>Domestic</option>
                  <option>Limited</option>
                  <option>Remote Only</option>
                </select>
              </div>

              <div className="form-row" style={{ marginBottom: '0.5rem' }}>
                <label style={{ marginBottom: '0.4rem' }}>Required Skills</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {ALL_SKILLS.map((s) => {
                    const on = newNeed.requiredSkills.includes(s)
                    return (
                      <button
                        key={s}
                        className={on ? 'btn btn-primary' : 'btn btn-secondary'}
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                        onClick={() => handleSkillToggle(s, 'requiredSkills', setNewNeed)}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="form-row">
                <label style={{ marginBottom: '0.4rem' }}>Nice-to-Have Skills</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {ALL_SKILLS.filter((s) => !newNeed.requiredSkills.includes(s)).map((s) => {
                    const on = newNeed.niceToHaveSkills.includes(s)
                    return (
                      <button
                        key={s}
                        className={on ? 'btn btn-primary' : 'btn btn-secondary'}
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                        onClick={() => handleSkillToggle(s, 'niceToHaveSkills', setNewNeed)}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="form-row">
                <label>Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the opportunity, key deliverables, context…"
                  value={newNeed.description}
                  onChange={(e) => setNewNeed((p) => ({ ...p, description: e.target.value }))}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleAddNeed}
                disabled={!newNeed.title || newNeed.requiredSkills.length === 0}
              >
                <CheckCircle size={15} />
                Post Opportunity
              </button>
            </div>
          )}
        </div>

        {/* ── Right: matches / profiles ─────────────────────────── */}
        <div>
          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              className={activeTab === 'matches' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setActiveTab('matches')}
            >
              <Star size={14} />
              AI Matches {selectedNeed ? `(${matches.length})` : ''}
            </button>
            <button
              className={activeTab === 'profiles' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setActiveTab('profiles')}
            >
              <Search size={14} />
              Browse Profiles ({CONSULTANTS.length})
            </button>
          </div>

          {activeTab === 'matches' && (
            <div>
              {!selectedNeed ? (
                <div
                  className="card"
                  style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-muted)',
                    border: '2px dashed var(--border)',
                    background: 'transparent',
                  }}
                >
                  <Users size={40} style={{ opacity: 0.25, marginBottom: '1rem' }} />
                  <div style={{ fontWeight: 600 }}>Select an opportunity to see matches</div>
                </div>
              ) : (
                <>
                  <div
                    className="card"
                    style={{ marginBottom: '1rem', background: '#f0f9ff', border: '1px solid #bae6fd' }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{selectedNeed.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      {selectedNeed.client} · {selectedNeed.industry} · {selectedNeed.durationWeeks}w ·{' '}
                      {selectedNeed.travelRequired} travel
                    </div>
                    {selectedNeed.description && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text)' }}>{selectedNeed.description}</div>
                    )}
                  </div>

                  {matches.map((m) => (
                    <ConsultantMatchCard
                      key={m.consultant.id}
                      match={m}
                      expanded={expandedMatch === m.consultant.id}
                      onToggle={() =>
                        setExpandedMatch((prev) =>
                          prev === m.consultant.id ? null : m.consultant.id,
                        )
                      }
                    />
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === 'profiles' && (
            <div>
              <div className="form-row" style={{ marginBottom: '1rem', position: 'relative' }}>
                <Search
                  size={16}
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
                />
                <input
                  placeholder="Search by name, skill, cert, industry, platform…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                {filteredConsultants.length} consultant{filteredConsultants.length !== 1 ? 's' : ''} found
              </div>

              {filteredConsultants.map((c) => (
                <ConsultantProfileCard key={c.id} c={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
