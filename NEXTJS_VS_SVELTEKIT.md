# Dokumentace projektu - Next.js vs SvelteKit

## 📁 Struktura projektu

### 1. Konfigurační soubory

#### `package.json`
**Účel:** Definuje závislosti a npm skripty

**Next.js:**
- `dev` - vývojový server (`next dev`)
- `build` - produkční build (`next build`)
- `start` - spuštění produkčního serveru (`next start`)

**SvelteKit ekvivalent:**
- `dev` - vývojový server (`vite dev`)
- `build` - produkční build (`vite build`)
- `preview` - náhled produkčního buildu (`vite preview`)

---

#### `next.config.ts` vs `svelte.config.js`
**Účel:** Konfigurace frameworku

**Next.js (`next.config.ts`):**
```typescript
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
export default withNextIntl(nextConfig);
```
- Konfigurace Next.js + integrace pluginů (např. `next-intl`)
- TypeScript soubor

**SvelteKit (`svelte.config.js`):**
```javascript
import adapter from '@sveltejs/adapter-auto';
export default {
  kit: { adapter: adapter() }
};
```
- Konfigurace SvelteKit + adaptery (Vercel, Node, atd.)
- JavaScript soubor

---

#### `tsconfig.json`
**Účel:** TypeScript konfigurace

**Klíčové nastavení:**
```json
{
  "paths": {
    "@/*": ["./*"]  // Alias pro kořenovou složku
  }
}
```

**Použití:**
- `@/components/UploadModal` = `./components/UploadModal`
- `@/lib/supabase/client` = `./lib/supabase/client`

**SvelteKit ekvivalent:**
- Může používat `$lib` alias (automaticky `src/lib`)
- `$app/*` pro SvelteKit interní moduly

---

#### `proxy.ts` (Next.js 16+) vs `src/hooks.server.ts` (SvelteKit)
**Účel:** Middleware pro request handling

**Next.js (`proxy.ts`):**
```typescript
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)'
};
```
- Zpracovává requesty před routingem
- Používá se pro i18n redirecty, autentizaci, atd.
- **Poznámka:** Next.js 16 používá `proxy.ts` místo `middleware.ts`

**SvelteKit (`src/hooks.server.ts`):**
```typescript
export async function handle({ event, resolve }) {
  // Manipulace s requestem
  return resolve(event);
}
```
- `handle` - zpracování requestů
- `handleFetch` - manipulace s fetch požadavky
- `handleError` - error handling

---

### 2. Routing - App Router

#### `app/[locale]/layout.tsx` vs `src/routes/+layout.svelte`
**Účel:** Root layout pro všechny stránky

**Next.js (`app/[locale]/layout.tsx`):**
```typescript
// Server Component (default - žádný 'use client')
export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params; // Promise v Next.js 15+
  const messages = await getMessages();
  
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

**Klíčové body:**
- ✅ **Server Component** - běží na serveru (default)
- ✅ **Async funkce** - může používat `await` pro data fetching
- ✅ **`params` je Promise** - Next.js 15+ změna
- ✅ **Metadata export** - pro SEO (`export const metadata`)

**SvelteKit (`src/routes/+layout.svelte`):**
```svelte
<!-- Client-side komponenta -->
<script>
  import { page } from '$app/stores';
  // Client-side logika
</script>

<svelte:head>
  <title>My App</title>
</svelte:head>

<slot />
```

**Server-side logika v `+layout.server.ts`:**
```typescript
export async function load({ params }) {
  const locale = params.locale;
  const messages = await loadMessages(locale);
  return { messages };
}
```

**Porovnání:**
| Next.js | SvelteKit |
|---------|-----------|
| Server Component (default) | Client Component (default) |
| `async` funkce přímo v komponentě | Server logika v `.server.ts` |
| `params` je Promise | `params` je synchronní objekt |
| Metadata export | `<svelte:head>` tag |

---

#### `app/[locale]/page.tsx` vs `src/routes/+page.svelte`
**Účel:** Hlavní stránka aplikace

**Next.js (`app/[locale]/page.tsx`):**
```typescript
'use client'; // Explicitní označení client komponenty

export default function Home() {
  const t = useTranslations();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      {/* ... */}
    </div>
  );
}
```

**Klíčové body:**
- `'use client'` - directive pro client komponenty
- React hooks: `useState`, `useEffect`, atd.
- JSX syntax

**SvelteKit (`src/routes/+page.svelte`):**
```svelte
<script>
  import { page } from '$app/stores';
  
  // Svelte 5 s runes
  let isUploadModalOpen = $state(false);
  
  // nebo Svelte 4
  let isUploadModalOpen = false;
</script>

