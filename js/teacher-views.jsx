// Attendance check, students view, and reports

const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA } = React;

// ===================== Attendance =====================
function AttendanceView({ user, subjects, year, showToast }) {
  const [subjectId, setSubjectId] = useStateA(subjects[0]?.id || '');
  const [date, setDate] = useStateA(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useStateA(1);
  const [filter, setFilter] = useStateA('');
  const [history, setHistory] = useStateA(false);

  useEffectA(() => {
    if (!subjects.find((s) => s.id === subjectId)) setSubjectId(subjects[0]?.id || '');
  }, [subjects, subjectId]);

  const subject = subjects.find((s) => s.id === subjectId);
  const classroom = subject ? DataStore.getClassroom(subject.classroomId) : null;
  const students = subject ? DataStore.getStudentsByClassroom(subject.classroomId) : [];

  const existing = subject
    ? DataStore.load().attendance.find((a) => a.subjectId === subjectId && a.date === date && a.period === period)
    : null;

  const [records, setRecords] = useStateA({});
  useEffectA(() => {
    const init = {};
    students.forEach((s) => {
      const ex = existing?.records.find((r) => r.studentId === s.id);
      init[s.id] = ex ? { status: ex.status, note: ex.note || '' } : { status: 'present', note: '' };
    });
    setRecords(init);
  }, [subjectId, date, period, students.length, existing?.id]);

  const setStatus = (studentId, status) => {
    setRecords((r) => ({ ...r, [studentId]: { ...r[studentId], status } }));
  };
  const setNote = (studentId, note) => {
    setRecords((r) => ({ ...r, [studentId]: { ...r[studentId], note } }));
  };

  const bulkSet = (status) => {
    const r = { ...records };
    students.forEach((s) => { r[s.id] = { ...r[s.id], status }; });
    setRecords(r);
  };

  const counts = useMemoA(() => {
    const c = { present: 0, late: 0, leave: 0, absent: 0 };
    students.forEach((s) => { if (records[s.id]) c[records[s.id].status]++; });
    return c;
  }, [records, students]);

  const save = () => {
    if (!subject) return;
    DataStore.saveAttendance({
      subjectId,
      classroomId: subject.classroomId,
      date,
      period,
      records: students.map((s) => ({
        studentId: s.id,
        status: records[s.id]?.status || 'present',
        note: records[s.id]?.note || '',
      })),
    });
    showToast('บันทึกเวลาเรียนเรียบร้อยแล้ว ✓');
  };

  const filtered = students.filter((s) => {
    const q = filter.toLowerCase();
    return !q || s.firstName.toLowerCase().includes(q) || s.lastName.toLowerCase().includes(q) || s.studentNo.includes(q) || s.nickname.toLowerCase().includes(q);
  });

  if (subjects.length === 0) {
    return <Card><Empty message="ยังไม่มีรายวิชาที่มอบหมาย" icon="book" /></Card>;
  }

  // Subject options grouped by classroom
  const subjectOptions = subjects.map((s) => {
    const c = DataStore.getClassroom(s.classroomId);
    return { value: s.id, label: `${c?.name || '?'}  ·  ${s.code} ${s.name}` };
  });

  return (
    <div>
      <Card padding={20} style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <Field label="รายวิชา / ชั้นเรียน" required>
            <Select value={subjectId} onChange={setSubjectId} options={subjectOptions} />
          </Field>
          <Field label="วันที่" required>
            <Input type="date" value={date} onChange={setDate} />
          </Field>
          <Field label="คาบเรียน" required>
            <Select value={period} onChange={(v) => setPeriod(Number(v))} options={[1,2,3,4,5,6,7,8].map((n) => ({ value: n, label: `คาบ ${n}` }))} />
          </Field>
          <Field label="ค้นหานักเรียน">
            <Input value={filter} onChange={setFilter} placeholder="ชื่อ/เลขที่/ชื่อเล่น" icon="search" />
          </Field>
          <div style={{ marginBottom: 14 }}>
            <Button variant="outline" icon="calendar" onClick={() => setHistory(true)}>ประวัติ</Button>
          </div>
        </div>

        {classroom && (
          <div style={{
            display: 'flex', gap: 12, alignItems: 'center', marginTop: 8,
            padding: '10px 12px', background: 'var(--navy-50)', borderRadius: 8,
          }}>
            <Icon name="users" size={16} style={{ color: 'var(--navy)' }} />
            <span style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 600 }}>
              {classroom.name} · สาขา{classroom.program} · นักเรียน {students.length} คน
            </span>
            {existing && (
              <span style={{
                marginLeft: 'auto', padding: '3px 10px', background: 'var(--yellow-100)', borderRadius: 999,
                fontSize: 11, color: 'var(--navy)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <Icon name="check" size={12} /> มีบันทึกแล้ว — กำลังแก้ไข
              </span>
            )}
          </div>
        )}
      </Card>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy-400)', marginRight: 4 }}>ตั้งค่าทั้งห้อง:</span>
        {['present', 'late', 'leave', 'absent'].map((st) => (
          <button
            key={st}
            onClick={() => bulkSet(st)}
            style={{
              padding: '6px 12px', borderRadius: 8, border: `1px solid ${STATUS_COLOR[st]}40`,
              background: STATUS_COLOR[st] + '15', color: STATUS_COLOR[st], fontWeight: 700, fontSize: 12,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >ทั้งหมด = {STATUS_LABEL[st]}</button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
          {['present', 'late', 'leave', 'absent'].map((st) => (
            <div key={st} style={{
              padding: '4px 10px', background: STATUS_COLOR[st] + '15', color: STATUS_COLOR[st],
              borderRadius: 6, fontWeight: 700,
            }}>{STATUS_LABEL[st]} {counts[st]}</div>
          ))}
        </div>
      </div>

      <Card padding={0}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr style={{ background: 'var(--navy-50)' }}>
                <Th style={{ width: 50 }}>#</Th>
                <Th style={{ width: 110 }}>เลขประจำตัว</Th>
                <Th>ชื่อ-นามสกุล</Th>
                <Th style={{ width: 80 }}>ชื่อเล่น</Th>
                <Th style={{ width: 360 }}>สถานะ</Th>
                <Th style={{ width: 180 }}>หมายเหตุ</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
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
                    <StatusToggle value={records[s.id]?.status} onChange={(v) => setStatus(s.id, v)} />
                  </Td>
                  <Td>
                    <input
                      value={records[s.id]?.note || ''}
                      onChange={(e) => setNote(s.id, e.target.value)}
                      placeholder="—"
                      style={{
                        width: '100%', padding: '6px 10px', border: '1px solid var(--border)',
                        borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fff',
                      }}
                    />
                  </Td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--navy-400)' }}>ไม่พบนักเรียน</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{
        position: 'sticky', bottom: 0, marginTop: 16, padding: '14px 20px',
        background: '#fff', border: '1px solid var(--border)', borderRadius: 12,
        boxShadow: '0 -4px 16px rgba(10,38,71,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 13, color: 'var(--navy-400)' }}>
          <strong style={{ color: 'var(--navy)' }}>{subject?.name}</strong> · {classroom?.name} · {new Date(date).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · คาบ {period}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" icon="refresh" onClick={() => bulkSet('present')}>ล้างค่า</Button>
          <Button variant="yellow" icon="check" onClick={save} size="lg">บันทึกข้อมูล</Button>
        </div>
      </div>

      <AttendanceHistoryModal
        open={history}
        onClose={() => setHistory(false)}
        subject={subject}
        onPick={(r) => { setDate(r.date); setPeriod(r.period); setHistory(false); }}
      />
    </div>
  );
}

const Th = ({ children, style }) => (
  <th style={{
    textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 700,
    color: 'var(--navy-700)', letterSpacing: '.04em', ...style,
  }}>{children}</th>
);
const Td = ({ children, style }) => (
  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--navy)', ...style }}>{children}</td>
);

function StatusToggle({ value, onChange }) {
  const opts = ['present', 'late', 'leave', 'absent'];
  return (
    <div style={{ display: 'inline-flex', gap: 4, padding: 3, background: 'var(--bg)', borderRadius: 8 }}>
      {opts.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            style={{
              padding: '6px 14px', border: 'none', borderRadius: 6, cursor: 'pointer',
              fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
              background: active ? STATUS_COLOR[o] : 'transparent',
              color: active ? '#fff' : STATUS_COLOR[o],
              transition: 'all .15s', minWidth: 56,
            }}
          >{STATUS_LABEL[o]}</button>
        );
      })}
    </div>
  );
}

function AttendanceHistoryModal({ open, onClose, subject, onPick }) {
  if (!subject) return null;
  const list = DataStore.getAttendanceBySubject(subject.id);
  return (
    <Modal open={open} onClose={onClose} title={`ประวัติการเช็คชื่อ · ${subject?.name}`} width={680}>
      {list.length === 0 && <Empty message="ยังไม่มีการเช็คชื่อในวิชานี้" icon="calendar" />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.map((r) => {
          const c = { present: 0, late: 0, leave: 0, absent: 0 };
          r.records.forEach((x) => c[x.status]++);
          return (
            <div key={r.id}
              onClick={() => onPick(r)}
              style={{
                padding: 14, border: '1px solid var(--border)', borderRadius: 10,
                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', background: '#fff',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--navy)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{
                background: 'var(--yellow-100)', color: 'var(--navy)', borderRadius: 8,
                padding: '8px 12px', minWidth: 60, textAlign: 'center',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700 }}>{new Date(r.date).toLocaleDateString('th-TH', { month: 'short' })}</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{new Date(r.date).getDate()}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>
                  {new Date(r.date).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div style={{ fontSize: 12, color: 'var(--navy-400)' }}>คาบ {r.period} · บันทึก {r.records.length} คน</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['present', 'late', 'leave', 'absent'].map((s) => (
                  <CountChip key={s} n={c[s]} color={STATUS_COLOR[s]} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

// ===================== Students (View) =====================
// Teachers can view students in classes they teach + their attendance per subject
function StudentsView({ user, subjects, classrooms, year, showToast }) {
  const [classId, setClassId] = useStateA(classrooms[0]?.id || '');
  const [subjectId, setSubjectId] = useStateA('all');
  const [filter, setFilter] = useStateA('');
  const [selected, setSelected] = useStateA(null);

  useEffectA(() => {
    if (!classrooms.find((c) => c.id === classId)) setClassId(classrooms[0]?.id || '');
  }, [classrooms, classId]);

  const classroom = classrooms.find((c) => c.id === classId);
  const students = classroom ? DataStore.getStudentsByClassroom(classroom.id) : [];
  const classSubjects = subjects.filter((s) => s.classroomId === classId);

  const rows = useMemoA(() => {
    return students.map((st) => {
      let p = 0, l = 0, lv = 0, ab = 0, total = 0;
      const sids = subjectId === 'all' ? classSubjects.map((s) => s.id) : [subjectId];
      sids.forEach((sid) => {
        const r = DataStore.attendanceStats(sid, st.id);
        p += r.present; l += r.late; lv += r.leave; ab += r.absent; total += r.total;
      });
      const pct = total ? Math.round(((p + l * 0.5) / total) * 100) : 0;
      return { student: st, present: p, late: l, leave: lv, absent: ab, total, pct };
    });
  }, [students, classSubjects, subjectId]);

  const filtered = rows.filter((r) => {
    const q = filter.toLowerCase();
    const s = r.student;
    return !q || s.firstName.toLowerCase().includes(q) || s.lastName.toLowerCase().includes(q) || s.studentNo.includes(q) || s.nickname.toLowerCase().includes(q);
  });

  return (
    <div>
      <Card padding={16} style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: 12, alignItems: 'end' }}>
          <Field label="ชั้นเรียน">
            <Select value={classId} onChange={setClassId} options={classrooms.map((c) => ({ value: c.id, label: c.name }))} />
          </Field>
          <Field label="ดูเวลาเรียนของรายวิชา">
            <Select
              value={subjectId}
              onChange={setSubjectId}
              options={[{ value: 'all', label: 'ทุกวิชา (ที่ฉันสอน)' }, ...classSubjects.map((s) => ({ value: s.id, label: `${s.code} · ${s.name}` }))]}
            />
          </Field>
          <Field label="ค้นหา">
            <Input value={filter} onChange={setFilter} placeholder="ชื่อ/เลขที่" icon="search" />
          </Field>
        </div>
      </Card>

      <Card title={`${classroom?.name || '—'}  ·  ${students.length} คน`} padding={0}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--navy-50)' }}>
                <Th style={{ width: 50 }}>#</Th>
                <Th style={{ width: 110 }}>เลขประจำตัว</Th>
                <Th>ชื่อ-นามสกุล</Th>
                <Th style={{ width: 80 }}>ชื่อเล่น</Th>
                <Th style={{ textAlign: 'center' }}>มา</Th>
                <Th style={{ textAlign: 'center' }}>สาย</Th>
                <Th style={{ textAlign: 'center' }}>ลา</Th>
                <Th style={{ textAlign: 'center' }}>ขาด</Th>
                <Th style={{ width: 150 }}>เวลาเรียน</Th>
                <Th style={{ width: 90 }}>ดูรายละเอียด</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.student.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <Td>{i + 1}</Td>
                  <Td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.student.studentNo}</Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: r.student.gender === 'F' ? '#fde2e2' : '#dbeafe',
                        color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                      }}>{r.student.firstName.charAt(0)}</div>
                      <span style={{ fontWeight: 600 }}>{r.student.firstName} {r.student.lastName}</span>
                    </div>
                  </Td>
                  <Td style={{ color: 'var(--navy-400)' }}>{r.student.nickname}</Td>
                  <Td style={{ textAlign: 'center', color: STATUS_COLOR.present, fontWeight: 700 }}>{r.present}</Td>
                  <Td style={{ textAlign: 'center', color: STATUS_COLOR.late, fontWeight: 700 }}>{r.late}</Td>
                  <Td style={{ textAlign: 'center', color: STATUS_COLOR.leave, fontWeight: 700 }}>{r.leave}</Td>
                  <Td style={{ textAlign: 'center', color: STATUS_COLOR.absent, fontWeight: 700 }}>{r.absent}</Td>
                  <Td><ProgressBar pct={r.pct} /></Td>
                  <Td>
                    <Button variant="ghost" size="sm" icon="eye" onClick={() => setSelected(r.student)}>ดู</Button>
                  </Td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} style={{ padding: 32, textAlign: 'center', color: 'var(--navy-400)' }}>ไม่พบนักเรียน</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <StudentDetailModal student={selected} subjects={classSubjects} onClose={() => setSelected(null)} />
    </div>
  );
}

function StudentDetailModal({ student, subjects, onClose }) {
  if (!student) return null;
  const rows = subjects.map((s) => {
    const r = DataStore.attendanceStats(s.id, student.id);
    return { subject: s, ...r };
  });
  // Recent records
  const recent = [];
  subjects.forEach((s) => {
    DataStore.getAttendanceBySubject(s.id).slice(0, 5).forEach((rec) => {
      const r = rec.records.find((x) => x.studentId === student.id);
      if (r) recent.push({ subject: s, date: rec.date, period: rec.period, status: r.status, note: r.note });
    });
  });
  recent.sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Modal open={!!student} onClose={onClose} title={`${student.firstName} ${student.lastName} · เลขที่ ${student.studentNo}`} width={720}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12, background: 'var(--navy-50)', borderRadius: 10, marginBottom: 16 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: student.gender === 'F' ? '#fde2e2' : '#dbeafe',
          color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800,
        }}>{student.firstName.charAt(0)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>{student.firstName} {student.lastName}</div>
          <div style={{ fontSize: 12, color: 'var(--navy-400)' }}>ชื่อเล่น {student.nickname} · {student.gender === 'F' ? 'หญิง' : 'ชาย'} · เลขประจำตัว {student.studentNo}</div>
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>สรุปเวลาเรียนแยกตามรายวิชา</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr style={{ background: 'var(--navy-50)' }}>
            <Th>รายวิชา</Th>
            <Th style={{ textAlign: 'center', width: 50 }}>มา</Th>
            <Th style={{ textAlign: 'center', width: 50 }}>สาย</Th>
            <Th style={{ textAlign: 'center', width: 50 }}>ลา</Th>
            <Th style={{ textAlign: 'center', width: 50 }}>ขาด</Th>
            <Th style={{ width: 140 }}>เวลาเรียน</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.subject.id} style={{ borderTop: '1px solid var(--border)' }}>
              <Td>
                <div style={{ fontWeight: 600 }}>{r.subject.name}</div>
                <div style={{ fontSize: 11, color: 'var(--navy-400)' }}>{r.subject.code}</div>
              </Td>
              <Td style={{ textAlign: 'center', color: STATUS_COLOR.present, fontWeight: 700 }}>{r.present}</Td>
              <Td style={{ textAlign: 'center', color: STATUS_COLOR.late, fontWeight: 700 }}>{r.late}</Td>
              <Td style={{ textAlign: 'center', color: STATUS_COLOR.leave, fontWeight: 700 }}>{r.leave}</Td>
              <Td style={{ textAlign: 'center', color: STATUS_COLOR.absent, fontWeight: 700 }}>{r.absent}</Td>
              <Td><ProgressBar pct={r.pct} /></Td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>การเช็คชื่อล่าสุด</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {recent.slice(0, 8).map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, background: 'var(--bg)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--navy-400)', minWidth: 100 }}>
              {new Date(r.date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })} · คาบ {r.period}
            </div>
            <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>{r.subject.name}</div>
            <StatusBadge status={r.status} />
          </div>
        ))}
        {recent.length === 0 && <Empty message="ยังไม่มีบันทึก" icon="calendar" />}
      </div>
    </Modal>
  );
}

