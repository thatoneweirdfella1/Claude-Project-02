import { chromium } from 'playwright';

const browser = await chromium.launch({ 
  headless: true,
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
});
const page = await browser.newPage();
page.setViewportSize({ width: 1920, height: 1080 });

try {
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/tmp/claude-0/-home-user-Claude-Project-02/aec79994-b9fb-56c3-a95a-5e99ad2b80e2/scratchpad/local-app.png', fullPage: false });
  console.log('Screenshot saved to local-app.png');
} catch (error) {
  console.error('Error:', error.message);
}

await browser.close();
