/**
 * localStorage management for multi-resume support
 * Handles all persistence of resume metadata, data, and version history
 */

const STORAGE_KEYS = {
  RESUMES_LIST: 'ressie:resumes',
  RESUME_DATA: (id) => `ressie:resume:${id}`,
  RESUME_VERSIONS: (id) => `ressie:resume:${id}:versions`,
  LAST_ACTIVE_RESUME: 'ressie:lastActiveResumeId',
};

const LEGACY_STORAGE_KEYS = {
  RESUMES_LIST: 'texResumeApp:resumes',
  RESUME_DATA: (id) => `texResumeApp:resume:${id}`,
  RESUME_VERSIONS: (id) => `texResumeApp:resume:${id}:versions`,
  LAST_ACTIVE_RESUME: 'texResumeApp:lastActiveResumeId',
};

function getItemWithLegacy(key, legacyKey) {
  const value = localStorage.getItem(key);
  if (value !== null) return value;

  const legacyValue = localStorage.getItem(legacyKey);
  if (legacyValue !== null) {
    localStorage.setItem(key, legacyValue);
  }
  return legacyValue;
}

// Generate a unique ID (7-char random string)
const uid = () => Math.random().toString(36).slice(2, 9);

/**
 * Load the list of all resume metadata from localStorage
 * @returns {Array} Array of resume metadata objects
 */
export function loadResumesList() {
  try {
    const data = getItemWithLegacy(STORAGE_KEYS.RESUMES_LIST, LEGACY_STORAGE_KEYS.RESUMES_LIST);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error loading resumes list:', err);
    return [];
  }
}

/**
 * Save the entire resumes list to localStorage
 * @param {Array} list - Array of resume metadata objects
 */
export function saveResumesList(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.RESUMES_LIST, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving resumes list:', err);
  }
}

/**
 * Create a new resume with metadata
 * @param {string} name - Resume name (if empty, auto-generate "Resume N")
 * @param {string} template - Template type ('jakes', 'awesomecv', 'deedy')
 * @param {Object} defaultData - Default resume data to use
 * @param {Object} defaultSettings - Default settings to use
 * @returns {Object} Created resume object with id, metadata, data, and settings
 */
export function createResume(name, template, defaultData, defaultSettings) {
  const id = uid();
  const list = loadResumesList();

  // Auto-generate name if empty
  const resumeName = name?.trim() || `Resume ${list.length + 1}`;

  const metadata = {
    id,
    name: resumeName,
    template,
    tags: [],
    pinned: false,
    archived: false,
    createdAt: Date.now(),
    lastEditedAt: Date.now(),
  };

  // Save metadata
  list.push(metadata);
  saveResumesList(list);

  // Save resume data
  const resumeData = JSON.parse(JSON.stringify(defaultData)); // Deep clone
  const settings = JSON.parse(JSON.stringify(defaultSettings)); // Deep clone
  settings.template = template;

  saveResume(id, resumeData, settings);

  return { id, ...metadata, data: resumeData, settings };
}

/**
 * Load resume data and settings
 * @param {string} id - Resume ID
 * @returns {Object} {data, settings} or null if not found
 */
