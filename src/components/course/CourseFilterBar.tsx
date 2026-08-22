import React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import {
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  IconButton,
} from '@mui/material';

interface CourseFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedLevel: string;
  onLevelChange: (lvl: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  layout: 'grid' | 'list';
  onLayoutChange: (l: 'grid' | 'list') => void;
}

const CATEGORIES = [
  'All Courses',
  'Frontend & UI',
  'Backend & Systems',
  'Artificial Intelligence',
  'Data Science',
  'Enterprise & Backend',
];

export const CourseFilterBar: React.FC<CourseFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedLevel,
  onLevelChange,
  sortBy,
  onSortChange,
  layout,
  onLayoutChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Top row: Search input, Level selector, Sort selector, Grid/List toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <TextField
            fullWidth
            size="small"
            placeholder="Search by course title, keywords, or topics..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="w-4 h-4 text-slate-400" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Difficulty Level Dropdown */}
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select
              value={selectedLevel}
              onChange={(e) => onLevelChange(e.target.value)}
              displayEmpty
            >
              <MenuItem value="All">All Levels</MenuItem>
              <MenuItem value="Beginner">Beginner</MenuItem>
              <MenuItem value="Intermediate">Intermediate</MenuItem>
              <MenuItem value="Advanced">Advanced</MenuItem>
            </Select>
          </FormControl>

          {/* Sort By Dropdown */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              displayEmpty
            >
              <MenuItem value="featured">Featured First</MenuItem>
              <MenuItem value="newest">Newly Synced</MenuItem>
              <MenuItem value="duration_asc">Shortest First</MenuItem>
              <MenuItem value="duration_desc">Longest First</MenuItem>
            </Select>
          </FormControl>

          {/* Grid / List View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <IconButton
              size="small"
              onClick={() => onLayoutChange('grid')}
              color={layout === 'grid' ? 'primary' : 'default'}
              sx={{ p: 0.75 }}
            >
              <LayoutGrid className="w-4 h-4" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onLayoutChange('list')}
              color={layout === 'list' ? 'primary' : 'default'}
              sx={{ p: 0.75 }}
            >
              <List className="w-4 h-4" />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 subtle-scroll">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
