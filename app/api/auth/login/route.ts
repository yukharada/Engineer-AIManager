import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    // 環境変数のパスワードと照合
    const correctPassword = process.env.APP_PASSWORD;

    if (!correctPassword) {
      return NextResponse.json(
        { error: 'サーバー設定エラー: APP_PASSWORDガ設定されていません' },
        { status: 500 }
      );
    }

    if (password !== correctPassword) {
      return NextResponse.json(
        { error: 'パスワードが正しくありません' },
        { status: 401 }
      );
    }

    // ログイン成功 - Cookie を設定
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('auth-token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30日間有効
    });

    return response;

  } catch (error) {
    return NextResponse.json(
      { error: 'ログイン処理に失敗しました' },
      { status: 500 }
    );
  }
}
