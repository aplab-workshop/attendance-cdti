// Admin Panel - manage users, subjects, classrooms, academic years, and global reports

const { useState: useStateAd, useEffect: useEffectAd, useMemo: useMemoAd } = React;

function AdminApp({ user, onLogout }) {
  const [tab, setTab] = useStateAd('overview');
  const [toast, showToast] = useToast();
  const [, setRefresh] = useStateAd(0);
  useEffectAd(() => DataStore.subscribe(() => setRefresh((x) => x + 1)), []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <AdminTopBar user={user} onLogout={onLogout} />

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 64px)' }}>
        {/* Sidebar */}
        <div style={{ background: '#fff', borderRight: '1px solid var(--border)', padding: '20px 12px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy-400)', padding: '0 10px 8px', letterSpacing: '.1em' }}>
            ADMIN PANEL
          </div>
          {[
            { id: 'overview', label: 'ภาพรวมระบบ', icon: 'home' },
            { id: 'users', label: 'อาจารย์ผู้สอน', icon: 'user' },
            { id: 'classrooms', label: 'ชั้นเรียน', icon: 'users' },
            { id: 'subjects', label: 'รายวิชา', icon: 'book' },
            { id: 'students', label: 'นักเรียน', icon: 'users' },
            { id: 'schedule', label: 'ตารางสอน', icon: 'calendar' },
            { id: 'years', label: 'ปีการศึกษา', icon: 'calendar' },
            { id: 'reports', label: 'รายงานส่วนกลาง', icon: 'chart' },
            { id: 'data', label: 'ข้อมูลและ Sheets', icon: 'sheet' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', marginBottom: 2, border: 'none',
                borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 14, fontWeight: tab === t.id ? 700 : 500,
                background: tab === t.id ? 'var(--navy)' : 'transparent',
                color: tab === t.id ? '#fff' : 'var(--navy-700)',
                textAlign: 'left',
              }}
            >
              <Icon name={t.icon} size={18} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '28px 32px', maxWidth: 1280 }}>
          {tab === 'overview' && <OverviewTab />}
          {tab === 'users' && <UsersTab showToast={showToast} />}
          {tab === 'classrooms' && <ClassroomsTab showToast={showToast} />}
          {tab === 'subjects' && <SubjectsTab showToast={showToast} />}
          {tab === 'students' && <AdminStudentsTab showToast={showToast} />}
          {tab === 'schedule' && <AdminScheduleTab showToast={showToast} />}
          {tab === 'years' && <YearsTab showToast={showToast} />}
          {tab === 'reports' && <CentralReportsTab />}
          {tab === 'data' && <DataTab showToast={showToast} />}
        </div>
      </div>

      <Toast msg={toast?.msg} kind={toast?.kind} />
    </div>
  );
}

function AdminTopBar({ user, onLogout }) {
  return (
    <div style={{
      background: 'var(--navy)', color: '#fff', padding: '12px 28px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '3px solid var(--yellow)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ background: '#fff', padding: '6px 10px', borderRadius: 8 }}>
          <Logo size="sm" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>ระบบเช็คชื่อนักเรียน · Admin Panel</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>สถาบันเทคโนโลยีจิตรลดา</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <SheetBadge />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: 'var(--yellow)',
            color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
          }}>A</div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{user.name}</div>
            <div style={{ fontSize: 11, color: 'var(--yellow)' }}>System Administrator</div>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.2)',
              padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
              fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            <Icon name="logout" size={14} />
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== Overview ====================
function OverviewTab() {
  const d = DataStore.load();
  const totalSessions = d.attendance.length;
  let p = 0, l = 0, lv = 0, a = 0;
  d.attendance.forEach((rec) => rec.records.forEach((x) => {
    if (x.status === 'present') p++;
    else if (x.status === 'late') l++;
    else if (x.status === 'leave') lv++;
    else if (x.status === 'absent') a++;
  }));
  const totalCount = p + l + lv + a;

  return (
    <div>
      <PageTitle title="ภาพรวมระบบ" sub="สถิติทั้งหมดของระบบเช็คชื่อ" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <BigStat label="ครูประจำชั้น" value={d.users.filter((u) => u.role === 'teacher').length} icon="user" tone="navy" />
        <BigStat label="ชั้นเรียน" value={d.classrooms.length} icon="users" tone="yellow" />
        <BigStat label="รายวิชา" value={d.subjects.length} icon="book" tone="green" />
        <BigStat label="นักเรียน" value={d.students.length} icon="users" tone="blue" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card title="สถิติการเช็คชื่อทั้งระบบ">
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <DonutChart data={{ present: p, late: l, leave: lv, absent: a, total: totalCount }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--navy)' }}>{totalSessions}</div>
              <div style={{ fontSize: 12, color: 'var(--navy-400)', marginBottom: 16 }}>การเช็คชื่อทั้งหมด</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--navy)' }}>{totalCount.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: 'var(--navy-400)' }}>บันทึกรายนักเรียน</div>
            </div>
          </div>
        </Card>

        <Card title="กิจกรรมล่าสุด">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {d.attendance.slice(-6).reverse().map((r) => {
              const subj = d.subjects.find((s) => s.id === r.subjectId);
              const cls = d.classrooms.find((c) => c.id === r.classroomId);
              return (
                <div key={r.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ background: 'var(--navy-50)', color: 'var(--navy)', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                    {new Date(r.date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })}
                  </div>
                  <div style={{ flex: 1, fontSize: 12 }}>
                    <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{subj?.name}</div>
                    <div style={{ color: 'var(--navy-400)' }}>{cls?.name} · คาบ {r.period}</div>
                  </div>
                </div>
              );
            })}
            {d.attendance.length === 0 && <Empty message="ยังไม่มีกิจกรรม" />}
          </div>
        </Card>
      </div>
    </div>
  );
}

