// auth-setup.mjs
import fs from 'fs';
import { google } from 'googleapis';
import readline from 'readline';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';

const content = fs.readFileSync(CREDENTIALS_PATH);
const { client_secret, client_id, redirect_uris } = JSON.parse(content).installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

console.log('\n--- SYSTEM AUTHENTICATION REQUIRED ---');
console.log('1. 以下のURLをブラウザで開いてください:');
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\n2. ログイン後に表示された「コード」をここに貼り付けてください: ', (code) => {
  rl.close();
  oAuth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    console.log('\n--- SUCCESS: token.json HAS BEEN GENERATED ---');
    console.log('これで自動収集の準備が完了しました。');
  });
});