# Delivro Dashboard - Kompletní Dokumentace

## 📋 Obsah
1. [Úvod](#úvod)
2. [Technologie a závislosti](#technologie-a-závislosti)
3. [Struktura projektu](#struktura-projektu)
4. [Komponenty](#komponenty)
5. [API Routes](#api-routes)
6. [Databázová struktura](#databázová-struktura)
7. [Mezinárodní lokalizace (i18n)](#mezinárodní-lokalizace-i18n)
8. [Instalace a spuštění](#instalace-a-spuštění)
9. [Jak aplikace funguje](#jak-aplikace-funguje)
10. [Návaznosti mezi komponentami](#návaznosti-mezi-komponentami)
11. [Klíčové koncepty Reactu a Next.js](#klíčové-koncepty-reactu-a-nextjs)

---

## Úvod

**Delivro Dashboard** je webová aplikace pro správu faktur a zásilek. Umožňuje nahrávání fakturních dat z JSON souborů, jejich zobrazení v přehledném dashboardu a filtrování podle různých kritérií.

### Hlavní funkce:
- 📤 **Upload faktur** - Nahrání JSON souborů s fakturními daty
- 👁️ **Preview dat** - Náhled dat v tabulce před potvrzením uploadu
- 📊 **Dashboard zásilek** - Zobrazení všech zásilek s nejnovějšími fakturními údaji
- 🔍 **Filtrování** - Filtrování zásilek podle společnosti a tracking čísla
- 📈 **Historie cen** - Zobrazení historie cen pro každou zásilku
- 🌐 **Mezinárodní lokalizace** - Podpora angličtiny a češtiny
- 📄 **Paginace** - Efektivní zobrazení velkého množství dat

---

## Technologie a závislosti

### Frontend Framework
- **Next.js 16** - React framework s App Router
  - Server-side rendering (SSR)
  - API Routes pro backend logiku
  - Automatické code splitting
  - Optimalizace obrázků

- **React 19** - UI knihovna
  - Komponenty pro stavování UI
  - Hooks pro správu stavu (`useState`, `useEffect`, `useCallback`)
  - Client Components vs Server Components

### Styling
- **Tailwind CSS 4** - Utility-first CSS framework
  - Rychlé stylování pomocí tříd
  - Responzivní design
  - Dark mode ready

### Databáze
- **Supabase** - Backend-as-a-Service
  - PostgreSQL databáze
  - REST API
  - Realtime subscriptions (nepoužívá se v tomto projektu)

### Další knihovny
- **@tanstack/react-table** - Tabulky s pokročilými funkcemi
  - Řazení, filtrování, paginace
  - Type-safe API

- **next-intl** - Mezinárodní lokalizace
  - Podpora více jazyků
  - Routing s locale prefixy

- **lucide-react** - Ikony
  - SVG ikony jako React komponenty

- **TypeScript** - Typovaný JavaScript
  - Type safety
  - Lepší vývojářská zkušenost

---

## Struktura projektu

```
delivro-task_jiri_mika/
│
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Dynamický segment pro jazyky (en, cs)
│   │   ├── layout.tsx           # Root layout s i18n providerem
│   │   ├── page.tsx             # Hlavní stránka (dashboard)
│   │   └── globals.css          # Globální CSS styly
│   │
│   ├── api/                      # API Routes (backend endpoints)
│   │   ├── companies/
│   │   │   └── route.ts         # GET /api/companies
│   │   ├── invoices/
│   │   │   └── upload/
│   │   │       └── route.ts     # POST /api/invoices/upload
│   │   └── shipments/
│   │       ├── route.ts         # GET /api/shipments
│   │       └── [id]/
│   │           └── history/
│   │               └── route.ts # GET /api/shipments/[id]/history
│   │
│   └── favicon.ico              # Favicon
│
├── components/                   # React komponenty
│   ├── CompanyFilter.tsx        # Dropdown pro výběr společnosti
│   ├── LanguageSwitcher.tsx     # Přepínač jazyků
│   ├── PreviewTable.tsx         # Tabulka pro náhled dat před uploadem
│   ├── PriceHistoryModal.tsx    # Modal s historií cen zásilky
│   ├── ShipmentsTable.tsx       # Hlavní tabulka zásilek
│   ├── TrackingNumberSearch.tsx # Vyhledávání podle tracking čísla
│   └── UploadModal.tsx          # Modal pro upload souborů
│
├── i18n/                         # Konfigurace internacionalizace
│   ├── navigation.ts            # next-intl navigation utilities
│   ├── request.ts               # Konfigurace pro načítání zpráv
│   └── routing.ts               # Routing konfigurace (locales, default locale)
│
├── lib/                          # Utility funkce a konfigurace
│   ├── i18n.ts                  # (nepoužívá se, může být smazáno)
│   └── supabase/
│       ├── client.ts            # Supabase klient pro client-side
│       └── server.ts            # Supabase admin klient pro server-side
│
├── messages/                     # Překladové soubory
│   ├── en.json                  # Anglické překlady
│   └── cs.json                  # České překlady
│
├── public/                       # Statické soubory
│   └── assets/                  # SVG loga dopravců
│       ├── dpd.svg
│       ├── fedex.svg
│       ├── gls.svg
│       ├── ppl.svg
│       └── ups.svg
│
├── supabase/                     # Supabase migrace
│   └── migrations/
│       └── 001_initial_schema.sql # SQL migrace pro vytvoření tabulek
│
├── types/                        # TypeScript typy
│   └── database.ts              # Typy pro databázové entity
│
├── data/                         # Testovací data
│   ├── invoices_1.json
│   ├── invoices_2.json
│   ├── invoices_3.json
│   └── invoices_4.json
│
├── proxy.ts                      # Next.js middleware (proxy) pro i18n routing
├── next.config.ts               # Next.js konfigurace
├── tsconfig.json                # TypeScript konfigurace
├── package.json                 # NPM závislosti a skripty
└── README.md                    # Tento soubor
```

### Vysvětlení klíčových složek:

#### `app/` - Next.js App Router
- **App Router** je nový routing systém v Next.js 13+
- Každý soubor v `app/` reprezentuje route
- `[locale]` je dynamický segment - umožňuje URL jako `/en/dashboard` nebo `/cs/dashboard`
- `layout.tsx` definuje layout pro všechny stránky v daném segmentu
- `page.tsx` je samotná stránka

#### `app/api/` - API Routes
- Každý soubor `route.ts` v `app/api/` vytváří API endpoint
- Např. `app/api/companies/route.ts` → `/api/companies`
- Tyto soubory běží na serveru (server-side)

#### `components/` - React komponenty
- Všechny komponenty jsou **Client Components** (`'use client'`)
- Client Components běží v prohlížeči a mohou používat React hooks
- Server Components (bez `'use client'`) běží na serveru a nemohou používat hooks

#### `lib/` - Utility funkce
- `lib/supabase/client.ts` - Supabase klient pro client-side operace
- `lib/supabase/server.ts` - Supabase admin klient pro server-side operace (má více práv)

---

## Komponenty

### 1. `app/[locale]/page.tsx` - Hlavní stránka (Dashboard)

**Typ:** Client Component  
**Účel:** Hlavní stránka aplikace, která zobrazuje dashboard se zásilkami

**Klíčové funkce:**
- Spravuje stav modalu pro upload (`isUploadModalOpen`)
- Spravuje vybranou společnost (`selectedCompanyId`)
- Spravuje tracking číslo pro vyhledávání (`trackingNumber`)
- Spravuje refresh klíč pro aktualizaci tabulky po uploadu (`refreshKey`)

**Stav komponenty:**
```typescript
const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
const [trackingNumber, setTrackingNumber] = useState<string>('');
const [refreshKey, setRefreshKey] = useState(0);
```

**Důležité:**
- Používá `useTranslations()` pro překlady
- Předává props do child komponent
- `refreshKey` se mění po úspěšném uploadu, což způsobí re-render `ShipmentsTable`

---

### 2. `components/UploadModal.tsx` - Modal pro upload faktur

**Typ:** Client Component  
**Účel:** Modal okno pro nahrání JSON souboru s fakturními daty

**Klíčové funkce:**
1. **Výběr souboru** - Uživatel vybere JSON soubor
2. **Validace** - Kontrola formátu, velikosti a struktury dat
3. **Preview** - Zobrazení dat v tabulce před uploadem
4. **Upload** - Odeslání dat na server přes API

**Stav komponenty:**
```typescript
const [file, setFile] = useState<File | null>(null);
const [previewData, setPreviewData] = useState<InvoiceInput[]>([]);
const [isUploading, setIsUploading] = useState(false);
const [uploadProgress, setUploadProgress] = useState<string>('');
const [error, setError] = useState<string | null>(null);
```

**Flow uploadu:**
1. Uživatel vybere soubor → `handleFileSelect()`
2. Validace JSON formátu a struktury
3. Zobrazení preview v `PreviewTable`
4. Uživatel klikne "Potvrdit upload" → `handleUpload()`
5. Odeslání na `/api/invoices/upload`
6. Po úspěchu → `onUploadSuccess()` → zavření modalu

**Validace:**
- Soubor musí být `.json`
- Maximální velikost: 50MB
- Data musí být pole objektů
- Každá faktura musí mít všechny povinné pole
- Provider musí být: GLS, DPD, UPS, PPL, FedEx
- Mode musí být: EXPORT nebo IMPORT

---

### 3. `components/PreviewTable.tsx` - Tabulka náhledu

**Typ:** Client Component  
**Účel:** Zobrazení náhledu fakturních dat před uploadem

**Klíčové funkce:**
- Používá TanStack Table pro zobrazení dat
- Paginace (10 záznamů na stránku)
- Formátování čísel podle locale

**Sloupce:**
- Tracking Number
- Company (Společnost)
- Provider (Dopravce)
- Weight (Váha v kg)
- Price (Cena v CZK)

---

### 4. `components/ShipmentsTable.tsx` - Hlavní tabulka zásilek

**Typ:** Client Component  
**Účel:** Zobrazení všech zásilek s možností filtrování a paginace

**Klíčové funkce:**
1. **Načítání dat** - Fetch z `/api/shipments` s parametry filtru
2. **Filtrování** - Podle `companyId` a `trackingNumber` (props)
3. **Paginace** - Server-side paginace (50 záznamů na stránku)
4. **Historie cen** - Otevření modalu s historií při kliknutí na tlačítko

**Stav komponenty:**
```typescript
const [data, setData] = useState<ShipmentWithLatestInvoice[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [pagination, setPagination] = useState({...});
const [selectedShipment, setSelectedShipment] = useState<{...} | null>(null);
```

**Sloupce tabulky:**
- Tracking Number (monospace font)
- Company (název společnosti)
- Provider (barevný badge: GLS=žlutý, DPD=červený, UPS=oranžový, PPL=modrý, FedEx=fialový)
- Mode (EXPORT=zelený, IMPORT=oranžový)
- Country (origin → destination)
- Weight (z nejnovější faktury)
- Price (z nejnovější faktury, formátováno podle locale)
- Actions (tlačítko "Historie")

**Důležité:**
- Používá `useCallback` pro `fetchShipments` aby se nevolala zbytečně
- `useEffect` volá `fetchShipments` při změně `companyId` nebo `trackingNumber`
- Zobrazuje SVG loga dopravců nad tabulkou

---

### 5. `components/CompanyFilter.tsx` - Filtrování podle společnosti

**Typ:** Client Component  
**Účel:** Dropdown pro výběr společnosti pro filtrování zásilek

**Klíčové funkce:**
1. Načítá seznam společností z `/api/companies`
2. Zobrazuje dropdown s možností "Všechny společnosti"
3. Při výběru volá `onCompanyChange` callback

**Stav komponenty:**
```typescript
const [companies, setCompanies] = useState<Company[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [isOpen, setIsOpen] = useState(false);
```

**UX:**
- Kliknutí mimo dropdown ho zavře
- Zvýraznění vybrané společnosti
- Loading stav při načítání

---

### 6. `components/TrackingNumberSearch.tsx` - Vyhledávání podle tracking čísla

**Typ:** Client Component  
**Účel:** Input pole pro vyhledávání zásilek podle tracking čísla

**Klíčové funkce:**
- Text input s ikonou vyhledávání
- Tlačítko pro vymazání (X)
- Odeslání formuláře volá `onChange` callback

**Důležité:**
- Používá `mounted` state pro řešení hydration error
- `suppressHydrationWarning` na input elementu
- Placeholder se zobrazí až po mount (client-side)

---

### 7. `components/PriceHistoryModal.tsx` - Modal s historií cen

**Typ:** Client Component  
**Účel:** Zobrazení historie všech faktur pro konkrétní zásilku

**Klíčové funkce:**
1. Načítá historii z `/api/shipments/[id]/history`
2. Zobrazuje tabulku s datem, váhou a cenou
3. Seřazeno od nejnovější po nejstarší

**Stav komponenty:**
```typescript
const [invoices, setInvoices] = useState<InvoiceHistory[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Flow:**
- Otevře se při kliknutí na "Historie" v `ShipmentsTable`
- `useEffect` načte data při otevření (`isOpen === true`)
- Zobrazí loading, error nebo data

---

### 8. `components/LanguageSwitcher.tsx` - Přepínač jazyků

**Typ:** Client Component  
**Účel:** Tlačítko pro přepínání mezi angličtinou a češtinou

**Klíčové funkce:**
- Zobrazuje aktuální jazyk (EN/CS)
- Při kliknutí přepne na druhý jazyk
- Používá `next-intl` router pro změnu URL

**Důležité:**
- Používá `useRouter` a `usePathname` z `@/i18n/navigation`
- Automaticky přidá/odebere locale prefix v URL

---

## API Routes

### 1. `POST /api/invoices/upload` - Upload faktur

**Soubor:** `app/api/invoices/upload/route.ts`  
**Účel:** Zpracování a uložení fakturních dat do databáze

**Request:**
```typescript
POST /api/invoices/upload
Content-Type: application/json

[
  {
    "id": "invoice_id",
    "shipment": {
      "id": "shipment_id",
      "createdAt": "2025-10-30T04:01:45.903Z",
      "trackingNumber": "208669628341",
      "company": {
        "id": "company_id",
        "name": "Company Name"
      },
      "provider": "GLS",
      "mode": "EXPORT",
      "originCountry": "CZ",
      "destinationCountry": "GP"
    },
    "invoicedWeight": 9.9,
    "invoicedPrice": 302
  }
]
```

**Response:**
```typescript
{
  "success": true,
  "statistics": {
    "totalProcessed": 100,
    "newCompanies": 5,
    "newShipments": 50,
    "updatedShipments": 30,
    "newInvoices": 100
  }
}
```

**Proces:**
1. **Validace** - Kontrola struktury každé faktury
2. **Deduplikace** - Použití `Map` pro odstranění duplicit podle ID
   - `companiesMap` - unikátní společnosti
   - `shipmentsMap` - unikátní zásilky
   - `invoicesMap` - unikátní faktury
3. **Upsert společností** - Vložení nebo aktualizace společností
4. **Upsert zásilek** - Vložení nebo aktualizace zásilek
5. **Insert faktur** - Vložení pouze nových faktur (ne upsert!)

**Důležité:**
- Používá `supabaseAdmin` (service role key) pro plná práva
- Faktury se **nikdy neaktualizují**, pouze se vkládají nové (historie)
- Zásilky se aktualizují (upsert) - může se změnit tracking number, provider, atd.
- Timeout: 300 sekund (pro velké uploady)

---

### 2. `GET /api/shipments` - Seznam zásilek

**Soubor:** `app/api/shipments/route.ts`  
**Účel:** Získání seznamu zásilek s nejnovějšími fakturními údaji

**Query Parameters:**
- `company_id` (optional) - Filtrování podle společnosti
- `tracking_number` (optional) - Filtrování podle tracking čísla (LIKE search)
- `page` (optional, default: 1) - Číslo stránky
- `limit` (optional, default: 50) - Počet záznamů na stránku

**Response:**
```typescript
{
  "data": [
    {
      "id": "shipment_id",
      "tracking_number": "208669628341",
      "company": {
        "id": "company_id",
        "name": "Company Name"
      },
      "provider": "GLS",
      "mode": "EXPORT",
      "origin_country": "CZ",
      "destination_country": "GP",
      "latest_invoice": {
        "invoiced_weight": 9.9,
        "invoiced_price": 302,
        "created_at": "2025-10-30T04:01:45.903Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

**Proces:**
1. Sestavení query s filtry
2. Získání celkového počtu (pro paginaci)
3. Aplikace paginace (offset, limit)
4. Získání nejnovější faktury pro každou zásilku
5. Kombinace zásilek s jejich nejnovější fakturou

**Důležité:**
- Používá JOIN s tabulkou `companies`
- Nejnovější faktura se získává separátním dotazem a mapuje se k zásilkám
- Seřazeno podle `updated_at` (nejnovější první)

---

### 3. `GET /api/shipments/[id]/history` - Historie cen zásilky

**Soubor:** `app/api/shipments/[id]/history/route.ts`  
**Účel:** Získání všech faktur pro konkrétní zásilku

**URL Parameter:**
- `id` - ID zásilky

**Response:**
```typescript
{
  "shipment_id": "shipment_id",
  "invoices": [
    {
      "id": "invoice_id",
      "shipment_id": "shipment_id",
      "invoiced_weight": 9.9,
      "invoiced_price": 302,
      "created_at": "2025-10-30T04:01:45.903Z"
    }
  ]
}
```

**Proces:**
1. Ověření existence zásilky
2. Získání všech faktur pro zásilku
3. Seřazení od nejnovější po nejstarší

---

### 4. `GET /api/companies` - Seznam společností

**Soubor:** `app/api/companies/route.ts`  
**Účel:** Získání seznamu všech společností

**Response:**
```typescript
{
  "data": [
    {
      "id": "company_id",
      "name": "Company Name",
      "created_at": "2025-10-30T04:01:45.903Z"
    }
  ]
}
```

**Proces:**
- Jednoduchý SELECT z tabulky `companies`
- Seřazeno podle názvu (A-Z)

---

## Databázová struktura

### Tabulka: `companies`
```sql
CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Účel:** Ukládá informace o společnostech (zákaznících)

**Pole:**
- `id` - Unikátní identifikátor společnosti
- `name` - Název společnosti
- `created_at` - Datum vytvoření záznamu

---

### Tabulka: `shipments`
```sql
CREATE TABLE shipments (
  id TEXT PRIMARY KEY,
  tracking_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  company_id TEXT NOT NULL REFERENCES companies(id),
  provider TEXT NOT NULL CHECK (provider IN ('GLS', 'DPD', 'UPS', 'PPL', 'FedEx')),
  mode TEXT NOT NULL CHECK (mode IN ('EXPORT', 'IMPORT')),
  origin_country TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Účel:** Ukládá informace o zásilkách

**Pole:**
- `id` - Unikátní identifikátor zásilky
- `tracking_number` - Tracking číslo zásilky
- `created_at` - Datum vytvoření zásilky
- `company_id` - Reference na společnost (foreign key)
- `provider` - Dopravce (GLS, DPD, UPS, PPL, FedEx)
- `mode` - Režim zásilky (EXPORT, IMPORT)
- `origin_country` - Země původu
- `destination_country` - Země určení
- `updated_at` - Datum poslední aktualizace

**Vztahy:**
- `company_id` → `companies.id` (many-to-one)

---

### Tabulka: `invoices`
```sql
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  shipment_id TEXT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  invoiced_weight DECIMAL(10, 2) NOT NULL,
  invoiced_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Účel:** Ukládá fakturní údaje (historie cen a vah)

**Pole:**
- `id` - Unikátní identifikátor faktury
- `shipment_id` - Reference na zásilku (foreign key)
- `invoiced_weight` - Fakturovaná váha (kg)
- `invoiced_price` - Fakturovaná cena (CZK)
- `created_at` - Datum vytvoření faktury

**Vztahy:**
- `shipment_id` → `shipments.id` (many-to-one)
- `ON DELETE CASCADE` - Při smazání zásilky se smažou i faktury

**Důležité:**
- Každá faktura se ukládá jako nový záznam (historie)
- Faktury se **nikdy neaktualizují**, pouze se vkládají nové
- Dashboard zobrazuje pouze nejnovější fakturu pro každou zásilku

---

## Mezinárodní lokalizace (i18n)

### Konfigurace

**Soubor:** `i18n/routing.ts`
```typescript
export const routing = defineRouting({
  locales: ['en', 'cs'],           // Podporované jazyky
  defaultLocale: 'en',              // Výchozí jazyk
  localePrefix: 'as-needed',        // EN bez prefixu, CS s prefixem /cs
  localeDetection: false            // Vypnutá automatická detekce z prohlížeče
});
```

**Soubor:** `i18n/request.ts`
- Načítá překladové soubory podle locale
- Fallback na default locale pokud locale není podporován

**Soubor:** `proxy.ts` (middleware)
- Zpracovává routing s locale prefixy
- Přesměrovává na správnou URL podle locale

### Překladové soubory

**Soubor:** `messages/en.json` a `messages/cs.json`
- Obsahují všechny texty aplikace
- Strukturované podle sekcí (dashboard, uploadModal, shipmentsTable, atd.)

### Použití v komponentách

```typescript
import { useTranslations, useLocale } from 'next-intl';

function MyComponent() {
  const t = useTranslations();        // Hook pro překlady
  const locale = useLocale();         // Hook pro aktuální locale
  
  return <div>{t('dashboard.title')}</div>;
}
```

### URL struktura

- Angličtina (default): `/` nebo `/en`
- Čeština: `/cs`

---

## Instalace a spuštění

### 1. Požadavky
- Node.js 18 nebo vyšší
- npm nebo yarn
- Účet na Supabase (zdarma)

### 2. Instalace závislostí

```bash
npm install
```

### 3. Nastavení Supabase

1. Vytvořte projekt na [supabase.com](https://supabase.com)
2. V SQL Editoru spusťte migraci z `supabase/migrations/001_initial_schema.sql`
3. Zkopírujte URL projektu a API klíče z Settings > API

### 4. Konfigurace environment variables

Vytvořte soubor `.env.local` v kořenovém adresáři:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Důležité:**
- `NEXT_PUBLIC_*` proměnné jsou dostupné v prohlížeči
- `SUPABASE_SERVICE_ROLE_KEY` je pouze pro server-side (nikdy v prohlížeči!)

### 5. Spuštění vývojového serveru

```bash
npm run dev
```

Aplikace bude dostupná na [http://localhost:3000](http://localhost:3000)

### 6. Build pro produkci

```bash
npm run build
npm start
```

---

## Jak aplikace funguje

### Flow uploadu faktur

1. **Uživatel otevře modal** (`UploadModal`)
   - Klikne na tlačítko "Nahrát faktury" v headeru

2. **Výběr souboru**
   - Uživatel vybere JSON soubor
   - `handleFileSelect()` načte a validuje soubor

3. **Validace**
   - Kontrola formátu (musí být JSON)
   - Kontrola struktury (musí být pole objektů)
   - Validace každé faktury (povinná pole, hodnoty)

4. **Preview**
   - Pokud validace projde, zobrazí se `PreviewTable`
   - Uživatel vidí data před uploadem

5. **Upload**
   - Uživatel klikne "Potvrdit upload"
   - `handleUpload()` odešle data na `/api/invoices/upload`
   - Zobrazí se progress

6. **Zpracování na serveru**
   - API route validuje data znovu
   - Deduplikace pomocí `Map`
   - Upsert společností a zásilek
   - Insert nových faktur

7. **Úspěch**
   - Modal se zavře
   - `onUploadSuccess()` se zavolá
   - `ShipmentsTable` se aktualizuje (díky `refreshKey`)

### Flow zobrazení zásilek

1. **Načtení stránky**
   - `app/[locale]/page.tsx` se renderuje
   - `ShipmentsTable` se mountuje

2. **Načtení dat**
   - `useEffect` v `ShipmentsTable` volá `fetchShipments()`
   - Request na `/api/shipments` s parametry (page, limit, filtry)

3. **Server-side zpracování**
   - API route načte zásilky z databáze
   - Aplikuje filtry (company_id, tracking_number)
   - Získá nejnovější fakturu pro každou zásilku
   - Vrátí data s paginací

4. **Zobrazení**
   - `ShipmentsTable` zobrazí data v tabulce
   - Zobrazí paginaci

5. **Filtrování**
   - Uživatel vybere společnost v `CompanyFilter`
   - `onCompanyChange` se zavolá
   - `selectedCompanyId` se změní
   - `useEffect` v `ShipmentsTable` detekuje změnu
   - Znovu se načtou data s novým filtrem

6. **Historie cen**
   - Uživatel klikne na "Historie" u zásilky
   - `PriceHistoryModal` se otevře
   - Načte se historie z `/api/shipments/[id]/history`
   - Zobrazí se všechny faktury pro zásilku

### Flow změny jazyka

1. **Uživatel klikne na LanguageSwitcher**
   - `switchLanguage()` se zavolá

2. **Router změna**
   - `next-intl` router změní URL (přidá/odebere locale prefix)
   - Např. `/` → `/cs` nebo `/cs` → `/`

3. **Načtení překladů**
   - `i18n/request.ts` načte správný překladový soubor
   - `NextIntlClientProvider` poskytne překlady komponentám

4. **Re-render**
   - Všechny komponenty používající `useTranslations()` se re-renderují
   - Texty se změní na nový jazyk

---

## Návaznosti mezi komponentami

### Hierarchie komponent

```
app/[locale]/page.tsx (Home)
│
├── LanguageSwitcher
│   └── (nezávislý, pouze mění URL)
│
├── UploadModal
│   └── PreviewTable
│       └── (zobrazuje preview dat)
│
├── CompanyFilter
│   └── (callback: onCompanyChange → Home)
│
├── TrackingNumberSearch
│   └── (callback: onChange → Home)
│
└── ShipmentsTable
    ├── (props: companyId, trackingNumber z Home)
    └── PriceHistoryModal
        └── (otevře se při kliknutí na "Historie")
```

### Data flow

1. **Upload flow:**
   ```
   UploadModal → API /upload → Database
                ↓
            onUploadSuccess()
                ↓
            Home (refreshKey++)
                ↓
            ShipmentsTable (re-fetch)
   ```

2. **Filtrování flow:**
   ```
   CompanyFilter → onCompanyChange() → Home (selectedCompanyId)
                                                ↓
                                          ShipmentsTable (useEffect)
                                                ↓
                                          API /shipments?company_id=...
                                                ↓
                                          Database
   ```

3. **Historie flow:**
   ```
   ShipmentsTable → PriceHistoryModal (onClick)
                          ↓
                    API /shipments/[id]/history
                          ↓
                    Database
   ```

### State management

- **Lokální state** - Každá komponenta spravuje svůj vlastní state pomocí `useState`
- **Props drilling** - Data se předávají z rodiče na dítě přes props
- **Callbacks** - Dítě volá callback funkci rodiče pro komunikaci nahoru

**Příklad:**
```typescript
// Home komponenta
const [selectedCompanyId, setSelectedCompanyId] = useState(null);

// Předá callback do CompanyFilter
<CompanyFilter 
  selectedCompanyId={selectedCompanyId}
  onCompanyChange={setSelectedCompanyId}  // ← callback
/>

// CompanyFilter volá callback
onCompanyChange(company.id);  // ← změní state v Home
```

---

## Klíčové koncepty Reactu a Next.js

### React Hooks

#### `useState`
```typescript
const [value, setValue] = useState(initialValue);
```
- Spravuje lokální state komponenty
- Při změně se komponenta re-renderuje
- **Příklad:** `const [isOpen, setIsOpen] = useState(false);`

#### `useEffect`
```typescript
useEffect(() => {
  // Side effect (fetch, subscription, atd.)
  return () => {
    // Cleanup (volá se při unmount)
  };
}, [dependencies]);
```
- Spouští side effects (fetch dat, subscriptions)
- Spouští se po renderu
- **Příklad:** Načtení dat při mountu komponenty

#### `useCallback`
```typescript
const memoizedCallback = useCallback(() => {
  // funkce
}, [dependencies]);
```
- Memoizuje funkci (vrací stejnou referenci pokud se dependencies nezměnily)
- Používá se pro optimalizaci (aby se child komponenty nere-renderovaly zbytečně)
- **Příklad:** `fetchShipments` v `ShipmentsTable`

#### `useMemo`
```typescript
const memoizedValue = useMemo(() => {
  return expensiveCalculation();
}, [dependencies]);
```
- Memoizuje hodnotu (vypočítá se pouze při změně dependencies)
- Používá se pro optimalizaci výpočtů

### Next.js koncepty

#### Server Components vs Client Components

**Server Components** (default):
- Běží na serveru
- Nemohou používat hooks (`useState`, `useEffect`)
- Nemohou používat event handlery (`onClick`)
- Mají přístup k databázi přímo
- Menší bundle size (kód se neposílá do prohlížeče)

**Client Components** (`'use client'`):
- Běží v prohlížeči
- Mohou používat hooks
- Mohou používat event handlery
- Interaktivní UI

**Kdy použít co:**
- Server Component: Statický obsah, načítání dat z databáze
- Client Component: Interaktivní prvky (tlačítka, formuláře, modaly)

#### App Router

**File-based routing:**
- `app/page.tsx` → `/`
- `app/about/page.tsx` → `/about`
- `app/[locale]/page.tsx` → `/:locale` (dynamický segment)
- `app/api/route.ts` → `/api` (API endpoint)

**Layouts:**
- `app/layout.tsx` - Root layout (obaluje všechny stránky)
- `app/[locale]/layout.tsx` - Layout pro locale segment

**Metadata:**
```typescript
export const metadata: Metadata = {
  title: "Delivro Dashboard",
  description: "..."
};
```

#### API Routes

- Každý `route.ts` v `app/api/` vytváří API endpoint
- Exportuje funkce: `GET`, `POST`, `PUT`, `DELETE`, atd.
- Běží na serveru (Node.js runtime)

**Příklad:**
```typescript
// app/api/companies/route.ts
export async function GET() {
  // Server-side kód
  return NextResponse.json({ data: companies });
}
```

### TypeScript

#### Typy vs Interfaces

**Interface:**
```typescript
interface User {
  id: string;
  name: string;
}
```

**Type:**
```typescript
type User = {
  id: string;
  name: string;
}
```

**Kdy použít co:**
- Interface: Pro objekty, může se extendovat
- Type: Pro union types, intersection types, atd.

#### Generics

```typescript
function useState<T>(initial: T): [T, (value: T) => void] {
  // ...
}
```

#### Type assertions

```typescript
const value = data as string;  // Řekneme TypeScriptu, že data je string
```

---

## Závěr

Tato aplikace demonstruje:
- ✅ Next.js App Router s TypeScriptem
- ✅ Server-side a client-side rendering
- ✅ API Routes pro backend logiku
- ✅ Supabase jako databázové řešení
- ✅ Mezinárodní lokalizace (i18n)
- ✅ React hooks pro state management
- ✅ TanStack Table pro pokročilé tabulky
- ✅ Tailwind CSS pro styling
- ✅ Type-safe development s TypeScriptem

Pro další informace o Next.js navštivte [nextjs.org/docs](https://nextjs.org/docs).

