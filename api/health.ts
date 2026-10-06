export default async function handler(req: any, res: any) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const isConfigured = Boolean(
    accountId &&
    apiToken &&
    accountId.trim() !== '' &&
    apiToken.trim() !== ''
  );

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    status: 'ok',
    cloudflareConfigured: isConfigured,
    timestamp: new Date().toISOString(),
  });
}
