/**
 * Version history management for resumes
 * Handles auto-saving versions and restoring from history
 */

const uid = () => Math.random().toString(36).slice(2, 9);

const STORAGE_KEYS = {
  RESUME_VERSIONS: (id) => `texResumeApp:resume:${id}:versions`,
};

/**
 * Save a version of the resume
 * @param {string} resumeId - Resume ID
 * @param {Object} data - Resume data
 * @param {Object} settings - Resume settings
 * @param {string} label - Optional label for this version
 * @param {boolean} isManual - Whether this is a manual save (user-initiated)
 */
export function saveVersion(resumeId, data, settings, label = '', isManual = false) {
  try {
    const versions = loadVersions(resumeId);

    const version = {
      versionId: uid(),
      timestamp: Date.now(),
      data: JSON.parse(JSON.stringify(data)), // Deep clone
      settings: JSON.parse(JSON.stringify(settings)), // Deep clone
      label: label || (isManual ? `Manual save ${new Date().toLocaleTimeString()}` : `Auto-save ${new Date().toLocaleTimeString()}`),
      isManual,
    };

    versions.push(version);

    // Keep only the 20 most recent versions
    pruneVersions(resumeId, versions);

    localStorage.setItem(STORAGE_KEYS.RESUME_VERSIONS(resumeId), JSON.stringify(versions));
    return version;
  } catch (err) {
    console.error(`Error saving version for resume ${resumeId}:`, err);
    return null;
  }
}

/**
 * Load all versions for a resume
 * @param {string} resumeId - Resume ID
 * @returns {Array} Array of version objects
 */
export function loadVersions(resumeId) {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESUME_VERSIONS(resumeId));
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error(`Error loading versions for resume ${resumeId}:`, err);
    return [];
  }
}

/**
 * Restore a specific version of a resume
 * @param {string} resumeId - Resume ID
 * @param {string} versionId - Version ID to restore
 * @returns {Object} {data, settings} from the restored version
 */
export function restoreVersion(resumeId, versionId) {
  try {
    const versions = loadVersions(resumeId);
    const version = versions.find(v => v.versionId === versionId);

    if (!version) {
      console.warn(`Version ${versionId} not found`);
      return null;
    }

    return {
      data: JSON.parse(JSON.stringify(version.data)),
      settings: JSON.parse(JSON.stringify(version.settings)),
    };
  } catch (err) {
    console.error(`Error restoring version ${versionId}:`, err);
    return null;
  }
}

/**
 * Delete a specific version
 * @param {string} resumeId - Resume ID
 * @param {string} versionId - Version ID to delete
 */
export function deleteVersion(resumeId, versionId) {
  try {
    const versions = loadVersions(resumeId);
    const index = versions.findIndex(v => v.versionId === versionId);

    if (index !== -1) {
      versions.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.RESUME_VERSIONS(resumeId), JSON.stringify(versions));
    }
  } catch (err) {
    console.error(`Error deleting version ${versionId}:`, err);
  }
}

/**
 * Prune old versions, keeping only the N most recent
 * @param {string} resumeId - Resume ID
 * @param {Array} versions - Optional versions array (if not provided, loads from storage)
 * @param {number} maxCount - Maximum versions to keep (default: 20)
 */
export function pruneVersions(resumeId, versions = null, maxCount = 20) {
  try {
    const verList = versions || loadVersions(resumeId);

    if (verList.length > maxCount) {
      // Keep only the most recent maxCount versions
      const pruned = verList.slice(-maxCount);
      localStorage.setItem(STORAGE_KEYS.RESUME_VERSIONS(resumeId), JSON.stringify(pruned));
      return pruned;
    }

    return verList;
  } catch (err) {
    console.error(`Error pruning versions for resume ${resumeId}:`, err);
    return [];
  }
}

/**
 * Clear all versions for a resume
 * @param {string} resumeId - Resume ID
 */
export function clearVersions(resumeId) {
  try {
    localStorage.removeItem(STORAGE_KEYS.RESUME_VERSIONS(resumeId));
  } catch (err) {
    console.error(`Error clearing versions for resume ${resumeId}:`, err);
  }
}
