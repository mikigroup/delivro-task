import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { InvoiceInput } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate that body is an array
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Invalid JSON format. Expected an array of invoices.' },
        { status: 400 }
      );
    }

    // Validate each invoice structure
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
        return NextResponse.json(
          { error: 'Invalid invoice structure. Missing required fields.' },
          { status: 400 }
        );
      }
    }

    let newCompanies = 0;
    let newShipments = 0;
    let updatedShipments = 0;
    let newInvoices = 0;

    // Process invoices in batches to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < body.length; i += batchSize) {
      const batch = body.slice(i, i + batchSize) as InvoiceInput[];

      for (const invoiceData of batch) {
        // Upsert company
        const { error: companyError } = await supabaseAdmin
          .from('companies')
          .upsert(
            {
              id: invoiceData.shipment.company.id,
              name: invoiceData.shipment.company.name,
            },
            { onConflict: 'id' }
          );

        if (companyError) {
          console.error('Error upserting company:', companyError);
          return NextResponse.json(
            { error: 'Failed to save company data' },
            { status: 500 }
          );
        }

        // Check if shipment exists
        const { data: existingShipment } = await supabaseAdmin
          .from('shipments')
          .select('id')
          .eq('id', invoiceData.shipment.id)
          .single();

        const isNewShipment = !existingShipment;

        // Upsert shipment
        const { error: shipmentError } = await supabaseAdmin
          .from('shipments')
          .upsert(
            {
              id: invoiceData.shipment.id,
              tracking_number: invoiceData.shipment.trackingNumber,
              created_at: invoiceData.shipment.createdAt,
              company_id: invoiceData.shipment.company.id,
              provider: invoiceData.shipment.provider,
              mode: invoiceData.shipment.mode,
              origin_country: invoiceData.shipment.originCountry,
              destination_country: invoiceData.shipment.destinationCountry,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );

        if (shipmentError) {
          console.error('Error upserting shipment:', shipmentError);
          return NextResponse.json(
            { error: 'Failed to save shipment data' },
            { status: 500 }
          );
        }

        if (isNewShipment) {
          newShipments++;
        } else {
          updatedShipments++;
        }

        // Check if invoice already exists
        const { data: existingInvoice } = await supabaseAdmin
          .from('invoices')
          .select('id')
          .eq('id', invoiceData.id)
          .single();

        if (!existingInvoice) {
          // Insert new invoice
          const { error: invoiceError } = await supabaseAdmin
            .from('invoices')
            .insert({
              id: invoiceData.id,
              shipment_id: invoiceData.shipment.id,
              invoiced_weight: invoiceData.invoicedWeight,
              invoiced_price: invoiceData.invoicedPrice,
            });

          if (invoiceError) {
            console.error('Error inserting invoice:', invoiceError);
            return NextResponse.json(
              { error: 'Failed to save invoice data' },
              { status: 500 }
            );
          }

          newInvoices++;
        }
      }
    }

    // Count new companies (approximate, as we're upserting)
    const { data: allCompanies } = await supabaseAdmin
      .from('companies')
      .select('id');
    
    newCompanies = allCompanies?.length || 0;

    return NextResponse.json({
      success: true,
      statistics: {
        totalProcessed: body.length,
        newCompanies,
        newShipments,
        updatedShipments,
        newInvoices,
      },
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}

