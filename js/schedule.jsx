// Schedule/Timetable components - shared between teacher and admin views

const { useState: useStateSched, useMemo: useMemoSched } = React;

// Color palette for subjects - assign deterministically by subject id
const SUBJECT_COLORS = [
  { bg: '#FFF4CC', border: '#F5C518', fg: '#7A5C00' },
  { bg: '#DBEAFE', border: '#3B82F6', fg: '#1E40AF' },
  { bg: '#D1FAE5', border: '#10B981', fg: '#065F46' },
  { bg: '#FCE7F3', border: '#EC4899', fg: '#9D174D' },
  { bg: '#FED7AA', border: '#F97316', fg: '#9A3412' },
  { bg: '#E0E7FF', border: '#6366F1', fg: '#3730A3' },
  { bg: '#FEE2E2', border: '#EF4444', fg: '#991B1B' },
  { bg: '#CFFAFE', border: '#06B6D4', fg: '#155E75' },
  { bg: '#FEF3C7', border: '#F59E0B', fg: '#92400E' },
  { bg: '#F3E8FF', border: '#A855F7', fg: '#6B21A8' },
];

function colorForSubject(subjectId) {
  let hash = 0;
  for (let i = 0; i < subjectId.length; i++) hash = (hash * 31 + subjectId.charCodeAt(i)) >>> 0;
  return SUBJECT_COLORS[hash % SUBJECT_COLORS.length];
}

// Build a timetable grid from a flat list of subjects.
// Returns: { grid: { [day]: { [period]: { subject, span } | 'spanned' } }, conflicts: [...] }
function buildTimetable(subjects) {
  const grid = {};
  for (let d = 1; d <= 5; d++) {
    grid[d] = {};
  }
  const conflicts = [];

  subjects.forEach((s) => {
    (s.schedule || []).forEach((slot) => {
      const day = slot.day;
      if (!grid[day]) grid[day] = {};
      for (let p = slot.startPeriod; p <= slot.endPeriod; p++) {
        if (grid[day][p]) {
          conflicts.push({ day, period: p, subject: s, conflictsWith: grid[day][p].subject || grid[day][p].rootSubject });
        }
        if (p === slot.startPeriod) {
          grid[day][p] = { subject: s, slot, span: slot.endPeriod - slot.startPeriod + 1, room: slot.room };
        } else {
          grid[day][p] = { spanned: true, rootSubject: s };
        }
      }
    });
  });

  return { grid, conflicts };
}

