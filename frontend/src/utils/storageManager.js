/**
 * localStorage management for multi-resume support
 * Handles all persistence of resume metadata, data, and version history
 */

import { loadVersions } from './versionManager.js';

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

/**
 * Validate imported JSON against expected schema
 * @param {Object} obj - JSON object to validate
 * @param {string} type - 'single' | 'backup' - what type of export this is
 * @returns {Object} {isValid: boolean, errors: string[]}
 */
export function validateResumeJSON(obj, type = 'single') {
  const errors = [];

  if (!obj || typeof obj !== 'object') {
    errors.push('Input must be a valid JSON object');
    return { isValid: false, errors };
  }

  if (type === 'single') {
    // Check required top-level fields
    if (!obj.metadata) errors.push('Missing required field: metadata');
    if (!obj.data) errors.push('Missing required field: data');
    if (!obj.settings) errors.push('Missing required field: settings');

    // Validate metadata
    if (obj.metadata) {
      if (!obj.metadata.name || typeof obj.metadata.name !== 'string') {
        errors.push('metadata.name must be a non-empty string');
      }
      if (!obj.metadata.template) {
        errors.push('metadata.template is required');
      }
      const validTemplates = ['jakes', 'awesomecv', 'deedy'];
      if (!validTemplates.includes(obj.metadata.template)) {
        errors.push(`metadata.template must be one of: ${validTemplates.join(', ')}`);
      }
    }

    // Validate data structure
    if (obj.data) {
      if (!('header' in obj.data)) errors.push('data.header is required');
      if (!Array.isArray(obj.data.sections)) {
        errors.push('data.sections must be an array');
      }
    }

    // Validate settings
    if (obj.settings) {
      if (!obj.settings.template) {
        errors.push('settings.template is required');
      }
    }
  } else if (type === 'backup') {
    if (!obj.version) errors.push('Missing backup version field');
    if (!obj.exportedAt) errors.push('Missing exportedAt timestamp');
    if (!Array.isArray(obj.resumes)) {
      errors.push('resumes must be an array');
    } else {
      obj.resumes.forEach((resume, idx) => {
        if (!resume.metadata || !resume.data || !resume.settings) {
          errors.push(`Resume ${idx}: missing required fields (metadata, data, settings)`);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Import a single resume from exported JSON
 * @param {Object} jsonData - Parsed JSON from exported file
 * @returns {string|null} New resume ID if successful, null on failure
 */
export function importResumeJSON(jsonData) {
  try {
    // Validate structure
    const validation = validateResumeJSON(jsonData, 'single');
    if (!validation.isValid) {
      console.error('Validation errors:', validation.errors);
      throw new Error(validation.errors[0]);
    }

    // Generate new ID for imported resume
    const newId = uid();

    // Prepare metadata with new ID and timestamps
    const metadata = {
      ...jsonData.metadata,
      id: newId,
      createdAt: Date.now(),
      lastEditedAt: Date.now(),
      pinned: false, // Always default to unpinned
      archived: false, // Always default to not archived
    };

    // Update resumes list
    const list = loadResumesList();
    list.push(metadata);
    saveResumesList(list);

    // Save resume data with new ID
    const resumeData = JSON.parse(JSON.stringify(jsonData.data));
    const settings = JSON.parse(JSON.stringify(jsonData.settings));
    settings.template = metadata.template; // Ensure template consistency

    saveResume(newId, resumeData, settings);

    // Optionally import versions if they exist
    if (jsonData.versions && Array.isArray(jsonData.versions)) {
      try {
        const versionsStorage = jsonData.versions.map(v => ({
          ...v,
          versionId: uid(), // Generate new version IDs
        }));
        localStorage.setItem(
          STORAGE_KEYS.RESUME_VERSIONS(newId),
          JSON.stringify(versionsStorage)
        );
      } catch (versionErr) {
        // Soft error: resume imported successfully, but versions failed
        console.warn('Could not import versions:', versionErr);
      }
    }

    return newId;
  } catch (err) {
    console.error('Error importing resume:', err);
    return null;
  }
}

/**
 * Export entire app backup (all resumes + metadata + version history)
 * @returns {string|null} JSON string of backup, null on error
 */
export function exportFullBackup() {
  try {
    const list = loadResumesList();
    const backupData = {
      version: '1.0', // Backup format version for future migrations
      exportedAt: new Date().toISOString(),
      resumes: [],
    };

    list.forEach(metadata => {
      const resume = loadResume(metadata.id);
      if (!resume) {
        console.warn(`Could not load resume ${metadata.id}`);
        return;
      }

      const versions = loadVersions(metadata.id);

      backupData.resumes.push({
        metadata,
        data: resume.data,
        settings: resume.settings,
        versions: versions.length > 0 ? versions : undefined, // Omit if empty
      });
    });

    return JSON.stringify(backupData, null, 2);
  } catch (err) {
    console.error('Error exporting backup:', err);
    return null;
  }
}

/**
 * Import entire backup, restoring all resumes and version history
 * @param {Object} backupData - Parsed backup JSON
 * @param {Object} options - {skipVersions: false, overwriteExisting: false}
 * @returns {Object} {success: boolean, message: string, importedCount: number, errors: string[]}
 */
export function importFullBackup(backupData, options = {}) {
  const {
    skipVersions = false,
    overwriteExisting = false, // Not implemented yet, reserved for future
  } = options;

  const result = {
    success: false,
    message: '',
    importedCount: 0,
    errors: [],
  };

  try {
    // Validate backup structure
    const validation = validateResumeJSON(backupData, 'backup');
    if (!validation.isValid) {
      result.message = validation.errors[0];
      result.errors = validation.errors;
      return result;
    }

    // Import each resume in the backup
    backupData.resumes.forEach((resumeItem, idx) => {
      try {
        // Prepare single resume export format
        const singleExport = {
          metadata: resumeItem.metadata,
          data: resumeItem.data,
          settings: resumeItem.settings,
          versions: skipVersions ? undefined : resumeItem.versions,
        };

        const importedId = importResumeJSON(singleExport);
        if (importedId) {
          result.importedCount++;
        } else {
          result.errors.push(`Resume ${idx}: Failed to import`);
        }
      } catch (err) {
        result.errors.push(`Resume ${idx}: ${err.message}`);
      }
    });

    result.success = result.importedCount > 0;
    result.message = result.importedCount === backupData.resumes.length
      ? 'All resumes imported successfully'
      : `Imported ${result.importedCount} of ${backupData.resumes.length} resumes`;

    return result;
  } catch (err) {
    result.message = err.message;
    result.errors.push(err.message);
    return result;
  }
}
