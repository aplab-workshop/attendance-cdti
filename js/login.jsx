// Login screen

const { useState: useStateL } = React;

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useStateL('');
  const [password, setPassword] = useStateL('');
  const [showPw, setShowPw] = useStateL(false);
  const [err, setErr] = useStateL('');
  const [loading, setLoading] = useStateL(false);

  const submit = (e) => {
    e?.preventDefault();
    setErr('');
    setLoading(true);
    setTimeout(() => {
      const user = DataStore.login(username.trim(), password);
      if (!user) {
        setErr('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        setLoading(false);
        return;
      }
      Session.user = user;
      onLogin(user);
    }, 350);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.05fr 1fr', background: '#fff' }}>
      {/* Left panel */}
      <div style={{
        position: 'relative', background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-700) 60%, #061a32 100%)',
        color: '#fff', padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,209,67,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,209,67,0.06)' }} />
        <div style={{ position: 'absolute', top: '40%', right: '10%', width: 12, height: 12, borderRadius: '50%', background: 'var(--yellow)' }} />
        <div style={{ position: 'absolute', top: '20%', left: '30%', width: 6, height: 6, borderRadius: '50%', background: 'var(--yellow)', opacity: 0.6 }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ background: '#fff', padding: '14px 18px', borderRadius: 12, display: 'inline-block' }}>
            <Logo size="md" />
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--yellow)', letterSpacing: '.12em', marginBottom: 12 }}>
            ATTENDANCE SYSTEM · ระบบเช็คชื่อนักเรียน
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 800, margin: 0, lineHeight: 1.15, letterSpacing: '-.01em' }}>
            ระบบบันทึก<br />
            เวลาเรียน<br />
            <span style={{ color: 'var(--yellow)' }}>นักเรียนนักศึกษา</span>
          </h1>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,.75)', marginTop: 16, maxWidth: 460 }}>
            สถาบันเทคโนโลยีจิตรลดา · บันทึกเวลาเรียนทุกรายวิชา รายงานสรุปแยกตามปีการศึกษา พร้อม Export PDF
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 24, fontSize: 13, color: 'rgba(255,255,255,.7)' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{DataStore.load().classrooms.length}</div>
            <div>ชั้นเรียนที่เปิดสอน</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{DataStore.load().subjects.length}</div>
            <div>รายวิชา</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{DataStore.load().students.length}</div>
            <div>นักเรียนทั้งหมด</div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy-400)', marginBottom: 6 }}>ยินดีต้อนรับ</div>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: 'var(--navy)', margin: 0 }}>เข้าสู่ระบบ</h2>
            <div style={{ fontSize: 14, color: 'var(--navy-400)', marginTop: 8 }}>
              กรุณากรอกชื่อผู้ใช้และรหัสผ่านของคุณ
            </div>
          </div>

          <form onSubmit={submit}>
            <Field label="ชื่อผู้ใช้ (Username)" required>
              <Input value={username} onChange={setUsername} placeholder="เช่น kruA หรือ TTT" icon="user" autoFocus />
            </Field>

            <Field label="รหัสผ่าน (Password)" required>
              <div style={{ position: 'relative' }}>
                <Input value={password} onChange={setPassword} type={showPw ? 'text' : 'password'} placeholder="••••••••" icon="lock" />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--navy-400)',
                  }}
                >
                  <Icon name={showPw ? 'eyeOff' : 'eye'} size={16} />
                </button>
              </div>
            </Field>

            {err && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14, fontWeight: 500,
              }}>
                {err}
              </div>
            )}

            <Button type="submit" size="lg" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }} disabled={loading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </form>

          <div style={{
            marginTop: 32, padding: 16, background: 'var(--navy-50)', borderRadius: 10,
            border: '1px dashed var(--navy-200)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 8, letterSpacing: '.05em' }}>
              ตัวอย่างบัญชีทดสอบ
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: 'var(--navy-700)' }}>
              <div>
                <div style={{ fontWeight: 700 }}>ครูประจำชั้น</div>
                <div style={{ fontFamily: 'monospace' }}>kruA / 1234</div>
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>ผู้ดูแลระบบ</div>
                <div style={{ fontFamily: 'monospace' }}>•••• / •••</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, fontSize: 12, color: 'var(--navy-400)', textAlign: 'center' }}>
            © 2568 สถาบันเทคโนโลยีจิตรลดา · Chitralada Technology Institute
          </div>
        </div>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
