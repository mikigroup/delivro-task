# Delivro Dashboard

Dashboard pro správu faktur a zásilek s integrací Supabase a deploy na Vercel.

## Funkce

- 📤 **Upload faktur** - Nahrání JSON souborů s fakturními daty
- 👁️ **Preview dat** - Náhled dat v tabulce před potvrzením uploadu
- 📊 **Dashboard zásilek** - Zobrazení všech zásilek s nejnovějšími fakturními údaji
- 🔍 **Filtrování** - Filtrování zásilek podle společnosti
- 📈 **Historie cen** - Zobrazení historie cen pro každou zásilku
- 📄 **Paginace** - Efektivní zobrazení velkého množství dat

## Technologie

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Databáze**: Supabase (PostgreSQL)
- **Tabulky**: TanStack Table
- **Ikony**: Lucide React

## Požadavky

- Node.js 18+ 
- npm nebo yarn
- Účet na Supabase
- Účet na Vercel (pro deploy)

## Instalace

1. **Klonování repozitáře a instalace závislostí**

```bash
cd delivro-task_jiri_mika
npm install
```

2. **Nastavení Supabase**

   a. Vytvořte nový projekt na [Supabase](https://supabase.com)
   
   b. V SQL Editoru spusťte migrační skript z `supabase/migrations/001_initial_schema.sql`
   
   c. Zkopírujte URL projektu a API klíče z Settings > API

3. **Konfigurace environment variables**

   Vytvořte soubor `.env.local` v kořenovém adresáři projektu:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Spuštění vývojového serveru**

```bash
npm run dev
```

Aplikace bude dostupná na [http://localhost:3000](http://localhost:3000)

## Struktura projektu

```
delivro-task_jiri_mika/
├── app/
│   ├── api/              # API routes
│   │   ├── invoices/     # Upload endpoint
│   │   ├── shipments/    # Shipments a history endpoints
│   │   └── companies/    # Companies endpoint
│   ├── page.tsx          # Hlavní stránka
│   └── layout.tsx        # Root layout
├── components/           # React komponenty
│   ├── UploadModal.tsx
│   ├── PreviewTable.tsx
│   ├── ShipmentsTable.tsx
│   ├── PriceHistoryModal.tsx
│   └── CompanyFilter.tsx
├── lib/
│   └── supabase/         # Supabase klienti
│       ├── client.ts
│       └── server.ts
├── types/
│   └── database.ts       # TypeScript typy
├── supabase/
│   └── migrations/       # SQL migrace
└── vercel.json           # Vercel konfigurace
```

## API Endpoints

### POST /api/invoices/upload
Nahrání a zpracování JSON souboru s fakturními daty.

**Request Body:**
```json
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

### GET /api/shipments
Získání zásilek s nejnovějšími fakturními údaji.

**Query Parameters:**
- `company_id` (optional) - Filtrování podle společnosti
- `page` (optional, default: 1) - Číslo stránky
- `limit` (optional, default: 50) - Počet záznamů na stránku

### GET /api/shipments/[id]/history
Historie cen pro konkrétní zásilku.

### GET /api/companies
Seznam všech společností.

## Deploy na Vercel

1. **Push kódu na GitHub/GitLab**

2. **Import projektu do Vercel**
   - Přihlaste se na [Vercel](https://vercel.com)
   - Klikněte na "New Project"
   - Importujte váš repozitář

3. **Nastavení Environment Variables**
   V Vercel projektu přidejte následující environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. **Deploy**
   - Vercel automaticky detekuje Next.js projekt
   - Klikněte na "Deploy"
   - Po dokončení deploye bude aplikace dostupná na URL poskytnuté Vercel

## Databázové schéma

### Tabulky

- **companies** - Společnosti
- **shipments** - Zásilky
- **invoices** - Faktury (s historií)

Všechny faktury se ukládají, dashboard zobrazuje pouze nejnovější fakturu pro každou zásilku.

## Poznámky

- Aplikace neobsahuje autentizaci (interní použití)
- Při uploadu se automaticky aktualizují existující zásilky podle `shipment.id`
- Všechny faktury se ukládají pro zachování historie
- Aplikace je optimalizována pro práci s velkým množstvím dat pomocí paginace a indexů

## Build

```bash
npm run build
npm start
```

## License

Tento projekt byl vytvořen jako testovací úloha pro Delivro.
