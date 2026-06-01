// Teacher app - manages multiple subjects across multiple classrooms

const { useState: useStateT, useEffect: useEffectT, useMemo: useMemoT } = React;

function TeacherApp({ user, onLogout }) {
  const [tab, setTab] = useStateT('dashboard');
  const [year, setYear] = useStateT(DataStore.load().meta.currentYear);
  const [toast, showToast] = useToast();
  const [, setRefresh] = useStateT(0);
  useEffectT(() => DataStore.subscribe(() => setRefresh((x) => x + 1)), []);

  const TeachingLogComponent = window.TeachingLog;
  const subjects = DataStore.getSubjectsByTeacher(user.id, year);
  const classrooms = DataStore.getClassroomsByTeacher(user.id, year);
  const students = DataStore.getStudentsByTeacher(user.id, year);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <TopBar user={user} onLogout={onLogout} year={year} setYear={setYear} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 28px 48px' }}>
        <TeacherHeader user={user} subjects={subjects} classrooms={classrooms} students={students} year={year} />

        <div style={{ marginTop: 24 }}>
          <Tabs
            active={tab}
            onChange={setTab}
            tabs={[
              { id: 'dashboard', label: 'แดชบอร์ด', icon: 'home' },
              { id: 'schedule', label: 'ตารางสอน', icon: 'calendar' },
              { id: 'attendance', label: 'เช็คชื่อเข้าเรียน', icon: 'check' },
              { id: 'teaching-log', label: 'บันทึกหลังการสอน', icon: 'sheet' },
              { id: 'students', label: 'นักเรียนที่สอน', icon: 'users' },
              { id: 'reports', label: 'รายงานสรุป', icon: 'chart' },
            ]}
          />
        </div>

        {subjects.length === 0 && (
          <Card>
            <Empty
              message={`ยังไม่มีรายวิชาที่มอบหมายให้ในปีการศึกษา ${year} กรุณาติดต่อผู้ดูแลระบบ`}
              icon="book"
            />
          </Card>
        )}

        {subjects.length > 0 && tab === 'dashboard' && (
          <DashboardView user={user} subjects={subjects} classrooms={classrooms} students={students} year={year} setTab={setTab} />
        )}
        {subjects.length > 0 && tab === 'schedule' && (
          <TeacherScheduleView user={user} subjects={subjects} classrooms={classrooms} year={year} />
        )}
        {subjects.length > 0 && tab === 'attendance' && (
          <AttendanceView user={user} subjects={subjects} year={year} showToast={showToast} />
        )}
        {subjects.length > 0 && tab === 'teaching-log' && TeachingLogComponent && (
          <TeachingLogComponent />
        )}
        {subjects.length > 0 && tab === 'students' && (
          <StudentsView user={user} subjects={subjects} classrooms={classrooms} year={year} showToast={showToast} />
        )}
        {subjects.length > 0 && tab === 'reports' && (
          <ReportsView user={user} subjects={subjects} classrooms={classrooms} year={year} />
        )}
      </div>

      <Toast msg={toast?.msg} kind={toast?.kind} />
    </div>
  );
}

function TopBar({ user, onLogout, year, setYear }) {
  return (
    <div style={{
      background: '#fff', borderBottom: '1px solid var(--border)',
      padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 20, gap: 12, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <Logo size="sm" />
        <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>ระบบเช็คชื่อนักเรียน</div>
          <div style={{ fontSize: 11, color: 'var(--navy-400)' }}>Attendance System · CDTI</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <SheetBadge />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--navy-400)', fontWeight: 600 }}>ปีการศึกษา</span>
          <Select value={year} onChange={setYear} options={ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 16, borderLeft: '1px solid var(--border)' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: 'var(--yellow)',
            color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 14,
          }}>{user.avatar}</div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>{user.name}</div>
            <div style={{ fontSize: 11, color: 'var(--navy-400)' }}>{user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'อาจารย์ผู้สอน'}</div>
          </div>
          <Button variant="ghost" size="sm" icon="logout" onClick={onLogout} title="ออกจากระบบ">
            ออกจากระบบ
          </Button>
        </div>
      </div>
    </div>
  );
}

