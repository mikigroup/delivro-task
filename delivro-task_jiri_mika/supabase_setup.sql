-- ============================================
-- DELIVRO DASHBOARD - SUPABASE DATABASE SETUP
-- ============================================
-- Zkopírujte celý tento soubor do Supabase SQL Editoru a spusťte ho

-- 1. Vytvoření tabulky companies (společnosti)
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Vytvoření tabulky shipments (zásilky)
CREATE TABLE IF NOT EXISTS shipments (
  id TEXT PRIMARY KEY,
  tracking_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('GLS', 'DPD', 'UPS', 'PPL', 'FedEx')),
  mode TEXT NOT NULL CHECK (mode IN ('EXPORT', 'IMPORT')),
  origin_country TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Vytvoření tabulky invoices (faktury)
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  shipment_id TEXT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  invoiced_weight NUMERIC(10, 2) NOT NULL,
  invoiced_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Vytvoření indexů pro optimalizaci výkonu
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_company_id ON shipments(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_shipment_id ON invoices(shipment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shipments_updated_at ON shipments(updated_at DESC);

-- 5. Vytvoření funkce pro automatickou aktualizaci updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Vytvoření triggeru pro automatickou aktualizaci updated_at při změně zásilky
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- OVĚŘENÍ: Zkontrolujte, že byly vytvořeny všechny tabulky
-- ============================================
-- Spusťte tento dotaz pro ověření:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('companies', 'shipments', 'invoices')
-- ORDER BY table_name;

