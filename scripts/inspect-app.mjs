import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5174';

async function run() {
  console.log('Launching headless browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleLogs = [];
  const errors = [];

  page.on('console', (msg) => {
    const text = `[Browser Console ${msg.type()}]: ${msg.text()}`;
    consoleLogs.push(text);
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });

  page.on('pageerror', (err) => {
    errors.push(`[Page Error]: ${err.toString()}`);
  });

  // Test 1: Public Auth Pages (/login, /register, /forgot-password)
  console.log('\n--- 1. Testing /login ---');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  const loginTitle = await page.title();
  console.log('Login Page Title:', loginTitle);
  const loginFormLabels = await page.$$eval('label', (labels) => labels.map(l => l.innerText.trim()));
  console.log('Login Form Labels:', loginFormLabels);
  const loginInputs = await page.$$eval('input', (inputs) => inputs.map(i => ({ type: i.type, placeholder: i.placeholder, required: i.required })));
  console.log('Login Inputs:', loginInputs);

  console.log('\n--- 2. Testing /register ---');
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle2' });
  const registerFormLabels = await page.$$eval('label', (labels) => labels.map(l => l.innerText.trim()));
  console.log('Register Form Labels:', registerFormLabels);
  const registerInputs = await page.$$eval('input', (inputs) => inputs.map(i => ({ type: i.type, placeholder: i.placeholder, required: i.required })));
  console.log('Register Inputs:', registerInputs);

  console.log('\n--- 3. Testing /forgot-password ---');
  await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: 'networkidle2' });
  const fpLabels = await page.$$eval('label', (labels) => labels.map(l => l.innerText.trim()));
  console.log('Forgot Password Form Labels:', fpLabels);
  const fpInputs = await page.$$eval('input', (inputs) => inputs.map(i => ({ type: i.type, placeholder: i.placeholder })));
  console.log('Forgot Password Inputs:', fpInputs);

  // Set mock session profile in localStorage to test protected routes
  console.log('\n--- Setting Mock Auth Session in LocalStorage ---');
  await page.evaluate(() => {
    const mockUser = {
      uid: 'test_user_inspector',
      displayName: 'Inspector Tester',
      email: 'inspector@example.com',
      role: 'student',
      xp: 450,
      level: 1,
      currentStreak: 3,
      longestStreak: 5,
      totalActiveDays: 8,
      totalLearningMinutes: 120,
      completedCoursesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('learnos_user_profile', JSON.stringify(mockUser));
    localStorage.setItem('learnos_session_expires', (Date.now() + 86400000).toString());
  });

  // Test 4: Dashboard & Courses
  console.log('\n--- 4. Testing /dashboard ---');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
  const dashboardHeading = await page.evaluate(() => document.querySelector('h1, h2')?.textContent?.trim());
  console.log('Dashboard Heading:', dashboardHeading);

  console.log('\n--- 5. Testing /courses ---');
  await page.goto(`${BASE_URL}/courses`, { waitUntil: 'networkidle2' });
  const courseCards = await page.$$eval('h3, h4', (headings) => headings.map(h => h.innerText.trim()));
  console.log('Course list / Headings on Courses Page:', courseCards.slice(0, 10));

  // Test 6: Course Player Page (/learning/linux or /learning/...)
  console.log('\n--- 6. Testing /learning/linux ---');
  await page.goto(`${BASE_URL}/learning/linux`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const playerLessonTitle = await page.evaluate(() => {
    const title = document.querySelector('h1, h2')?.textContent?.trim();
    const iframe = document.querySelector('iframe')?.src;
    const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
    return { title, iframe, buttons: buttons.filter(Boolean).slice(0, 15) };
  });
  console.log('Course Player inspection:', playerLessonTitle);

  // Test 7: Route /learn/linux check (user asked about /learn/linux)
  console.log('\n--- 7. Testing /learn/linux route ---');
  await page.goto(`${BASE_URL}/learn/linux`, { waitUntil: 'networkidle2' });
  const currentUrl = page.url();
  console.log('Navigated to /learn/linux -> Current URL is:', currentUrl);

  // Test 8: Notes Page (/notes)
  console.log('\n--- 8. Testing /notes ---');
  await page.goto(`${BASE_URL}/notes`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  const notesUI = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
    const inputs = Array.from(document.querySelectorAll('input, textarea')).map(i => i.placeholder || i.tagName);
    return { buttons: buttons.filter(Boolean), inputs };
  });
  console.log('Notes UI elements:', notesUI);

  // Test 9: Schedule Page (/schedule)
  console.log('\n--- 9. Testing /schedule ---');
  await page.goto(`${BASE_URL}/schedule`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  const scheduleUI = await page.evaluate(() => {
    const text = document.body.innerText.slice(0, 300);
    return text;
  });
  console.log('Schedule UI text snippet:', scheduleUI.replace(/\n+/g, ' '));

  // Test 10: Goals Page (/goals)
  console.log('\n--- 10. Testing /goals ---');
  await page.goto(`${BASE_URL}/goals`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  const goalsUI = await page.evaluate(() => {
    const text = document.body.innerText.slice(0, 300);
    return text;
  });
  console.log('Goals UI text snippet:', goalsUI.replace(/\n+/g, ' '));

  // Test 11: Tasks Page (/tasks)
  console.log('\n--- 11. Testing /tasks ---');
  await page.goto(`${BASE_URL}/tasks`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  const tasksUI = await page.evaluate(() => {
    const text = document.body.innerText.slice(0, 300);
    return text;
  });
  console.log('Tasks UI text snippet:', tasksUI.replace(/\n+/g, ' '));

  console.log('\n=== SUMMARY OF CONSOLE ERRORS & WARNINGS ===');
  console.log('Total Console Logs:', consoleLogs.length);
  console.log('Errors caught:', errors.length > 0 ? errors : 'None! Zero console errors!');

  await browser.close();
}

run().catch(console.error);
