import type { DriveFileType, Lesson, CourseModule } from '../../types';

// Detect normalized file type from MIME type and filename extension
export const detectFileType = (mimeType: string, filename: string = ''): DriveFileType => {
  const lowerName = filename.toLowerCase();
  const lowerMime = (mimeType || '').toLowerCase();

  if (
    lowerMime.startsWith('video/') || 
    lowerName.endsWith('.mp4') || 
    lowerName.endsWith('.webm') || 
    lowerName.endsWith('.mov') || 
    lowerName.endsWith('.mkv') || 
    lowerName.endsWith('.avi')
  ) {
    return 'VIDEO';
  }

  if (lowerMime === 'application/pdf' || lowerName.endsWith('.pdf')) {
    return 'PDF';
  }

  if (
    lowerMime.includes('document') || 
    lowerMime.includes('word') || 
    lowerName.endsWith('.doc') || 
    lowerName.endsWith('.docx') || 
    lowerName.endsWith('.txt') || 
    lowerName.endsWith('.md')
  ) {
    return 'DOCUMENT';
  }

  if (
    lowerMime.includes('presentation') || 
    lowerMime.includes('powerpoint') || 
    lowerName.endsWith('.ppt') || 
    lowerName.endsWith('.pptx')
  ) {
    return 'PRESENTATION';
  }

  if (
    lowerMime.includes('spreadsheet') || 
    lowerMime.includes('excel') || 
    lowerName.endsWith('.xls') || 
    lowerName.endsWith('.xlsx') || 
    lowerName.endsWith('.csv')
  ) {
    return 'SPREADSHEET';
  }

  if (
    lowerMime.startsWith('image/') || 
    lowerName.endsWith('.png') || 
    lowerName.endsWith('.jpg') || 
    lowerName.endsWith('.jpeg') || 
    lowerName.endsWith('.webp') || 
    lowerName.endsWith('.svg')
  ) {
    return 'IMAGE';
  }

  return 'OTHER';
};

// Check if a file is an intended course thumbnail
export const isThumbnailImage = (filename: string): boolean => {
  const lower = filename.toLowerCase();
  return (
    lower.includes('thumbnail') ||
    lower.includes('cover') ||
    lower.includes('banner') ||
    lower === 'poster.png' ||
    lower === 'poster.jpg'
  );
};

// Extract numeric prefix for sorting (e.g., "01 Intro.mp4" -> 1, "02_Basics" -> 2)
export const extractNumericPrefix = (name: string): { order: number; cleanTitle: string } => {
  // Matches "01 Introduction", "01. Introduction", "01 - Intro", "1_Intro", "Module 01 - Intro"
  const prefixMatch = name.match(/^(?:Module\s*)?(\d+)[\s._-]+(.*)$/i);
  
  if (prefixMatch) {
    const num = parseInt(prefixMatch[1], 10);
    let title = prefixMatch[2].trim();
    // Strip file extension if present
    title = title.replace(/\.[^/.]+$/, '');
    // If title was only the number, restore original without extension
    if (!title) {
      title = name.replace(/\.[^/.]+$/, '');
    }
    return { order: num, cleanTitle: title };
  }

  const cleanTitle = name.replace(/\.[^/.]+$/, '').trim();
  return { order: 9999, cleanTitle };
};

// Sort drive items: numeric prefix first, then alphabetical fallback
export const sortDriveItems = <T extends { name?: string; title?: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const nameA = a.name || a.title || '';
    const nameB = b.name || b.title || '';

    const prefixA = extractNumericPrefix(nameA);
    const prefixB = extractNumericPrefix(nameB);

    if (prefixA.order !== prefixB.order) {
      return prefixA.order - prefixB.order;
    }

    return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
  });
};

// Group flat or nested lesson list into hierarchical modules
export const groupLessonsIntoModules = (lessons: Lesson[]): CourseModule[] => {
  const moduleMap: Map<string, Lesson[]> = new Map();

  lessons.forEach((lesson) => {
    const moduleName = lesson.moduleName || 'Curriculum Lessons';
    if (!moduleMap.has(moduleName)) {
      moduleMap.set(moduleName, []);
    }
    moduleMap.get(moduleName)!.push(lesson);
  });

  const modules: CourseModule[] = [];
  let moduleOrder = 1;

  for (const [title, modLessons] of moduleMap.entries()) {
    modules.push({
      id: `module_${moduleOrder}`,
      title,
      order: moduleOrder++,
      lessons: modLessons.sort((a, b) => a.order - b.order),
    });
  }

  return modules;
};
