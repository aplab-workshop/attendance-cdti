// Mock Google Sheets data layer using Firebase Realtime Database
// Schema mirrors what would be in Google Sheets tabs

const firebaseConfig = {
  apiKey: "AIzaSyD2BbyleZwxkjhqinv6DSjDH9J8Eegjea0",
  authDomain: "attendance-cdti.firebaseapp.com",
  databaseURL: "https://attendance-cdti-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "attendance-cdti",
  storageBucket: "attendance-cdti.firebasestorage.app",
  messagingSenderId: "996636805371",
  appId: "1:996636805371:web:41e0f6996e338239e2485e"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const STORAGE_KEY = 'cdti_attendance_v3';
const FIREBASE_PATH = '/cdti_data';

const ACADEMIC_YEARS = ['2567', '2568', '2569'];

const DEFAULT_PERIODS = [
  { n: 1, start: '08:30', end: '09:20' },
  { n: 2, start: '09:20', end: '10:10' },
  { n: 3, start: '10:10', end: '11:00' },
  { n: 4, start: '11:00', end: '11:50' },
  { n: 5, start: '12:50', end: '13:40' },
  { n: 6, start: '13:40', end: '14:30' },
  { n: 7, start: '14:30', end: '15:20' },
  { n: 8, start: '15:20', end: '16:10' },
];

const DAYS = [
  { n: 1, short: 'จ.', full: 'จันทร์', color: '#FEF3C7' },
  { n: 2, short: 'อ.', full: 'อังคาร', color: '#FEE2E2' },
  { n: 3, short: 'พ.', full: 'พุธ', color: '#D1FAE5' },
  { n: 4, short: 'พฤ.', full: 'พฤหัสบดี', color: '#FED7AA' },
  { n: 5, short: 'ศ.', full: 'ศุกร์', color: '#DBEAFE' },
];

const DEFAULT_DATA = {
  meta: {
    currentYear: '2568',
    sheetId: '1aBcDeFgHiJkLmNoPqRsTuVwXyZ_chitralada',
    lastSync: new Date().toISOString(),
    periods: DEFAULT_PERIODS,
  },
  users: [
    { id: 'u1', username: 'kruA', password: '1234', name: 'อ.อรนภา สุวรรณชาติ', role: 'teacher', department: 'เทคโนโลยีสารสนเทศ', avatar: 'อ' },
    { id: 'u2', username: 'kruB', password: '1234', name: 'อ.ธนกร เพ็ชรรัตน์', role: 'teacher', department: 'ภาษาไทยและสามัญ', avatar: 'ธ' },
    { id: 'u3', username: 'kruC', password: '1234', name: 'อ.วราภรณ์ ใจดี', role: 'teacher', department: 'ธุรกิจ', avatar: 'ว' },
    { id: 'admin1', username: 'TTT', password: '666', name: 'ผู้ดูแลระบบ', role: 'admin', avatar: 'A' },
  ],
  classrooms: [
    { id: 'c1', name: 'ปวช.1/1 เทคโนโลยีสารสนเทศ', grade: 'ปวช.1', section: '1', program: 'เทคโนโลยีสารสนเทศ', year: '2568' },
    { id: 'c2', name: 'ปวช.2/1 ธุรกิจค้าปลีก', grade: 'ปวช.2', section: '1', program: 'ธุรกิจค้าปลีก', year: '2568' },
    { id: 'c3', name: 'ปวช.1/2 อาหารและโภชนาการ', grade: 'ปวช.1', section: '2', program: 'อาหารและโภชนาการ', year: '2568' },
    { id: 'c4', name: 'ปวส.1/1 คอมพิวเตอร์ธุรกิจ', grade: 'ปวส.1', section: '1', program: 'คอมพิวเตอร์ธุรกิจ', year: '2568' },
  ],
  subjects: [
    // kruA (u1) - IT teacher
    { id: 's1', code: '20901-1001', name: 'การเขียนโปรแกรมคอมพิวเตอร์', hours: 60, classroomId: 'c1', year: '2568', term: 1, teacherId: 'u1',
      schedule: [{ day: 1, startPeriod: 1, endPeriod: 2, room: 'IT-301' }, { day: 3, startPeriod: 3, endPeriod: 4, room: 'IT-301' }] },
    { id: 's2', code: '20901-1002', name: 'ระบบเครือข่ายเบื้องต้น', hours: 40, classroomId: 'c1', year: '2568', term: 1, teacherId: 'u1',
      schedule: [{ day: 2, startPeriod: 5, endPeriod: 6, room: 'IT-302' }] },
    { id: 's10', code: '30901-2001', name: 'การพัฒนาเว็บไซต์', hours: 60, classroomId: 'c4', year: '2568', term: 1, teacherId: 'u1',
      schedule: [{ day: 4, startPeriod: 1, endPeriod: 3, room: 'IT-401' }] },
    { id: 's11', code: '20901-1003', name: 'การใช้งานคอมพิวเตอร์', hours: 40, classroomId: 'c2', year: '2568', term: 1, teacherId: 'u1',
      schedule: [{ day: 5, startPeriod: 5, endPeriod: 6, room: 'IT-303' }] },
    // kruB (u2) - Thai/English teacher
    { id: 's3', code: '20000-1101', name: 'ภาษาไทยพื้นฐาน', hours: 40, classroomId: 'c1', year: '2568', term: 1, teacherId: 'u2',
      schedule: [{ day: 1, startPeriod: 3, endPeriod: 4, room: 'A-201' }] },
    { id: 's4', code: '20000-1201', name: 'ภาษาอังกฤษในชีวิตจริง', hours: 40, classroomId: 'c1', year: '2568', term: 1, teacherId: 'u2',
      schedule: [{ day: 3, startPeriod: 5, endPeriod: 6, room: 'A-202' }] },
    { id: 's12', code: '20000-1102', name: 'ภาษาไทยเพื่ออาชีพ', hours: 40, classroomId: 'c2', year: '2568', term: 1, teacherId: 'u2',
      schedule: [{ day: 2, startPeriod: 1, endPeriod: 2, room: 'A-203' }] },
    { id: 's13', code: '20000-1202', name: 'ภาษาอังกฤษเพื่อการสื่อสาร', hours: 40, classroomId: 'c3', year: '2568', term: 1, teacherId: 'u2',
      schedule: [{ day: 4, startPeriod: 5, endPeriod: 6, room: 'A-204' }] },
    // kruC (u3) - Math/business teacher
    { id: 's5', code: '20000-1401', name: 'คณิตศาสตร์พื้นฐานอาชีพ', hours: 40, classroomId: 'c1', year: '2568', term: 1, teacherId: 'u3',
      schedule: [{ day: 5, startPeriod: 1, endPeriod: 2, room: 'M-101' }] },
    { id: 's6', code: '20202-2001', name: 'การขายเบื้องต้น', hours: 60, classroomId: 'c2', year: '2568', term: 1, teacherId: 'u3',
      schedule: [{ day: 1, startPeriod: 5, endPeriod: 6, room: 'B-202' }, { day: 3, startPeriod: 1, endPeriod: 2, room: 'B-202' }] },
    { id: 's7', code: '20202-2002', name: 'การจัดการธุรกิจค้าปลีก', hours: 60, classroomId: 'c2', year: '2568', term: 1, teacherId: 'u3',
      schedule: [{ day: 4, startPeriod: 3, endPeriod: 4, room: 'B-203' }] },
    { id: 's8', code: '20404-1001', name: 'อาหารไทยเบื้องต้น', hours: 80, classroomId: 'c3', year: '2568', term: 1, teacherId: 'u3',
      schedule: [{ day: 2, startPeriod: 3, endPeriod: 4, room: 'F-101' }] },
    { id: 's9', code: '20404-1002', name: 'โภชนาการ', hours: 40, classroomId: 'c3', year: '2568', term: 1, teacherId: 'u3',
      schedule: [{ day: 5, startPeriod: 3, endPeriod: 4, room: 'F-102' }] },
  ],
  students: [
    // c4 - ปวส.1/1 IT (added)
    { id: 'st21', studentNo: '67501001', firstName: 'อรพิชชา', lastName: 'เจริญสุข', nickname: 'ฟ้า', gender: 'F', classroomId: 'c4' },
    { id: 'st22', studentNo: '67501002', firstName: 'ไชยวัฒน์', lastName: 'ขจรขจี', nickname: 'ไชย์', gender: 'M', classroomId: 'c4' },
    { id: 'st23', studentNo: '67501003', firstName: 'ปริญญาพร', lastName: 'รรณสิริ', nickname: 'มิ้ง', gender: 'F', classroomId: 'c4' },
    { id: 'st24', studentNo: '67501004', firstName: 'ชยันต์', lastName: 'บุญมา', nickname: 'ติว', gender: 'M', classroomId: 'c4' },
    { id: 'st25', studentNo: '67501005', firstName: 'อัญชิษฐา', lastName: 'ประเสริฐ', nickname: 'ไอม์', gender: 'F', classroomId: 'c4' },
    // c1 - ปวช.1/1 IT
    { id: 'st1', studentNo: '67301001', firstName: 'กิตติศักดิ์', lastName: 'พงษ์พานิช', nickname: 'ต้น', gender: 'M', classroomId: 'c1' },
    { id: 'st2', studentNo: '67301002', firstName: 'จิราพร', lastName: 'แสงทอง', nickname: 'มายด์', gender: 'F', classroomId: 'c1' },
    { id: 'st3', studentNo: '67301003', firstName: 'ณัฐพล', lastName: 'วัฒนกุล', nickname: 'แบงค์', gender: 'M', classroomId: 'c1' },
    { id: 'st4', studentNo: '67301004', firstName: 'ดารินทร์', lastName: 'ทองคำ', nickname: 'อาย', gender: 'F', classroomId: 'c1' },
    { id: 'st5', studentNo: '67301005', firstName: 'ธีรเดช', lastName: 'มั่นคง', nickname: 'อ๊อฟ', gender: 'M', classroomId: 'c1' },
    { id: 'st6', studentNo: '67301006', firstName: 'นภัสสร', lastName: 'จันทร์เพ็ญ', nickname: 'น้ำ', gender: 'F', classroomId: 'c1' },
    { id: 'st7', studentNo: '67301007', firstName: 'ปิยวัฒน์', lastName: 'รุ่งเรือง', nickname: 'เอิร์ธ', gender: 'M', classroomId: 'c1' },
    { id: 'st8', studentNo: '67301008', firstName: 'พิมพ์ชนก', lastName: 'ศรีสวัสดิ์', nickname: 'พิม', gender: 'F', classroomId: 'c1' },
    { id: 'st9', studentNo: '67301009', firstName: 'ภัทรพล', lastName: 'อนุชิต', nickname: 'ปอนด์', gender: 'M', classroomId: 'c1' },
    { id: 'st10', studentNo: '67301010', firstName: 'รัตนาวดี', lastName: 'พรหมศิริ', nickname: 'มุก', gender: 'F', classroomId: 'c1' },
    { id: 'st11', studentNo: '67301011', firstName: 'วชิรวิทย์', lastName: 'แก้วใส', nickname: 'เจมส์', gender: 'M', classroomId: 'c1' },
    { id: 'st12', studentNo: '67301012', firstName: 'ศิรประภา', lastName: 'นวลจันทร์', nickname: 'แพรว', gender: 'F', classroomId: 'c1' },
    // c2
    { id: 'st13', studentNo: '67302001', firstName: 'อนุชา', lastName: 'พึ่งสุข', nickname: 'นัท', gender: 'M', classroomId: 'c2' },
    { id: 'st14', studentNo: '67302002', firstName: 'เบญจมาศ', lastName: 'ดอกบัว', nickname: 'เบล', gender: 'F', classroomId: 'c2' },
    { id: 'st15', studentNo: '67302003', firstName: 'สุรชัย', lastName: 'มาลัย', nickname: 'ปอ', gender: 'M', classroomId: 'c2' },
    { id: 'st16', studentNo: '67302004', firstName: 'ขวัญฤดี', lastName: 'หิรัญ', nickname: 'แพร', gender: 'F', classroomId: 'c2' },
    { id: 'st17', studentNo: '67302005', firstName: 'ปรีชา', lastName: 'ทินกร', nickname: 'ปลื้ม', gender: 'M', classroomId: 'c2' },
    // c3
    { id: 'st18', studentNo: '67303001', firstName: 'ธัญญา', lastName: 'พิทักษ์', nickname: 'แพรว', gender: 'F', classroomId: 'c3' },
    { id: 'st19', studentNo: '67303002', firstName: 'มงคล', lastName: 'ชัยชนะ', nickname: 'โบ๊ท', gender: 'M', classroomId: 'c3' },
    { id: 'st20', studentNo: '67303003', firstName: 'กานต์ธิดา', lastName: 'พรหมจักร', nickname: 'จูน', gender: 'F', classroomId: 'c3' },
  ],
  // attendance records: { id, subjectId, date, records: [{studentId, status, note}] }
  attendance: [],
};

// Seed some attendance records for last 2 weeks
function seedAttendance(data) {
  const today = new Date();
  const records = [];
  const statuses = ['present', 'present', 'present', 'present', 'present', 'late', 'absent', 'leave'];

  data.subjects.forEach((subj) => {
    const classStudents = data.students.filter((s) => s.classroomId === subj.classroomId);
    // Generate ~8 sessions per subject in last 30 days
    for (let i = 0; i < 8; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i * 3 - (subj.id.charCodeAt(1) % 3));
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      records.push({
        id: `att_${subj.id}_${i}`,
        subjectId: subj.id,
        classroomId: subj.classroomId,
        date: d.toISOString().split('T')[0],
        period: 1 + (i % 4),
        records: classStudents.map((st, idx) => ({
          studentId: st.id,
          status: statuses[(idx + i + subj.id.length) % statuses.length],
          note: '',
        })),
      });
    }
  });
  data.attendance = records;
  return data;
}

