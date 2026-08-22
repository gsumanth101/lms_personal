import type { Course, Lesson } from '../../types';
import {
  detectFileType,
  extractNumericPrefix,
  isThumbnailImage,
  sortDriveItems,
  groupLessonsIntoModules,
} from './courseParser';
import { setCachedData } from './driveCache';

const ROOT_FOLDER_CONFIG_KEY = 'learnos_google_drive_root_folder_id';
export const DEFAULT_ROOT_ID =
  import.meta.env.VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID || '';

const GOOGLE_API_KEY =
  import.meta.env.VITE_GOOGLE_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY ||
  '';


export const getRootCourseFolderId = (): string => {
  return localStorage.getItem(ROOT_FOLDER_CONFIG_KEY) || DEFAULT_ROOT_ID;
};

export const setRootCourseFolderId = (folderId: string): void => {
  localStorage.setItem(ROOT_FOLDER_CONFIG_KEY, folderId.trim());
};

// Interface for Drive API v3 File resource
export interface DriveApiFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  parents?: string[];
  thumbnailLink?: string;
}

interface DriveFileListResponse {
  files: DriveApiFile[];
  nextPageToken?: string;
}

// Perform request against Google Drive API v3 via OAuth Token or Google API Key
export const fetchDriveFiles = async (
  query: string,
  accessToken?: string,
  fields: string = 'nextPageToken, files(id, name, mimeType, size, webViewLink, webContentLink, createdTime, modifiedTime, thumbnailLink)'
): Promise<DriveApiFile[]> => {
  const token = accessToken;

  const allFiles: DriveApiFile[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL('https://www.googleapis.com/drive/v3/files');
    url.searchParams.set('q', query);
    url.searchParams.set('fields', fields);
    url.searchParams.set('pageSize', '100');
    url.searchParams.set('supportsAllDrives', 'true');
    url.searchParams.set('includeItemsFromAllDrives', 'true');

    if (!token && GOOGLE_API_KEY) {
      url.searchParams.set('key', GOOGLE_API_KEY);
    }

    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), {
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const statusCode = response.status;
      const message = errorBody?.error?.message || response.statusText;

      if (statusCode === 401) {
        throw new Error('Your Google authorization session has expired. Please click "Authorize Google Account" below to re-authenticate.');
      }
      if (statusCode === 403) {
        if (!token) {
          throw new Error(
            'Google Drive API requires authorization or your folder needs to be set to "Anyone with the link (Viewer)". Click "Authorize with Google" below to grant read access.'
          );
        }
        throw new Error(
          'Unable to access the configured course folder. Please verify that the folder in Google Drive is shared with "Anyone with the link" or that your Google account has Viewer/Editor permissions.'
        );
      }
      if (statusCode === 404) {
        throw new Error('The configured course root folder ID could not be found in Google Drive.');
      }
      throw new Error(`Google Drive API error (${statusCode}): ${message}`);
    }

    const data: DriveFileListResponse = await response.json();
    if (data.files && data.files.length) {
      allFiles.push(...data.files);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return allFiles;
};

// Retrieve all course child folders from the configured root folder
export const getChildFolders = async (parentFolderId: string, accessToken?: string): Promise<DriveApiFile[]> => {
  const query = `'${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  return fetchDriveFiles(query, accessToken);
};

// Retrieve all files within a course folder
export const getFolderContents = async (folderId: string, accessToken?: string): Promise<DriveApiFile[]> => {
  const query = `'${folderId}' in parents and trashed = false`;
  return fetchDriveFiles(query, accessToken);
};

// Primary Course Discovery Engine
export const discoverCoursesAndLessons = async (
  onProgress?: (step: string, percent: number) => void,
  customToken?: string
): Promise<{ courses: Course[]; lessonsByCourse: Record<string, Lesson[]> }> => {
  const rootId = getRootCourseFolderId();
  const token = customToken;

  onProgress?.('Connecting to Google Drive API v3...', 10);
  const courseFolders = await getChildFolders(rootId, token || undefined);

  if (!courseFolders.length) {
    onProgress?.('No course folders found in root folder.', 100);
    return { courses: [], lessonsByCourse: {} };
  }

  onProgress?.(`Found ${courseFolders.length} course folders. Scanning lessons...`, 30);

  const courses: Course[] = [];
  const lessonsByCourse: Record<string, Lesson[]> = {};
  const totalFolders = courseFolders.length;

  for (let i = 0; i < totalFolders; i++) {
    const folder = courseFolders[i];
    const folderItems = await getFolderContents(folder.id, token || undefined);

    let thumbnail = '';
    const lessons: Lesson[] = [];
    const submodules: DriveApiFile[] = [];

    // Check items inside course folder
    for (const item of folderItems) {
      if (item.mimeType === 'application/vnd.google-apps.folder') {
        submodules.push(item);
      } else if (isThumbnailImage(item.name)) {
        thumbnail = item.thumbnailLink || item.webViewLink || '';
      } else {
        const fileType = detectFileType(item.mimeType, item.name);
        const { order, cleanTitle } = extractNumericPrefix(item.name);

        lessons.push({
          id: `lesson_${item.id}`,
          courseId: `course_${folder.id}`,
          driveFileId: item.id,
          title: cleanTitle,
          order,
          mimeType: item.mimeType,
          fileType,
          size: item.size ? parseInt(item.size, 10) : undefined,
          webViewLink: item.webViewLink,
          streamUrl: `https://drive.google.com/file/d/${item.id}/preview`,
          createdTime: item.createdTime,
          modifiedTime: item.modifiedTime,
          moduleName: 'General Curriculum',
        });
      }
    }

    // If there are submodules (e.g. Course -> Module 01 -> Lessons)
    if (submodules.length > 0) {
      for (const sub of submodules) {
        const subItems = await getFolderContents(sub.id, token || undefined);
        for (const item of subItems) {
          if (isThumbnailImage(item.name)) {
            thumbnail = item.thumbnailLink || thumbnail;
          } else if (item.mimeType !== 'application/vnd.google-apps.folder') {
            const fileType = detectFileType(item.mimeType, item.name);
            const { order, cleanTitle } = extractNumericPrefix(item.name);

            lessons.push({
              id: `lesson_${item.id}`,
              courseId: `course_${folder.id}`,
              driveFileId: item.id,
              title: cleanTitle,
              order,
              mimeType: item.mimeType,
              fileType,
              size: item.size ? parseInt(item.size, 10) : undefined,
              webViewLink: item.webViewLink,
              streamUrl: `https://drive.google.com/file/d/${item.id}/preview`,
              createdTime: item.createdTime,
              modifiedTime: item.modifiedTime,
              moduleName: sub.name,
            });
          }
        }
      }
    }

    // Sort lessons deterministically by numeric prefix
    const sortedLessons = sortDriveItems(lessons);
    const courseId = `course_${folder.id}`;
    const { cleanTitle: courseTitle } = extractNumericPrefix(folder.name);

    const videoLessons = sortedLessons.filter((l) => l.fileType === 'VIDEO');

    const course: Course = {
      id: courseId,
      driveFolderId: folder.id,
      title: courseTitle || folder.name,
      description: `Complete course for ${courseTitle || folder.name} with lessons and learning materials.`,
      thumbnail: thumbnail || '',
      category: getCategoryForCourse(folder.name),
      level: 'Intermediate',
      instructor: {
        name: 'Course Instructor',
      },
      totalLessons: videoLessons.length || sortedLessons.length,
      totalDuration: (videoLessons.length || sortedLessons.length) * 1200,
      lastSynced: new Date().toISOString(),
      published: true,
      tags: [folder.name, 'Google Drive'],
      modules: groupLessonsIntoModules(sortedLessons),
      lessons: sortedLessons,
    };

    courses.push(course);
    lessonsByCourse[courseId] = sortedLessons;

    const pct = Math.round(30 + ((i + 1) / totalFolders) * 60);
    onProgress?.(`Parsed ${i + 1}/${totalFolders}: ${course.title}`, pct);
  }

  onProgress?.('Finalizing course metadata cache...', 98);
  setCachedData('discovered_courses', courses);
  setCachedData('discovered_lessons', lessonsByCourse);
  onProgress?.('Google Drive synchronization complete!', 100);

  return { courses, lessonsByCourse };
};

const getCategoryForCourse = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('react') || lower.includes('vue') || lower.includes('frontend') || lower.includes('javascript') || lower.includes('css')) {
    return 'Frontend & UI';
  }
  if (lower.includes('python') || lower.includes('django') || lower.includes('flask') || lower.includes('fastapi')) {
    return 'Backend & Systems';
  }
  if (lower.includes('machine') || lower.includes('ai') || lower.includes('deep') || lower.includes('neural') || lower.includes('llm')) {
    return 'Machine Learning & AI';
  }
  if (lower.includes('data') || lower.includes('pandas') || lower.includes('numpy') || lower.includes('analytics')) {
    return 'Data Science';
  }
  if (lower.includes('java') || lower.includes('spring') || lower.includes('c#') || lower.includes('.net')) {
    return 'Enterprise Development';
  }
  return 'General Engineering';
};

export const syncCoursesFromDrive = async (
  folderId?: string,
  token?: string | null
): Promise<{ courses: Course[]; lessonsByCourse: Record<string, Lesson[]> }> => {
  if (folderId) {
    setRootCourseFolderId(folderId);
  }
  return discoverCoursesAndLessons(undefined, token || undefined);
};
