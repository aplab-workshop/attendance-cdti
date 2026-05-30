// Shared UI components & utilities

const { useState, useEffect, useRef, useMemo } = React;

const Icon = ({ name, size = 18, className = '', style = {} }) => {
  const paths = {
    user: 'M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z',
    lock: 'M18 8h-1V6c0-2.8-2.2-5-5-5S7 3.2 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9V6z',
    home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    book: 'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 7l-3-2v-3h6v3l-3 2z',
    chart: 'M3 13h2v8H3zm4-6h2v14H7zm4 3h2v11h-2zm4-6h2v17h-2zm4 9h2v8h-2z',
    users: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
    check: 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z',
    plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z',
    edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z',
    trash: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z',
    download: 'M19 9h-4V3H9v6H5l7 7zM5 18v2h14v-2z',
    logout: 'M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4z',
    settings: 'M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
    calendar: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14zM7 10h5v5H7z',
    search: 'M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zM9.5 14C7 14 5 12 5 9.5S7 5 9.5 5 14 7 14 9.5 12 14 9.5 14z',
    arrowLeft: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z',
    sheet: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM8 17H5v-3h3zm0-5H5V9h3zm0-5H5V5h3zm6 10h-4v-3h4zm0-5h-4V9h4zm0-5h-4V5h4zm5 10h-3v-3h3zm0-5h-3V9h3zm0-5h-3V5h3z',
    bell: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1z',
    eye: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
    eyeOff: 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z',
    refresh: 'M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z',
    pdf: 'M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5zM20 9.5h-1.5V11H20V12.5h-1.5V14H17V7h3zM10 9.5h-1v-1h1zm5 0v-1h-1v3h1V11h1V9.5z',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d={paths[name] || ''} />
    </svg>
  );
};

const Logo = ({ size = 'md' }) => {
  const heights = { sm: 28, md: 40, lg: 60, xl: 90 };
  return <img src="assets/logo.png" alt="CDTI" style={{ height: heights[size], display: 'block' }} />;
};

const Button = ({ children, variant = 'primary', size = 'md', icon, onClick, type, disabled, style = {}, title }) => {
  const variants = {
    primary: { background: 'var(--navy)', color: '#fff', border: '1px solid var(--navy)' },
    yellow: { background: 'var(--yellow)', color: 'var(--navy)', border: '1px solid var(--yellow)' },
    outline: { background: '#fff', color: 'var(--navy)', border: '1px solid var(--navy-300)' },
    ghost: { background: 'transparent', color: 'var(--navy)', border: '1px solid transparent' },
    danger: { background: '#fff', color: '#dc2626', border: '1px solid #fecaca' },
    dangerSolid: { background: '#dc2626', color: '#fff', border: '1px solid #dc2626' },
    success: { background: '#1f9d55', color: '#fff', border: '1px solid #1f9d55' },
  };
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 13, height: 32 },
    md: { padding: '8px 16px', fontSize: 14, height: 38 },
    lg: { padding: '10px 20px', fontSize: 15, height: 44 },
  };
  return (
    <button
      type={type || 'button'}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="btn"
      style={{
        ...variants[variant],
        ...sizes[size],
        fontFamily: 'inherit',
        fontWeight: 600,
        borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all .15s',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
};

const Card = ({ children, style = {}, padding = 24, title, action }) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid var(--border)',
      boxShadow: '0 1px 2px rgba(10,38,71,0.04)',
      ...style,
    }}
  >
    {title && (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>{title}</div>
        {action}
      </div>
    )}
    <div style={{ padding }}>{children}</div>
  </div>
);

const StatusBadge = ({ status }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      background: STATUS_COLOR[status] + '20',
      color: STATUS_COLOR[status],
      border: `1px solid ${STATUS_COLOR[status]}40`,
    }}
  >
    {STATUS_LABEL[status]}
  </span>
);

const Modal = ({ open, onClose, title, children, width = 560, footer }) => {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10,38,71,0.45)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 14, width: '100%', maxWidth: width, maxHeight: '90vh',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(10,38,71,0.25)',
        }}
      >
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 16 }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--navy-400)', padding: 0, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 24, overflow: 'auto', flex: 1 }}>{children}</div>
        {footer && <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{footer}</div>}
      </div>
    </div>
  );
};