<h1>{$t('dashboard.title')}</h1>
```

**Porovnání state managementu:**

**Next.js (React):**
```typescript
const [count, setCount] = useState(0);
const [data, setData] = useState<string | null>(null);

// Update
setCount(count + 1);
setData('new value');
```

**Svelte 5 (Runes):**
```svelte
<script>
  let count = $state(0);
  let data = $state<string | null>(null);
</script>

<!-- Update - automatická reaktivita -->
<button onclick={() => count++}>+</button>
```

**Svelte 4 (Reactivity):**
```svelte
<script>
  let count = 0;
  let data = null;
  
  // Reaktivní přiřazení
  $: doubled = count * 2;
</script>
```

---

### 3. API Routes

#### `app/api/invoices/upload/route.ts` vs `src/routes/api/invoices/upload/+server.ts`
**Účel:** API endpoint pro upload faktur

**Next.js (`app/api/invoices/upload/route.ts`):**
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validace, zpracování...
  
  return NextResponse.json({ success: true });
}

export const maxDuration = 300; // Timeout konfigurace
export const runtime = 'nodejs'; // Runtime konfigurace
```

**Klíčové body:**
- Exportované funkce: `GET`, `POST`, `PUT`, `DELETE`, atd.
- `NextRequest` / `NextResponse` typy
- `maxDuration` - timeout konfigurace
- `runtime` - 'nodejs' nebo 'edge'

**SvelteKit (`src/routes/api/invoices/upload/+server.ts`):**
```typescript
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  const body = await request.json();
  
  // Validace, zpracování...
  
  return json({ success: true });
}
```

**Porovnání:**
| Next.js | SvelteKit |
|---------|-----------|
| `NextRequest` / `NextResponse` | `RequestEvent` s `request`, `cookies`, `locals` |
| `NextResponse.json()` | `json()` helper |
| `export const maxDuration` | Timeout v konfiguraci |
| `route.ts` soubor | `+server.ts` soubor |

---

### 4. Komponenty

#### `components/UploadModal.tsx` vs `src/lib/components/UploadModal.svelte`
**Účel:** Modal komponenta pro upload faktur

**Next.js (`components/UploadModal.tsx`):**
```typescript
'use client';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export default function UploadModal({ 
  isOpen, 
  onClose, 
  onUploadSuccess 
}: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal">
      <button onClick={onClose}>Close</button>
      {/* ... */}
    </div>
  );
}
```

**Klíčové body:**
- `'use client'` directive
- Props jako TypeScript interface
- JSX syntax
- Conditional rendering: `{isOpen && <div>}` nebo `{isOpen ? <div> : null}`

**SvelteKit (`src/lib/components/UploadModal.svelte`):**
```svelte
<script lang="ts">
  interface Props {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: () => void;
  }
  
  let { isOpen, onClose, onUploadSuccess }: Props = $props();
  let file = $state<File | null>(null);
</script>

{#if isOpen}
  <div class="modal">
    <button onclick={onClose}>Close</button>
    <!-- ... -->
  </div>
{/if}
```

**Porovnání:**

**Props:**
```typescript
// Next.js
interface Props {
  value: string;
  onChange: (value: string) => void;
}
export default function Input({ value, onChange }: Props) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />;
}
```

```svelte
<!-- Svelte 5 -->
<script lang="ts">
  interface Props {
    value: string;
    onChange: (value: string) => void;
  }
  let { value, onChange }: Props = $props();
</script>
<input value={value} oninput={(e) => onChange(e.target.value)} />
```

**Conditional Rendering:**
```typescript
// Next.js
{isOpen && <Modal />}
{isOpen ? <Modal /> : <Fallback />}
```

```svelte
<!-- Svelte -->
{#if isOpen}
  <Modal />
{/if}

{#if isOpen}
  <Modal />
{:else}
  <Fallback />
{/if}
```

**Events:**
```typescript
// Next.js
<button onClick={() => handleClick()}>Click</button>
<input onChange={(e) => handleChange(e.target.value)} />
```

```svelte
<!-- Svelte -->
<button onclick={() => handleClick()}>Click</button>
<input oninput={(e) => handleChange(e.target.value)} />
```

---

#### `components/TrackingNumberSearch.tsx` - State & Effects
**Účel:** Search input s hydration fix

**Next.js:**
```typescript
'use client';

export default function TrackingNumberSearch({ value, onChange }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    setInputValue(value);
  }, [value]);
  
  return (
    <input
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder={mounted ? t('placeholder') : ''}
      suppressHydrationWarning
    />
  );
}
```

**Klíčové body:**
- `useState` pro lokální state
- `useEffect` pro side effects a synchronizaci
- `suppressHydrationWarning` pro ignorování hydration warnings

