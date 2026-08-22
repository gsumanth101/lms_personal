import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5174';

async function run() {
  console.log('Starting In-Depth Interactive LMS Inspection...');
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

  // Inject session
  await page.goto(`${BASE_URL}/login`);
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

  // 1. Test Course Player
  console.log('\n--- Testing Course Player: /learning/linux ---');
  await page.goto(`${BASE_URL}/learning/linux`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Check initial state
  const playerState1 = await page.evaluate(() => {
    const markButtons = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Mark') || b.innerText.includes('Completed'));
    const sidebarProgress = document.querySelector('.MuiLinearProgress-root')?.parentElement?.innerText;
    const lessonTitle = document.querySelector('h1')?.innerText;
    return {
      lessonTitle,
      sidebarProgress,
      markButtons: markButtons.map(b => b.innerText)
    };
  });
  console.log('Initial Player State:', playerState1);

  // Click Mark Lesson Complete
  console.log('\n--- Clicking "Mark Lesson Complete" button ---');
  const clicked = await page.evaluate(() => {
    const markBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Mark Lesson Complete') || b.innerText.includes('Mark Complete'));
    if (markBtn) {
      markBtn.click();
      return true;
    }
    return false;
  });
  console.log('Button clicked:', clicked);
  await new Promise(r => setTimeout(r, 1500));

  const playerState2 = await page.evaluate(() => {
    const markButtons = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Mark') || b.innerText.includes('Completed'));
    const sidebarProgress = document.querySelector('.MuiLinearProgress-root')?.parentElement?.innerText;
    return {
      sidebarProgress,
      markButtons: markButtons.map(b => b.innerText)
    };
  });
  console.log('State after Mark Complete:', playerState2);

  // Test Next Lesson Navigation
  console.log('\n--- Testing Next Lesson Navigation ---');
  const nextClicked = await page.evaluate(() => {
    const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Next Lesson'));
    if (nextBtn) {
      nextBtn.click();
      return true;
    }
    return false;
  });
  console.log('Next Lesson Button Clicked:', nextClicked);
  await new Promise(r => setTimeout(r, 1500));

  const nextLessonState = await page.evaluate(() => {
    return {
      lessonTitle: document.querySelector('h1')?.innerText
    };
  });
  console.log('New Active Lesson Title:', nextLessonState);

  // Mark Lesson 2 Complete as well
  console.log('\n--- Marking Lesson 2 Complete (Multi-Lesson Test) ---');
  await page.evaluate(() => {
    const markBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Mark Lesson Complete') || b.innerText.includes('Mark Complete'));
    if (markBtn) markBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  const playerState3 = await page.evaluate(() => {
    const sidebarProgress = document.querySelector('.MuiLinearProgress-root')?.parentElement?.innerText;
    return { sidebarProgress };
  });
  console.log('State after 2 lessons complete:', playerState3);

  // 2. Test Notes Page
  console.log('\n--- Testing Notes Page: /notes ---');
  await page.goto(`${BASE_URL}/notes`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Click "New Note"
  console.log('Clicking "New Note"...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('New Note') || b.innerText.includes('Create New Note'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  const notesCountAfterNew = await page.evaluate(() => {
    const noteItems = document.querySelectorAll('div[class*="rounded-xl cursor-pointer"]');
    const editor = document.querySelector('textarea, input[placeholder*="Untitled"], input[placeholder*="Title"]');
    return { noteCardsCount: noteItems.length, hasEditor: Boolean(editor) };
  });
  console.log('Notes count after new note creation:', notesCountAfterNew);

  // 3. Test Goals Page
  console.log('\n--- Testing Goals Page: /goals ---');
  await page.goto(`${BASE_URL}/goals`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const goalsState = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText);
    const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText);
    return { buttons: buttons.filter(Boolean), headings };
  });
  console.log('Goals Page State:', goalsState);

  // 4. Test Tasks Page
  console.log('\n--- Testing Tasks Page: /tasks ---');
  await page.goto(`${BASE_URL}/tasks`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const tasksState = await page.evaluate(() => {
    const columns = Array.from(document.querySelectorAll('h2, h3, h4')).map(h => h.innerText);
    return { columns };
  });
  console.log('Tasks Kanban Columns:', tasksState);

  // 5. Test Schedule Page
  console.log('\n--- Testing Schedule Page: /schedule ---');
  await page.goto(`${BASE_URL}/schedule`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const scheduleState = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
    return { buttons: buttons.filter(Boolean) };
  });
  console.log('Schedule Page Buttons/View:', scheduleState);

  // 6. Test Responsive Viewports (Mobile & Tablet)
  console.log('\n--- Testing Mobile Viewport (375x812) on Course Player ---');
  await page.setViewport({ width: 375, height: 812 });
  await page.goto(`${BASE_URL}/learning/linux`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const mobilePlayerUI = await page.evaluate(() => {
    const curriculumBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Curriculum'));
    const isCurriculumVisible = curriculumBtn ? true : false;
    return { isCurriculumToggleVisible: isCurriculumVisible };
  });
  console.log('Mobile Player UI:', mobilePlayerUI);

  // Test Mobile Navigation Drawer
  if (mobilePlayerUI.isCurriculumToggleVisible) {
    console.log('Clicking Mobile Curriculum Toggle Drawer...');
    await page.evaluate(() => {
      const curriculumBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Curriculum'));
      if (curriculumBtn) curriculumBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    const drawerOpen = await page.evaluate(() => {
      const drawer = document.querySelector('.MuiDrawer-root');
      return Boolean(drawer);
    });
    console.log('Mobile Curriculum Drawer opened successfully:', drawerOpen);
  }

  console.log('\n=== ERRORS & FINDINGS ===');
  if (errors.length > 0) {
    console.log('Errors caught:', errors);
  } else {
    console.log('No JavaScript or console runtime errors detected during full interactive flow!');
  }

  await browser.close();
}

run().catch(console.error);