// Compact timetable display
function TimetableGrid({ subjects, periods, showClassroom = false, showTeacher = false, compact = false }) {
  const { grid } = useMemoSched(() => buildTimetable(subjects), [subjects]);
  const d = DataStore.load();
  const cellH = compact ? 56 : 76;

  return (
    <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 10, border: '1px solid var(--border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800, tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: 110 }} />
          {periods.map((p) => <col key={p.n} />)}
        </colgroup>
        <thead>
          <tr style={{ background: 'var(--navy)' }}>
            <th style={{
              padding: '10px 8px', color: '#fff', fontSize: 12, fontWeight: 700,
              borderRight: '1px solid rgba(255,255,255,.15)', position: 'sticky', left: 0, background: 'var(--navy)', zIndex: 1,
            }}>วัน \\ คาบ</th>
            {periods.map((p) => (
              <th key={p.n} style={{
                padding: '10px 6px', color: '#fff', fontSize: 12, fontWeight: 700,
                borderRight: '1px solid rgba(255,255,255,.15)',
              }}>
                <div>คาบ {p.n}</div>
                <div style={{ fontSize: 10, opacity: .8, fontFamily: 'monospace', marginTop: 2, fontWeight: 500 }}>
                  {p.start}–{p.end}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day) => (
            <tr key={day.n}>
              <td style={{
                padding: 10, background: day.color, fontWeight: 700, fontSize: 13,
                color: 'var(--navy)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                textAlign: 'center', position: 'sticky', left: 0, zIndex: 1,
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, opacity: .7 }}>{day.short}</div>
                <div>{day.full}</div>
              </td>
              {periods.map((p) => {
                const cell = grid[day.n]?.[p.n];
                if (cell?.spanned) return null;
                if (!cell) {
                  return (
                    <td key={p.n} style={{
                      height: cellH, borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                      background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, #fafbfc 8px, #fafbfc 16px)',
                    }} />
                  );
                }
                const s = cell.subject;
                const c = colorForSubject(s.id);
                const cls = DataStore.getClassroom(s.classroomId);
                const teacher = d.users.find((u) => u.id === s.teacherId);
                return (
                  <td key={p.n} colSpan={cell.span} style={{
                    height: cellH, padding: 6, borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                    verticalAlign: 'top',
                  }}>
                    <div style={{
                      height: '100%', background: c.bg, borderLeft: `4px solid ${c.border}`,
                      borderRadius: 6, padding: '6px 10px', color: c.fg, position: 'relative', overflow: 'hidden',
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.25, color: 'var(--navy)' }}>{s.name}</div>
                      <div style={{ fontSize: 10, fontFamily: 'monospace', opacity: .8, marginTop: 2 }}>{s.code}</div>
                      <div style={{ fontSize: 10, opacity: .75, marginTop: 2, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {showClassroom && cls && <span>📚 {cls.name}</span>}
                        {showTeacher && teacher && <span>👤 {teacher.name}</span>}
                        {cell.room && <span style={{ background: 'rgba(0,0,0,.06)', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>{cell.room}</span>}
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Editor for a subject's schedule slots (used in admin Subject form)
function ScheduleEditor({ schedule, onChange, periods }) {
  const list = schedule || [];
  const update = (i, patch) => {
    const next = [...list];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const add = () => onChange([...list, { day: 1, startPeriod: 1, endPeriod: 2, room: '' }]);
  const remove = (i) => onChange(list.filter((_, idx) => idx !== i));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>ตารางสอน</span>
        <span style={{ fontSize: 11, color: 'var(--navy-400)' }}>· วัน / คาบ / ห้องเรียน</span>
        <button
          type="button" onClick={add}
          style={{
            marginLeft: 'auto', padding: '4px 10px', background: 'var(--yellow)', color: 'var(--navy)',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}
        >
          <Icon name="plus" size={12} /> เพิ่มคาบ
        </button>
      </div>

      {list.length === 0 && (
        <div style={{
          padding: 16, background: 'var(--navy-50)', border: '1px dashed var(--navy-200)',
          borderRadius: 8, fontSize: 12, color: 'var(--navy-400)', textAlign: 'center',
        }}>
          ยังไม่ได้กำหนดตารางสอน · กดปุ่ม "เพิ่มคาบ" เพื่อเริ่ม
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.map((slot, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1.5fr auto', gap: 8, alignItems: 'center',
            padding: 10, background: 'var(--navy-50)', borderRadius: 8,
          }}>
            <select
              value={slot.day}
              onChange={(e) => update(i, { day: Number(e.target.value) })}
              style={selectStyle()}
            >
              {DAYS.map((d) => <option key={d.n} value={d.n}>วัน{d.full}</option>)}
            </select>
            <select value={slot.startPeriod} onChange={(e) => {
              const v = Number(e.target.value);
              update(i, { startPeriod: v, endPeriod: Math.max(v, slot.endPeriod) });
            }} style={selectStyle()}>
              {periods.map((p) => <option key={p.n} value={p.n}>คาบเริ่ม {p.n}</option>)}
            </select>
            <select value={slot.endPeriod} onChange={(e) => update(i, { endPeriod: Number(e.target.value) })} style={selectStyle()}>
              {periods.filter((p) => p.n >= slot.startPeriod).map((p) => <option key={p.n} value={p.n}>ถึงคาบ {p.n}</option>)}
            </select>
            <input
              value={slot.room || ''}
              onChange={(e) => update(i, { room: e.target.value })}
              placeholder="ห้องเรียน (เช่น IT-301)"
              style={{
                padding: '6px 10px', height: 32, border: '1px solid var(--border)',
                borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fff', color: 'var(--navy)',
              }}
            />
            <button type="button" onClick={() => remove(i)} style={{
              background: '#fff', border: '1px solid #fecaca', color: '#dc2626',
              width: 32, height: 32, borderRadius: 6, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }} title="ลบ"><Icon name="trash" size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function selectStyle() {
  return {
    height: 32, padding: '0 8px', border: '1px solid var(--border)',
    borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fff', color: 'var(--navy)', cursor: 'pointer',
  };
}

// Period config (admin uses)
function PeriodsEditor({ showToast }) {
  const d = DataStore.load();
  const [periods, setPeriods] = useStateSched(d.meta.periods || DEFAULT_PERIODS);

  const update = (i, patch) => {
    const next = [...periods];
    next[i] = { ...next[i], ...patch };
    setPeriods(next);
  };
  const add = () => setPeriods([...periods, { n: periods.length + 1, start: '16:10', end: '17:00' }]);
  const remove = (i) => setPeriods(periods.filter((_, idx) => idx !== i).map((p, idx) => ({ ...p, n: idx + 1 })));
  const save = () => {
    const dd = DataStore.load();
    dd.meta.periods = periods;
    DataStore.save();
    showToast('บันทึกช่วงเวลาคาบเรียนเรียบร้อยแล้ว ✓');
  };

  return (
    <Card title="ช่วงเวลาคาบเรียน · Period Times" action={
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="outline" size="sm" icon="plus" onClick={add}>เพิ่มคาบ</Button>
        <Button variant="yellow" size="sm" icon="check" onClick={save}>บันทึก</Button>
      </div>
    }>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {periods.map((p, i) => (
          <div key={i} style={{
            padding: 12, background: 'var(--navy-50)', borderRadius: 10,
            border: '1px solid var(--border)', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 8, right: 8,
              width: 28, height: 28, background: 'var(--yellow)', color: 'var(--navy)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 12,
            }}>{p.n}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy-400)', letterSpacing: '.05em', marginBottom: 6 }}>คาบที่ {p.n}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="time" value={p.start} onChange={(e) => update(i, { start: e.target.value })} style={inputStyle()} />
              <span style={{ color: 'var(--navy-400)', fontWeight: 700 }}>–</span>
              <input type="time" value={p.end} onChange={(e) => update(i, { end: e.target.value })} style={inputStyle()} />
            </div>
            <button onClick={() => remove(i)} style={{
              marginTop: 8, background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer',
              fontSize: 11, fontWeight: 600, fontFamily: 'inherit', padding: 0,
            }}>× ลบคาบนี้</button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function inputStyle() {
  return {
    flex: 1, height: 36, padding: '0 8px', border: '1px solid var(--border)',
    borderRadius: 6, fontSize: 13, fontFamily: 'monospace', background: '#fff', color: 'var(--navy)', minWidth: 0,
  };
}

Object.assign(window, { TimetableGrid, ScheduleEditor, PeriodsEditor, colorForSubject, buildTimetable, SUBJECT_COLORS });