**SvelteKit ekvivalent:**
```svelte
<script>
  let { value, onChange } = $props();
  let inputValue = $state('');
  
  // Automatická synchronizace
  $effect(() => {
    inputValue = value;
  });
</script>

<input 
  value={inputValue} 
  oninput={(e) => {
    inputValue = e.target.value;
    onChange(inputValue);
  }}
  placeholder={$t('placeholder')}
/>
```

**Porovnání Effects:**

**Next.js:**
```typescript
// Spustí se po každém renderu
useEffect(() => {
  console.log('Effect ran');
});

// Spustí se pouze při mount
useEffect(() => {
  console.log('Mounted');
}, []);

// Spustí se při změně dependency
useEffect(() => {
  fetchData(id);
}, [id]);

// Cleanup
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer);
}, []);
```

**Svelte 5:**
```svelte
<script>
  // Spustí se po každé změně
  $effect(() => {
    console.log('Effect ran');
  });
  
  // Spustí se pouze při mount
  $effect.pre(() => {
    console.log('Before render');
  });
  
  // Spustí se při změně dependency
  $effect(() => {
    fetchData(id);
  });
  
  // Cleanup
  $effect(() => {
    const timer = setInterval(() => {}, 1000);
    return () => clearInterval(timer);
  });
</script>
```

---

### 5. i18n (Internationalization)

#### `i18n/routing.ts`
**Účel:** Konfigurace i18n routingu

```typescript
export const routing = defineRouting({
  locales: ['en', 'cs'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // 'en' bez prefixu, 'cs' s prefixem
  localeDetection: false // Vypnout auto-detekci
});
```

**SvelteKit ekvivalent:**
- Vlastní implementace v `src/i18n/` nebo použití `svelte-i18n`

---

#### `i18n/request.ts`
**Účel:** Načítání zpráv pro aktuální locale

```typescript
export default getRequestConfig(async ({requestLocale}) => {
  const locale = hasLocale(routing.locales, requested) 
    ? requested 
    : routing.defaultLocale;
    
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
```

**SvelteKit ekvivalent:**
```typescript
// src/i18n/index.ts
export async function loadMessages(locale: string) {
  return (await import(`../messages/${locale}.json`)).default;
}
```

---

#### `i18n/navigation.ts`
**Účel:** Wrappery pro Next.js navigaci s i18n podporou

```typescript
export const {Link, redirect, usePathname, useRouter} = 
  createNavigation(routing);
```

**Použití:**
```typescript
import { Link, useRouter } from '@/i18n/navigation';

<Link href="/dashboard">Dashboard</Link>
router.push('/dashboard', { locale: 'cs' });
```

**SvelteKit ekvivalent:**
```typescript
import { goto } from '$app/navigation';
import { page } from '$app/stores';

goto(`/${locale}/dashboard`);
```

---

#### Použití v komponentách

**Next.js:**
```typescript
'use client';
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations();
  return <h1>{t('dashboard.title')}</h1>;
}
```

**SvelteKit:**
```svelte
<script>
  import { t } from '$lib/i18n';
</script>

<h1>{$t('dashboard.title')}</h1>
```

---

### 6. Database & Supabase

#### `lib/supabase/client.ts` vs `src/lib/supabase/client.ts`
**Účel:** Client-side Supabase klient

**Next.js:**
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

**SvelteKit:**
```typescript
import { createClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';

export const supabase = browser 
  ? createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    )
  : null;
```

---

#### `lib/supabase/server.ts` vs `src/lib/supabase/server.ts`
**Účel:** Server-side Supabase klient (s admin právy)