function BigStat({ label, value, icon, tone }) {
  const tones = {
    navy: { bg: 'var(--navy)', fg: '#fff', accent: 'var(--yellow)' },
    yellow: { bg: 'var(--yellow)', fg: 'var(--navy)', accent: 'var(--navy)' },
    green: { bg: '#1f9d55', fg: '#fff', accent: '#fff' },
    blue: { bg: '#2563eb', fg: '#fff', accent: '#fff' },
  };
  const t = tones[tone];
  return (
    <div style={{
      background: t.bg, color: t.fg, padding: 20, borderRadius: 12,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', right: -10, top: -10, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.1)' }} />
      <Icon name={icon} size={28} style={{ color: t.accent, position: 'relative' }} />
      <div style={{ fontSize: 36, fontWeight: 800, marginTop: 6, lineHeight: 1, position: 'relative' }}>{value}</div>
      <div style={{ fontSize: 12, opacity: .8, marginTop: 4, fontWeight: 600, position: 'relative' }}>{label}</div>
    </div>
  );
}

function PageTitle({ title, sub, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--navy)', margin: 0 }}>{title}</h1>
        {sub && <div style={{ fontSize: 13, color: 'var(--navy-400)', marginTop: 4 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

// ==================== Users ====================
function UsersTab({ showToast }) {
  const d = DataStore.load();
  const [editing, setEditing] = useStateAd(null);
  const [assigning, setAssigning] = useStateAd(null); // teacher being assigned subjects
  const teachers = d.users.filter((u) => u.role === 'teacher');

  const save = (form) => {
    if (form.id) {
      DataStore.updateUser(form.id, form);
      showToast('แก้ไขข้อมูลอาจารย์เรียบร้อย ✓');
    } else {
      DataStore.addUser({ ...form, role: 'teacher' });
      showToast('เพิ่มอาจารย์เรียบร้อย ✓');
    }
    setEditing(null);
  };
  const del = (u) => {
    if (!confirm(`ลบ ${u.name}?`)) return;
    DataStore.deleteUser(u.id);
    showToast('ลบเรียบร้อย', 'info');
  };

  return (
    <div>
      <PageTitle
        title="อาจารย์ผู้สอน"
        sub="เพิ่ม / แก้ไข / ลบ ผู้ใช้งาน · มอบหมายรายวิชาให้อาจารย์รับผิดชอบได้หลายวิชา"
        action={<Button variant="yellow" icon="plus" onClick={() => setEditing({})}>เพิ่มอาจารย์</Button>}
      />
      <Card padding={0}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--navy-50)' }}>
              <Th style={{ width: 50 }}>#</Th>
              <Th>ชื่อ-สกุล</Th>
              <Th style={{ width: 140 }}>Username</Th>
              <Th style={{ width: 110 }}>Password</Th>
              <Th>รายวิชา / ชั้นที่สอน</Th>
              <Th style={{ width: 220 }}>การดำเนินการ</Th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((u, i) => {
              const subs = d.subjects.filter((s) => s.teacherId === u.id);
              const classes = [...new Set(subs.map((s) => s.classroomId))];
              return (
                <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <Td>{i + 1}</Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', background: 'var(--yellow)',
                        color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
                      }}>{u.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--navy-400)' }}>{u.department || '—'}</div>
                      </div>
                    </div>
                  </Td>
                  <Td style={{ fontFamily: 'monospace', fontSize: 12 }}>{u.username}</Td>
                  <Td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--navy-400)' }}>{'•'.repeat(u.password.length)}</Td>
                  <Td>
                    {subs.length === 0 ? (
                      <span style={{ color: 'var(--navy-400)', fontSize: 12 }}>ยังไม่ได้มอบหมายรายวิชา</span>
                    ) : (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>
                          {subs.length} รายวิชา · {classes.length} ชั้นเรียน
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--navy-400)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 380, whiteSpace: 'nowrap' }}>
                          {subs.map((s) => s.code).join(', ')}
                        </div>
                      </div>
                    )}
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Button variant="yellow" size="sm" icon="book" onClick={() => setAssigning(u)}>รายวิชา</Button>
                      <Button variant="ghost" size="sm" icon="edit" onClick={() => setEditing(u)}>แก้ไข</Button>
                      <Button variant="danger" size="sm" icon="trash" onClick={() => del(u)}>ลบ</Button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <UserFormModal user={editing} onClose={() => setEditing(null)} onSave={save} />
      <AssignSubjectsModal teacher={assigning} onClose={() => setAssigning(null)} showToast={showToast} />
    </div>
  );
}

