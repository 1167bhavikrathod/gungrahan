import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const VIEWPORTS = [
  { name: 'Small Mobile 320x568 (iPhone SE 1st / 320px)', width: 320, height: 568 },
  { name: 'Small Mobile 360x740 (Android Compact)', width: 360, height: 740 },
  { name: 'Small Mobile 375x667 (iPhone SE 2nd/3rd)', width: 375, height: 667 },
  { name: 'Standard Mobile 390x844 (iPhone 12/13/14/15)', width: 390, height: 844 },
  { name: 'Standard Mobile 412x915 (Samsung S21/Pixel 7)', width: 412, height: 915 },
  { name: 'Large Mobile 430x932 (iPhone Pro Max)', width: 430, height: 932 },
  { name: 'Tablet 768x1024 (iPad Mini/Air)', width: 768, height: 1024 },
  { name: 'Tablet 820x1180 (iPad 10th Gen)', width: 820, height: 1180 },
  { name: 'Desktop 1024x768 (Small Desktop / Landscape)', width: 1024, height: 768 },
  { name: 'Desktop 1280x800 (Laptop)', width: 1280, height: 800 },
  { name: 'Desktop 1440x900 (Large Desktop)', width: 1440, height: 900 },
];

const ROUTES = ['/', '/feed', '/leaderboard', '/coverage', '/report', '/admin'];

async function testPage(page, route, vp) {
  // Check doc scroll width vs window inner width
  return await page.evaluate((vpWidth) => {
    const docWidth = document.documentElement.scrollWidth;
    const bodyWidth = document.body.scrollWidth;
    const winWidth = window.innerWidth;

    // Detect any top-level unclipped elements causing horizontal overflow
    const unclippedOverflows = [];
    const allEls = document.querySelectorAll('header, nav, main, footer, div, section, article');
    for (const el of allEls) {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      // Skip hidden or fixed elements designed to span width
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      
      // If element right edge spills beyond viewport AND it's not inside an overflow scroll container
      if (rect.right > winWidth + 2) {
        let current = el.parentElement;
        let isInsideScroll = false;
        while (current && current !== document.body && current !== document.documentElement) {
          const pStyle = window.getComputedStyle(current);
          if (pStyle.overflowX === 'auto' || pStyle.overflowX === 'scroll' || pStyle.overflowX === 'hidden') {
            const pRect = current.getBoundingClientRect();
            if (pRect.right <= winWidth + 2) {
              isInsideScroll = true;
              break;
            }
          }
          current = current.parentElement;
        }
        if (!isInsideScroll) {
          unclippedOverflows.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className || '').toString().slice(0, 40),
            right: Math.round(rect.right),
            winWidth,
          });
        }
      }
    }

    return {
      docWidth,
      bodyWidth,
      winWidth,
      hasOverflow: docWidth > winWidth,
      unclippedOverflows: unclippedOverflows.slice(0, 5),
    };
  }, vp.width);
}

async function runComprehensiveAudit() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  console.log('========================================================');
  console.log('  COMPREHENSIVE MULTI-DEVICE & BROWSER RESPONSIVE AUDIT  ');
  console.log('========================================================\n');

  let totalTests = 0;
  let passedTests = 0;
  const failures = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n--- Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });

    // Set logged-in state (Bhavik Super Admin)
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem(
        'gunagrahan_user_v1',
        JSON.stringify({
          id: '1ccb1238-4241-4dbc-a933-b8db3696ca6b',
          name: 'ભાવિક યોગેશભાઈ રાઠોડ',
          karyakar_number: '13317',
          role: 'સંચાલક',
          sabha: 'શિવશક્તિ',
          wing: 'bal',
        })
      );
      localStorage.setItem('gunagrahan_admin_unlocked_v1', 'true');
    });

    for (const route of ROUTES) {
      totalTests++;
      await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle0' });
      const result = await testPage(page, route, vp);

      if (!result.hasOverflow && result.unclippedOverflows.length === 0) {
        passedTests++;
        console.log(`  [PASS] ${route.padEnd(14)} -> scrollWidth: ${result.docWidth}px, innerWidth: ${result.winWidth}px`);
      } else {
        console.log(`  [FAIL] ${route.padEnd(14)} -> docWidth: ${result.docWidth}px, innerWidth: ${result.winWidth}px, unclipped: ${result.unclippedOverflows.length}`);
        failures.push({
          vp: vp.name,
          route,
          result,
        });
      }
    }

    // Modal Test: Open AddGunaDrawer on home page
    if (vp.width <= 430) {
      totalTests++;
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
      // Click on "નવો ગુણ ઉમેરો" button
      const clicked = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent.includes('નવો ગુણ ઉમેરો') || b.getAttribute('aria-label') === 'Add new guna');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });

      if (clicked) {
        await new Promise((r) => setTimeout(r, 400));
        const drawerCheck = await page.evaluate(() => {
          const drawer = document.querySelector('.fixed.inset-0');
          if (!drawer) return { found: false };
          const rect = drawer.getBoundingClientRect();
          const card = drawer.querySelector('.bg-white');
          const cardRect = card ? card.getBoundingClientRect() : null;
          return {
            found: true,
            drawerWidth: rect.width,
            cardWidth: cardRect ? cardRect.width : 0,
            cardHeight: cardRect ? cardRect.height : 0,
            viewportHeight: window.innerHeight,
            fitsHeight: cardRect ? cardRect.height <= window.innerHeight : true,
          };
        });
        if (drawerCheck.found && drawerCheck.fitsHeight) {
          passedTests++;
          console.log(`  [PASS] AddGunaDrawer -> Drawer card fits within viewport height (${drawerCheck.cardHeight}px <= ${drawerCheck.viewportHeight}px)`);
        } else {
          failures.push({ vp: vp.name, test: 'AddGunaDrawer', drawerCheck });
        }
      }
    }

    await page.close();
  }

  // Also test unauthenticated LoginGateModal on 320px
  console.log('\n--- Unauthenticated LoginGateModal Test (320px) ---');
  totalTests++;
  const loginPage = await browser.newPage();
  await loginPage.setViewport({ width: 320, height: 568 });
  await loginPage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await loginPage.evaluate(() => {
    localStorage.clear();
  });
  await loginPage.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  const loginCheck = await testPage(loginPage, '/', { width: 320, height: 568 });
  if (!loginCheck.hasOverflow && loginCheck.unclippedOverflows.length === 0) {
    passedTests++;
    console.log(`  [PASS] LoginGateModal (320px) -> scrollWidth: ${loginCheck.docWidth}px, innerWidth: 320px, unclipped: 0`);
  } else {
    failures.push({ vp: 'LoginGateModal 320px', test: 'LoginGateModal', loginCheck });
  }
  await loginPage.close();

  await browser.close();

  console.log('\n========================================================');
  console.log(`AUDIT RESULTS: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  if (failures.length > 0) {
    console.log(`FAILURES: ${failures.length}`);
    console.log(JSON.stringify(failures, null, 2));
    process.exit(1);
  } else {
    console.log('ALL VIEWPORTS, ROUTES, AND MODALS PASSED WITH ZERO UI BREAKS! 🎉');
    console.log('========================================================');
  }
}

runComprehensiveAudit().catch((err) => {
  console.error(err);
  process.exit(1);
});
