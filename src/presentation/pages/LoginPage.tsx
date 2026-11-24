import { useState } from 'react';

export function LoginPage({ onLogin }: { onLogin: (password: string) => Promise<boolean> }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <div className="login">
      <form className="login-card" onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const ok = await onLogin(pw);
        setBusy(false);
        setError(!ok);
      }}>
        <h1>Oposición 2027</h1>
        <p className="muted">Servicios a la Comunidad · Madrid</p>
        <label className="field"><span>Contraseña</span>
          <input type="password" value={pw} autoFocus autoComplete="current-password" onChange={(e) => { setPw(e.target.value); setError(false); }} />
        </label>
        {error && <p className="error">Contraseña incorrecta.</p>}
        <button className="btn primary block" type="submit" disabled={busy || !pw}>Entrar</button>
      </form>
    </div>
  );
}
