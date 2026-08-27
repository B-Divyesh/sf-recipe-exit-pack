const PRODUCT = 'recipe-exit-pack';
const API_BASE = 'https://api.sociobot.in/api/v1';
const TOKEN_KEY = `sb_license:${PRODUCT}`;
const CACHE_KEY = `sb_license_cache:${PRODUCT}`;
const DAY = 86_400_000;

interface VerifyResponse {
  valid: boolean;
  reason: 'ok' | 'invalid' | 'expired' | 'revoked' | 'wrong_product';
  expires_at?: string | null;
}

interface CachedVerdict extends VerifyResponse { checkedAt: number }

export interface LicenseState {
  unlocked: boolean;
  checking: boolean;
  reason?: VerifyResponse['reason'] | 'network';
}

function readCache(): CachedVerdict | null {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') as CachedVerdict | null; }
  catch { return null; }
}

export function storedLicense(): string {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export async function initializeLicense(onChange: (state: LicenseState) => void): Promise<void> {
  const url = new URL(location.href);
  const returned = url.searchParams.get('license');
  if (returned) {
    localStorage.setItem(TOKEN_KEY, returned);
    url.searchParams.delete('license');
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    onChange({ unlocked: true, checking: true });
    await verifyLicense(returned, onChange);
    return;
  }
  const token = storedLicense();
  const cache = readCache();
  if (!token) { onChange({ unlocked: false, checking: false }); return; }
  if (cache?.valid) onChange({ unlocked: true, checking: Date.now() - cache.checkedAt >= DAY });
  else onChange({ unlocked: false, checking: true, reason: cache?.reason });
  if (!cache || Date.now() - cache.checkedAt >= DAY) await verifyLicense(token, onChange);
}

export async function verifyLicense(token: string, onChange: (state: LicenseState) => void): Promise<void> {
  const clean = token.trim();
  if (!clean) { onChange({ unlocked: false, checking: false, reason: 'invalid' }); return; }
  localStorage.setItem(TOKEN_KEY, clean);
  onChange({ unlocked: readCache()?.valid === true, checking: true });
  try {
    const response = await fetch(`${API_BASE}/products/${PRODUCT}/verify?license=${encodeURIComponent(clean)}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Verification returned ${response.status}`);
    const verdict = await response.json() as VerifyResponse;
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...verdict, checkedAt: Date.now() } satisfies CachedVerdict));
    onChange({ unlocked: verdict.valid, checking: false, reason: verdict.reason });
  } catch {
    const cache = readCache();
    onChange({ unlocked: cache?.valid === true, checking: false, reason: 'network' });
  }
}
