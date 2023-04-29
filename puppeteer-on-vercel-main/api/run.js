const chromium = require("@sparticuz/chromium")
const puppeteer = require("puppeteer-core")

export default async function handler(request, response) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath:
      process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath),
    headless: true,
    ignoreHTTPSErrors: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process",
      '--window-size=1400,1080',
    ],
    ignoreDefaultArgs: ["--disable-extensions"],
    ignoreHTTPSErrors: true,
  })
  const page = await browser.newPage();


  await page.goto("https://vercel.com/")
  const title = await page.title()
  const screenshot = await page.screenshot({ encoding: 'base64' });



  const orderCode = request.url.split('?')[1];
  const orderUrl = `https://www.vivapayments.com/web2?ref=${orderCode}&paymentmethod=27`;

  const status = await page.goto(orderUrl);
  // await page.waitForTimeout(6000);

  // const title = await page.title();
  // response.status(200).json({
  //   body: request.body,
  //   cookies: request.cookies,
  //   chromium: await chromium.executablePath,
  //   url: request.url,
  //   orderCode: orderCode,
  //   orderUrl: orderUrl,
  //   title,
  // });
  // await page.close();
  // await browser.close();

  // const qrCode = await page.$('canvas');
  // const screenshot = await qrCode.screenshot({ encoding: 'base64' });
  // await page.close()
  // await browser.close()
  // response.status(200).json({
  //   body: request.body,
  //   cookies: request.cookies,
  //   chromium: await chromium.executablePath,
  //   url: request.url,
  //   orderCode: orderCode,
  //   orderUrl: orderUrl,
  //   data: 'data:image/png;base64,' + screenshot,
  // });


  await page.close()
  await browser.close()
  response.status(200).json({
    body: request.body,
    cookies: request.cookies,
    title,
    url: request.url,
    orderCode: orderCode,
    orderUrl: orderUrl,
    chromium: await chromium.executablePath,
    // s: status.status(),
    data: 'data:image/png;base64,' + screenshot,
  })
}
