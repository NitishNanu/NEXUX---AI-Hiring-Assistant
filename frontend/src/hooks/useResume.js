import toast from 'react-hot-toast';
import { uploadResume } from '../api/resume';
import { useAppContext } from '../context/AppContext';

const allowedExtensions = ['pdf', 'docx', 'doc', 'txt'];

function normalizeAts(ats = {}) {
  return {
    score: ats.score ?? ats.ats_score ?? 0,
    level: ats.level ?? ats.match_level ?? 'Pending',
  };
}

export function validateResumeFile(file) {
  const extension = file?.name?.split('.').pop()?.toLowerCase();
  return allowedExtensions.includes(extension);
}

export default function useResume() {
  const { dispatch } = useAppContext();

  async function handleUpload(file) {
    dispatch({ type: 'SET_LOADING_RESUME', payload: true });
    try {
      const data = await uploadResume(file);
      dispatch({
        type: 'SET_RESUME_DATA',
        payload: {
          file,
          rawText: data.raw_text || '',
          parsed: data.parsed || { skills: [], summary: '', experience_years: 0, education: [], projects: [] },
          ats: normalizeAts(data.ats),
          uploadedAt: new Date(),
        },
      });
      toast.success('Resume loaded');
      return data;
    } catch (error) {
      if (error.message?.startsWith('Network error')) {
        toast.error('Network error - is the backend running?');
      } else if (error.status >= 500) {
        toast.error('Server error - try again');
      } else {
        toast.error(error.message || 'Unable to upload resume');
      }
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING_RESUME', payload: false });
    }
  }

  return { handleUpload };
}
