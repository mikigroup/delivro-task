export interface Company {
  id: string;
  name: string;
  created_at?: string;
}

export interface Shipment {
  id: string;
  tracking_number: string;
  created_at: string;
  company_id: string;
  provider: 'GLS' | 'DPD' | 'UPS' | 'PPL' | 'FedEx';
  mode: 'EXPORT' | 'IMPORT';
  origin_country: string;
  destination_country: string;
  updated_at?: string;
}

export interface Invoice {
  id: string;
  shipment_id: string;
  invoiced_weight: number;
  invoiced_price: number;
  created_at?: string;
}

export interface InvoiceInput {
  id: string;
  shipment: {
    id: string;
    createdAt: string;
    trackingNumber: string;
    company: {
      id: string;
      name: string;
    };
    provider: 'GLS' | 'DPD' | 'UPS' | 'PPL' | 'FedEx';
    mode: 'EXPORT' | 'IMPORT';
    originCountry: string;
    destinationCountry: string;
  };
  invoicedWeight: number;
  invoicedPrice: number;
}

export interface ShipmentWithLatestInvoice extends Shipment {
  company: Company;
  latest_invoice?: {
    invoiced_weight: number;
    invoiced_price: number;
    created_at: string;
  };
}

export interface InvoiceHistory extends Invoice {
  created_at: string;
}

