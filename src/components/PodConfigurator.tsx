import { useState, useMemo, type ReactNode } from 'react'
import { LayoutGrid, ChevronRight, DollarSign, Users, Clock, Zap, Shield, Scale } from 'lucide-react'
import { ALL_CAPABILITIES, ALL_PLATFORMS, ALL_INDUSTRIES, ROLE_TEMPLATES } from '../data/mockData'

// ── Types ─────────────────────────────────────────────────────────────

interface PodConfig {
  scope: string
  durationWeeks: number
  capabilities: string[]
  deliveryModel: 'Agile' | 'Waterfall' | 'Hybrid' | ''
  industry: string
  platform: string
  weeklyBudget: number
  onsite: boolean
}

interface TeamOption {
  id: 'lean' | 'balanced' | 'specialist'
  label: string
  tagline: string
  icon: ReactNode
  color: string
  roles: { title: string; seniority: string; fte: number; weeklyRate: number }[]
  strengths: string[]
  risks: string[]
}

// ── Helpers ───────────────────────────────────────────────────────────

const SENIORITY_MULTIPLIER: Record<string, number> = {
  Junior: 0.75,
  Mid: 1.0,
  Senior: 1.25,
  Principal: 1.55,
}

function weeklyRateForRole(
  baseRange: [number, number],
  seniority: string,
  fte: number,
  billableHoursPerWeek = 40,
): number {
  const base = (baseRange[0] + baseRange[1]) / 2
  return Math.round(base * SENIORITY_MULTIPLIER[seniority] * fte * billableHoursPerWeek)
}

function buildTeamOptions(config: PodConfig): TeamOption[] {
  // Map capabilities to relevant role templates
  const capabilityRoleMap: Record<string, string[]> = {
    'Cloud & Infrastructure': ['Cloud / DevOps Engineer', 'Solution Architect'],
    'Data & Analytics': ['Data Engineer'],
    'AI / Machine Learning': ['AI / ML Engineer'],
    'Generative AI': ['AI / ML Engineer'],
    'DevOps & Automation': ['Cloud / DevOps Engineer'],
    'Enterprise Architecture': ['Solution Architect'],
    'Change & Adoption': ['Change & Adoption Manager'],
    'Agile Delivery': ['Change & Adoption Manager'],
    'Cybersecurity': ['Cybersecurity Specialist'],
    'Digital Product Design': ['UX / Product Designer'],
    'System Integration': ['Solution Architect'],
    'Programme Management': ['Engagement Lead'],
  }

  // Collect required roles (deduplicated)
  const roleSet = new Set<string>(['Engagement Lead'])
  config.capabilities.forEach((cap) => {
    const roles = capabilityRoleMap[cap] ?? []
    roles.forEach((r) => roleSet.add(r))
  })
  if (roleSet.size < 2) {
    roleSet.add('Business / Systems Analyst')
  }

  const requiredRoles = Array.from(roleSet)

  const buildOption = (variant: 'lean' | 'balanced' | 'specialist'): TeamOption => {
    const roles = requiredRoles.map((title) => {
      const tmpl = ROLE_TEMPLATES.find((r) => r.title === title) ?? ROLE_TEMPLATES[0]
      const seniorityIdx =
        variant === 'lean'
          ? 0
          : variant === 'specialist'
          ? tmpl.seniorityOptions.length - 1
          : Math.floor(tmpl.seniorityOptions.length / 2)
      const seniority = tmpl.seniorityOptions[seniorityIdx]
      const fte = variant === 'lean' ? Math.min(tmpl.fteEquivalent, 0.5) : tmpl.fteEquivalent
      return {
        title,
        seniority,
        fte,
        weeklyRate: weeklyRateForRole(tmpl.baseRateRange, seniority, fte),
      }
    })

    return {
      id: variant,
      label:
        variant === 'lean'
          ? 'Lean Pod'
          : variant === 'balanced'
          ? 'Balanced Pod'
          : 'Specialist-Heavy Pod',
      tagline:
        variant === 'lean'
          ? 'Small, versatile team — maximum agility at lower cost'
          : variant === 'balanced'
          ? 'Right mix of seniority — delivery quality with cost control'
          : 'Deep expertise — premium quality with faster specialised outcomes',
      icon:
        variant === 'lean' ? (
          <Zap size={20} />
        ) : variant === 'balanced' ? (
          <Scale size={20} />
        ) : (
          <Shield size={20} />
        ),
      color:
        variant === 'lean'
          ? '#10b981'
          : variant === 'balanced'
          ? '#4f46e5'
          : '#f59e0b',
      roles,
      strengths:
        variant === 'lean'
          ? [
              'Lower cost per sprint',
              'Easy to pivot scope',
              'Minimal coordination overhead',
            ]
          : variant === 'balanced'
          ? [
              'Covers all required capabilities',
              'Mentorship built in (senior + mid)',
              'Good delivery velocity',
            ]
          : [
              'Fastest time-to-insight on complex problems',
              'Reduces re-work risk',
              'Strong stakeholder credibility',
            ],
      risks:
        variant === 'lean'
          ? [
              'Key-person dependency',
              'May miss specialist depth',
              'Overtime risk on long engagements',
            ]
          : variant === 'balanced'
          ? [
              'Slightly higher cost than lean',
              'Role clarity needed to avoid overlap',
            ]
          : [
              'Highest cost per week',
              'Over-engineered for routine delivery',
              'Specialist availability constraints',
            ],
    }
  }

  return ['lean', 'balanced', 'specialist'].map((v) => buildOption(v as TeamOption['id']))
}