const Field = ({ label, children, hint, required }) => (
  <label style={{ display: 'block', marginBottom: 14 }}>
    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 6 }}>
      {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
    </div>
    {children}
    {hint && <div style={{ fontSize: 12, color: 'var(--navy-400)', marginTop: 4 }}>{hint}</div>}
  </label>
);

const Input = ({ value, onChange, type = 'text', placeholder, icon, ...rest }) => (
  <div style={{ position: 'relative' }}>
    {icon && (
      <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--navy-400)' }}>
        <Icon name={icon} size={16} />
      </div>
    )}
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', height: 40, padding: icon ? '0 12px 0 38px' : '0 12px',
        border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit',
        background: '#fff', color: 'var(--navy)', outline: 'none', boxSizing: 'border-box',
      }}
      onFocus={(e) => (e.target.style.borderColor = 'var(--navy)')}
      onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
      {...rest}
    />
  </div>
);

const Select = ({ value, onChange, options, placeholder }) => (
  <select
    value={value ?? ''}
    onChange={(e) => onChange?.(e.target.value)}
    style={{
      width: '100%', height: 40, padding: '0 12px',
      border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit',
      background: '#fff', color: 'var(--navy)', outline: 'none', cursor: 'pointer', boxSizing: 'border-box',
    }}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

const Tabs = ({ tabs, active, onChange }) => (
  <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 24, overflowX: 'auto', whiteSpace: 'nowrap' }}>
    {tabs.map((t) => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        style={{
          padding: '12px 18px', background: 'transparent', border: 'none', fontFamily: 'inherit',
          fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
          color: active === t.id ? 'var(--navy)' : 'var(--navy-400)',
          borderBottom: active === t.id ? '2px solid var(--yellow)' : '2px solid transparent',
          marginBottom: -1, display: 'inline-flex', alignItems: 'center', gap: 8,
        }}
      >
        {t.icon && <Icon name={t.icon} size={16} />}
        {t.label}
      </button>
    ))}
  </div>
);

const Toast = ({ msg, kind = 'success' }) => {
  if (!msg) return null;
  const colors = {
    success: { bg: '#1f9d55', icon: 'check' },
    error: { bg: '#dc2626', icon: 'trash' },
    info: { bg: 'var(--navy)', icon: 'bell' },
  };
  const c = colors[kind] || colors.success;
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 1000,
      background: c.bg, color: '#fff', padding: '12px 20px', borderRadius: 10,
      boxShadow: '0 10px 30px rgba(10,38,71,0.2)',
      display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: 14,
      animation: 'slideIn .25s ease-out',
    }}>
      <Icon name={c.icon} size={16} />
      {msg}
    </div>
  );
};

function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, kind = 'success') => {
    setToast({ msg, kind, ts: Date.now() });
    setTimeout(() => setToast((t) => (t && t.ts === toast?.ts ? null : t)), 2500);
  };
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);
  return [toast, show];
}

const Empty = ({ message, icon = 'sheet' }) => (
  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--navy-400)' }}>
    <div style={{ background: 'var(--navy-50)', width: 56, height: 56, borderRadius: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
      <Icon name={icon} size={26} />
    </div>
    <div style={{ fontSize: 14 }}>{message}</div>
  </div>
);

const SheetBadge = () => {
  const d = DataStore.load();
  const time = new Date(d.meta.lastSync).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#0F9D5820', color: '#0F9D58', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
      <Icon name="sheet" size={12} />
      Google Sheets · sync {time}
    </div>
  );
};

const Th = ({ children, style }) => (
  <th style={{
    textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 700,
    color: 'var(--navy-700)', letterSpacing: '.04em', ...style,
  }}>{children}</th>
);
const Td = ({ children, style }) => (
  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--navy)', ...style }}>{children}</td>
);

Object.assign(window, {
  Icon, Logo, Button, Card, StatusBadge, Modal, Field, Input, Select, Tabs, Toast, useToast, Empty, SheetBadge, Th, Td,
});