// ===================== Reports =====================
function ReportsView({ user, subjects, classrooms, year }) {
  const [classId, setClassId] = useStateA('all');
  const [subjectId, setSubjectId] = useStateA('all');

  const filteredSubjects = subjects.filter((s) =>
    (classId === 'all' || s.classroomId === classId) &&
    (subjectId === 'all' || s.id === subjectId)
  );
  const filteredStudentIds = new Set();
  filteredSubjects.forEach((s) => {
    DataStore.getStudentsByClassroom(s.classroomId).forEach((st) => filteredStudentIds.add(st.id));
  });
  const allStudents = DataStore.load().students;
  const students = allStudents.filter((s) => filteredStudentIds.has(s.id));

  const rows = useMemoA(() => {
    return students.map((st) => {
      let p = 0, l = 0, lv = 0, ab = 0, total = 0;
      filteredSubjects.filter((s) => s.classroomId === st.classroomId).forEach((s) => {
        const r = DataStore.attendanceStats(s.id, st.id);
        p += r.present; l += r.late; lv += r.leave; ab += r.absent; total += r.total;
      });
      const pct = total ? Math.round(((p + l * 0.5) / total) * 100) : 0;
      const cls = DataStore.getClassroom(st.classroomId);
      return { student: st, classroom: cls, present: p, late: l, leave: lv, absent: ab, total, pct };
    });
  }, [students, filteredSubjects]);

  const totals = useMemoA(() => rows.reduce((a, r) => ({
    present: a.present + r.present, late: a.late + r.late, leave: a.leave + r.leave, absent: a.absent + r.absent, total: a.total + r.total,
  }), { present: 0, late: 0, leave: 0, absent: 0, total: 0 }), [rows]);

  const openPdf = () => {
    const url = `report.html?teacher=${user.id}&classroom=${classId}&subject=${subjectId}&year=${year}`;
    window.open(url, '_blank');
  };

  const classOptions = [{ value: 'all', label: 'ทุกชั้นเรียน' }, ...classrooms.map((c) => ({ value: c.id, label: c.name }))];
  const subjectsInClass = classId === 'all' ? subjects : subjects.filter((s) => s.classroomId === classId);
  const subjOptions = [{ value: 'all', label: 'ทุกรายวิชา' }, ...subjectsInClass.map((s) => ({ value: s.id, label: `${s.code} · ${s.name}` }))];

  return (
    <div>
      <Card padding={16} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 260 }}>
            <Field label="ชั้นเรียน">
              <Select value={classId} onChange={(v) => { setClassId(v); setSubjectId('all'); }} options={classOptions} />
            </Field>
          </div>
          <div style={{ minWidth: 300, flex: 1 }}>
            <Field label="รายวิชา">
              <Select value={subjectId} onChange={setSubjectId} options={subjOptions} />
            </Field>
          </div>
          <div style={{ marginBottom: 14 }}>
            <Button variant="outline" icon="pdf" onClick={openPdf}>Export PDF</Button>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 20 }}>
        <Card title="สรุปภาพรวม">
          <DonutChart data={totals} />
        </Card>
        <Card title="สถิติแยกตามสถานะ">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {['present', 'late', 'leave', 'absent'].map((st) => {
              const v = totals[st];
              const pct = totals.total ? Math.round((v / totals.total) * 100) : 0;
              return (
                <div key={st} style={{
                  padding: 16, border: '1px solid var(--border)', borderRadius: 10,
                  background: STATUS_COLOR[st] + '08',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLOR[st], textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    {STATUS_LABEL[st]}
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--navy)', lineHeight: 1.1, marginTop: 4 }}>
                    {v}<span style={{ fontSize: 13, color: 'var(--navy-400)', marginLeft: 4 }}>ครั้ง</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--navy-400)', marginTop: 4 }}>{pct}% ของทั้งหมด</div>
                  <div style={{ height: 5, background: 'var(--bg)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                    <div style={{ width: pct + '%', height: '100%', background: STATUS_COLOR[st] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card title="ตารางเวลาเรียนรายบุคคล" padding={0}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--navy-50)' }}>
                <Th style={{ width: 50 }}>#</Th>
                <Th style={{ width: 110 }}>เลขประจำตัว</Th>
                <Th>ชื่อ-นามสกุล</Th>
                <Th>ชั้นเรียน</Th>
                <Th style={{ textAlign: 'center' }}>มา</Th>
                <Th style={{ textAlign: 'center' }}>สาย</Th>
                <Th style={{ textAlign: 'center' }}>ลา</Th>
                <Th style={{ textAlign: 'center' }}>ขาด</Th>
                <Th style={{ width: 160 }}>เวลาเรียน</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.student.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <Td>{i + 1}</Td>
                  <Td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.student.studentNo}</Td>
                  <Td style={{ fontWeight: 600 }}>{r.student.firstName} {r.student.lastName}</Td>
                  <Td style={{ fontSize: 12, color: 'var(--navy-400)' }}>{r.classroom?.name}</Td>
                  <Td style={{ textAlign: 'center', color: STATUS_COLOR.present, fontWeight: 700 }}>{r.present}</Td>
                  <Td style={{ textAlign: 'center', color: STATUS_COLOR.late, fontWeight: 700 }}>{r.late}</Td>
                  <Td style={{ textAlign: 'center', color: STATUS_COLOR.leave, fontWeight: 700 }}>{r.leave}</Td>
                  <Td style={{ textAlign: 'center', color: STATUS_COLOR.absent, fontWeight: 700 }}>{r.absent}</Td>
                  <Td><ProgressBar pct={r.pct} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function DonutChart({ data }) {
  const total = data.total || 1;
  const segs = [
    { k: 'present', v: data.present },
    { k: 'late', v: data.late },
    { k: 'leave', v: data.leave },
    { k: 'absent', v: data.absent },
  ];
  let cum = 0;
  const r = 70, c = 80, circ = 2 * Math.PI * r;
  const present = data.total ? Math.round(((data.present + data.late * 0.5) / data.total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <svg width={c * 2} height={c * 2} viewBox={`0 0 ${c * 2} ${c * 2}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--bg)" strokeWidth={20} />
        {segs.map((s) => {
          const len = (s.v / total) * circ;
          const off = circ - cum;
          cum += len;
          return (
            <circle key={s.k} cx={c} cy={c} r={r} fill="none"
              stroke={STATUS_COLOR[s.k]} strokeWidth={20}
              strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={off} />
          );
        })}
      </svg>
      <div style={{ marginTop: -110, textAlign: 'center', pointerEvents: 'none' }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--navy)' }}>{present}%</div>
        <div style={{ fontSize: 11, color: 'var(--navy-400)' }}>เวลาเรียน</div>
      </div>
      <div style={{ height: 90 }} />
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
        {segs.map((s) => (
          <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: STATUS_COLOR[s.k] }} />
            <span style={{ color: 'var(--navy-400)' }}>{STATUS_LABEL[s.k]}</span>
            <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{s.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { AttendanceView, StudentsView, ReportsView, DonutChart });