const DataStore = {
  _data: null,
  _loadPromise: null,
  _listeners: new Set(),

  load() {
    if (!this._data) {
      this._data = seedAttendance(JSON.parse(JSON.stringify(DEFAULT_DATA)));
      this._loadFromFirebase();
    }
    return this._data;
  },

  _loadFromFirebase() {
    if (this._loadPromise) return this._loadPromise;

    this._loadPromise = db.ref(FIREBASE_PATH).once('value')
      .then((snapshot) => {
        const firebaseData = snapshot.val();
        if (firebaseData) {
          this._data = firebaseData;
        } else {
          this._data = seedAttendance(JSON.parse(JSON.stringify(DEFAULT_DATA)));
          return db.ref(FIREBASE_PATH).set(this._data);
        }
      })
      .then(() => {
        this._listeners.forEach((fn) => fn(this._data));
        return this._data;
      })
      .catch((e) => {
        console.error('Failed to load Firebase data:', e);
        this._listeners.forEach((fn) => fn(this._data));
        return this._data;
      });

    return this._loadPromise;
  },

  save() {
    this._data.meta.lastSync = new Date().toISOString();
    this._listeners.forEach((fn) => fn(this._data));
    return db.ref(FIREBASE_PATH).set(this._data).catch((e) => {
      console.error('Failed to save Firebase data:', e);
    });
  },

  reset() {
    this._data = seedAttendance(JSON.parse(JSON.stringify(DEFAULT_DATA)));
    this._listeners.forEach((fn) => fn(this._data));
    return db.ref(FIREBASE_PATH).set(this._data).catch((e) => {
      console.error('Failed to reset Firebase data:', e);
    });
  },

  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  },

  // Helpers
  uid(prefix = 'id') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  },

  login(username, password) {
    const d = this.load();
    return d.users.find((u) => u.username === username && u.password === password);
  },

  getClassroom(id) {
    return this.load().classrooms.find((c) => c.id === id);
  },

  getTeacherClassroom(teacherId) {
    return this.load().classrooms.find((c) => c.teacherId === teacherId);
  },

  getSubjectsByTeacher(teacherId, year) {
    return this.load()
      .subjects.filter((s) => s.teacherId === teacherId && (!year || s.year === year))
      .sort((a, b) => a.code.localeCompare(b.code));
  },

  getClassroomsByTeacher(teacherId, year) {
    const subs = this.getSubjectsByTeacher(teacherId, year);
    const ids = [...new Set(subs.map((s) => s.classroomId))];
    return ids.map((id) => this.getClassroom(id)).filter(Boolean);
  },

  getStudentsByTeacher(teacherId, year) {
    const cls = this.getClassroomsByTeacher(teacherId, year);
    const studentIds = new Set();
    const all = [];
    cls.forEach((c) => {
      this.getStudentsByClassroom(c.id).forEach((s) => {
        if (!studentIds.has(s.id)) {
          studentIds.add(s.id);
          all.push(s);
        }
      });
    });
    return all;
  },

  getStudentsByClassroom(classroomId) {
    return this.load()
      .students.filter((s) => s.classroomId === classroomId)
      .sort((a, b) => a.studentNo.localeCompare(b.studentNo));
  },

  getSubjectsByClassroom(classroomId, year) {
    return this.load().subjects.filter((s) => s.classroomId === classroomId && (!year || s.year === year));
  },

  getAttendanceBySubject(subjectId) {
    return this.load()
      .attendance.filter((a) => a.subjectId === subjectId)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  // CRUD
  addStudent(s) {
    const d = this.load();
    d.students.push({ ...s, id: this.uid('st') });
    this.save();
  },
  updateStudent(id, patch) {
    const d = this.load();
    const i = d.students.findIndex((s) => s.id === id);
    if (i >= 0) d.students[i] = { ...d.students[i], ...patch };
    this.save();
  },
  deleteStudent(id) {
    const d = this.load();
    d.students = d.students.filter((s) => s.id !== id);
    d.attendance.forEach((a) => {
      a.records = a.records.filter((r) => r.studentId !== id);
    });
    this.save();
  },

  saveAttendance(record) {
    const d = this.load();
    const i = d.attendance.findIndex(
      (a) => a.subjectId === record.subjectId && a.date === record.date && a.period === record.period
    );
    if (i >= 0) {
      d.attendance[i] = { ...d.attendance[i], ...record };
    } else {
      d.attendance.push({ ...record, id: this.uid('att') });
    }
    this.save();
  },

  deleteAttendance(id) {
    const d = this.load();
    d.attendance = d.attendance.filter((a) => a.id !== id);
    this.save();
  },

  addUser(u) {
    const d = this.load();
    d.users.push({ ...u, id: this.uid('u'), avatar: u.name?.charAt(0) || '?' });
    this.save();
  },
  updateUser(id, patch) {
    const d = this.load();
    const i = d.users.findIndex((u) => u.id === id);
    if (i >= 0) d.users[i] = { ...d.users[i], ...patch };
    this.save();
  },
  deleteUser(id) {
    const d = this.load();
    d.users = d.users.filter((u) => u.id !== id);
    this.save();
  },

  addSubject(s) {
    const d = this.load();
    d.subjects.push({ ...s, id: this.uid('s') });
    this.save();
  },
  updateSubject(id, patch) {
    const d = this.load();
    const i = d.subjects.findIndex((s) => s.id === id);
    if (i >= 0) d.subjects[i] = { ...d.subjects[i], ...patch };
    this.save();
  },
  deleteSubject(id) {
    const d = this.load();
    d.subjects = d.subjects.filter((s) => s.id !== id);
    d.attendance = d.attendance.filter((a) => a.subjectId !== id);
    this.save();
  },

  addClassroom(c) {
    const d = this.load();
    d.classrooms.push({ ...c, id: this.uid('c') });
    this.save();
  },
  updateClassroom(id, patch) {
    const d = this.load();
    const i = d.classrooms.findIndex((c) => c.id === id);
    if (i >= 0) d.classrooms[i] = { ...d.classrooms[i], ...patch };
    this.save();
  },
  deleteClassroom(id) {
    const d = this.load();
    d.classrooms = d.classrooms.filter((c) => c.id !== id);
    this.save();
  },

  // Stats
  attendanceStats(subjectId, studentId) {
    const recs = this.getAttendanceBySubject(subjectId);
    let present = 0, late = 0, leave = 0, absent = 0;
    recs.forEach((r) => {
      const rec = r.records.find((x) => x.studentId === studentId);
      if (!rec) return;
      if (rec.status === 'present') present++;
      else if (rec.status === 'late') late++;
      else if (rec.status === 'leave') leave++;
      else if (rec.status === 'absent') absent++;
    });
    const total = present + late + leave + absent;
    const pct = total ? Math.round(((present + late * 0.5) / total) * 100) : 0;
    return { present, late, leave, absent, total, pct };
  },
};

// Session
const Session = {
  get user() {
    try {
      const u = sessionStorage.getItem('cdti_user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  },
  set user(u) {
    if (u) sessionStorage.setItem('cdti_user', JSON.stringify(u));
    else sessionStorage.removeItem('cdti_user');
  },
  logout() {
    sessionStorage.removeItem('cdti_user');
  },
};

const STATUS_LABEL = {
  present: 'มา',
  late: 'สาย',
  leave: 'ลา',
  absent: 'ขาด',
};

const STATUS_COLOR = {
  present: '#1f9d55',
  late: '#e6a700',
  leave: '#3b82f6',
  absent: '#dc2626',
};

window.DataStore = DataStore;
window.Session = Session;
window.ACADEMIC_YEARS = ACADEMIC_YEARS;
window.STATUS_LABEL = STATUS_LABEL;
window.STATUS_COLOR = STATUS_COLOR;
window.DEFAULT_PERIODS = DEFAULT_PERIODS;
window.DAYS = DAYS;
