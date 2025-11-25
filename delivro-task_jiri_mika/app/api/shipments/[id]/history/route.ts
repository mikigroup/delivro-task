import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shipmentId = params.id;

    if (!shipmentId) {
      return NextResponse.json(
        { error: 'Shipment ID is required' },
        { status: 400 }
      );
    }

    // Verify shipment exists
    const { data: shipment, error: shipmentError } = await supabaseAdmin
      .from('shipments')
      .select('id')
      .eq('id', shipmentId)
      .single();

    if (shipmentError || !shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Get all invoices for this shipment, ordered by creation date (newest first)
    const { data: invoices, error: invoicesError } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('shipment_id', shipmentId)
      .order('created_at', { ascending: false });

    if (invoicesError) {
      console.error('Error fetching invoice history:', invoicesError);
      return NextResponse.json(
        { error: 'Failed to fetch invoice history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      shipment_id: shipmentId,
      invoices: invoices || [],
    });
  } catch (error) {
    console.error('Error in invoice history API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

