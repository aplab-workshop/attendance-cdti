// Teaching log form

const { useState: useStateTL, useEffect: useEffectTL, useMemo: useMemoTL, useCallback: useCallbackTL } = React;

const TeachingLogTextarea = ({ value, onChange, rows = 4, placeholder, maxLength }) => {
  const length = (value || '').length;
  const remaining = typeof maxLength === 'number' ? Math.max(maxLength - length, 0) : null;

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{
          width: '100%',
          minHeight: rows * 28,
          padding: '10px 12px',
          border: '1px solid var(--border)',
          borderRadius: 8,
          fontSize: 14,
          fontFamily: 'inherit',
          color: 'var(--navy)',
          outline: 'none',
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
      />
      {typeof maxLength === 'number' && (
        <div className="tl-char-counter" style={{ marginTop: 4, fontSize: 12, color: 'var(--navy-400)', textAlign: 'right' }}>
          เหลือ {remaining}/{maxLength} ตัวอักษร
        </div>
      )}
    </div>
  );
};

const TeachingLogSectionTitle = ({ children }) => (
  <div style={{
    margin: '22px 0 12px',
    padding: '9px 12px',
    background: 'var(--navy)',
    color: '#fff',
    fontWeight: 700,
    borderRadius: 6,
    fontSize: 14,
  }}>
    {children}
  </div>
);

const TeachingLogPrintLine = ({ label, value, flex = 1 }) => (
  <span className="tl-print-line" style={{ flex }}>
    <span className="tl-print-label">{label}: </span>
    <span className="tl-print-value">{value || ''}</span>
  </span>
);

const TeachingLogPrintTextBlock = ({ title, value, lines2, lines3 }) => (
  <div className="tl-print-section">
    {title && <div className="tl-print-section-title">{title}</div>}
    {lines2 || lines3 ? (
      <div className={`tl-print-fixed-lines ${lines3 ? 'tl-print-fixed-lines-3' : 'tl-print-fixed-lines-2'}`}>
        <div className="tl-print-fixed-text">{value || ''}</div>
        {Array.from({ length: lines3 ? 3 : 2 }).map((_, i) => (
          <span key={i} className="tl-print-fixed-line"></span>
        ))}
      </div>
    ) : (
      <div className="tl-print-text">{value || ''}</div>
    )}
  </div>
);

const TeachingLogPrintChoice = ({ checked, label, radio }) => (
  <span className="tl-print-choice">
    <span className={`tl-print-mark ${radio ? 'tl-print-radio-mark' : ''}`}>{checked ? (radio ? '●' : '✓') : ''}</span>
    <span>{label}</span>
  </span>
);

