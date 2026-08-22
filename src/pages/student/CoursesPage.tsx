import React, { useState } from 'react';
import { useLearning } from '../../contexts/LearningContext';
import { CourseFilterBar } from '../../components/course/CourseFilterBar';
import { CourseCard } from '../../components/course/CourseCard';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const CoursesPage: React.FC = () => {
  const { courses, enrollments, loadingCourses } = useLearning();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Courses');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  if (loadingCourses) {
    return <LoadingSkeleton type="courses" />;
  }

  // Filter and Sort Courses
  let filtered = courses.filter((course) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = course.title.toLowerCase().includes(q);
      const matchDesc = course.description?.toLowerCase().includes(q);
      const matchCat = course.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    // Category
    if (selectedCategory !== 'All Courses' && course.category !== selectedCategory) {
      return false;
    }

    // Level
    if (selectedLevel !== 'All' && course.level !== selectedLevel) {
      return false;
    }

    return true;
  });

  // Sort
  if (sortBy === 'duration_asc') {
    filtered.sort((a, b) => a.totalDuration - b.totalDuration);
  } else if (sortBy === 'duration_desc') {
    filtered.sort((a, b) => b.totalDuration - a.totalDuration);
  } else if (sortBy === 'newest') {
    filtered.sort((a, b) => (b.lastSynced || '').localeCompare(a.lastSynced || ''));
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Explore Course Catalog
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Showing {filtered.length} available courses and comprehensive curricula.
        </p>
      </div>

      {/* Filter Bar */}
      <CourseFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        sortBy={sortBy}
        onSortChange={setSortBy}
        layout={layout}
        onLayoutChange={setLayout}
      />

      {/* Course List / Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title="No courses matched your filter"
          description="Try adjusting your keywords, category, or difficulty level filters."
          actionText="Clear All Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('All Courses');
            setSelectedLevel('All');
          }}
        />
      ) : layout === 'list' ? (
        <div className="space-y-4">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              enrollment={enrollments[course.id]}
              layout="list"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              enrollment={enrollments[course.id]}
              layout="grid"
            />
          ))}
        </div>
      )}
    </div>
  );
};
