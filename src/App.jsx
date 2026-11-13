import { useState, useEffect } from 'react';
import Editor from './components/Editor.jsx';
import Dashboard from './components/Dashboard.jsx';
import { defaultResumeData, defaultSettings } from './data/defaultData.js';
import {
  loadResumesList,
  saveResumesList,
  createResume,
  loadResume,
  saveResume,
  setLastActiveResumeId,
  getLastActiveResumeId,
} from './utils/storageManager.js';

export default function App() {
  // Navigation
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'editor'
  const [activeResumeId, setActiveResumeId] = useState(null);
  const [resumesList, setResumesList] = useState([]);

  // Editor state
  const [resumeData, setResumeData] = useState(defaultResumeData);
  const [settings, setSettings] = useState(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  // Theme
  // Paper is the default ground; dark mode is the inversion, taken only when
  // the system explicitly asks for it.
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') ??
          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  // Load resumes list on mount
  useEffect(() => {
    const list = loadResumesList();
    setResumesList(list);

    // Restore last active resume if exists and no data loaded
    const lastId = getLastActiveResumeId();
    if (lastId && list.find(r => r.id === lastId)) {
      // Don't auto-open editor, just note it for later
      setActiveResumeId(lastId);
    }
  }, []);

  const handleSelectResume = (resumeId, createOptions = null) => {
    if (createOptions) {
      // Create new resume
      const newResume = createResume(
        createOptions.name,
        createOptions.template,
        defaultResumeData,
        defaultSettings
      );
      const newList = loadResumesList();
      setResumesList(newList);
      setActiveResumeId(newResume.id);
      setResumeData(newResume.data);
      setSettings(newResume.settings);
      setView('editor');
      setLastActiveResumeId(newResume.id);
    } else {
      // Load existing resume
      const resume = loadResume(resumeId);
      if (resume) {
        setActiveResumeId(resumeId);
        setResumeData(resume.data);
        setSettings(resume.settings);
        setView('editor');
        setLastActiveResumeId(resumeId);
      }
    }
  };

  const handleSaveResume = async () => {
    if (!activeResumeId) return;
    setIsSaving(true);
    try {
      saveResume(activeResumeId, resumeData, settings);
      const newList = loadResumesList();
      setResumesList(newList);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setActiveResumeId(null);
    // Reload list in case other tabs made changes
    const newList = loadResumesList();
    setResumesList(newList);
  };

  if (view === 'editor' && activeResumeId) {
    return (
      <Editor
        resumeData={resumeData}
        setResumeData={setResumeData}
        settings={settings}
        setSettings={setSettings}
        onBack={handleBackToDashboard}
        theme={theme}
        toggleTheme={toggleTheme}
        onSave={handleSaveResume}
        isSaving={isSaving}
        activeResumeId={activeResumeId}
      />
    );
  }

  return (
    <Dashboard
      resumesList={resumesList}
      onSelectResume={handleSelectResume}
      onUpdate={setResumesList}
      theme={theme}
      toggleTheme={toggleTheme}
      defaultData={defaultResumeData}
      defaultSettings={defaultSettings}
    />
  );
}
