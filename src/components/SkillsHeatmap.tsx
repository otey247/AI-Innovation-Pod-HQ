import { useState, useMemo } from 'react'
import { BarChart3, AlertTriangle, CheckCircle, TrendingUp, Filter } from 'lucide-react'
import {
  CONSULTANTS,
  PURSUITS,
  ALL_SKILLS,
  type SkillLevel,
  type Consultant,
  type Pursuit,
} from '../data/mockData'

// ── Helpers ────────────────────────────────────────────────────────────

const LEVEL_SCORE: Record<SkillLevel, number> = {
  Expert: 4,
  Proficient: 3,
  Beginner: 2,
  None: 0,
}

const LEVEL_COLOR: Record<string, string> = {
  Expert: '#059669',
  Proficient: '#3b82f6',
  Beginner: '#f59e0b',
  None: '#ef4444',
  Gap: '#ef4444',
  Partial: '#f97316',
  Covered: '#059669',
}

function getSkillCoverage(
  skill: string,
  pursuit: Pursuit,
  consultants: Consultant[],
): 'Covered' | 'Partial' | 'Gap' {
  const assigned = consultants.filter((c) => pursuit.assignedConsultants.includes(c.id))
  const maxLevel = Math.max(...assigned.map((c) => LEVEL_SCORE[c.skills[skill] ?? 'None']))
  if (maxLevel >= 3) return 'Covered'
  if (maxLevel >= 2) return 'Partial'
  return 'Gap'
}

function getSkillPoolStrength(skill: string, consultants: Consultant[]): number {
  // 0-100 based on team-wide coverage
  const scores = consultants.map((c) => LEVEL_SCORE[c.skills[skill] ?? 'None'])
  const avg = scores.reduce((a, b) => a + b, 0) / (scores.length || 1)
  return Math.round((avg / 4) * 100)
}

// ── Heatmap Cell ──────────────────────────────────────────────────────

function HeatCell({ status, skill }: { status: 'Covered' | 'Partial' | 'Gap'; skill: string }) {
  const bg =
    status === 'Covered'
      ? '#dcfce7'
      : status === 'Partial'
      ? '#fef3c7'
      : '#fee2e2'
  const color = LEVEL_COLOR[status]
  const label = status === 'Covered' ? '✓' : status === 'Partial' ? '~' : '✗'

  return (
    <td
      title={`${skill}: ${status}`}
      style={{
        background: bg,
        color,
        fontWeight: 700,
        fontSize: '0.85rem',
        textAlign: 'center',
        padding: '0.45rem 0.3rem',
        borderRadius: '0.25rem',
        minWidth: '44px',
        border: '1px solid #fff',
        cursor: 'default',
      }}
    >
      {label}
    </td>
  )
}

// ── Recommendation Card ───────────────────────────────────────────────