// ── Subcomponents ─────────────────────────────────────────────────────

function TeamCard({
  option,
  budget,
  selected,
  onSelect,
}: {
  option: TeamOption
  budget: number
  selected: boolean
  onSelect: () => void
}) {
  const totalWeekly = option.roles.reduce((s, r) => s + r.weeklyRate, 0)
  const overBudget = totalWeekly > budget

  return (
    <div
      className="card"
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        border: selected
          ? `2px solid ${option.color}`
          : '2px solid transparent',
        borderRadius: '1rem',
        transition: 'box-shadow 0.2s',
        boxShadow: selected ? `0 0 0 4px ${option.color}22` : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
        <span
          style={{
            background: option.color + '22',
            color: option.color,
            borderRadius: '0.5rem',
            padding: '0.35rem',
            display: 'flex',
          }}
        >
          {option.icon}
        </span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{option.label}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{option.tagline}</div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}
      >
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: overBudget ? 'var(--danger)' : option.color }}>
            ${totalWeekly.toLocaleString()}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/wk</span>
          </div>
          {overBudget && (
            <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>
              Over budget by ${(totalWeekly - budget).toLocaleString()}
            </span>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600 }}>{option.roles.length} roles</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {option.roles.reduce((s, r) => s + r.fte, 0).toFixed(1)} FTE
          </div>
        </div>
      </div>

      {/* Role list */}
      <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse', marginBottom: '0.75rem' }}>
        <thead>
          <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
            <th style={{ textAlign: 'left', padding: '0.3rem 0' }}>Role</th>
            <th style={{ textAlign: 'center', padding: '0.3rem 0' }}>Seniority</th>
            <th style={{ textAlign: 'center', padding: '0.3rem 0' }}>FTE</th>
            <th style={{ textAlign: 'right', padding: '0.3rem 0' }}>$/wk</th>
          </tr>
        </thead>
        <tbody>
          {option.roles.map((r) => (
            <tr key={r.title} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '0.35rem 0', fontWeight: 500 }}>{r.title}</td>
              <td style={{ padding: '0.35rem 0', textAlign: 'center' }}>
                <span
                  className={`badge ${
                    r.seniority === 'Principal'
                      ? 'badge-purple'
                      : r.seniority === 'Senior'
                      ? 'badge-blue'
                      : r.seniority === 'Mid'
                      ? 'badge-green'
                      : 'badge-gray'
                  }`}
                >
                  {r.seniority}
                </span>
              </td>
              <td style={{ padding: '0.35rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                {r.fte}
              </td>
              <td style={{ padding: '0.35rem 0', textAlign: 'right' }}>
                ${r.weeklyRate.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Trade-offs */}
      <div className="grid-2" style={{ gap: '0.6rem', fontSize: '0.8rem' }}>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--success)', marginBottom: '0.25rem' }}>✓ Strengths</div>
          {option.strengths.map((s) => (
            <div key={s} style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
              • {s}
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: '0.25rem' }}>⚠ Risks</div>
          {option.risks.map((r) => (
            <div key={r} style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
              • {r}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────

const DEFAULT_CONFIG: PodConfig = {
  scope: '',
  durationWeeks: 12,
  capabilities: [],
  deliveryModel: '',
  industry: '',
  platform: '',
  weeklyBudget: 30000,
  onsite: false,
}

export default function PodConfigurator() {
  const [config, setConfig] = useState<PodConfig>(DEFAULT_CONFIG)
  const [generated, setGenerated] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const teamOptions = useMemo(() => buildTeamOptions(config), [config])

  const handleCapabilityToggle = (cap: string) => {
    setConfig((c) => ({
      ...c,
      capabilities: c.capabilities.includes(cap)
        ? c.capabilities.filter((x) => x !== cap)
        : [...c.capabilities, cap],
    }))
    setGenerated(false)
  }

  const handleGenerate = () => {
    setGenerated(true)
    setSelectedOption('balanced')
  }

  const selected = teamOptions.find((o) => o.id === selectedOption)
  const totalCost = selected
    ? selected.roles.reduce((s, r) => s + r.weeklyRate, 0) * config.durationWeeks
    : 0

  return (
    <div>
      <div className="section-header">
        <span
          style={{
            background: '#ede9fe',
            color: '#6d28d9',
            borderRadius: '0.6rem',
            padding: '0.5rem',
            display: 'flex',
          }}
        >
          <LayoutGrid size={22} />
        </span>
        <div>
          <h2>Pod Staffing Configurator</h2>
          <p>Enter opportunity details to get AI-recommended team composition options with trade-off analysis.</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: '1.5rem' }}>
        {/* ── Left: inputs ─────────────────────────────────────────── */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            OPPORTUNITY DETAILS
          </h3>

          <div className="form-row">
            <label>Project / Opportunity Name</label>
            <input
              placeholder="e.g. CloudFirst Modernisation for Apex FS"
              value={config.scope}
              onChange={(e) => setConfig((c) => ({ ...c, scope: e.target.value }))}
            />
          </div>

          <div className="grid-2" style={{ gap: '0.75rem' }}>
            <div className="form-row">
              <label>Duration (weeks)</label>
              <input
                type="number"
                min={1}
                max={104}
                value={config.durationWeeks}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, durationWeeks: Number(e.target.value) }))
                }
              />
            </div>
            <div className="form-row">
              <label>Weekly Budget (USD)</label>
              <input
                type="number"
                step={1000}
                min={0}
                value={config.weeklyBudget}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, weeklyBudget: Number(e.target.value) }))
                }
              />
            </div>
          </div>

          <div className="grid-2" style={{ gap: '0.75rem' }}>
            <div className="form-row">
              <label>Delivery Model</label>
              <select
                value={config.deliveryModel}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, deliveryModel: e.target.value as PodConfig['deliveryModel'] }))
                }
              >
                <option value="">Select…</option>
                <option>Agile</option>
                <option>Waterfall</option>
                <option>Hybrid</option>
              </select>
            </div>
            <div className="form-row">
              <label>Client Industry</label>
              <select
                value={config.industry}
                onChange={(e) => setConfig((c) => ({ ...c, industry: e.target.value }))}
              >
                <option value="">Select…</option>
                {ALL_INDUSTRIES.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <label>Target Platform</label>
            <select
              value={config.platform}
              onChange={(e) => setConfig((c) => ({ ...c, platform: e.target.value }))}
            >
              <option value="">Select…</option>
              {ALL_PLATFORMS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="form-row" style={{ marginBottom: 0 }}>
            <label style={{ marginBottom: '0.5rem' }}>Required Capabilities</label>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.4rem',
              }}
            >
              {ALL_CAPABILITIES.map((cap) => {
                const active = config.capabilities.includes(cap)
                return (
                  <button
                    key={cap}
                    className={active ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
                    onClick={() => handleCapabilityToggle(cap)}
                  >
                    {cap}
                  </button>
                )
              })}
            </div>
          </div>

          <hr className="divider" />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <input
              id="onsite"
              type="checkbox"
              checked={config.onsite}
              onChange={(e) => setConfig((c) => ({ ...c, onsite: e.target.checked }))}
              style={{ width: 16, height: 16 }}
            />
            <label htmlFor="onsite" style={{ fontWeight: 400, cursor: 'pointer' }}>
              Client requires on-site presence
            </label>
          </div>

          <button
            className="btn btn-primary"
            style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', padding: '0.75rem' }}
            onClick={handleGenerate}
            disabled={config.capabilities.length === 0}
          >
            <ChevronRight size={16} />
            Generate Pod Options
          </button>
        </div>

        {/* ── Right: results ───────────────────────────────────────── */}
        <div>
          {!generated ? (
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
              <LayoutGrid size={40} style={{ opacity: 0.25, marginBottom: '1rem' }} />
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No options yet</div>
              <div style={{ fontSize: '0.85rem' }}>
                Select at least one required capability, then click "Generate Pod Options".
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Summary bar */}
              {selected && (
                <div
                  className="card"
                  style={{
                    display: 'flex',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Selected Option</div>
                    <div style={{ fontWeight: 700 }}>{selected.label}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duration</div>
                    <div style={{ fontWeight: 700 }}>{config.durationWeeks} weeks</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Est. Total Cost</div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      ${totalCost.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Team Size</div>
                    <div style={{ fontWeight: 700 }}>{selected.roles.length} roles</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Budget Status</div>
                    <div>
                      {selected.roles.reduce((s, r) => s + r.weeklyRate, 0) <= config.weeklyBudget ? (
                        <span className="badge badge-green">Within budget ✓</span>
                      ) : (
                        <span className="badge badge-red">Over budget ✗</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {teamOptions.map((opt) => (
                <TeamCard
                  key={opt.id}
                  option={opt}
                  budget={config.weeklyBudget}
                  selected={selectedOption === opt.id}
                  onSelect={() => setSelectedOption(opt.id)}
                />
              ))}

              {/* Budget comparison */}
              <div className="card">
                <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>
                  Weekly Cost vs Budget
                </h4>
                {teamOptions.map((opt) => {
                  const weekly = opt.roles.reduce((s, r) => s + r.weeklyRate, 0)
                  const pct = Math.min((weekly / Math.max(config.weeklyBudget, 1)) * 100, 120)
                  return (
                    <div key={opt.id} style={{ marginBottom: '0.75rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.82rem',
                          marginBottom: '0.25rem',
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{opt.label}</span>
                        <span>
                          ${weekly.toLocaleString()} / ${config.weeklyBudget.toLocaleString()}
                        </span>
                      </div>
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            background: pct > 100 ? 'var(--danger)' : opt.color,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
                <div
                  style={{
                    marginTop: '0.5rem',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    gap: '1rem',
                  }}
                >
                  <span>
                    <Users size={12} style={{ verticalAlign: 'middle' }} /> Rates include benefits & overhead
                  </span>
                  <span>
                    <Clock size={12} style={{ verticalAlign: 'middle' }} /> Based on 40-hr/wk billing
                  </span>
                  <span>
                    <DollarSign size={12} style={{ verticalAlign: 'middle' }} /> Blended market rates
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
