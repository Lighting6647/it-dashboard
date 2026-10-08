import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  Activity, Database, Eye, EyeOff, KeyRound, Laptop, LayoutDashboard,
  LockKeyhole, ShieldCheck, Sparkles, TicketCheck, UserRound
} from 'lucide-react';
import fernLogo from '../assets/fern-aesthetique-logo.png';
import { storeAuth } from '../auth';
import './Login.css';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
const glassItems = [
  { label: 'Dashboard', icon: LayoutDashboard }, { label: 'Asset', icon: Laptop },
  { label: 'Support', icon: TicketCheck }, { label: 'Security', icon: ShieldCheck },
  { label: 'Database', icon: Database }, { label: 'Monitor', icon: Activity }
];

export default function Login({ onLogin }) {
  const pageRef = useRef(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo('.login-hero-copy > *', { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: .72, stagger: .1 })
        .fromTo('.login-glass-tile', { opacity: 0, y: 22, scale: .9 }, { opacity: 1, y: 0, scale: 1, duration: .58, stagger: .07 }, '-=.42')
        .fromTo('.login-card', { opacity: 0, x: 36, scale: .96 }, { opacity: 1, x: 0, scale: 1, duration: .82 }, '-=.68');
      if (!reduceMotion) {
        gsap.to('.login-orb-one', { x: 70, y: 34, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        gsap.to('.login-orb-two', { x: -54, y: -38, duration: 10, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        gsap.to('.login-glass-tile', { y: -7, duration: 2.7, repeat: -1, yoyo: true, stagger: { each: .18, from: 'random' }, ease: 'sine.inOut' });
        gsap.to('.login-liquid-line', { xPercent: 24, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      }
    }, page);
    const move = (event) => {
      if (reduceMotion || !finePointer) return;
      const x = (event.clientX / window.innerWidth) - .5;
      const y = (event.clientY / window.innerHeight) - .5;
      gsap.to('.login-glass-field', { x: x * 18, y: y * 14, duration: .9, ease: 'power2.out', overwrite: 'auto' });
      gsap.to('.login-card', { x: x * -8, y: y * -6, duration: .9, ease: 'power2.out', overwrite: 'auto' });
    };
    const reset = () => gsap.to(['.login-glass-field', '.login-card'], { x: 0, y: 0, duration: .8, ease: 'power2.out', overwrite: 'auto' });
    page.addEventListener('pointermove', move);
    page.addEventListener('pointerleave', reset);
    return () => {
      page.removeEventListener('pointermove', move);
      page.removeEventListener('pointerleave', reset);
      context.revert();
    };
  }, []);

  const submit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: username.trim(), password }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      const auth = { token: result.token, user: result.user };
      storeAuth(auth); onLogin(auth);
    } catch (loginError) { setError(loginError.message || 'ไม่สามารถเข้าสู่ระบบได้'); }
    finally { setLoading(false); }
  };

  const handleDemoLogin = async () => {
    setError(''); setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/demo`, { method: 'POST' });
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.token && result.user) {
        const auth = { token: result.token, user: result.user };
        storeAuth(auth); onLogin(auth);
        return;
      }
    } catch {
      // offline/fallback mode
    }
    const fallbackAuth = {
      token: 'demo-token-guest',
      user: { username: 'demo_guest', name: 'ผู้เข้าชมเดโม (Demo Guest)', role: 'admin', active: true }
    };
    storeAuth(fallbackAuth); onLogin(fallbackAuth);
    setLoading(false);
  };

  return (
    <main className="login-page" ref={pageRef}>
      <div className="login-scene" aria-hidden="true"><span className="login-orb login-orb-one" /><span className="login-orb login-orb-two" /><span className="login-liquid-line" /></div>
      <div className="login-shell">
        <section className="login-visual" aria-label="ระบบ IT Monthly Dashboard">
          <div className="login-hero-copy"><h2 className="login-hero-title-brand">FERN AESTHETIQUE<br /><em>· IT OPERATIONS</em></h2><p>ศูนย์กลางข้อมูลทรัพย์สิน งานบริการ และการดำเนินงาน IT ที่ปลอดภัยในหน้าจอเดียว</p></div>
          <div className="login-glass-field" aria-hidden="true">{glassItems.map(({ label, icon: Icon }) => <div className="login-glass-tile" key={label}><span><Icon size={25} strokeWidth={1.7} /></span><small>{label}</small></div>)}</div>
        </section>
        <section className="login-card" aria-labelledby="login-title">
          <div className="login-brand-row"><img src={fernLogo} alt="FERN AESTHETIQUE" className="login-logo" /><span className="login-secure-badge"><ShieldCheck size={15} /> Secure Access</span></div>
          <div className="login-heading"><span className="login-icon"><LockKeyhole size={23} /></span><div><span className="login-overline">Welcome back</span><h1 id="login-title">เข้าสู่ระบบ IT Dashboard</h1><p>กรอกบัญชีผู้ใช้เพื่อเข้าสู่ระบบตามสิทธิ์ที่ได้รับ</p></div></div>
          <form onSubmit={submit} className="login-form">
            <label htmlFor="login-user">User</label><div className="login-input-wrap"><UserRound size={19} /><input id="login-user" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ชื่อผู้ใช้งาน" required autoFocus /></div>
            <label htmlFor="login-password">Password</label><div className="login-input-wrap"><KeyRound size={19} /><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน" required /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
            {error && <div className="login-error" role="alert">{error}</div>}<button className="login-submit" type="submit" disabled={loading}><span>{loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}</span></button>
          </form>

          <div className="demo-divider"><span>หรือ</span></div>
          <button
            type="button"
            className="demo-login-btn"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            <Sparkles size={18} />
            <span>เข้าชมระบบเวอร์ชัน Demo (ไม่ต้องใช้รหัสผ่าน)</span>
          </button>

          <div className="login-access-note"><LockKeyhole size={14} /> สิทธิ์ 3 ระดับ: ผู้ดูรายงาน • ผู้ใช้งานทั่วไป • ผู้ดูแล IT</div>
        </section>
      </div>
    </main>
  );
}
