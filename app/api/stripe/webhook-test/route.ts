import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headers = Object.fromEntries(request.headers.entries());
    
    console.log('=== WEBHOOK TEST RECEIVED ===');
    console.log('Headers:', headers);
    console.log('Body length:', body.length);
    console.log('Body preview:', body.substring(0, 200));
    console.log('================================');
    
    return NextResponse.json({
      success: true,
      message: 'Test webhook received',
      receivedAt: new Date().toISOString(),
      headers: {
        'stripe-signature': headers['stripe-signature'] ? 'PRESENT' : 'stripe-signature',
        'content-type': headers['content-type'],
        'user-agent': headers['user-agent']
      },
      bodyLength: body.length,
      bodyPreview: body.substring(0, 200)
    });
    
  } catch (error) {
    console.error('Webhook test error:', error);
    return NextResponse.json({ 
      error: 'Webhook test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
