import fs from 'fs';
import { google } from 'googleapis';

const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';

// 🔍 検索の合言葉（りそな または UFJ の利用メールを探す）
const SEARCH_QUERY = '("埼玉りそな" OR "三菱ＵＦＪ" OR "三菱UFJ") "利用"';

async function fetchLatestEmail() {
  // 1. 鍵と入館証を読み込む
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const client = keys.installed || keys.web;
  
  const oAuth2Client = new google.auth.OAuth2(
    client.client_id, 
    client.client_secret, 
    client.redirect_uris[0]
  );
  
  const token = fs.readFileSync(TOKEN_PATH);
  oAuth2Client.setCredentials(JSON.parse(token));

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  console.log('--- 📡 銀行メールをスキャン中... ---');
  
  // 2. 指定した条件でメールの「リスト」を取得
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: SEARCH_QUERY,
    maxResults: 1, 
  });

  if (!res.data.messages || res.data.messages.length === 0) {
    console.log('❌ メールが見つかりませんでした。');
    console.log('Gmailを開いて「' + SEARCH_QUERY + '」で検索して、メールが実在するか確認してみてください。');
    return;
  }

  // 3. 見つかったメールの「中身」を取得
  const message = await gmail.users.messages.get({
    userId: 'me',
    id: res.data.messages[0].id,
  });

  const snippet = message.data.snippet; // メールの冒頭部分
  console.log('\n✅ メールを発見しました！');
  console.log('--------------------------------------------------');
  console.log('内容の一部:', snippet);
  console.log('--------------------------------------------------');

  // 4. 金額を抜き出すテスト（数字のカタマリを探す）
  const amountMatch = snippet.match(/[0-9,]+(?=円)/);
  if (amountMatch) {
    console.log('💰 抽出された金額: ¥' + amountMatch[0]);
  } else {
    console.log('⚠️ 金額らしき数字が見つかりませんでした。');
  }
}

fetchLatestEmail();