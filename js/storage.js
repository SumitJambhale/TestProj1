/**
 * Storage management using browser localStorage
 */

const STORAGE_KEYS = {
  DRAFT: 'academia_student_reg_draft_v1',
  SUBMISSIONS: 'academia_student_submissions_v1',
  APP_COUNTER: 'academia_app_counter_v1'
};

const StorageService = {
  // Generate a clean application tracking ID
  generateAppId() {
    let count = parseInt(localStorage.getItem(STORAGE_KEYS.APP_COUNTER) || '1040', 10);
    count += 1;
    localStorage.setItem(STORAGE_KEYS.APP_COUNTER, count.toString());
    const year = new Date().getFullYear();
    return `APP-${year}-${count}`;
  },

  // Save draft
  saveDraft(formData) {
    try {
      localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify({
        data: formData,
        savedAt: new Date().toISOString()
      }));
    } catch (err) {
      console.warn('Could not save draft to localStorage:', err);
    }
  },

  // Load draft
  loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DRAFT);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.warn('Could not parse draft:', err);
      return null;
    }
  },

  // Clear draft
  clearDraft() {
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
  },

  // Get all submissions
  getSubmissions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn('Could not read submissions:', err);
      return [];
    }
  },

  // Save a new submission
  saveSubmission(record) {
    const list = this.getSubmissions();
    list.unshift(record);
    try {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
      this.clearDraft();
      return true;
    } catch (err) {
      console.error('Failed to save submission:', err);
      return false;
    }
  },

  // Delete single submission
  deleteSubmission(appId) {
    let list = this.getSubmissions();
    list = list.filter(item => item.appId !== appId);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
    return list;
  },

  // Clear all submissions
  clearAllSubmissions() {
    localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
  }
};