function RecommendationCard({
  pursuit,
  gaps,
  consultants,
}: {
  pursuit: Pursuit
  gaps: string[]
  consultants: Consultant[]
}) {
  if (gaps.length === 0) return null

  // Find consultants who have the gap skills
  const candidates = consultants
    .filter((c) => !pursuit.assignedConsultants.includes(c.id))
    .map((c) => ({
      ...c,
      covered: gaps.filter((s) => LEVEL_SCORE[c.skills[s] ?? 'None'] >= 3).length,
    }))
    .filter((c) => c.covered > 0)
    .sort((a, b) => b.covered - a.covered)
    .slice(0, 2)

  const upskillNeeds = gaps.filter((s) => candidates.every((c) => c.covered === 0 || !c.skills[s]))
  const partnerNeeded = gaps.filter(
    (s) => !consultants.some((c) => LEVEL_SCORE[c.skills[s] ?? 'None'] >= 3),
  )

  return (
    <div
      className="card"
      style={{ border: '1px solid #fde68a', background: '#fffbeb', marginBottom: '0.75rem' }}
    >
      <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
        <AlertTriangle size={14} style={{ verticalAlign: 'middle', color: '#d97706' }} />{' '}
        {pursuit.name} — {pursuit.client}
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
        {gaps.length} skill gap{gaps.length !== 1 ? 's' : ''} detected
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
        {gaps.map((g) => (
          <span key={g} className="badge badge-red">
            {g}
          </span>
        ))}
      </div>

      {candidates.length > 0 && (
        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1d4ed8', marginBottom: '0.25rem' }}>
            🎯 Recommend internal talent
          </div>
          {candidates.map((c) => (
            <div
              key={c.id}
              style={{
                fontSize: '0.8rem',
                color: 'var(--text)',
                marginBottom: '0.2rem',
                display: 'flex',
                gap: '0.4rem',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: 600 }}>{c.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>{c.title}</span>
              <span className="badge badge-green">covers {c.covered} gap{c.covered !== 1 ? 's' : ''}</span>
              {c.available && <span className="badge badge-blue">Available</span>}
            </div>
          ))}
        </div>
      )}

      {upskillNeeds.length > 0 && (
        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#d97706', marginBottom: '0.25rem' }}>
            📚 Upskilling needed
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {upskillNeeds.join(', ')} — consider training programme or certification path
          </div>
        </div>
      )}

      {partnerNeeded.length > 0 && (
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7c3aed', marginBottom: '0.25rem' }}>
            🤝 Partner dependency recommended
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            No team member reaches Proficient+ for:{' '}
            <strong>{partnerNeeded.join(', ')}</strong>. Evaluate SI partner or
            contract specialist.
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────

type FilterStatus = 'All' | 'Active' | 'Pursuit'
type FilterCoverage = 'All' | 'Gaps Only'

export default function SkillsHeatmap() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All')
  const [filterCoverage, setFilterCoverage] = useState<FilterCoverage>('All')
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)

  const filteredPursuits = useMemo(
    () =>
      PURSUITS.filter((p) => filterStatus === 'All' || p.status === filterStatus),
    [filterStatus],
  )

  // skills that appear in at least one pursuit
  const activeSkills = useMemo(
    () =>
      ALL_SKILLS.filter((s) =>
        filteredPursuits.some((p) => p.requiredSkills.includes(s)),
      ),
    [filteredPursuits],
  )

  // build gap matrix: pursuit × skill → status
  const matrix = useMemo(
    () =>
      filteredPursuits.map((p) => ({
        pursuit: p,
        coverage: activeSkills.map((s) => ({
          skill: s,
          required: p.requiredSkills.includes(s),
          status: getSkillCoverage(s, p, CONSULTANTS),
        })),
      })),
    [filteredPursuits, activeSkills],
  )

  const gapsByPursuit = useMemo(
    () =>
      matrix.map((row) => ({
        pursuit: row.pursuit,
        gaps: row.coverage
          .filter((c) => c.required && c.status === 'Gap')
          .map((c) => c.skill),
      })),
    [matrix],
  )

  const displayMatrix =
    filterCoverage === 'Gaps Only'
      ? matrix.filter((row) => gapsByPursuit.find((g) => g.pursuit.id === row.pursuit.id)?.gaps.length ?? 0 > 0)
      : matrix

  // Pool strength per skill
  const poolStrengths = useMemo(
    () => Object.fromEntries(ALL_SKILLS.map((s) => [s, getSkillPoolStrength(s, CONSULTANTS)])),
    [],
  )

  // Summary stats
  const totalRequired = matrix.flatMap((r) => r.coverage.filter((c) => c.required))
  const totalGaps = totalRequired.filter((c) => c.status === 'Gap').length
  const totalPartial = totalRequired.filter((c) => c.status === 'Partial').length
  const totalCovered = totalRequired.filter((c) => c.status === 'Covered').length

  return (
    <div>
      <div className="section-header">
        <span style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: '0.6rem', padding: '0.5rem', display: 'flex' }}>
          <BarChart3 size={22} />
        </span>
        <div>
          <h2>Skills Coverage Heatmap</h2>
          <p>Map open pursuits and active work against available consultant skills — spot gaps instantly.</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Covered Skills', value: totalCovered, color: '#059669', bg: '#dcfce7' },
          { label: 'Partial Coverage', value: totalPartial, color: '#d97706', bg: '#fef9c3' },
          { label: 'Skill Gaps', value: totalGaps, color: '#dc2626', bg: '#fee2e2' },
          { label: 'Pursuits / Active', value: filteredPursuits.length, color: '#4f46e5', bg: '#ede9fe' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="card"
            style={{ textAlign: 'center', background: kpi.bg, border: `1px solid ${kpi.color}33` }}
          >
            <div style={{ fontSize: '2rem', fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontSize: '0.82rem', color: kpi.color, fontWeight: 500 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="card"
        style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1rem', padding: '0.75rem 1.25rem' }}
      >
        <Filter size={16} style={{ color: 'var(--text-muted)' }} />
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Status:</span>
          {(['All', 'Active', 'Pursuit'] as FilterStatus[]).map((f) => (
            <button
              key={f}
              className={filterStatus === f ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
              onClick={() => setFilterStatus(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Show:</span>
          {(['All', 'Gaps Only'] as FilterCoverage[]).map((f) => (
            <button
              key={f}
              className={filterCoverage === f ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
              onClick={() => setFilterCoverage(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap table */}
      <div className="card" style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: '2px', width: '100%', fontSize: '0.8rem' }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: 'left',
                  padding: '0.5rem 0.75rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  minWidth: '180px',
                  position: 'sticky',
                  left: 0,
                  background: '#fff',
                  zIndex: 1,
                }}
              >
                Pursuit / Client
              </th>
              {activeSkills.map((s) => (
                <th
                  key={s}
                  style={{
                    padding: '0.4rem 0.2rem',
                    minWidth: '44px',
                    maxWidth: '66px',
                    textAlign: 'center',
                    cursor: 'default',
                    background: hoveredSkill === s ? '#f0f9ff' : undefined,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={() => setHoveredSkill(s)}
                  onMouseLeave={() => setHoveredSkill(null)}
                >
                  <div
                    style={{
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                      height: '90px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontWeight: 600,
                      color: 'var(--text)',
                      lineHeight: 1.2,
                      fontSize: '0.75rem',
                    }}
                  >
                    {s}
                  </div>
                </th>
              ))}
              <th style={{ padding: '0.4rem 0.6rem', minWidth: '70px', textAlign: 'right', color: 'var(--text-muted)' }}>
                Gaps
              </th>
            </tr>
            {/* Pool strength row */}
            <tr style={{ borderTop: '2px solid var(--border)' }}>
              <td
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                  position: 'sticky',
                  left: 0,
                  background: '#f8fafc',
                }}
              >
                Pool Strength (%)
              </td>
              {activeSkills.map((s) => {
                const pct = poolStrengths[s]
                const color =
                  pct >= 70 ? '#059669' : pct >= 40 ? '#d97706' : '#dc2626'
                return (
                  <td
                    key={s}
                    style={{
                      textAlign: 'center',
                      padding: '0.3rem 0',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color,
                      background: '#f8fafc',
                    }}
                  >
                    {pct}%
                  </td>
                )
              })}
              <td style={{ background: '#f8fafc' }} />
            </tr>
          </thead>
          <tbody>
            {displayMatrix.map(({ pursuit, coverage }) => {
              const gapCount = coverage.filter((c) => c.required && c.status === 'Gap').length
              return (
                <tr key={pursuit.id}>
                  <td
                    style={{
                      padding: '0.5rem 0.75rem',
                      position: 'sticky',
                      left: 0,
                      background: '#fff',
                      zIndex: 1,
                      borderRight: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: '0.15rem' }}>{pursuit.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {pursuit.client}
                      {' · '}
                      <span
                        className={`badge ${pursuit.status === 'Active' ? 'badge-green' : 'badge-blue'}`}
                        style={{ fontSize: '0.68rem' }}
                      >
                        {pursuit.status}
                      </span>
                    </div>
                  </td>
                  {coverage.map(({ skill, required, status }) => {
                    if (!required) {
                      return (
                        <td
                          key={skill}
                          style={{
                            background: '#f8fafc',
                            minWidth: '44px',
                            border: '1px solid #fff',
                          }}
                        />
                      )
                    }
                    return <HeatCell key={skill} status={status} skill={skill} />
                  })}
                  <td
                    style={{
                      textAlign: 'right',
                      padding: '0.4rem 0.6rem',
                      fontWeight: 700,
                      color: gapCount > 0 ? 'var(--danger)' : 'var(--success)',
                    }}
                  >
                    {gapCount > 0 ? `${gapCount} ✗` : '✓'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            marginTop: '1rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}
        >
          {[
            { label: '✓ Covered (Proficient+)', bg: '#dcfce7', color: '#059669' },
            { label: '~ Partial (Beginner)', bg: '#fef3c7', color: '#d97706' },
            { label: '✗ Gap (None / not assigned)', bg: '#fee2e2', color: '#dc2626' },
            { label: 'blank = not required', bg: '#f8fafc', color: 'var(--text-muted)' },
          ].map((l) => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  background: l.bg,
                  border: `1px solid ${l.color}44`,
                  borderRadius: '3px',
                }}
              />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Consultant skill panel */}
      <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'start' }}>
        {/* Recommendations */}
        <div>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
            Gap Recommendations
          </h3>
          {gapsByPursuit.filter((g) => g.gaps.length > 0).length === 0 ? (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'var(--success)',
                border: '1px solid #bbf7d0',
                background: '#f0fdf4',
              }}
            >
              <CheckCircle size={36} style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 600 }}>All skills are covered!</div>
            </div>
          ) : (
            gapsByPursuit
              .filter((g) => g.gaps.length > 0)
              .map((g) => (
                <RecommendationCard
                  key={g.pursuit.id}
                  pursuit={g.pursuit}
                  gaps={g.gaps}
                  consultants={CONSULTANTS}
                />
              ))
          )}
        </div>

        {/* Consultant skill table */}
        <div className="card" style={{ overflowX: 'auto' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Consultant Skill Levels</h3>
          <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '0.4rem 0' }}>Consultant</th>
                {['Cloud Architecture', 'Data Engineering', 'Machine Learning / AI', 'Generative AI', 'DevOps / CI-CD', 'Cybersecurity'].map(
                  (s) => (
                    <th
                      key={s}
                      style={{ textAlign: 'center', padding: '0.4rem 0.3rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}
                    >
                      {s.split(' / ')[0].split(' & ')[0].split(' ')[0]}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {CONSULTANTS.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.45rem 0', fontWeight: 500 }}>
                    <div>{c.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.title.split(' ').slice(0, 3).join(' ')}</div>
                  </td>
                  {['Cloud Architecture', 'Data Engineering', 'Machine Learning / AI', 'Generative AI', 'DevOps / CI-CD', 'Cybersecurity'].map(
                    (s) => {
                      const level = (c.skills[s] ?? 'None') as SkillLevel
                      const colors: Record<SkillLevel, string> = {
                        Expert: '#dcfce7',
                        Proficient: '#dbeafe',
                        Beginner: '#fef9c3',
                        None: '#f1f5f9',
                      }
                      const textColors: Record<SkillLevel, string> = {
                        Expert: '#059669',
                        Proficient: '#1d4ed8',
                        Beginner: '#92400e',
                        None: '#94a3b8',
                      }
                      return (
                        <td
                          key={s}
                          style={{
                            textAlign: 'center',
                            padding: '0.3rem',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.15rem 0.35rem',
                              borderRadius: '0.25rem',
                              background: colors[level],
                              color: textColors[level],
                              fontSize: '0.7rem',
                              fontWeight: 600,
                            }}
                          >
                            {level === 'None' ? '—' : level.slice(0, 3)}
                          </span>
                        </td>
                      )
                    },
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
