# Supabase Setup Guide

## Krok 1: Vytvoření projektu

1. Přihlaste se na [Supabase](https://supabase.com)
2. Klikněte na "New Project"
3. Vyplňte:
   - **Name**: delivro-dashboard (nebo libovolný název)
   - **Database Password**: Vytvořte silné heslo (uložte si ho)
   - **Region**: Vyberte region blízko vašich uživatelů (např. Europe West)
4. Klikněte na "Create new project"

## Krok 2: Spuštění migrace

1. Po vytvoření projektu přejděte do **SQL Editor** (v levém menu)
2. Klikněte na **"New query"** (nebo tlačítko "+ New query")
3. Otevřete soubor `supabase_setup.sql` z tohoto projektu
4. **Zkopírujte celý obsah** souboru (Ctrl+A, Ctrl+C)
5. **Vložte** do SQL Editoru v Supabase (Ctrl+V)
6. Klikněte na **"Run"** (nebo stiskněte **Ctrl+Enter**)
7. Měli byste vidět zprávu "Success. No rows returned" - to znamená, že vše proběhlo úspěšně

## Krok 3: Získání API klíčů

1. Přejděte do **Settings** > **API**
2. Zkopírujte následující hodnoty:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Tento klíč je tajný, nesdílejte ho!)

## Krok 4: Nastavení RLS (Row Level Security) - Volitelné

Pro produkční prostředí můžete nastavit RLS policies. Pro testování a interní použití to není nutné, protože používáme service role key pro server-side operace.

Pokud chcete nastavit RLS:

1. Přejděte do **Authentication** > **Policies**
2. Pro každou tabulku (companies, shipments, invoices) vytvořte policy:
   - **Policy name**: Allow all operations
   - **Allowed operation**: ALL
   - **Policy definition**: `true` (pro testování)

## Krok 5: Ověření schématu

1. Přejděte do **Table Editor**
2. Měli byste vidět tři tabulky:
   - `companies`
   - `shipments`
   - `invoices`

## Poznámky

- Service role key má plná práva k databázi - používejte ho pouze na serveru
- Anon key je bezpečný pro použití v klientovi (browser)
- Pro produkci na Vercel nastavte environment variables v projektu

