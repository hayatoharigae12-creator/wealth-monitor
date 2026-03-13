// 修正箇所：ファイルチェックを強化
function readDB(): any[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      console.log("Database file not found. Starting with empty array.");
      return [];
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}