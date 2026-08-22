import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, BookOpen } from 'lucide-react';
import { Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { getUserCertificates } from '../../services/firebase/firestoreService';
import { CertificateView } from '../../components/analytics/CertificateView';
import type { Certificate } from '../../types';

export const CertificatesPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile?.uid) {
      setLoading(true);
      getUserCertificates(userProfile.uid)
        .then(setCertificates)
        .finally(() => setLoading(false));
    }
  }, [userProfile?.uid]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Verifiable Certificates of Completion
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Certificates awarded upon reaching 100% video lesson completion for courses in your curriculum.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500">Loading certificates...</div>
      ) : certificates.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No certificates yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Complete all lessons in any course to automatically generate your verified completion certificate.
            </p>
          </div>
          <Button
            variant="contained"
            onClick={() => navigate('/courses')}
            startIcon={<BookOpen className="w-4 h-4" />}
          >
            Browse Courses
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {certificates.map((cert) => (
            <CertificateView key={cert.id} certificate={cert} />
          ))}
        </div>
      )}
    </div>
  );
};