function UserFormModal({ user, onClose, onSave }) {
  const [form, setForm] = useStateAd({});
  useEffectAd(() => {
    setForm(user ? { username: '', password: '', name: '', department: '', ...user } : {});
  }, [user]);
  if (!user) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.username || !form.password || !form.name) {
      alert('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    onSave(form);
  };

  return (
    <Modal
      open={!!user}
      onClose={onClose}
      title={form.id ? 'แก้ไขอาจารย์ผู้สอน' : 'เพิ่มอาจารย์ผู้สอน'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>ยกเลิก</Button>
          <Button variant="yellow" icon="check" onClick={submit}>บันทึก</Button>
        </>
      }
    >
      <Field label="ชื่อ-นามสกุล" required>
        <Input value={form.name} onChange={(v) => set('name', v)} placeholder="เช่น อ.สมศรี ใจดี" />
      </Field>
      <Field label="แผนกวิชา / สาขาวิชา">
        <Input value={form.department} onChange={(v) => set('department', v)} placeholder="เช่น เทคโนโลยีสารสนเทศ" />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Username" required>
          <Input value={form.username} onChange={(v) => set('username', v)} icon="user" />
        </Field>
        <Field label="Password" required>
          <Input value={form.password} onChange={(v) => set('password', v)} icon="lock" />
        </Field>
      </div>
      <div style={{
        marginTop: 8, padding: 12, background: 'var(--navy-50)', borderRadius: 8,
        fontSize: 12, color: 'var(--navy-700)', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Icon name="bell" size={14} />
        มอบหมายรายวิชาให้อาจารย์ผ่านปุ่ม "รายวิชา" หลังบันทึกข้อมูลบัญชีแล้ว
      </div>
    </Modal>
  );
}

// New: assign multiple subjects to a teacher
function AssignSubjectsModal({ teacher, onClose, showToast }) {
  const [year, setYear] = useStateAd(DataStore.load().meta.currentYear);
  if (!teacher) return null;
  const d = DataStore.load();
  const subsAll = d.subjects.filter((s) => year === 'all' || s.year === year);

  const toggle = (subjectId, checked) => {
    DataStore.updateSubject(subjectId, { teacherId: checked ? teacher.id : null });
  };

  // Group by classroom
  const byClass = new Map();
  subsAll.forEach((s) => {
    if (!byClass.has(s.classroomId)) byClass.set(s.classroomId, []);
    byClass.get(s.classroomId).push(s);
  });

  const mine = subsAll.filter((s) => s.teacherId === teacher.id);

  return (
    <Modal
      open={!!teacher}
      onClose={onClose}
      title={`มอบหมายรายวิชา · ${teacher.name}`}
      width={760}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>ปิด</Button>
          <Button variant="yellow" icon="check" onClick={() => { onClose(); showToast('บันทึกการมอบหมายเรียบร้อย ✓'); }}>เสร็จสิ้น</Button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>ปีการศึกษา:</span>
        <Select value={year} onChange={setYear} options={[{ value: 'all', label: 'ทั้งหมด' }, ...ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))]} />
        <div style={{ marginLeft: 'auto', padding: '4px 12px', background: 'var(--yellow-100)', borderRadius: 999, fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>
          มอบหมายแล้ว {mine.length} วิชา
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[...byClass.entries()].map(([cid, subs]) => {
          const cls = d.classrooms.find((c) => c.id === cid);
          return (
            <div key={cid} style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{
                background: 'var(--navy-50)', padding: '10px 14px', fontSize: 13, fontWeight: 700,
                color: 'var(--navy)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span><Icon name="users" size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />{cls?.name || '—'}</span>
                <span style={{ fontSize: 11, color: 'var(--navy-400)' }}>ปี {cls?.year} · {subs.length} วิชา</span>
              </div>
              {subs.map((s) => {
                const owner = d.users.find((u) => u.id === s.teacherId);
                const checked = s.teacherId === teacher.id;
                const ownedByOther = s.teacherId && s.teacherId !== teacher.id;
                return (
                  <label key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    borderTop: '1px solid var(--border)', cursor: 'pointer',
                    background: checked ? 'var(--yellow-50)' : '#fff',
                  }}>
                    <input
                      type="checkbox" checked={checked}
                      onChange={(e) => toggle(s.id, e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: 'var(--navy)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--navy-400)' }}>{s.code} · {s.hours} ชม. · ภาคเรียนที่ {s.term}</div>
                    </div>
                    {ownedByOther && (
                      <span style={{
                        fontSize: 11, padding: '3px 8px', background: '#fef2f2', color: '#b91c1c',
                        borderRadius: 999, fontWeight: 600,
                      }}>มอบให้ {owner?.name}</span>
                    )}
                  </label>
                );
              })}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

// ==================== Classrooms ====================
function ClassroomsTab({ showToast }) {
  const d = DataStore.load();
  const [editing, setEditing] = useStateAd(null);

  const save = (form) => {
    if (form.id) {
      DataStore.updateClassroom(form.id, form);
      showToast('แก้ไขชั้นเรียนเรียบร้อย ✓');
    } else {
      DataStore.addClassroom(form);
      showToast('เพิ่มชั้นเรียนเรียบร้อย ✓');
    }
    setEditing(null);
  };
  const del = (c) => {
    if (!confirm(`ลบ ${c.name}? นักเรียนและรายวิชาที่ผูกอยู่จะคงอยู่`)) return;
    DataStore.deleteClassroom(c.id);
    showToast('ลบเรียบร้อย', 'info');
  };

  return (
    <div>
      <PageTitle
        title="ชั้นเรียน"
        sub="เพิ่ม / แก้ไข / ลบ ชั้นเรียนที่เปิดสอน"
        action={<Button variant="yellow" icon="plus" onClick={() => setEditing({ year: d.meta.currentYear })}>เพิ่มชั้นเรียน</Button>}
      />
      <Card padding={0}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--navy-50)' }}>
              <Th style={{ width: 50 }}>#</Th>
              <Th>ชั้นเรียน</Th>
              <Th>สาขาวิชา</Th>
              <Th style={{ width: 110 }}>ปีการศึกษา</Th>
              <Th style={{ width: 90, textAlign: 'center' }}>นักเรียน</Th>
              <Th style={{ width: 90, textAlign: 'center' }}>รายวิชา</Th>
              <Th>อาจารย์ผู้สอน</Th>
              <Th style={{ width: 140 }}>การดำเนินการ</Th>
            </tr>
          </thead>
          <tbody>
            {d.classrooms.map((c, i) => {
              const subs = d.subjects.filter((s) => s.classroomId === c.id);
              const teacherIds = [...new Set(subs.map((s) => s.teacherId).filter(Boolean))];
              const teachers = teacherIds.map((tid) => d.users.find((u) => u.id === tid)).filter(Boolean);
              const count = d.students.filter((s) => s.classroomId === c.id).length;
              return (
                <tr key={c.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <Td>{i + 1}</Td>
                  <Td style={{ fontWeight: 700 }}>{c.name}</Td>
                  <Td>{c.program}</Td>
                  <Td>{c.year}</Td>
                  <Td style={{ textAlign: 'center', fontWeight: 700 }}>{count}</Td>
                  <Td style={{ textAlign: 'center', fontWeight: 700 }}>{subs.length}</Td>
                  <Td>
                    {teachers.length === 0
                      ? <span style={{ color: 'var(--navy-400)' }}>—</span>
                      : <span style={{ fontSize: 12 }}>{teachers.map((t) => t.name).join(', ')}</span>}
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button variant="ghost" size="sm" icon="edit" onClick={() => setEditing(c)}>แก้ไข</Button>
                      <Button variant="danger" size="sm" icon="trash" onClick={() => del(c)}>ลบ</Button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <ClassroomFormModal classroom={editing} onClose={() => setEditing(null)} onSave={save} />
    </div>
  );
}

function ClassroomFormModal({ classroom, onClose, onSave }) {
  const [form, setForm] = useStateAd({});
  useEffectAd(() => {
    setForm(classroom ? { name: '', grade: 'ปวช.1', section: '1', program: '', year: '2568', ...classroom } : {});
  }, [classroom]);
  if (!classroom) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name || !form.program) {
      alert('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    onSave(form);
  };

  return (
    <Modal
      open={!!classroom}
      onClose={onClose}
      title={form.id ? 'แก้ไขชั้นเรียน' : 'เพิ่มชั้นเรียน'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>ยกเลิก</Button>
          <Button variant="yellow" icon="check" onClick={submit}>บันทึก</Button>
        </>
      }
    >
      <Field label="ชื่อชั้นเรียน" required>
        <Input value={form.name} onChange={(v) => set('name', v)} placeholder="เช่น ปวช.1/3 เทคโนโลยีสารสนเทศ" />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="ระดับชั้น">
          <Select value={form.grade} onChange={(v) => set('grade', v)} options={['ปวช.1', 'ปวช.2', 'ปวช.3', 'ปวส.1', 'ปวส.2'].map((g) => ({ value: g, label: g }))} />
        </Field>
        <Field label="ห้อง">
          <Input value={form.section} onChange={(v) => set('section', v)} placeholder="1" />
        </Field>
        <Field label="ปีการศึกษา">
          <Select value={form.year} onChange={(v) => set('year', v)} options={ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))} />
        </Field>
      </div>
      <Field label="สาขาวิชา" required>
        <Input value={form.program} onChange={(v) => set('program', v)} />
      </Field>
      <div style={{
        marginTop: 8, padding: 12, background: 'var(--navy-50)', borderRadius: 8,
        fontSize: 12, color: 'var(--navy-700)', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Icon name="bell" size={14} />
        มอบหมายอาจารย์ผู้สอนให้ชั้นเรียนผ่านเมนู "รายวิชา" — อาจารย์ 1 คนสอนได้หลายวิชาในชั้นเรียนเดียวกันได้
      </div>
    </Modal>
  );
}

// ==================== Subjects ====================
function SubjectsTab({ showToast }) {
  const d = DataStore.load();
  const [editing, setEditing] = useStateAd(null);
  const [yearF, setYearF] = useStateAd('all');
  const [classF, setClassF] = useStateAd('all');

  const filtered = d.subjects.filter((s) => (yearF === 'all' || s.year === yearF) && (classF === 'all' || s.classroomId === classF));

  const save = (form) => {
    if (form.id) {
      DataStore.updateSubject(form.id, form);
      showToast('แก้ไขรายวิชาเรียบร้อย ✓');
    } else {
      DataStore.addSubject(form);
      showToast('เพิ่มรายวิชาเรียบร้อย ✓');
    }
    setEditing(null);
  };
  const del = (s) => {
    if (!confirm(`ลบ ${s.name}? ประวัติการเช็คชื่อในวิชานี้จะถูกลบด้วย`)) return;
    DataStore.deleteSubject(s.id);
    showToast('ลบเรียบร้อย', 'info');
  };

  return (
    <div>
      <PageTitle
        title="รายวิชา"
        sub="กำหนดรายวิชาที่เปิดสอน และจำนวนชั่วโมงเรียนต่อวิชา"
        action={<Button variant="yellow" icon="plus" onClick={() => setEditing({ year: d.meta.currentYear, hours: 40, term: 1 })}>เพิ่มรายวิชา</Button>}
      />

      <Card padding={16} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
          <div style={{ minWidth: 160 }}>
            <Field label="ปีการศึกษา">
              <Select value={yearF} onChange={setYearF} options={[{ value: 'all', label: 'ทั้งหมด' }, ...ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))]} />
            </Field>
          </div>
          <div style={{ minWidth: 280 }}>
            <Field label="ชั้นเรียน">
              <Select value={classF} onChange={setClassF} options={[{ value: 'all', label: 'ทั้งหมด' }, ...d.classrooms.map((c) => ({ value: c.id, label: c.name }))]} />
            </Field>
          </div>
        </div>
      </Card>

      <Card padding={0}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--navy-50)' }}>
              <Th style={{ width: 50 }}>#</Th>
              <Th style={{ width: 120 }}>รหัสวิชา</Th>
              <Th>ชื่อวิชา</Th>
              <Th>อาจารย์ผู้สอน</Th>
              <Th>ชั้นเรียน</Th>
              <Th style={{ width: 100 }}>ปีการศึกษา</Th>
              <Th style={{ width: 70, textAlign: 'center' }}>ภาค</Th>
              <Th style={{ width: 80, textAlign: 'center' }}>ชั่วโมง</Th>
              <Th style={{ width: 140 }}>การดำเนินการ</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => {
              const cls = d.classrooms.find((c) => c.id === s.classroomId);
              const teacher = d.users.find((u) => u.id === s.teacherId);
              return (
                <tr key={s.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <Td>{i + 1}</Td>
                  <Td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.code}</Td>
                  <Td style={{ fontWeight: 600 }}>{s.name}</Td>
                  <Td>
                    {teacher ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%', background: 'var(--yellow)',
                          color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 800,
                        }}>{teacher.avatar}</div>
                        <span style={{ fontSize: 12 }}>{teacher.name}</span>
                      </div>
                    ) : (
                      <span style={{ color: '#dc2626', fontSize: 12, fontWeight: 600 }}>⚠ ยังไม่มีผู้สอน</span>
                    )}
                  </Td>
                  <Td>{cls?.name || '—'}</Td>
                  <Td>{s.year}</Td>
                  <Td style={{ textAlign: 'center' }}>{s.term}</Td>
                  <Td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--navy)' }}>{s.hours}</Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button variant="ghost" size="sm" icon="edit" onClick={() => setEditing(s)}>แก้ไข</Button>
                      <Button variant="danger" size="sm" icon="trash" onClick={() => del(s)}>ลบ</Button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <SubjectFormModal subject={editing} onClose={() => setEditing(null)} onSave={save} />
    </div>
  );
}

function SubjectFormModal({ subject, onClose, onSave }) {
  const [form, setForm] = useStateAd({});
  useEffectAd(() => {
    setForm(subject ? { code: '', name: '', hours: 40, term: 1, classroomId: '', year: '2568', teacherId: '', ...subject } : {});
  }, [subject]);
  if (!subject) return null;
  const d = DataStore.load();
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.code || !form.name || !form.classroomId) {
      alert('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    onSave({ ...form, hours: Number(form.hours), term: Number(form.term) });
  };

  return (
    <Modal
      open={!!subject}
      onClose={onClose}
      title={form.id ? 'แก้ไขรายวิชา' : 'เพิ่มรายวิชา'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>ยกเลิก</Button>
          <Button variant="yellow" icon="check" onClick={submit}>บันทึก</Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
        <Field label="รหัสวิชา" required>
          <Input value={form.code} onChange={(v) => set('code', v)} placeholder="20901-1001" />
        </Field>
        <Field label="ชื่อวิชา" required>
          <Input value={form.name} onChange={(v) => set('name', v)} />
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="ชั้นเรียน" required>
          <Select
            value={form.classroomId}
            onChange={(v) => set('classroomId', v)}
            options={[{ value: '', label: 'เลือกชั้นเรียน' }, ...d.classrooms.map((c) => ({ value: c.id, label: c.name }))]}
          />
        </Field>
        <Field label="อาจารย์ผู้สอน">
          <Select
            value={form.teacherId}
            onChange={(v) => set('teacherId', v)}
            options={[{ value: '', label: 'ยังไม่ได้มอบหมาย' }, ...d.users.filter((u) => u.role === 'teacher').map((u) => ({ value: u.id, label: u.name }))]}
          />
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="ปีการศึกษา">
          <Select value={form.year} onChange={(v) => set('year', v)} options={ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))} />
        </Field>
        <Field label="ภาคเรียน">
          <Select value={form.term} onChange={(v) => set('term', v)} options={[1, 2].map((t) => ({ value: t, label: `ภาคเรียนที่ ${t}` }))} />
        </Field>
        <Field label="จำนวนชั่วโมง" required>
          <Input type="number" value={form.hours} onChange={(v) => set('hours', v)} />
        </Field>
      </div>

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <ScheduleEditor
          schedule={form.schedule || []}
          onChange={(s) => set('schedule', s)}
          periods={DataStore.load().meta.periods || DEFAULT_PERIODS}
        />
      </div>
    </Modal>
  );
}

// ==================== Students (Admin manages all students) ====================
function AdminStudentsTab({ showToast }) {
  const d = DataStore.load();
  const [editing, setEditing] = useStateAd(null);
  const [filter, setFilter] = useStateAd('');
  const [classF, setClassF] = useStateAd('all');

  const students = d.students
    .filter((s) => classF === 'all' || s.classroomId === classF)
    .filter((s) => {
      const q = filter.toLowerCase();
      return !q || s.firstName.toLowerCase().includes(q) || s.lastName.toLowerCase().includes(q) || s.studentNo.includes(q) || s.nickname.toLowerCase().includes(q);
    })
    .sort((a, b) => a.studentNo.localeCompare(b.studentNo));

  const save = (form) => {
    if (form.id) {
      DataStore.updateStudent(form.id, form);
      showToast('แก้ไขข้อมูลนักเรียนเรียบร้อย ✓');
    } else {
      DataStore.addStudent(form);
      showToast('เพิ่มนักเรียนใหม่เรียบร้อย ✓');
    }
    setEditing(null);
  };
  const del = (s) => {
    if (!confirm(`ลบ ${s.firstName} ${s.lastName}? ประวัติการเช็คชื่อของนักเรียนคนนี้จะถูกลบด้วย`)) return;
    DataStore.deleteStudent(s.id);
    showToast('ลบเรียบร้อย', 'info');
  };

  return (
    <div>
      <PageTitle
        title="นักเรียน"
        sub="เพิ่ม / แก้ไข / ลบข้อมูลนักเรียนทั้งหมดในระบบ"
        action={<Button variant="yellow" icon="plus" onClick={() => setEditing({ gender: 'M', classroomId: d.classrooms[0]?.id || '' })}>เพิ่มนักเรียน</Button>}
      />

      <Card padding={16} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
          <div style={{ minWidth: 280 }}>
            <Field label="ชั้นเรียน">
              <Select value={classF} onChange={setClassF} options={[{ value: 'all', label: 'ทั้งหมด' }, ...d.classrooms.map((c) => ({ value: c.id, label: c.name }))]} />
            </Field>
          </div>
          <div style={{ flex: 1, maxWidth: 360 }}>
            <Field label="ค้นหา">
              <Input value={filter} onChange={setFilter} placeholder="ชื่อ / เลขที่ / ชื่อเล่น" icon="search" />
            </Field>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ marginBottom: 14, fontSize: 13, color: 'var(--navy-400)', fontWeight: 600 }}>
            พบ {students.length} คน
          </div>
        </div>
      </Card>

      <Card padding={0}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--navy-50)' }}>
                <Th style={{ width: 50 }}>#</Th>
                <Th style={{ width: 120 }}>เลขประจำตัว</Th>
                <Th>ชื่อ-นามสกุล</Th>
                <Th style={{ width: 90 }}>ชื่อเล่น</Th>
                <Th style={{ width: 70 }}>เพศ</Th>
                <Th>ชั้นเรียน</Th>
                <Th style={{ width: 140 }}>การดำเนินการ</Th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const cls = d.classrooms.find((c) => c.id === s.classroomId);
                return (
                  <tr key={s.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <Td>{i + 1}</Td>
                    <Td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.studentNo}</Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: s.gender === 'F' ? '#fde2e2' : '#dbeafe',
                          color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                        }}>{s.firstName.charAt(0)}</div>
                        <span style={{ fontWeight: 600 }}>{s.firstName} {s.lastName}</span>
                      </div>
                    </Td>
                    <Td style={{ color: 'var(--navy-400)' }}>{s.nickname}</Td>
                    <Td>
                      <span style={{
                        padding: '2px 8px', background: s.gender === 'F' ? '#fde2e2' : '#dbeafe',
                        color: 'var(--navy)', borderRadius: 999, fontSize: 11, fontWeight: 700,
                      }}>{s.gender === 'F' ? 'หญิง' : 'ชาย'}</span>
                    </Td>
                    <Td>{cls?.name || '—'}</Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Button variant="ghost" size="sm" icon="edit" onClick={() => setEditing(s)}>แก้ไข</Button>
                        <Button variant="danger" size="sm" icon="trash" onClick={() => del(s)}>ลบ</Button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--navy-400)' }}>ไม่พบข้อมูลนักเรียน</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AdminStudentFormModal student={editing} onClose={() => setEditing(null)} onSave={save} />
    </div>
  );
}