export function loadResume(id) {
  try {
    const data = getItemWithLegacy(STORAGE_KEYS.RESUME_DATA(id), LEGACY_STORAGE_KEYS.RESUME_DATA(id));
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Error loading resume ${id}:`, err);
    return null;
  }
}

/**
 * Save resume data and settings
 * @param {string} id - Resume ID
 * @param {Object} data - Resume data (header, sections)
 * @param {Object} settings - Resume settings (template, fonts, margins)
 */
export function saveResume(id, data, settings) {
  try {
    const payload = { data, settings };
    localStorage.setItem(STORAGE_KEYS.RESUME_DATA(id), JSON.stringify(payload));

    // Update lastEditedAt in metadata
    const list = loadResumesList();
    const resume = list.find(r => r.id === id);
    if (resume) {
      resume.lastEditedAt = Date.now();
      saveResumesList(list);
    }
  } catch (err) {
    console.error(`Error saving resume ${id}:`, err);
  }
}

/**
 * Update resume metadata (name, tags, pinned, archived)
 * @param {string} id - Resume ID
 * @param {Object} updates - Fields to update {name, tags, pinned, archived}
 */
export function updateResumeMeta(id, updates) {
  try {
    const list = loadResumesList();
    const resume = list.find(r => r.id === id);
    if (resume) {
      Object.assign(resume, updates, { lastEditedAt: Date.now() });
      saveResumesList(list);
    }
  } catch (err) {
    console.error(`Error updating resume metadata ${id}:`, err);
  }
}

/**
 * Delete a resume (soft delete - moves to archive)
 * @param {string} id - Resume ID
 */
export function archiveResume(id) {
  updateResumeMeta(id, { archived: true });
}

/**
 * Permanently delete a resume (hard delete)
 * @param {string} id - Resume ID
 */
export function deleteResume(id) {
  try {
    const list = loadResumesList();
    const index = list.findIndex(r => r.id === id);
    if (index !== -1) {
      list.splice(index, 1);
      saveResumesList(list);
    }
    // Also delete the resume data and versions
    localStorage.removeItem(STORAGE_KEYS.RESUME_DATA(id));
    localStorage.removeItem(STORAGE_KEYS.RESUME_VERSIONS(id));
    localStorage.removeItem(LEGACY_STORAGE_KEYS.RESUME_DATA(id));
    localStorage.removeItem(LEGACY_STORAGE_KEYS.RESUME_VERSIONS(id));
  } catch (err) {
    console.error(`Error deleting resume ${id}:`, err);
  }
}

/**
 * Duplicate a resume
 * @param {string} sourceId - Source resume ID
 * @param {string} newName - Name for the duplicate
 * @returns {Object} Duplicated resume object or null if source not found
 */
export function duplicateResume(sourceId, newName) {
  try {
    const sourceData = loadResume(sourceId);
    if (!sourceData) return null;

    const sourceList = loadResumesList();
    const source = sourceList.find(r => r.id === sourceId);
    if (!source) return null;

    const id = uid();
    const list = loadResumesList();

    const metadata = {
      id,
      name: newName || `${source.name} (Copy)`,
      template: source.template,
      tags: [...source.tags],
      pinned: false,
      archived: false,
      createdAt: Date.now(),
      lastEditedAt: Date.now(),
    };

    list.push(metadata);
    saveResumesList(list);

    // Deep clone the data and settings
    const data = JSON.parse(JSON.stringify(sourceData.data));
    const settings = JSON.parse(JSON.stringify(sourceData.settings));

    saveResume(id, data, settings);

    return { id, ...metadata, data, settings };
  } catch (err) {
    console.error(`Error duplicating resume ${sourceId}:`, err);
    return null;
  }
}

/**
 * Get the last active resume ID
 * @returns {string|null} Resume ID or null
 */
export function getLastActiveResumeId() {
  return getItemWithLegacy(STORAGE_KEYS.LAST_ACTIVE_RESUME, LEGACY_STORAGE_KEYS.LAST_ACTIVE_RESUME);
}

/**
 * Set the last active resume ID
 * @param {string} id - Resume ID
 */
export function setLastActiveResumeId(id) {
  if (id) {
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_RESUME, id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVE_RESUME);
  }
}

/**
 * Export resume as JSON
 * @param {string} id - Resume ID
 * @returns {string} JSON string
 */
export function exportResumeJSON(id) {
  try {
    const list = loadResumesList();
    const metadata = list.find(r => r.id === id);
    const resume = loadResume(id);

    if (!metadata || !resume) return null;

    const exportData = {
      metadata,
      ...resume,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(exportData, null, 2);
  } catch (err) {
    console.error(`Error exporting resume ${id}:`, err);
    return null;
  }
}

/**
 * Check localStorage quota usage
 * @returns {Object} {used, total, percentage}
 */
export function getStorageQuota() {
  try {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    // Rough estimate: localStorage limit is ~5-10MB (varies by browser)
    const estimatedLimit = 10 * 1024 * 1024; // 10MB
    const percentage = (totalSize / estimatedLimit) * 100;
    return {
      used: totalSize,
      total: estimatedLimit,
      percentage: Math.round(percentage),
    };
  } catch (err) {
    console.error('Error checking storage quota:', err);
    return null;
  }
}
