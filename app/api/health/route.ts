export async function GET() {
  return Response.json({ 
    ok: true,
    time: new Date().toISOString(),
    env: {
      vercel: !!process.env.VERCEL,
      region: process.env.VERCEL_REGION || null
    }
  });
}
