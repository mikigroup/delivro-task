import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('company_id');
    const trackingNumber = searchParams.get('tracking_number');
    
    const pageParam = searchParams.get('page') || '1';
    const limitParam = searchParams.get('limit') || '50';
    
    const page = Math.max(1, parseInt(pageParam, 10)) || 1;
    const limit = Math.min(Math.max(1, parseInt(limitParam, 10)) || 50, 100);
    const offset = (page - 1) * limit;
    
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }
    
    if (trackingNumber && trackingNumber.length > 100) {
      return NextResponse.json(
        { error: 'Tracking number too long' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('shipments')
      .select(`
        *,
        company:companies(*)
      `)
      .order('updated_at', { ascending: false });

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    if (trackingNumber && trackingNumber.trim()) {
      query = query.ilike('tracking_number', `%${trackingNumber.trim()}%`);
    }

    let countQuery = supabaseAdmin
      .from('shipments')
      .select('*', { count: 'exact', head: true });

    if (companyId) {
      countQuery = countQuery.eq('company_id', companyId);
    }

    if (trackingNumber && trackingNumber.trim()) {
      countQuery = countQuery.ilike('tracking_number', `%${trackingNumber.trim()}%`);
    }

    const { count } = await countQuery;

    query = query.range(offset, offset + limit - 1);

    const { data: shipments, error: shipmentsError } = await query;

    if (shipmentsError) {
      console.error('Error fetching shipments:', shipmentsError);
      return NextResponse.json(
        { error: 'Failed to fetch shipments' },
        { status: 500 }
      );
    }

    if (!shipments || shipments.length === 0) {
      return NextResponse.json({
        data: [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    }

    const shipmentIds = shipments.map((s: any) => s.id);
    
    const { data: latestInvoices, error: invoicesError } = await supabaseAdmin
      .from('invoices')
      .select('shipment_id, invoiced_weight, invoiced_price, created_at')
      .in('shipment_id', shipmentIds)
      .order('created_at', { ascending: false });

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError);
      return NextResponse.json(
        { error: 'Failed to fetch invoice data' },
        { status: 500 }
      );
    }

    const latestInvoiceMap = new Map();
    if (latestInvoices) {
      for (const invoice of latestInvoices) {
        if (!latestInvoiceMap.has(invoice.shipment_id)) {
          latestInvoiceMap.set(invoice.shipment_id, invoice);
        }
      }
    }

    const shipmentsWithInvoices = shipments.map((shipment: any) => ({
      ...shipment,
      latest_invoice: latestInvoiceMap.get(shipment.id) || null,
    }));

    return NextResponse.json({
      data: shipmentsWithInvoices,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in shipments API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

