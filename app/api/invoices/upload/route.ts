import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { InvoiceInput } from '@/types/database';

// Increase timeout for large uploads (max 300 seconds in Vercel Pro, 60 in Hobby)
export const maxDuration = 300;
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  console.log('[UPLOAD API] Request received');
  
  try {
    console.log('[UPLOAD API] Parsing request body...');
    const body = await request.json();
    console.log('[UPLOAD API] Body parsed, invoice count:', body.length);
    
    // Validate that body is an array
    if (!Array.isArray(body)) {
      console.error('[UPLOAD API] Invalid format - not an array');
      return NextResponse.json(
        { error: 'Invalid JSON format. Expected an array of invoices.' },
        { status: 400 }
      );
    }

    // Validate each invoice structure
    console.log('[UPLOAD API] Validating invoice structure...');
    for (const invoice of body) {
      if (
        !invoice.id ||
        !invoice.shipment ||
        !invoice.shipment.id ||
        !invoice.shipment.trackingNumber ||
        !invoice.shipment.company ||
        !invoice.shipment.company.id ||
        !invoice.shipment.company.name ||
        !invoice.shipment.provider ||
        !invoice.shipment.mode ||
        !invoice.shipment.originCountry ||
        !invoice.shipment.destinationCountry ||
        typeof invoice.invoicedWeight !== 'number' ||
        typeof invoice.invoicedPrice !== 'number'
      ) {
        console.error('[UPLOAD API] Invalid invoice structure:', invoice);
        return NextResponse.json(
          { error: 'Invalid invoice structure. Missing required fields.' },
          { status: 400 }
        );
      }
    }
    console.log('[UPLOAD API] Validation passed');

    // Check Supabase connection
    console.log('[UPLOAD API] Checking Supabase connection...');
    const { data: testData, error: testError } = await supabaseAdmin
      .from('companies')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('[UPLOAD API] Supabase connection error:', testError);
      return NextResponse.json(
        { error: `Database connection error: ${testError.message}`, details: testError },
        { status: 500 }
      );
    }
    console.log('[UPLOAD API] Supabase connection OK');

    console.log('[UPLOAD API] Preparing batch operations...');
    
    // Collect unique companies
    const companiesMap = new Map<string, { id: string; name: string }>();
    const shipmentsMap = new Map<string, any>();
    const invoicesToInsert: any[] = [];
    const invoiceIds = body.map((inv: InvoiceInput) => inv.id);

    for (const invoiceData of body as InvoiceInput[]) {
      // Collect companies
      companiesMap.set(invoiceData.shipment.company.id, {
        id: invoiceData.shipment.company.id,
        name: invoiceData.shipment.company.name,
      });

      // Collect shipments
      shipmentsMap.set(invoiceData.shipment.id, {
        id: invoiceData.shipment.id,
        tracking_number: invoiceData.shipment.trackingNumber,
        created_at: invoiceData.shipment.createdAt,
        company_id: invoiceData.shipment.company.id,
        provider: invoiceData.shipment.provider,
        mode: invoiceData.shipment.mode,
        origin_country: invoiceData.shipment.originCountry,
        destination_country: invoiceData.shipment.destinationCountry,
        updated_at: new Date().toISOString(),
      });

      // Collect invoices
      invoicesToInsert.push({
        id: invoiceData.id,
        shipment_id: invoiceData.shipment.id,
        invoiced_weight: invoiceData.invoicedWeight,
        invoiced_price: invoiceData.invoicedPrice,
      });
    }

    console.log(`[UPLOAD API] Collected ${companiesMap.size} unique companies, ${shipmentsMap.size} shipments, ${invoicesToInsert.length} invoices`);

    // Batch upsert companies
    console.log('[UPLOAD API] Batch upserting companies...');
    const companiesArray = Array.from(companiesMap.values());
    const { error: companyError } = await supabaseAdmin
      .from('companies')
      .upsert(companiesArray, { onConflict: 'id' });

    if (companyError) {
      console.error('[UPLOAD API] Error batch upserting companies:', companyError);
      return NextResponse.json(
        { error: `Failed to save companies: ${companyError.message}`, details: companyError },
        { status: 500 }
      );
    }
    console.log('[UPLOAD API] Companies upserted successfully');

    // Check which shipments already exist
    console.log('[UPLOAD API] Checking existing shipments...');
    const shipmentIds = Array.from(shipmentsMap.keys());
    const { data: existingShipments, error: shipmentCheckError } = await supabaseAdmin
      .from('shipments')
      .select('id')
      .in('id', shipmentIds);

    if (shipmentCheckError) {
      console.error('[UPLOAD API] Error checking shipments:', shipmentCheckError);
      return NextResponse.json(
        { error: `Failed to check shipments: ${shipmentCheckError.message}`, details: shipmentCheckError },
        { status: 500 }
      );
    }

    const existingShipmentIds = new Set((existingShipments || []).map((s: any) => s.id));
    const newShipments = shipmentIds.filter(id => !existingShipmentIds.has(id)).length;
    const updatedShipments = shipmentIds.length - newShipments;
    console.log(`[UPLOAD API] Found ${existingShipmentIds.size} existing shipments, ${newShipments} new shipments`);

    // Batch upsert shipments
    console.log('[UPLOAD API] Batch upserting shipments...');
    const shipmentsArray = Array.from(shipmentsMap.values());
    const { error: shipmentError } = await supabaseAdmin
      .from('shipments')
      .upsert(shipmentsArray, { onConflict: 'id' });

    if (shipmentError) {
      console.error('[UPLOAD API] Error batch upserting shipments:', shipmentError);
      return NextResponse.json(
        { error: `Failed to save shipments: ${shipmentError.message}`, details: shipmentError },
        { status: 500 }
      );
    }
    console.log('[UPLOAD API] Shipments upserted successfully');

    // Check which invoices already exist
    console.log('[UPLOAD API] Checking existing invoices...');
    const { data: existingInvoices, error: invoiceCheckError } = await supabaseAdmin
      .from('invoices')
      .select('id')
      .in('id', invoiceIds);

    if (invoiceCheckError) {
      console.error('[UPLOAD API] Error checking invoices:', invoiceCheckError);
      return NextResponse.json(
        { error: `Failed to check invoices: ${invoiceCheckError.message}`, details: invoiceCheckError },
        { status: 500 }
      );
    }

    const existingInvoiceIds = new Set((existingInvoices || []).map((inv: any) => inv.id));
    const newInvoicesToInsert = invoicesToInsert.filter(inv => !existingInvoiceIds.has(inv.id));
    const newInvoices = newInvoicesToInsert.length;
    console.log(`[UPLOAD API] Found ${existingInvoiceIds.size} existing invoices, ${newInvoices} new invoices to insert`);

    // Batch insert new invoices
    if (newInvoicesToInsert.length > 0) {
      console.log('[UPLOAD API] Batch inserting invoices...');
      const { error: invoiceError } = await supabaseAdmin
        .from('invoices')
        .insert(newInvoicesToInsert);

      if (invoiceError) {
        console.error('[UPLOAD API] Error batch inserting invoices:', invoiceError);
        return NextResponse.json(
          { error: `Failed to save invoices: ${invoiceError.message}`, details: invoiceError },
          { status: 500 }
        );
      }
      console.log('[UPLOAD API] Invoices inserted successfully');
    } else {
      console.log('[UPLOAD API] No new invoices to insert');
    }

    console.log('[UPLOAD API] All operations completed');
    console.log('[UPLOAD API] Final statistics - New shipments:', newShipments, 'Updated shipments:', updatedShipments, 'New invoices:', newInvoices);
    
    // Count total companies
    console.log('[UPLOAD API] Counting companies...');
    const { data: allCompanies, error: countError } = await supabaseAdmin
      .from('companies')
      .select('id');
    
    let newCompanies = 0;
    if (countError) {
      console.error('[UPLOAD API] Error counting companies:', countError);
    } else {
      newCompanies = allCompanies?.length || 0;
    }

    const result = {
      success: true,
      statistics: {
        totalProcessed: body.length,
        newCompanies,
        newShipments,
        updatedShipments,
        newInvoices,
      },
    };

    console.log('[UPLOAD API] Upload completed successfully:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[UPLOAD API] Fatal error processing upload:', error);
    console.error('[UPLOAD API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[UPLOAD API] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    return NextResponse.json(
      { 
        error: 'Failed to process upload',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}