function TeachingLog() {
  const data = DataStore.load();
  const teachers = data.users.filter((u) => u.role === 'teacher');
  const subjects = data.subjects;

  const [teacherId, setTeacherId] = useStateTL(teachers[0]?.id || '');
  const [subjectId, setSubjectId] = useStateTL('');
  const [topic, setTopic] = useStateTL('');
  const [teachDate, setTeachDate] = useStateTL(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useStateTL('08:30');
  const [endTime, setEndTime] = useStateTL('10:10');
  const [ratings, setRatings] = useStateTL({});
  const [summary, setSummary] = useStateTL('');
  const [understanding, setUnderstanding] = useStateTL('ดี');
  const [goodContent, setGoodContent] = useStateTL('');
  const [unclearContent, setUnclearContent] = useStateTL('');
  const [problems, setProblems] = useStateTL([]);
  const [otherProblem, setOtherProblem] = useStateTL('');
  const [notes, setNotes] = useStateTL('');
  const [improvement, setImprovement] = useStateTL('');
  const [homework, setHomework] = useStateTL('');
  const [dueDate, setDueDate] = useStateTL('');
  const [followUp, setFollowUp] = useStateTL('');
  const [overview, setOverview] = useStateTL('การสอนเป็นไปตามแผนและบรรลุวัตถุประสงค์');
  const [, setRefresh] = useStateTL(0);

  useEffectTL(() => DataStore.subscribe(() => setRefresh((x) => x + 1)), []);

  useEffectTL(() => {
    if (!teachers.find((t) => t.id === teacherId)) setTeacherId(teachers[0]?.id || '');
    if (subjectId && !DataStore.getSubjectsByTeacher(teacherId).find((s) => s.id === subjectId)) setSubjectId('');
  }, [teachers.length, subjects.length, teacherId, subjectId]);

  const selectedTeacher = teachers.find((t) => t.id === teacherId);
  const selectedSubject = subjects.find((s) => s.id === subjectId);
  const classroom = selectedSubject ? DataStore.getClassroom(selectedSubject.classroomId) : null;

  const filteredSubjects = useMemoTL(() => (
    teacherId ? DataStore.getSubjectsByTeacher(teacherId) : []
  ), [teacherId, subjects.length]);

  const subjectOptions = useMemoTL(() => filteredSubjects.map((s) => {
    const c = DataStore.getClassroom(s.classroomId);
    return { value: s.id, label: `${s.code} - ${s.name}${c ? ` (${c.name})` : ''}` };
  }), [filteredSubjects]);

  const teacherOptions = teachers.map((t) => ({ value: t.id, label: t.name }));
  const ratingTopics = [
    'ความสนใจและการมีส่วนร่วมของผู้เรียน',
    'ความเข้าใจในเนื้อหาของผู้เรียน',
    'การบรรลุจุดประสงค์การเรียนรู้',
    'การจัดการเวลา',
    'การใช้สื่อและอุปกรณ์',
  ];
  const ratingLevels = ['ดีมาก', 'ดี', 'พอใช้', 'ปรับปรุง'];
  const understandingLevels = ['ดีมาก', 'ดี', 'พอใช้', 'ต้องปรับปรุง'];
  const problemOptions = [
    'ผู้เรียนขาดความพร้อม/ความรู้พื้นฐาน',
    'ปัญหาด้านสื่อ/อุปกรณ์/เครื่องมือ',
    'เวลาไม่เพียงพอ',
    'ผู้เรียนขาดความสนใจ/แรงจูงใจ',
    'เนื้อหายากเกินไปสำหรับผู้เรียน',
    'อื่นๆ',
  ];
  const overviewOptions = [
    'การสอนเป็นไปตามแผนและบรรลุวัตถุประสงค์',
    'การสอนเป็นไปตามแผนแต่บรรลุวัตถุประสงค์บางส่วน',
    'การสอนมีการปรับเปลี่ยนจากแผนเล็กน้อย',
    'การสอนมีการปรับเปลี่ยนจากแผนมาก',
    'ต้องมีการสอนซ่อมเสริม/ทบทวนเนื้อหานี้อีกครั้ง',
  ];

  const handleTeacherIdChange = useCallbackTL((value) => {
    setTeacherId(value);
    setSubjectId('');
  }, []);
  const handleSubjectIdChange = useCallbackTL((value) => setSubjectId(value), []);
  const handleTopicChange = useCallbackTL((value) => setTopic(value), []);
  const handleTeachDateChange = useCallbackTL((value) => setTeachDate(value), []);
  const handleStartTimeChange = useCallbackTL((value) => setStartTime(value), []);
  const handleEndTimeChange = useCallbackTL((value) => setEndTime(value), []);
  const handleSummaryChange = useCallbackTL((value) => setSummary(value), []);
  const handleGoodContentChange = useCallbackTL((value) => setGoodContent(value), []);
  const handleUnclearContentChange = useCallbackTL((value) => setUnclearContent(value), []);
  const handleOtherProblemChange = useCallbackTL((value) => setOtherProblem(value), []);
  const handleNotesChange = useCallbackTL((value) => setNotes(value), []);
  const handleImprovementChange = useCallbackTL((value) => setImprovement(value), []);
  const handleHomeworkChange = useCallbackTL((value) => setHomework(value), []);
  const handleDueDateChange = useCallbackTL((value) => setDueDate(value), []);
  const handleFollowUpChange = useCallbackTL((value) => setFollowUp(value), []);
  const handleReadonlyChange = useCallbackTL(() => {}, []);
  const handlePrint = useCallbackTL(() => window.print(), []);
  const handleUnderstandingChange = useCallbackTL((level) => setUnderstanding(level), []);
  const handleOverviewChange = useCallbackTL((item) => setOverview(item), []);
  const handleRatingChange = useCallbackTL((topicName, level) => {
    setRatings((r) => ({ ...r, [topicName]: r[topicName] === level ? '' : level }));
  }, []);
  const toggleProblem = useCallbackTL((problem) => {
    setProblems((items) => (
      items.includes(problem) ? items.filter((x) => x !== problem) : [...items, problem]
    ));
  }, []);

  const displayDate = teachDate
    ? new Date(`${teachDate}T00:00:00`).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  const subjectLabel = selectedSubject ? `${selectedSubject.code} - ${selectedSubject.name}` : '';

  return (
    <div className="teaching-log-page" style={{ padding: 24, background: 'var(--bg)', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
        .tl-print-sheet { max-width: 980px; margin: 0 auto; }
        .tl-print-form { display: none; }
        .tl-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 18px; }
        .tl-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px 18px; }
        .tl-eval-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .tl-eval-table th, .tl-eval-table td { border: 1px solid var(--navy-200); padding: 9px; text-align: center; white-space: normal; }
        .tl-eval-table th { background: var(--navy-50); font-weight: 700; }
        .tl-eval-table td:first-child, .tl-eval-table th:first-child { text-align: left; width: 34%; }
        .tl-check-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 14px; }
        .tl-choice { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; background: #fff; }
        .tl-sign-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 48px; margin-top: 34px; text-align: center; }
        @media (max-width: 760px) {
          .tl-grid-2, .tl-grid-3, .tl-check-grid, .tl-sign-row { grid-template-columns: 1fr; }
        }
        @media print {
          @page { size: A4; margin: 20mm; }
          * { font-family: 'TH Sarabun PSK', 'Sarabun', serif !important; }
          body { background: #fff !important; color: #000 !important; }
          body * { visibility: hidden !important; }
          .teaching-log-page { padding: 0 !important; background: #fff !important; }
          .tl-no-print, .tl-screen-form, .tl-char-counter { display: none !important; }
          .tl-print-form, .tl-print-form * { visibility: visible !important; }
          .tl-print-form {
            display: block !important;
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'TH Sarabun PSK', 'Sarabun', serif !important;
            font-size: 12px !important;
            line-height: 1.38 !important;
            color: #000 !important;
          }
          .tl-print-page {
            min-height: 257mm !important;
            page-break-after: always !important;
            break-after: page !important;
          }
          .tl-print-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .tl-print-title {
            text-align: center !important;
            font-size: 16px !important;
            font-weight: 800 !important;
            margin: 0 0 18px !important;
          }
          .tl-print-subtitle {
            font-weight: 800 !important;
            margin: 0 0 2px !important;
            padding: 0 !important;
          }
          .tl-print-subtitle + .tl-print-row {
            margin-top: 0 !important;
          }
          .tl-print-row {
            display: flex !important;
            gap: 16px !important;
            margin-bottom: 7px !important;
            align-items: flex-end !important;
          }
          .tl-print-teacher-subject-row {
            display: flex !important;
            justify-content: space-between !important;
            gap: 16px !important;
            align-items: flex-end !important;
          }
          .tl-print-teacher-subject-row .tl-print-line {
            width: auto !important;
          }
          .tl-print-teacher-subject-row .tl-print-line:first-child {
            flex: 0 0 40% !important;
          }
          .tl-print-teacher-subject-row .tl-print-line:last-child {
            flex: 0 0 calc(60% - 16px) !important;
          }
          .tl-print-teacher-subject-row .tl-print-value {
            word-break: break-word !important;
            overflow-wrap: anywhere !important;
          }
          .tl-print-bullet-row::before {
            content: '•' !important;
            flex: 0 0 auto !important;
            padding-top: 1px !important;
          }
          .tl-print-line {
            display: inline-flex !important;
            align-items: flex-end !important;
            min-width: 0 !important;
          }
          .tl-print-label {
            flex: 0 0 auto !important;
            font-weight: 600 !important;
          }
          .tl-print-value {
            flex: 1 1 auto !important;
            min-height: 18px !important;
            border-bottom: 1px dotted #000 !important;
            padding: 0 8px 1px !important;
            word-break: break-word !important;
          }
          .tl-print-heading {
            font-weight: 800 !important;
            margin: 13px 0 6px !important;
          }
          .tl-print-bullet-title {
            font-weight: 700 !important;
            margin: 8px 0 3px !important;
          }
          .tl-print-bullet-title::before {
            content: '• ' !important;
          }
          .tl-print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            margin: 6px 0 10px !important;
          }
          .tl-print-table th, .tl-print-table td {
            border: 1px solid #000 !important;
            padding: 5px 7px !important;
            text-align: center !important;
            height: 25px !important;
          }
          .tl-print-table th:first-child, .tl-print-table td:first-child {
            text-align: left !important;
            width: 38% !important;
          }
          .tl-print-check {
            font-size: 12px !important;
            font-weight: 800 !important;
            line-height: 1 !important;
          }
          .tl-print-section {
            margin-top: 8px !important;
            break-inside: avoid !important;
          }
          .tl-print-section-title {
            font-weight: 700 !important;
            margin-bottom: 3px !important;
          }
          .tl-print-text {
            min-height: 34px !important;
            border-bottom: 1px dotted #000 !important;
            white-space: pre-wrap !important;
            padding: 2px 4px !important;
          }
          .tl-print-fixed-lines {
            position: relative !important;
            margin: 0 0 4px !important;
            overflow: hidden !important;
          }
          .tl-print-fixed-lines-2 {
            height: 52px !important;
          }
          .tl-print-fixed-lines-3 {
            height: 78px !important;
          }
          .tl-print-fixed-text {
            position: absolute !important;
            inset: 0 4px auto 4px !important;
            height: 100% !important;
            line-height: 26px !important;
            overflow: hidden !important;
            white-space: pre-wrap !important;
            word-break: break-word !important;
          }
          .tl-print-fixed-line {
            display: block !important;
            border-bottom: 1px solid #000 !important;
            width: 100% !important;
            margin: 6px 0 !important;
            min-height: 20px !important;
          }
          .tl-print-fixed-line::after {
            content: "" !important;
          }
          .tl-print-choice-row {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 8px 18px !important;
            margin: 5px 0 !important;
          }
          .tl-print-choice {
            display: inline-flex !important;
            align-items: center !important;
            gap: 5px !important;
            white-space: nowrap !important;
          }
          .tl-print-mark {
            width: 15px !important;
            height: 15px !important;
            border: 1px solid #000 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 12px !important;
            font-weight: 800 !important;
            line-height: 1 !important;
          }
          .tl-print-radio-mark {
            border-radius: 50% !important;
            font-size: 10px !important;
          }
          .tl-print-list {
            margin: 6px 0 0 0 !important;
            padding: 0 !important;
            list-style: none !important;
          }
          .tl-print-list li {
            margin-bottom: 6px !important;
            display: flex !important;
            align-items: flex-end !important;
            gap: 7px !important;
          }
          .tl-print-list li::before {
            content: '•' !important;
            flex: 0 0 auto !important;
          }
          .tl-print-inline-fill {
            display: inline-block !important;
            min-width: 245px !important;
            border-bottom: 1px solid #000 !important;
            padding: 0 8px 1px !important;
          }
          .tl-print-sign {
            width: 54% !important;
            margin: 42px 0 0 auto !important;
            text-align: center !important;
            break-inside: avoid !important;
          }
          .tl-print-sign-line {
            display: flex !important;
            align-items: flex-end !important;
            gap: 8px !important;
            margin-bottom: 4px !important;
          }
          .tl-print-sign-blank {
            flex: 1 !important;
            border-bottom: 1px solid #000 !important;
            height: 24px !important;
          }
          .tl-print-name-blank {
            display: inline-block !important;
            min-width: 230px !important;
            border-bottom: 1px solid #000 !important;
            padding: 0 8px 1px !important;
          }
        }
      `}</style>

      <div className="tl-print-sheet tl-screen-form">
        <div className="tl-no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)' }}>แบบบันทึกหลังการสอน</div>
            <div style={{ color: 'var(--navy-400)', fontSize: 13 }}>ระบบ attendance-cdti</div>
          </div>
          <Button variant="yellow" icon="pdf" onClick={handlePrint}>Export PDF</Button>
        </div>

        <div
          className="tl-card"
          style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 8,
            boxShadow: '0 1px 2px rgba(10,38,71,0.04)',
            padding: 28,
          }}
        >
          <div>
            <div style={{ textAlign: 'center', borderBottom: '3px double var(--navy)', paddingBottom: 14, marginBottom: 18 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)' }}>แบบบันทึกหลังการสอน</div>
              <div style={{ fontSize: 14, color: 'var(--navy-500)', marginTop: 4 }}>สถาบันเทคโนโลยีจิตรลดา</div>
            </div>

            <TeachingLogSectionTitle>1. ข้อมูลการสอน</TeachingLogSectionTitle>
            <div className="tl-grid-2">
              <Field label="ชื่อผู้สอน">
                <Select value={teacherId} onChange={handleTeacherIdChange} options={teacherOptions} placeholder="เลือกผู้สอน" />
              </Field>
              <Field label="รหัสวิชา/ชื่อวิชา">
                <Select value={subjectId} onChange={handleSubjectIdChange} options={subjectOptions} placeholder="เลือกรายวิชา" />
              </Field>
            </div>

            <div className="tl-grid-3">
              <Field label="สาขาวิชา">
                <Input value={classroom?.program || ''} onChange={handleReadonlyChange} readOnly />
              </Field>
              <Field label="ระดับชั้น">
                <Input value={classroom?.grade || ''} onChange={handleReadonlyChange} readOnly />
              </Field>
              <Field label="กลุ่ม">
                <Input value={classroom?.section || ''} onChange={handleReadonlyChange} readOnly />
              </Field>
            </div>

            <div className="tl-grid-2">
              <Field label="หัวข้อ/เรื่องที่สอน">
                <Input value={topic} onChange={handleTopicChange} placeholder="ระบุหัวข้อหรือเรื่องที่สอน" />
              </Field>
              <Field label="วันที่สอน">
                <Input type="date" value={teachDate} onChange={handleTeachDateChange} />
              </Field>
            </div>

            <div className="tl-grid-3">
              <Field label="เวลาเริ่ม">
                <Input type="time" value={startTime} onChange={handleStartTimeChange} />
              </Field>
              <Field label="เวลาสิ้นสุด">
                <Input type="time" value={endTime} onChange={handleEndTimeChange} />
              </Field>
              <Field label="วันที่แบบไทย">
                <Input value={displayDate} onChange={handleReadonlyChange} readOnly />
              </Field>
            </div>

            <TeachingLogSectionTitle>2. ตารางประเมินผลกิจกรรมการเรียนรู้</TeachingLogSectionTitle>
            <table className="tl-eval-table">
              <thead>
                <tr>
                  <th>หัวข้อประเมิน</th>
                  {ratingLevels.map((level) => <th key={level}>{level}</th>)}
                </tr>
              </thead>
              <tbody>
                {ratingTopics.map((topicName) => (
                  <tr key={topicName}>
                    <td>{topicName}</td>
                    {ratingLevels.map((level) => (
                      <td key={level}>
                        <input
                          type="checkbox"
                          checked={ratings[topicName] === level}
                          onChange={() => handleRatingChange(topicName, level)}
                          aria-label={`${topicName} ${level}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <TeachingLogSectionTitle>3. สรุปผลการเรียนรู้</TeachingLogSectionTitle>
            <Field label="ผลลัพธ์การเรียนรู้ประจำหน่วย">
              <TeachingLogTextarea value={summary} onChange={handleSummaryChange} rows={3} maxLength={220} placeholder="ระบุผลลัพธ์การเรียนรู้ประจำหน่วย" />
            </Field>
            <Field label="ผู้เรียนส่วนใหญ่เข้าใจเนื้อหา">
              <div className="tl-check-grid">
                {understandingLevels.map((level) => (
                  <label key={level} className="tl-choice">
                    <input type="radio" name="teaching-log-understanding" checked={understanding === level} onChange={() => handleUnderstandingChange(level)} />
                    <span>{level}</span>
                  </label>
                ))}
              </div>
            </Field>
            <div className="tl-grid-2">
              <Field label="เนื้อหา/ทักษะที่ผู้เรียนเข้าใจได้ดี">
                <TeachingLogTextarea value={goodContent} onChange={handleGoodContentChange} rows={2} maxLength={220} placeholder="ระบุเนื้อหา/ทักษะที่ผู้เรียนเข้าใจได้ดี" />
              </Field>
              <Field label="เนื้อหา/ทักษะที่ผู้เรียนยังไม่เข้าใจหรือต้องเพิ่มเติม">
                <TeachingLogTextarea value={unclearContent} onChange={handleUnclearContentChange} rows={2} maxLength={220} placeholder="ระบุเนื้อหา/ทักษะที่ยังต้องเพิ่มเติม" />
              </Field>
            </div>

            <TeachingLogSectionTitle>4. ปัญหาที่พบ</TeachingLogSectionTitle>
            <div className="tl-check-grid">
              {problemOptions.map((problem) => (
                <label key={problem} className="tl-choice">
                  <input type="checkbox" checked={problems.includes(problem)} onChange={() => toggleProblem(problem)} />
                  <span>{problem === 'อื่นๆ' ? 'อื่นๆ (ระบุ)' : problem}</span>
                </label>
              ))}
            </div>
            {problems.includes('อื่นๆ') && (
              <Field label="อื่นๆ (ระบุ)">
                <Input value={otherProblem} onChange={handleOtherProblemChange} placeholder="ระบุปัญหาอื่นๆ" />
              </Field>
            )}

            <TeachingLogSectionTitle>5. ข้อสังเกตและประเด็นพิเศษ</TeachingLogSectionTitle>
            <TeachingLogTextarea value={notes} onChange={handleNotesChange} rows={3} maxLength={220} placeholder="ระบุข้อสังเกตเพิ่มเติม" />

            <TeachingLogSectionTitle>6. แนวทางพัฒนา</TeachingLogSectionTitle>
            <TeachingLogTextarea value={improvement} onChange={handleImprovementChange} rows={3} maxLength={220} placeholder="แนวทางปรับปรุงหรือพัฒนาในครั้งถัดไป" />

            <TeachingLogSectionTitle>7. กิจกรรมเสริม</TeachingLogSectionTitle>
            <div className="tl-grid-3">
              <Field label="การบ้าน/งานที่มอบหมาย">
                <Input value={homework} onChange={handleHomeworkChange} placeholder="ระบุงานที่มอบหมาย" />
              </Field>
              <Field label="กำหนดส่ง">
                <Input value={dueDate} onChange={handleDueDateChange} placeholder="ระบุกำหนดส่ง" />
              </Field>
              <Field label="วิธีการติดตาม/ประเมินผล">
                <Input value={followUp} onChange={handleFollowUpChange} placeholder="ระบุวิธีติดตาม" />
              </Field>
            </div>

            <TeachingLogSectionTitle>8. สรุปภาพรวม</TeachingLogSectionTitle>
            <div className="tl-check-grid">
              {overviewOptions.map((item) => (
                <label key={item} className="tl-choice">
                  <input type="radio" name="teaching-log-overview" checked={overview === item} onChange={() => handleOverviewChange(item)} />
                  <span>{item}</span>
                </label>
              ))}
            </div>

            <div className="tl-sign-row">
              <div>
                <div style={{ borderBottom: '1px solid var(--navy)', height: 36 }} />
                <div style={{ marginTop: 8 }}>ลงชื่อผู้สอน</div>
                <div style={{ marginTop: 4, color: 'var(--navy-500)' }}>{selectedTeacher?.name || ''}</div>
              </div>
              <div>
                <div style={{ borderBottom: '1px solid var(--navy)', height: 36 }} />
                <div style={{ marginTop: 8 }}>ลงชื่อหัวหน้างาน/ผู้ตรวจ</div>
                <div style={{ marginTop: 4, color: 'var(--navy-500)' }}>วันที่ ........../........../..........</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tl-print-form">
        <section className="tl-print-page">
          <h1 className="tl-print-title">แบบบันทึกหลังการสอน</h1>

          <div className="tl-print-subtitle">ข้อมูลทั่วไป</div>
          <div className="tl-print-row tl-print-bullet-row tl-print-teacher-subject-row">
            <TeachingLogPrintLine label="ชื่อผู้สอน" value={selectedTeacher?.name} />
            <TeachingLogPrintLine label="รหัสวิชา/ชื่อวิชา" value={subjectLabel} />
          </div>
          <div className="tl-print-row tl-print-bullet-row">
            <TeachingLogPrintLine label="สาขาวิชา" value={classroom?.program} />
            <TeachingLogPrintLine label="ระดับชั้น" value={classroom?.grade} flex={0.7} />
            <TeachingLogPrintLine label="กลุ่ม" value={classroom?.section} flex={0.45} />
          </div>
          <div className="tl-print-row tl-print-bullet-row">
            <TeachingLogPrintLine label="หัวข้อ/เรื่องที่สอน" value={topic || subjectLabel} />
          </div>
          <div className="tl-print-row tl-print-bullet-row">
            <TeachingLogPrintLine label="วันที่สอน" value={displayDate} />
            <TeachingLogPrintLine label="เวลา" value={`${startTime || ''} - ${endTime || ''}`} flex={0.8} />
          </div>

          <div className="tl-print-heading">1. ผลการจัดกิจกรรมการเรียนรู้ (ทำเครื่องหมาย ✓)</div>
          <table className="tl-print-table">
            <thead>
              <tr>
                <th>หัวข้อการประเมิน</th>
                {ratingLevels.map((level) => <th key={level}>{level}</th>)}
              </tr>
            </thead>
            <tbody>
              {ratingTopics.map((topicName) => (
                <tr key={topicName}>
                  <td>{topicName}</td>
                  {ratingLevels.map((level) => (
                    <td key={level} className="tl-print-check">{ratings[topicName] === level ? '✓' : ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="tl-print-heading">2. สรุปผลการเรียนรู้</div>
          <div className="tl-print-bullet-title">ผลลัพธ์การเรียนรู้ประจำหน่วย</div>
          <TeachingLogPrintTextBlock value={summary} lines2 />
          <div className="tl-print-row tl-print-bullet-row">
            <span className="tl-print-label">ผู้เรียนส่วนใหญ่เข้าใจเนื้อหา: </span>
            <span className="tl-print-choice-row">
              {understandingLevels.map((level) => (
                <TeachingLogPrintChoice key={level} checked={understanding === level} label={level} />
              ))}
            </span>
          </div>
          <div className="tl-print-bullet-title">เนื้อหา/ทักษะที่ผู้เรียนเข้าใจได้ดี:</div>
          <TeachingLogPrintTextBlock value={goodContent} lines2 />
          <div className="tl-print-bullet-title">เนื้อหา/ทักษะที่ผู้เรียนยังไม่เข้าใจหรือต้องเพิ่มเติม:</div>
          <TeachingLogPrintTextBlock value={unclearContent} lines2 />

          <div className="tl-print-heading">3. ปัญหาที่พบ (เลือกได้มากกว่า 1 ข้อ)</div>
          <ul className="tl-print-list">
            {problemOptions.filter((problem) => problem !== 'อื่นๆ').map((problem) => (
              <li key={problem}>
                <TeachingLogPrintChoice checked={problems.includes(problem)} label={problem} />
              </li>
            ))}
            <li>
              <TeachingLogPrintChoice checked={problems.includes('อื่นๆ')} label="อื่นๆ (ระบุ)" />
              <span className="tl-print-inline-fill">{otherProblem}</span>
            </li>
          </ul>
        </section>

        <section className="tl-print-page">
          <div className="tl-print-heading">4. ข้อสังเกตและประเด็นพิเศษ (ผู้เรียนที่โดดเด่น/ต้องการความช่วยเหลือพิเศษ)</div>
          <TeachingLogPrintTextBlock value={notes} lines2 />

          <div className="tl-print-heading">5. แนวทางการพัฒนา/ปรับปรุงการสอนครั้งถัดไป</div>
          <TeachingLogPrintTextBlock value={improvement} lines2 />

          <div className="tl-print-heading">6. กิจกรรมเสริม/การมอบหมายงาน (ถ้ามี)</div>
          <div className="tl-print-row tl-print-bullet-row">
            <TeachingLogPrintLine label="การบ้าน/งานที่มอบหมาย" value={homework} />
          </div>
          <div className="tl-print-row tl-print-bullet-row">
            <TeachingLogPrintLine label="กำหนดส่ง" value={dueDate} />
          </div>
          <div className="tl-print-row tl-print-bullet-row">
            <TeachingLogPrintLine label="วิธีการติดตาม/ประเมินผล" value={followUp} />
          </div>

          <div className="tl-print-heading">7. สรุปภาพรวม (เลือกเพียง 1 ข้อ)</div>
          <ul className="tl-print-list">
            {overviewOptions.map((item) => (
              <li key={item}>
                <TeachingLogPrintChoice checked={overview === item} label={item} radio />
              </li>
            ))}
          </ul>

          <div className="tl-print-sign">
            <div className="tl-print-sign-line">
              <span>ลงชื่อ</span>
              <span className="tl-print-sign-blank"></span>
              <span>ผู้สอน</span>
            </div>
            <div>(<span className="tl-print-name-blank">{selectedTeacher?.name || ''}</span>)</div>
            <div style={{ marginTop: 10 }}>วันที่ <span className="tl-print-name-blank">{displayDate}</span></div>
          </div>
        </section>
      </div>
    </div>
  );
}

window.TeachingLog = TeachingLog;
