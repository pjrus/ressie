import html2canvas from 'html2canvas';
import { loadResumesList, updateResumeMeta } from './storageManager';

/**
 * Captures the PDF viewer as a low-quality thumbnail image
 * @param {React.RefObject} pdfViewerRef - Reference to the PdfViewer container
 * @param {number} quality - Canvas quality (0-1, default 0.3 for low quality)
 * @returns {Promise<string>} Base64 data URL of the thumbnail, or null if capture fails
 */
export async function capturePdfThumbnail(pdfViewerRef, quality = 0.3) {
  try {
    if (!pdfViewerRef?.current) {
      console.warn('PdfViewer ref is not available for thumbnail capture');
      return null;
    }

    const element = pdfViewerRef.current;

    // Capture the PDF viewer element with low quality
    const canvas = await html2canvas(element, {
      allowTaint: true,
      useCORS: true,
      logging: false,
      scale: 1, // 1x scale to reduce size
      backgroundColor: '#ffffff',
    });

    // Convert to JPEG with low quality to reduce file size
    const base64Data = canvas.toDataURL('image/jpeg', quality);
    return base64Data;
  } catch (error) {
    console.error('Failed to capture PDF thumbnail:', error);
    return null;
  }
}

/**
 * Saves a thumbnail to a resume in localStorage
 * @param {string} resumeId - The resume ID
 * @param {string} base64Data - The base64 data URL of the thumbnail
 */
export function saveThumbnail(resumeId, base64Data) {
  try {
    if (!base64Data) return;

    const resumes = loadResumesList();
    const resumeIndex = resumes.findIndex(r => r.id === resumeId);

    if (resumeIndex !== -1) {
      resumes[resumeIndex].thumbnail = base64Data;
      localStorage.setItem('texResumeApp:resumes', JSON.stringify(resumes));
      console.log(`Thumbnail saved for resume ${resumeId}`);
    }
  } catch (error) {
    console.error('Failed to save thumbnail:', error);
  }
}

/**
 * Retrieves a thumbnail from a resume
 * @param {string} resumeId - The resume ID
 * @returns {string|null} Base64 data URL of the thumbnail, or null if not found
 */
export function getThumbnail(resumeId) {
  try {
    const resumes = loadResumesList();
    const resume = resumes.find(r => r.id === resumeId);
    return resume?.thumbnail || null;
  } catch (error) {
    console.error('Failed to get thumbnail:', error);
    return null;
  }
}

/**
 * Clears a thumbnail from a resume
 * @param {string} resumeId - The resume ID
 */
export function clearThumbnail(resumeId) {
  try {
    const resumes = loadResumesList();
    const resumeIndex = resumes.findIndex(r => r.id === resumeId);

    if (resumeIndex !== -1) {
      delete resumes[resumeIndex].thumbnail;
      localStorage.setItem('texResumeApp:resumes', JSON.stringify(resumes));
    }
  } catch (error) {
    console.error('Failed to clear thumbnail:', error);
  }
}

/**
 * Captures and saves a thumbnail in one operation
 * @param {React.RefObject} pdfViewerRef - Reference to the PdfViewer container
 * @param {string} resumeId - The resume ID
 * @param {number} quality - Canvas quality (0-1)
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function captureAndSaveThumbnail(pdfViewerRef, resumeId, quality = 0.3) {
  try {
    const base64Data = await capturePdfThumbnail(pdfViewerRef, quality);
    if (base64Data) {
      saveThumbnail(resumeId, base64Data);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to capture and save thumbnail:', error);
    return false;
  }
}