function TeacherHeader({ user, subjects, classrooms, students, year }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-700) 100%)',
      color: '#fff', borderRadius: 16, padding: '24px 28px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', right: -40, top: -40, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,209,67,0.1)' }} />
      <div style={{ position: 'absolute', right: 60, bottom: -60, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,209,67,0.08)' }} />

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: '1 1 360px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--yellow)', letterSpacing: '.1em', marginBottom: 6 }}>
            อาจารย์ผู้สอน · ปีการศึกษา {year}
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{user.name}</h1>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,.8)', marginTop: 8 }}>
            {user.department || 'อาจารย์ผู้สอนรายวิชา'} · สถาบันเทคโนโลยีจิตรลดา
          </div>
          {classrooms.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
              {classrooms.map((c) => (
                <span key={c.id} style={{
                  background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)',
                  padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                }}>{c.name}</span>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <Stat label="รายวิชา" value={subjects.length} suffix="วิชา" />
          <Stat label="ชั้นเรียน" value={classrooms.length} suffix="ห้อง" />
          <Stat label="นักเรียน" value={students.length} suffix="คน" />
          <Stat label="ชั่วโมงรวม" value={subjects.reduce((a, b) => a + b.hours, 0)} suffix="ชม." />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, suffix }) {
  return (
    <div style={{ minWidth: 90 }}>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>
        {value}
        <span style={{ fontSize: 13, marginLeft: 4, color: 'var(--yellow)' }}>{suffix}</span>
      </div>
    </div>
  );
}

// ===================== Dashboard =====================
function DashboardView({ user, subjects, classrooms, students, year, setTab }) {
  const stats = useMemoT(() => {
    let total = 0, present = 0, late = 0, leave = 0, absent = 0;
    subjects.forEach((s) => {
      const cls = DataStore.getStudentsByClassroom(s.classroomId);
      cls.forEach((st) => {
        const r = DataStore.attendanceStats(s.id, st.id);
        total += r.total; present += r.present; late += r.late; leave += r.leave; absent += r.absent;
      });
    });
    const pct = total ? Math.round(((present + late * 0.5) / total) * 100) : 0;
    return { total, present, late, leave, absent, pct };
  }, [subjects]);

  const recent = useMemoT(() => {
    const list = [];
    subjects.forEach((s) => {
      DataStore.getAttendanceBySubject(s.id).slice(0, 3).forEach((r) => {
        list.push({ ...r, subject: s });
      });
    });
    return list.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  }, [subjects]);

  // Subjects grouped by classroom
  const groups = useMemoT(() => {
    const map = new Map();
    subjects.forEach((s) => {
      if (!map.has(s.classroomId)) map.set(s.classroomId, []);
      map.get(s.classroomId).push(s);
    });
    return [...map.entries()].map(([cid, subs]) => ({
      classroom: DataStore.getClassroom(cid),
      subjects: subs,
    }));
  }, [subjects]);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 20 }}>
        <KPI label="เวลาเรียนเฉลี่ย" value={stats.pct + '%'} sub="รวมทุกวิชาทุกห้อง" tone="yellow" big />
        <KPI label="มาเรียน" value={stats.present} sub={`จาก ${stats.total} ครั้ง`} tone="green" />
        <KPI label="สาย" value={stats.late} sub="ครั้ง" tone="amber" />
        <KPI label="ลา" value={stats.leave} sub="ครั้ง" tone="blue" />
        <KPI label="ขาด" value={stats.absent} sub="ครั้ง" tone="red" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        <Card title={`รายวิชาที่รับผิดชอบ · ${subjects.length} วิชา`} action={<Button size="sm" icon="check" onClick={() => setTab('attendance')}>ไปหน้าเช็คชื่อ</Button>} padding={0}>
          {groups.map((g, gi) => (
            <div key={g.classroom?.id || gi}>
              <div style={{
                padding: '10px 24px', background: 'var(--navy-50)',
                fontSize: 12, fontWeight: 700, color: 'var(--navy)',
                borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Icon name="users" size={14} />
                {g.classroom?.name || 'ไม่ระบุชั้นเรียน'}
                <span style={{ marginLeft: 'auto', color: 'var(--navy-400)', fontWeight: 600 }}>
                  {DataStore.getStudentsByClassroom(g.classroom?.id).length} คน
                </span>
              </div>
              {g.subjects.map((s, i) => {
                const cls = DataStore.getStudentsByClassroom(s.classroomId);
                let total = 0, present = 0, late = 0;
                cls.forEach((st) => {
                  const r = DataStore.attendanceStats(s.id, st.id);
                  total += r.total; present += r.present; late += r.late;
                });
                const pct = total ? Math.round(((present + late * 0.5) / total) * 100) : 0;
                return (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10, background: 'var(--yellow-100)', color: 'var(--navy)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
                      fontSize: 11, fontFamily: 'monospace',
                    }}>{s.code.split('-')[1]?.slice(0, 4) || 'CODE'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--navy-400)' }}>{s.code} · {s.hours} ชม. · ภาคเรียนที่ {s.term}</div>
                    </div>
                    <ProgressBar pct={pct} />
                  </div>
                );
              })}
            </div>
          ))}
        </Card>

        <Card title="การเช็คชื่อล่าสุด" padding={0}>
          {recent.length === 0 && <Empty message="ยังไม่มีการบันทึก" icon="calendar" />}
          {recent.map((r, i) => {
            const counts = { present: 0, late: 0, leave: 0, absent: 0 };
            r.records.forEach((x) => (counts[x.status] = (counts[x.status] || 0) + 1));
            const cls = DataStore.getClassroom(r.classroomId);
            return (
              <div key={r.id} style={{
                padding: '14px 20px', borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  background: 'var(--yellow-100)', color: 'var(--navy)', borderRadius: 8,
                  padding: '6px 10px', minWidth: 52, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700 }}>{new Date(r.date).toLocaleDateString('th-TH', { month: 'short' })}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{new Date(r.date).getDate()}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.subject.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--navy-400)' }}>{cls?.name} · คาบ {r.period}</div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <CountChip n={counts.present} color={STATUS_COLOR.present} />
                  <CountChip n={counts.late} color={STATUS_COLOR.late} />
                  <CountChip n={counts.absent} color={STATUS_COLOR.absent} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

function KPI({ label, value, sub, tone = 'navy', big }) {
  const tones = {
    navy: { bg: 'var(--navy-50)', fg: 'var(--navy)' },
    yellow: { bg: 'var(--yellow-100)', fg: 'var(--navy)' },
    green: { bg: '#d1fae5', fg: '#065f46' },
    amber: { bg: '#fef3c7', fg: '#92400e' },
    blue: { bg: '#dbeafe', fg: '#1e40af' },
    red: { bg: '#fee2e2', fg: '#991b1b' },
  };
  const t = tones[tone];
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 16,
      position: 'relative', overflow: 'hidden',
    }}>
      {big && <div style={{ position: 'absolute', right: -10, top: -10, width: 60, height: 60, borderRadius: '50%', background: t.bg, opacity: .7 }} />}
      <div style={{ fontSize: 11, color: 'var(--navy-400)', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', position: 'relative' }}>{label}</div>
      <div style={{ fontSize: big ? 34 : 26, fontWeight: 800, color: t.fg, lineHeight: 1.1, marginTop: 4, position: 'relative' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--navy-400)', marginTop: 2, position: 'relative' }}>{sub}</div>
    </div>
  );
}

function ProgressBar({ pct }) {
  const color = pct >= 80 ? '#1f9d55' : pct >= 60 ? '#e6a700' : '#dc2626';
  return (
    <div style={{ minWidth: 120 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
        <span style={{ color: 'var(--navy-400)', fontWeight: 600 }}>เวลาเรียน</span>
        <span style={{ color, fontWeight: 800 }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: color, transition: 'width .3s' }} />
      </div>
    </div>
  );
}

function CountChip({ n, color }) {
  return (
    <div style={{
      minWidth: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: color + '20', color, fontSize: 11, fontWeight: 800, padding: '0 6px',
    }}>
      {n}
    </div>
  );
}

window.TeacherApp = TeacherApp;
window.KPI = KPI;
window.ProgressBar = ProgressBar;
window.CountChip = CountChip;

// =========== Teacher Schedule View ===========
function TeacherScheduleView({ user, subjects, classrooms, year }) {
  const d = DataStore.load();
  const periods = d.meta.periods || DEFAULT_PERIODS;
  const totalHours = subjects.reduce((a, s) => a + s.hours, 0);
  const totalSlots = subjects.reduce((a, s) => a + (s.schedule?.length || 0), 0);
  const totalPeriodsPerWeek = subjects.reduce((a, s) => {
    return a + (s.schedule || []).reduce((b, sl) => b + (sl.endPeriod - sl.startPeriod + 1), 0);
  }, 0);

  const subjectsWithoutSchedule = subjects.filter((s) => !s.schedule || s.schedule.length === 0);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <KPI label="รายวิชา" value={subjects.length} sub="วิชา" tone="yellow" big />
        <KPI label="ชั้นเรียน" value={classrooms.length} sub="ห้อง" tone="navy" />
        <KPI label="คาบต่อสัปดาห์" value={totalPeriodsPerWeek} sub="คาบ/สัปดาห์" tone="blue" />
        <KPI label="ชั่วโมงรวม" value={totalHours} sub="ชม./ภาคเรียน" tone="green" />
      </div>

      {subjectsWithoutSchedule.length > 0 && (
        <div style={{
          padding: 14, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10,
          marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 22 }}>⚠️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>
              มี {subjectsWithoutSchedule.length} วิชาที่ยังไม่ได้กำหนดตารางสอน
            </div>
            <div style={{ fontSize: 12, color: '#a16207', marginTop: 2 }}>
              {subjectsWithoutSchedule.map((s) => s.code).join(', ')} — ติดต่อผู้ดูแลระบบเพื่อเพิ่มตารางสอน
            </div>
          </div>
        </div>
      )}

      <Card
        title={`ตารางสอนรายสัปดาห์ · ${user.name} · ปีการศึกษา ${year}`}
        action={<Button variant="outline" size="sm" icon="pdf" onClick={() => window.open(`schedule.html?teacher=${user.id}&year=${year}`, '_blank')}>Export PDF</Button>}
      >
        <TimetableGrid subjects={subjects} periods={periods} showClassroom />
      </Card>

      <Card title="รายละเอียดรายวิชาและช่วงเวลา" style={{ marginTop: 16 }} padding={0}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--navy-50)' }}>
              <Th style={{ width: 50 }}>#</Th>
              <Th style={{ width: 100 }}>รหัส</Th>
              <Th>รายวิชา</Th>
              <Th>ชั้นเรียน</Th>
              <Th>ตารางสอน</Th>
              <Th style={{ width: 80, textAlign: 'center' }}>ชม.</Th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s, i) => {
              const cls = DataStore.getClassroom(s.classroomId);
              const c = colorForSubject(s.id);
              return (
                <tr key={s.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <Td>{i + 1}</Td>
                  <Td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.code}</Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 4, height: 24, background: c.border, borderRadius: 2 }} />
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                    </div>
                  </Td>
                  <Td style={{ fontSize: 12, color: 'var(--navy-400)' }}>{cls?.name || '—'}</Td>
                  <Td>
                    {(s.schedule || []).length === 0
                      ? <span style={{ color: '#dc2626', fontSize: 12, fontWeight: 600 }}>⚠ ยังไม่ได้ตั้ง</span>
                      : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {(s.schedule || []).map((sl, j) => {
                            const day = DAYS.find((d) => d.n === sl.day);
                            return (
                              <span key={j} style={{
                                padding: '3px 8px', background: 'var(--navy-50)', borderRadius: 6,
                                fontSize: 11, color: 'var(--navy)', fontWeight: 600,
                              }}>
                                {day?.short} · คาบ {sl.startPeriod}{sl.endPeriod !== sl.startPeriod ? `-${sl.endPeriod}` : ''}
                                {sl.room ? ` · ${sl.room}` : ''}
                              </span>
                            );
                          })}
                        </div>
                      )}
                  </Td>
                  <Td style={{ textAlign: 'center', fontWeight: 700 }}>{s.hours}</Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

window.TeacherScheduleView = TeacherScheduleView;