function AdminStudentFormModal({ student, onClose, onSave }) {
  const [form, setForm] = useStateAd({});
  useEffectAd(() => {
    setForm(student ? { studentNo: '', firstName: '', lastName: '', nickname: '', gender: 'M', classroomId: '', ...student } : {});
  }, [student]);
  if (!student) return null;
  const d = DataStore.load();
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const isEdit = !!form.id;

  const submit = () => {
    if (!form.studentNo || !form.firstName || !form.lastName || !form.classroomId) {
      alert('กรุณากรอกข้อมูลที่จำเป็น');
      return;
    }
    onSave(form);
  };

  return (
    <Modal
      open={!!student}
      onClose={onClose}
      title={isEdit ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>ยกเลิก</Button>
          <Button variant="yellow" icon="check" onClick={submit}>บันทึกข้อมูล</Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="เลขประจำตัวนักเรียน" required>
          <Input value={form.studentNo} onChange={(v) => set('studentNo', v)} placeholder="เช่น 67301013" />
        </Field>
        <Field label="เพศ" required>
          <Select value={form.gender} onChange={(v) => set('gender', v)} options={[{ value: 'M', label: 'ชาย' }, { value: 'F', label: 'หญิง' }]} />
        </Field>
        <Field label="ชื่อ" required>
          <Input value={form.firstName} onChange={(v) => set('firstName', v)} />
        </Field>
        <Field label="นามสกุล" required>
          <Input value={form.lastName} onChange={(v) => set('lastName', v)} />
        </Field>
        <Field label="ชื่อเล่น">
          <Input value={form.nickname} onChange={(v) => set('nickname', v)} />
        </Field>
        <Field label="ชั้นเรียน" required>
          <Select
            value={form.classroomId}
            onChange={(v) => set('classroomId', v)}
            options={[{ value: '', label: 'เลือกชั้นเรียน' }, ...d.classrooms.map((c) => ({ value: c.id, label: c.name }))]}
          />
        </Field>
      </div>
    </Modal>
  );
}

// ==================== Years ====================
function YearsTab({ showToast }) {
  const d = DataStore.load();
  const current = d.meta.currentYear;
  return (
    <div>
      <PageTitle title="ปีการศึกษา" sub="กำหนดปีการศึกษาปัจจุบันที่ใช้งานในระบบ" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {ACADEMIC_YEARS.map((y) => {
          const active = y === current;
          const counts = {
            classrooms: d.classrooms.filter((c) => c.year === y).length,
            subjects: d.subjects.filter((s) => s.year === y).length,
            sessions: d.attendance.filter((a) => {
              const s = d.subjects.find((x) => x.id === a.subjectId);
              return s && s.year === y;
            }).length,
          };
          return (
            <div key={y} style={{
              background: active ? 'var(--navy)' : '#fff',
              color: active ? '#fff' : 'var(--navy)',
              border: `1px solid ${active ? 'var(--navy)' : 'var(--border)'}`,
              borderRadius: 14, padding: 24,
              position: 'relative', overflow: 'hidden',
            }}>
              {active && (
                <div style={{
                  position: 'absolute', top: 12, right: 12, background: 'var(--yellow)', color: 'var(--navy)',
                  padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800,
                }}>ปัจจุบัน</div>
              )}
              <div style={{ fontSize: 12, fontWeight: 700, opacity: .7, letterSpacing: '.05em' }}>ปีการศึกษา</div>
              <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1, marginTop: 4 }}>{y}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 16, fontSize: 12 }}>
                <div><div style={{ fontWeight: 800, fontSize: 18 }}>{counts.classrooms}</div><div style={{ opacity: .7 }}>ชั้นเรียน</div></div>
                <div><div style={{ fontWeight: 800, fontSize: 18 }}>{counts.subjects}</div><div style={{ opacity: .7 }}>รายวิชา</div></div>
                <div><div style={{ fontWeight: 800, fontSize: 18 }}>{counts.sessions}</div><div style={{ opacity: .7 }}>การเช็คชื่อ</div></div>
              </div>
              {!active && (
                <Button variant="outline" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
                  onClick={() => { const dd = DataStore.load(); dd.meta.currentYear = y; DataStore.save(); showToast(`ตั้งค่าปี ${y} เป็นปัจจุบันแล้ว`); }}
                >ตั้งเป็นปีปัจจุบัน</Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== Central Reports ====================
function CentralReportsTab() {
  const d = DataStore.load();
  const [year, setYear] = useStateAd(d.meta.currentYear);
  const [scope, setScope] = useStateAd('all');

  const classroomsInYear = d.classrooms.filter((c) => c.year === year);

  // summary per classroom
  const rows = classroomsInYear.map((c) => {
    const subs = d.subjects.filter((s) => s.classroomId === c.id && s.year === year);
    const students = d.students.filter((s) => s.classroomId === c.id);
    const teacherIds = [...new Set(subs.map((s) => s.teacherId).filter(Boolean))];
    const teachers = teacherIds.map((tid) => d.users.find((u) => u.id === tid)).filter(Boolean);
    let p = 0, l = 0, lv = 0, ab = 0;
    subs.forEach((sb) => {
      students.forEach((st) => {
        const r = DataStore.attendanceStats(sb.id, st.id);
        p += r.present; l += r.late; lv += r.leave; ab += r.absent;
      });
    });
    const total = p + l + lv + ab;
    const pct = total ? Math.round(((p + l * 0.5) / total) * 100) : 0;
    return { classroom: c, teachers, students: students.length, subjects: subs.length, present: p, late: l, leave: lv, absent: ab, total, pct };
  });

  const openCentral = () => {
    window.open(`report.html?mode=central&year=${year}`, '_blank');
  };

  return (
    <div>
      <PageTitle
        title="รายงานส่วนกลาง"
        sub="ภาพรวมเวลาเรียนของทุกชั้นเรียน และส่งออกรายงาน PDF"
        action={<Button variant="yellow" icon="pdf" onClick={openCentral}>Export PDF (เปิดในแท็บใหม่)</Button>}
      />

      <Card padding={16} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
          <div style={{ minWidth: 160 }}>
            <Field label="ปีการศึกษา">
              <Select value={year} onChange={setYear} options={ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))} />
            </Field>
          </div>
        </div>
      </Card>

      <Card title="สรุปแยกตามชั้นเรียน" padding={0}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--navy-50)' }}>
              <Th style={{ width: 50 }}>#</Th>
              <Th>ชั้นเรียน</Th>
              <Th>อาจารย์ผู้สอน</Th>
              <Th style={{ textAlign: 'center', width: 80 }}>นักเรียน</Th>
              <Th style={{ textAlign: 'center', width: 80 }}>รายวิชา</Th>
              <Th style={{ textAlign: 'center', width: 70 }}>มา</Th>
              <Th style={{ textAlign: 'center', width: 70 }}>สาย</Th>
              <Th style={{ textAlign: 'center', width: 70 }}>ลา</Th>
              <Th style={{ textAlign: 'center', width: 70 }}>ขาด</Th>
              <Th style={{ width: 160 }}>เวลาเรียน</Th>
              <Th style={{ width: 80 }}>PDF</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.classroom.id} style={{ borderTop: '1px solid var(--border)' }}>
                <Td>{i + 1}</Td>
                <Td style={{ fontWeight: 700 }}>{r.classroom.name}</Td>
                <Td style={{ fontSize: 12 }}>
                  {r.teachers.length === 0
                    ? <span style={{ color: 'var(--navy-400)' }}>—</span>
                    : r.teachers.map((t) => t.name).join(', ')}
                </Td>
                <Td style={{ textAlign: 'center' }}>{r.students}</Td>
                <Td style={{ textAlign: 'center' }}>{r.subjects}</Td>
                <Td style={{ textAlign: 'center', color: STATUS_COLOR.present, fontWeight: 700 }}>{r.present}</Td>
                <Td style={{ textAlign: 'center', color: STATUS_COLOR.late, fontWeight: 700 }}>{r.late}</Td>
                <Td style={{ textAlign: 'center', color: STATUS_COLOR.leave, fontWeight: 700 }}>{r.leave}</Td>
                <Td style={{ textAlign: 'center', color: STATUS_COLOR.absent, fontWeight: 700 }}>{r.absent}</Td>
                <Td><ProgressBar pct={r.pct} /></Td>
                <Td>
                  <Button variant="ghost" size="sm" icon="pdf" onClick={() => window.open(`report.html?classroom=${r.classroom.id}&subject=all&year=${year}`, '_blank')}>เปิด</Button>
                </Td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={11} style={{ padding: 32, textAlign: 'center', color: 'var(--navy-400)' }}>ไม่มีข้อมูลในปีการศึกษานี้</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ==================== Data ====================
function DataTab({ showToast }) {
  const d = DataStore.load();
  return (
    <div>
      <PageTitle title="ข้อมูลและ Google Sheets" sub="การเชื่อมต่อแหล่งข้อมูล" />

      <Card title="สถานะการเชื่อมต่อ">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 8 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 14, background: '#0F9D5815',
            color: '#0F9D58', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="sheet" size={32} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>Google Sheets · เชื่อมต่อแล้ว</div>
            <div style={{ fontSize: 13, color: 'var(--navy-400)', marginTop: 2 }}>
              Sheet ID: <span style={{ fontFamily: 'monospace' }}>{d.meta.sheetId}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--navy-400)', marginTop: 4 }}>
              ซิงค์ล่าสุด: {new Date(d.meta.lastSync).toLocaleString('th-TH')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" icon="refresh" onClick={() => { DataStore.save(); showToast('ซิงค์ข้อมูลกับ Google Sheets แล้ว ✓'); }}>ซิงค์ทันที</Button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginTop: 16 }}>
          {[
            { label: 'Users', n: d.users.length },
            { label: 'Classrooms', n: d.classrooms.length },
            { label: 'Subjects', n: d.subjects.length },
            { label: 'Students', n: d.students.length },
            { label: 'Attendance', n: d.attendance.length },
          ].map((x) => (
            <div key={x.label} style={{
              padding: 12, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy-400)', letterSpacing: '.05em' }}>SHEET · {x.label.toUpperCase()}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)' }}>{x.n}</div>
              <div style={{ fontSize: 11, color: 'var(--navy-400)' }}>{x.n.toLocaleString()} แถว</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="การจัดการข้อมูล" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button variant="outline" icon="download" onClick={() => exportAllData()}>นำออกข้อมูลทั้งหมด (JSON)</Button>
          <Button variant="danger" icon="trash" onClick={() => {
            if (confirm('รีเซ็ตข้อมูลทั้งหมดกลับสู่ค่าเริ่มต้น?')) {
              DataStore.reset();
              showToast('รีเซ็ตข้อมูลแล้ว', 'info');
            }
          }}>รีเซ็ตข้อมูลทั้งหมด</Button>
        </div>
      </Card>
    </div>
  );
}

function exportAllData() {
  const blob = new Blob([JSON.stringify(DataStore.load(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `cdti_attendance_backup_${Date.now()}.json`;
  a.click();
}

window.AdminApp = AdminApp;

// ==================== Admin Schedule Tab ====================
function AdminScheduleTab({ showToast }) {
  const d = DataStore.load();
  const [year, setYear] = useStateAd(d.meta.currentYear);
  const [teacherId, setTeacherId] = useStateAd('all');
  const teachers = d.users.filter((u) => u.role === 'teacher');
  const periods = d.meta.periods || DEFAULT_PERIODS;

  // Determine subjects to show
  const subs = d.subjects.filter((s) => s.year === year && (teacherId === 'all' || s.teacherId === teacherId));

  // Per-teacher conflicts
  const conflictsByTeacher = teachers.map((t) => {
    const tSubs = d.subjects.filter((s) => s.year === year && s.teacherId === t.id);
    const { conflicts } = buildTimetable(tSubs);
    return { teacher: t, count: conflicts.length };
  }).filter((x) => x.count > 0);

  return (
    <div>
      <PageTitle
        title="ตารางสอน และช่วงเวลาคาบเรียน"
        sub="จัดการช่วงเวลาคาบเรียน และดูตารางสอนของอาจารย์แต่ละท่าน"
      />

      <PeriodsEditor showToast={showToast} />

      <Card padding={16} style={{ marginTop: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 160 }}>
            <Field label="ปีการศึกษา">
              <Select value={year} onChange={setYear} options={ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))} />
            </Field>
          </div>
          <div style={{ minWidth: 260 }}>
            <Field label="ดูตารางสอนของ">
              <Select
                value={teacherId}
                onChange={setTeacherId}
                options={[{ value: 'all', label: 'ทุกอาจารย์ (แสดงรวม)' }, ...teachers.map((t) => ({ value: t.id, label: t.name }))]}
              />
            </Field>
          </div>
          <div style={{ flex: 1 }} />
          {teacherId !== 'all' && (
            <div style={{ marginBottom: 14 }}>
              <Button variant="outline" icon="pdf" onClick={() => window.open(`schedule.html?teacher=${teacherId}&year=${year}`, '_blank')}>Export PDF</Button>
            </div>
          )}
        </div>
      </Card>

      {conflictsByTeacher.length > 0 && (
        <div style={{
          padding: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
          marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 22 }}>⚠️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#991b1b' }}>
              พบตารางชนกัน ใน {conflictsByTeacher.length} อาจารย์
            </div>
            <div style={{ fontSize: 12, color: '#dc2626', marginTop: 2 }}>
              {conflictsByTeacher.map((x) => `${x.teacher.name} (${x.count})`).join(', ')}
            </div>
          </div>
        </div>
      )}

      {teacherId === 'all' ? (
        // Show each teacher's timetable in a list
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {teachers.map((t) => {
            const tSubs = d.subjects.filter((s) => s.year === year && s.teacherId === t.id);
            const totalPeriods = tSubs.reduce((a, s) => a + (s.schedule || []).reduce((b, sl) => b + (sl.endPeriod - sl.startPeriod + 1), 0), 0);
            return (
              <Card key={t.id}
                title={`${t.name} · ${tSubs.length} วิชา · ${totalPeriods} คาบ/สัปดาห์`}
                action={
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="ghost" size="sm" icon="eye" onClick={() => setTeacherId(t.id)}>ดูรายละเอียด</Button>
                    <Button variant="outline" size="sm" icon="pdf" onClick={() => window.open(`schedule.html?teacher=${t.id}&year=${year}`, '_blank')}>PDF</Button>
                  </div>
                }
              >
                <TimetableGrid subjects={tSubs} periods={periods} showClassroom compact />
              </Card>
            );
          })}
        </div>
      ) : (
        <Card title={`ตารางสอน · ${teachers.find((t) => t.id === teacherId)?.name || ''}`}>
          <TimetableGrid subjects={subs} periods={periods} showClassroom />
        </Card>
      )}
    </div>
  );
}

window.AdminScheduleTab = AdminScheduleTab;
