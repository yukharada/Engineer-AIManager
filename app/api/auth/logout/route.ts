import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Cookie を削除
  response.cookies.delete('auth-token');
  
  return response;
}
