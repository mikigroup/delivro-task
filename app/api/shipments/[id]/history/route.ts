import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shipmentId } = await params;

    if (!shipmentId) {
      return NextResponse.json(
        { error: 'Shipment ID is required' },
        { status: 400 }
      );
    }
    
    if (typeof shipmentId !== 'string' || shipmentId.length > 100) {
      return NextResponse.json(
        { error: 'Invalid shipment ID format' },
        { status: 400 }
      );
    }

    console.log('[HISTORY API] Fetching history for shipment:', shipmentId);

    const { data: shipment, error: shipmentError } = await supabaseAdmin
      .from('shipments')
      .select('id')
      .eq('id', shipmentId)
      .single();

    if (shipmentError) {
      console.error('[HISTORY API] Error checking shipment:', shipmentError);
      if (shipmentError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Shipment not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: `Failed to check shipment: ${shipmentError.message}`, details: shipmentError },
        { status: 500 }
      );
    }

    if (!shipment) {
      console.error('[HISTORY API] Shipment not found:', shipmentId);
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    console.log('[HISTORY API] Shipment found, fetching invoices...');

    const { data: invoices, error: invoicesError } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('shipment_id', shipmentId)
      .order('created_at', { ascending: false });

    if (invoicesError) {
      console.error('[HISTORY API] Error fetching invoice history:', invoicesError);
      return NextResponse.json(
        { error: `Failed to fetch invoice history: ${invoicesError.message}`, details: invoicesError },
        { status: 500 }
      );
    }

    console.log('[HISTORY API] Found invoices:', invoices?.length || 0);

    return NextResponse.json({
      shipment_id: shipmentId,
      invoices: invoices || [],
    });
  } catch (error) {
    console.error('[HISTORY API] Fatal error:', error);
    console.error('[HISTORY API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

