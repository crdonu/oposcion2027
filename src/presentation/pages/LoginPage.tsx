import { useState } from 'react';
import type { Credentials } from '../../application/ports';

export function LoginPage({ needsEmail, onLogin }: { needsEmail: boolean; onLogin: (c: Credentials) => Promise<boolean> }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <div className="login">
      <form className="login-card" onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const ok = await onLogin({ email, password: pw });
        setBusy(false);
        setError(!ok);
      }}>
        <h1>Oposición 2027</h1>
        <p className="muted">Servicios a la Comunidad · Madrid</p>
        {needsEmail && (
          <label className="field"><span>Correo</span>
            <input type="email" value={email} autoFocus autoComplete="username" onChange={(e) => { setEmail(e.target.value); setError(false); }} />
          </label>
        )}
        <label className="field"><span>Contraseña</span>
          <input type="password" value={pw} autoFocus={!needsEmail} autoComplete="current-password" onChange={(e) => { setPw(e.target.value); setError(false); }} />
        </label>
        {error && <p className="error">{needsEmail ? 'Correo o contraseña incorrectos.' : 'Contraseña incorrecta.'}</p>}
        <button className="btn primary block" type="submit" disabled={busy || !pw || (needsEmail && !email)}>Entrar</button>
      </form>
    </div>
  );
}
