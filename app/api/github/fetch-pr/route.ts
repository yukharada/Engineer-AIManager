import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prUrl } = await req.json();
    
    // URLからowner, repo, pr_numberを抽出
    const match = prUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
    if (!match) {
      return NextResponse.json({ error: '無効なPR URLです' }, { status: 400 });
    }
    
    const [, owner, repo, prNumber] = match;
    
    // GitHub APIでPRのファイル情報を取得
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          // 必要に応じてPersonal Access Tokenを追加
          ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {})
        }
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ 
        error: 'PRの取得に失敗しました',
        details: errorData.message 
      }, { status: response.status });
    }
    
    const files = await response.json();
    
    // 変更されたファイルの情報を整形
    const codeChanges = files.map((file: any) => ({
      filename: file.filename,
      status: file.status, // added, modified, removed
      additions: file.additions,
      deletions: file.deletions,
      patch: file.patch || '' // diffの内容
    }));
    
    // 全体のdiffを1つの文字列に統合
    const combinedCode = codeChanges
      .map((f: any) => `// ファイル: ${f.filename}\n// ステータス: ${f.status}\n\n${f.patch}`)
      .join('\n\n---\n\n');
    
    return NextResponse.json({ 
      success: true,
      code: combinedCode,
      files: codeChanges,
      prInfo: {
        owner,
        repo,
        number: prNumber,
        totalFiles: files.length
      }
    });
    
  } catch (error: any) {
    console.error('GitHub API Error:', error);
    return NextResponse.json({ 
      error: 'PRの取得中にエラーが発生しました',
      details: error.message 
    }, { status: 500 });
  }
}
