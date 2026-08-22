import React, { useState } from 'react';
import { Avatar, Chip, Button, TextField, MenuItem, Select, FormControl, InputLabel, Alert } from '@mui/material';
import { Mail, Flame, Zap, BookOpen, ShieldCheck, Edit2, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLearning } from '../../contexts/LearningContext';

export const ProfilePage: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const { courses, enrollments } = useLearning();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>(userProfile?.displayName || '');
  const [bio, setBio] = useState<string>(userProfile?.bio || '');
  const [learningLevel, setLearningLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(
    userProfile?.learningLevel || 'intermediate'
  );
  const [dailyTarget, setDailyTarget] = useState<number>(userProfile?.dailyLearningTarget || 45);
  const [timezone, setTimezone] = useState<string>(
    userProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const enrolled = courses.filter((c) => enrollments[c.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      displayName: displayName.trim() || 'Learner',
      bio: bio.trim() || undefined,
      learningLevel,
      dailyLearningTarget: Number(dailyTarget) || 45,
      timezone,
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {saveSuccess && (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          Profile updated successfully!
        </Alert>
      )}

      {/* Profile Header Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <Avatar
            src={userProfile?.photoURL}
            alt={userProfile?.displayName}
            sx={{ width: 96, height: 96, bgcolor: '#4648d4', fontSize: '2.5rem', fontWeight: 800 }}
          >
            {userProfile?.displayName?.charAt(0) || 'U'}
          </Avatar>

          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {userProfile?.displayName || 'Learner'}
              </h1>
              <Chip
                label="STUDENT"
                color="primary"
                size="small"
                sx={{ fontWeight: 800, fontSize: '0.7rem' }}
              />
            </div>

            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
              <Mail className="w-3.5 h-3.5" />
              {userProfile?.email || 'learner@learnos.ai'}
            </p>

            {userProfile?.bio && (
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md pt-1">
                {userProfile.bio}
              </p>
            )}

            <div className="pt-3 flex items-center justify-center sm:justify-start gap-6 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <strong>{userProfile?.currentStreak || 0}d</strong> Streak
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-500" />
                <strong>{userProfile?.xp?.toLocaleString() || '0'}</strong> XP (Level {userProfile?.level || 1})
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <strong>{userProfile?.completedCoursesCount || 0}</strong> Certified
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setIsEditing(!isEditing);
            setDisplayName(userProfile?.displayName || '');
            setBio(userProfile?.bio || '');
          }}
          startIcon={<Edit2 className="w-3.5 h-3.5" />}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      {/* Edit Profile Form */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
        >
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Profile Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Full Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              size="small"
              fullWidth
              required
            />

            <FormControl fullWidth size="small">
              <InputLabel>Experience Level</InputLabel>
              <Select
                value={learningLevel}
                label="Experience Level"
                onChange={(e) => setLearningLevel(e.target.value as any)}
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Daily Learning Target (Minutes)"
              type="number"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(Number(e.target.value))}
              size="small"
              fullWidth
            />

            <TextField
              label="Timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              size="small"
              fullWidth
              helperText="Used for accurate streak calculation"
            />
          </div>

          <TextField
            label="Bio / Learning Goals"
            multiline
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            size="small"
            fullWidth
            placeholder="Tell us about your learning objectives..."
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      )}

      {/* Enrolled Courses Summary */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <span>Enrolled Curriculums ({enrolled.length})</span>
        </h3>

        {enrolled.length === 0 ? (
          <p className="text-xs text-slate-500">No courses enrolled yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {enrolled.map((c) => {
              const enroll = enrollments[c.id];
              return (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3.5"
                >
                  {c.thumbnail ? (
                    <img src={c.thumbnail} alt={c.title} className="w-14 h-14 rounded-xl object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{c.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{enroll?.progress || 0}% Completed</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