**Next.js:**
```typescript
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Admin key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

**SvelteKit:**
```typescript
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);
```

---

### 7. Styling

#### `app/[locale]/globals.css` vs `src/app.css`
**Účel:** Globální CSS styly

**Next.js:**
- Importován v `layout.tsx`: `import './globals.css'`
- Tailwind directives: `@tailwind base; @tailwind components; @tailwind utilities;`

**SvelteKit:**
- Importován v `app.html` nebo root `+layout.svelte`
- Stejné Tailwind directives

---

## 📊 Přehledná tabulka rozdílů

| Koncept | Next.js (React) | SvelteKit (Svelte 5) |
|---------|----------------|---------------------|
| **Server Components** | Default (bez `'use client'`) | `.server.ts` soubory |
| **Client Components** | `'use client'` directive | Default (`.svelte`) |
| **State** | `useState()` hook | `$state()` rune |
| **Derived State** | `useMemo()` hook | `$derived()` rune |
| **Effects** | `useEffect()` hook | `$effect()` rune |
| **Props** | `interface Props` + destructuring | `let { prop } = $props()` |
| **Conditional** | `{condition && <div>}` | `{#if condition}...{/if}` |
| **Loops** | `{items.map(item => <div key={id}>{item}</div>)}` | `{#each items as item (item.id)}<div>{item}</div>{/each}` |
| **Events** | `onClick={() => {}}` | `onclick={() => {}}` |
| **API Routes** | `route.ts` s `export function POST` | `+server.ts` s `export function POST` |
| **Routing** | File-based v `app/` | File-based v `src/routes/` |
| **Params** | `Promise<{id: string}>` (Next.js 15+) | `{id: string}` (synchronní) |
| **Async Data** | `async` komponenty | `+page.server.ts` nebo `+page.ts` |
| **Environment Variables** | `process.env.NEXT_PUBLIC_*` | `import.meta.env.VITE_*` (client) / `$env/static/private` (server) |
| **Metadata** | `export const metadata` | `<svelte:head>` tag |

---

## 🔄 Praktické příklady převodu

### 1. State Management

**Next.js:**
```typescript
const [count, setCount] = useState(0);
const [name, setName] = useState('');
const [items, setItems] = useState<string[]>([]);

<button onClick={() => setCount(count + 1)}>+</button>
<input value={name} onChange={(e) => setName(e.target.value)} />
```

**Svelte 5:**
```svelte
<script>
  let count = $state(0);
  let name = $state('');
  let items = $state<string[]>([]);
</script>

<button onclick={() => count++}>+</button>
<input value={name} oninput={(e) => name = e.target.value} />
```

---

### 2. Derived State

**Next.js:**
```typescript
const doubled = useMemo(() => count * 2, [count]);
const filtered = useMemo(() => 
  items.filter(item => item.includes(search)), 
  [items, search]
);
```

**Svelte 5:**
```svelte
<script>
  let count = $state(0);
  let search = $state('');
  let items = $state<string[]>([]);
  
  let doubled = $derived(count * 2);
  let filtered = $derived(items.filter(item => item.includes(search)));
</script>
```

---

### 3. Async Data Fetching

**Next.js (Server Component):**
```typescript
// app/page.tsx (Server Component)
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  const json = await data.json();
  
  return <div>{json.title}</div>;
}
```

**SvelteKit:**
```svelte
<!-- +page.svelte -->
<script>
  let { data } = $props();
</script>

<div>{data.title}</div>
```

```typescript
// +page.ts nebo +page.server.ts
export async function load() {
  const response = await fetch('https://api.example.com/data');
  const json = await response.json();
  return { data: json };
}
```

---

### 4. Form Handling

**Next.js:**
```typescript
const [email, setEmail] = useState('');

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // Submit logic
};

<form onSubmit={handleSubmit}>
  <input 
    value={email} 
    onChange={(e) => setEmail(e.target.value)} 
  />
  <button type="submit">Submit</button>
</form>
```

**Svelte 5:**
```svelte
<script>
  let email = $state('');
  
  function handleSubmit() {
    // Submit logic
  }
</script>

<form onsubmit={handleSubmit}>
  <input bind:value={email} />
  <button type="submit">Submit</button>
</form>
```

---

## 🎯 Klíčové rozdíly pro migraci

### 1. **Server vs Client**
- **Next.js:** Server Components jsou default, explicitní `'use client'` pro client
- **SvelteKit:** Client Components jsou default, server logika v `.server.ts`

### 2. **State Management**
- **Next.js:** Hooks pattern (`useState`, `useEffect`)
- **Svelte 5:** Runes (`$state`, `$derived`, `$effect`)

### 3. **Reaktivita**
- **Next.js:** Explicitní `setState` calls
- **Svelte:** Automatická reaktivita při změně hodnot

### 4. **Template Syntax**
- **Next.js:** JSX (JavaScript v HTML)
- **Svelte:** Template syntax (`{#if}`, `{#each}`, `{@html}`)

### 5. **Routing**
- **Next.js:** `app/[locale]/page.tsx` s `params` jako Promise
- **SvelteKit:** `src/routes/[locale]/+page.svelte` s `params` jako objekt

---

## 📝 Závěr

Tento dokument popisuje strukturu Next.js projektu s porovnáním se SvelteKit. Hlavní rozdíly jsou v:
- **Paradigmatu:** React hooks vs Svelte runes
- **Server/Client split:** Next.js Server Components vs SvelteKit server files
- **Syntaxi:** JSX vs Svelte template syntax
- **Reaktivitě:** Explicitní vs automatická

Pro rychlou orientaci použijte tabulku rozdílů a praktické příklady převodu.

