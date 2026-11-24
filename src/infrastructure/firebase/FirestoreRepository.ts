// Datos en Cloud Firestore: un documento por usuaria (users/{uid}/data/app).
// Se sincroniza entre aparatos en tiempo real y funciona sin conexión.
import type { Auth } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, type Firestore } from 'firebase/firestore';
import type { DataRepository } from '../../application/ports';
import { validarAppData } from '../../application/useCases';
import type { AppData } from '../../domain/entities';

const SAVE_DELAY_MS = 800;

export class FirestoreRepository implements DataRepository {
  private readonly db: Firestore;
  private readonly auth: Auth;
  /** Datos que había en este navegador antes de usar la nube: se suben la primera vez. */
  private readonly legacy?: DataRepository;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pending: AppData | null = null;
  private lastWritten = '';

  constructor(db: Firestore, auth: Auth, legacy?: DataRepository) {
    this.db = db;
    this.auth = auth;
    this.legacy = legacy;
  }

  private ref() {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('Sin sesión');
    return doc(this.db, 'users', uid, 'data', 'app');
  }

  async load(): Promise<AppData | null> {
    const snap = await getDoc(this.ref());
    const remote = snap.exists() ? (snap.data().json as string | undefined) : undefined;
    if (remote) {
      const parsed: unknown = JSON.parse(remote);
      if (validarAppData(parsed)) {
        this.lastWritten = remote;
        return parsed;
      }
    }
    const local = (await this.legacy?.load()) ?? null;
    if (local) await this.write(local);
    return local;
  }

  save(data: AppData): Promise<void> {
    this.pending = data;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const d = this.pending;
      this.pending = null;
      this.timer = null;
      if (d) void this.write(d);
    }, SAVE_DELAY_MS);
    return Promise.resolve();
  }

  private async write(data: AppData): Promise<void> {
    const json = JSON.stringify(data);
    if (json === this.lastWritten) return;
    this.lastWritten = json;
    // Se guarda como texto JSON para conservar la estructura exacta (listas anidadas, campos vacíos).
    await setDoc(this.ref(), { json, updatedAt: new Date().toISOString() });
  }

  subscribe(onRemoteChange: (data: AppData) => void): () => void {
    return onSnapshot(this.ref(), (snap) => {
      if (snap.metadata.hasPendingWrites || !snap.exists()) return;
      const json = snap.data().json as string | undefined;
      if (!json || json === this.lastWritten || this.pending) return;
      const parsed: unknown = JSON.parse(json);
      if (validarAppData(parsed)) {
        this.lastWritten = json;
        onRemoteChange(parsed);
      }
    });
  }
}
