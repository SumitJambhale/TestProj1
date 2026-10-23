/**
 * Main Application Controller for AcademiaPortal Student Registration
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    currentStep: 1,
    appId: StorageService.generateAppId(),
    uploadedPhotoData: null
  };

  // DOM Elements
  const form = document.getElementById('registrationForm');
  const stepElements = {
    1: document.getElementById('step1'),
    2: document.getElementById('step2'),
    3: document.getElementById('step3')
  };
  const stepButtons = document.querySelectorAll('.stepper .step');
  const appIdDisplay = document.getElementById('appIdDisplay');
  const draftStatus = document.getElementById('draftStatus');
  const submissionCountBadge = document.getElementById('submissionCountBadge');

  // Photo Upload Elements
  const photoInput = document.getElementById('studentPhoto');
  const avatarPreview = document.getElementById('avatarPreview');
  const avatarPlaceholder = document.getElementById('avatarPlaceholder');
  const removePhotoBtn = document.getElementById('removePhotoBtn');

  // Modals
  const successModal = document.getElementById('successModal');
  const submissionsModal = document.getElementById('submissionsModal');

  // Initialize
  init();

  function init() {
    appIdDisplay.textContent = state.appId;
    updateSubmissionsBadge();
    ValidationService.bindLiveClear(form);
    setupEventListeners();
    tryRestoreDraft();
  }

  function setupEventListeners() {
    // Stepper header navigation
    stepButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetStep = parseInt(btn.dataset.step, 10);
        if (targetStep < state.currentStep) {
          goToStep(targetStep);
        } else if (targetStep === 2 && state.currentStep === 1) {
          if (ValidationService.validateStep1(form)) goToStep(2);
        } else if (targetStep === 3) {
          if (state.currentStep === 1 && !ValidationService.validateStep1(form)) return;
          if (ValidationService.validateStep2(form)) goToStep(3);
        }
      });
    });

    // Step 1 buttons
    document.getElementById('goToStep2Btn').addEventListener('click', () => {
      if (ValidationService.validateStep1(form)) {
        goToStep(2);
      } else {
        showToast('Please correct highlighted personal details before continuing.', 'error');
      }
    });

    document.getElementById('clearFormBtn').addEventListener('click', () => {
      if (confirm('Are you sure you want to clear the entire form?')) {
        form.reset();
        clearPhoto();
        StorageService.clearDraft();
        showToast('Form cleared.', 'info');
      }
    });

    // Step 2 buttons
    document.getElementById('backToStep1Btn').addEventListener('click', () => {
      goToStep(1);
    });

    document.getElementById('goToStep3Btn').addEventListener('click', () => {
      if (ValidationService.validateStep2(form)) {
        populateReviewSection();
        goToStep(3);
      } else {
        showToast('Please complete all required academic fields.', 'error');
      }
    });

    // Step 3 edit quick-jump buttons
    document.getElementById('editPersonalBtn').addEventListener('click', () => goToStep(1));
    document.getElementById('editParentBtn').addEventListener('click', () => goToStep(1));
    document.getElementById('editAcademicBtn').addEventListener('click', () => goToStep(2));
    document.getElementById('backToStep2Btn').addEventListener('click', () => goToStep(2));

    // Form submission
    form.addEventListener('submit', handleFinalSubmit);

    // Photo input handling
    photoInput.addEventListener('change', handlePhotoSelect);
    removePhotoBtn.addEventListener('click', clearPhoto);

    // Auto-save draft on user typing
    form.addEventListener('input', debounce(autoSaveCurrentDraft, 500));
    form.addEventListener('change', debounce(autoSaveCurrentDraft, 500));

    // Quick demo fill
    document.getElementById('quickFillBtn').addEventListener('click', fillDemoData);

    // Submissions modal triggers
    document.getElementById('viewRecordsBtn').addEventListener('click', openSubmissionsModal);
    document.getElementById('closeSubmissionsModal').addEventListener('click', closeSubmissionsModal);
    submissionsModal.addEventListener('click', (e) => {
      if (e.target === submissionsModal) closeSubmissionsModal();
    });

    // Submissions table search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => filterSubmissions(e.target.value));
    }

    // Export & Clear records
    document.getElementById('exportJsonBtn').addEventListener('click', exportSubmissionsToJson);
    document.getElementById('clearAllRecordsBtn').addEventListener('click', handleClearAllSubmissions);

    // Success Modal actions
    document.getElementById('printReceiptBtn').addEventListener('click', () => window.print());
    document.getElementById('registerAnotherBtn').addEventListener('click', resetForNewRegistration);
  }

  // Step transitions
  function goToStep(stepNum) {
    state.currentStep = stepNum;

    // Toggle forms
    Object.keys(stepElements).forEach(s => {
      stepElements[s].classList.toggle('active', parseInt(s, 10) === stepNum);
    });

    // Update Stepper indicators
    stepButtons.forEach(btn => {
      const stepIdx = parseInt(btn.dataset.step, 10);
      btn.classList.toggle('active', stepIdx === stepNum);
      btn.classList.toggle('completed', stepIdx < stepNum);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Photo handlers
  function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Photo size must be less than 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
      state.uploadedPhotoData = evt.target.result;
      avatarPreview.src = state.uploadedPhotoData;
      avatarPreview.classList.remove('hidden');
      avatarPlaceholder.classList.add('hidden');
      removePhotoBtn.classList.remove('hidden');
      autoSaveCurrentDraft();
    };
    reader.readAsDataURL(file);
  }

  function clearPhoto() {
    state.uploadedPhotoData = null;
    photoInput.value = '';
    avatarPreview.src = '';
    avatarPreview.classList.add('hidden');
    avatarPlaceholder.classList.remove('hidden');
    removePhotoBtn.classList.add('hidden');
    autoSaveCurrentDraft();
  }

  // Extract Form Data
  function getFormData() {
    return {
      appId: state.appId,
      photo: state.uploadedPhotoData,
      personal: {
        firstName: form.firstName.value.trim(),
        middleName: form.middleName.value.trim(),
        lastName: form.lastName.value.trim(),
        dob: form.dob.value,
        gender: form.gender.value,
        bloodGroup: form.bloodGroup.value,
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        nationality: form.nationality.value.trim(),
        category: form.religionCategory ? form.religionCategory.value : 'General',
        streetAddress: form.streetAddress.value.trim(),
        city: form.city.value.trim(),
        state: form.state.value.trim(),
        postalCode: form.postalCode.value.trim()
      },
      parent: {
        fatherName: form.fatherName.value.trim(),
        fatherOccupation: form.fatherOccupation.value.trim(),
        fatherPhone: form.fatherPhone.value.trim(),
        motherName: form.motherName.value.trim(),
        motherOccupation: form.motherOccupation.value.trim(),
        motherPhone: form.motherPhone.value.trim(),
        primaryContactPerson: form.primaryContactPerson.value,
        guardianEmail: form.guardianEmail.value.trim(),
        familyIncome: form.familyIncome.value
      },
      academic: {
        targetProgram: form.targetProgram.value,
        academicYear: form.academicYear.value,
        enrollmentType: form.enrollmentType.value,
        prevInstitution: form.prevInstitution.value.trim(),
        prevBoard: form.prevBoard.value,
        qualifyingExam: form.qualifyingExam.value,
        passingYear: form.passingYear.value,
        scorePercentage: form.scorePercentage.value.trim(),
        majorStream: form.majorStream.value.trim(),
        rollNumber: form.rollNumber.value.trim(),
        achievements: form.achievements.value.trim(),
        declared: form.academicDeclaration.checked
      }
    };
  }

  // Populate Review Section in Step 3
  function populateReviewSection() {
    const data = getFormData();
    const fullName = [data.personal.firstName, data.personal.middleName, data.personal.lastName]
      .filter(Boolean).join(' ');

    document.getElementById('reviewFullName').textContent = fullName || 'Applicant';
    document.getElementById('reviewProgramPill').textContent = data.academic.targetProgram || 'Program Not Selected';
    document.getElementById('reviewEmail').innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> ${data.personal.email || '-'}`;
    document.getElementById('reviewPhone').innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> ${data.personal.phone || '-'}`;

    // Avatar
    const reviewAvatar = document.getElementById('reviewAvatar');
    const reviewAvatarFallback = document.getElementById('reviewAvatarFallback');
    if (data.photo) {
      reviewAvatar.src = data.photo;
      reviewAvatar.classList.remove('hidden');
      reviewAvatarFallback.classList.add('hidden');
    } else {
      reviewAvatar.classList.add('hidden');
      reviewAvatarFallback.classList.remove('hidden');
      reviewAvatarFallback.textContent = (data.personal.firstName[0] || 'S') + (data.personal.lastName[0] || 'T');
    }

    // Personal DL
    document.getElementById('reviewDob').textContent = data.personal.dob || '-';
    document.getElementById('reviewGender').textContent = data.personal.gender || '-';
    document.getElementById('reviewBloodGroup').textContent = data.personal.bloodGroup || 'Not specified';
    document.getElementById('reviewNationality').textContent = `${data.personal.nationality} (${data.personal.category || 'General'})`;
    document.getElementById('reviewAddress').textContent = `${data.personal.streetAddress}, ${data.personal.city}, ${data.personal.state} - ${data.personal.postalCode}`;

    // Parent DL (Issue #1)
    document.getElementById('reviewFatherName').textContent = data.parent.fatherName || '-';
    document.getElementById('reviewFatherContact').textContent = `${data.parent.fatherPhone}${data.parent.fatherOccupation ? ' • ' + data.parent.fatherOccupation : ''}`;
    document.getElementById('reviewMotherName').textContent = data.parent.motherName || '-';
    document.getElementById('reviewMotherContact').textContent = `${data.parent.motherPhone || 'N/A'}${data.parent.motherOccupation ? ' • ' + data.parent.motherOccupation : ''}`;
    document.getElementById('reviewPrimaryContact').textContent = data.parent.primaryContactPerson || 'Father';
    document.getElementById('reviewGuardianEmailIncome').textContent = `${data.parent.guardianEmail || 'No email provided'} | ${data.parent.familyIncome || 'Income not specified'}`;

    // Academic DL
    document.getElementById('reviewProgramSession').textContent = `${data.academic.targetProgram} (${data.academic.academicYear})`;
    document.getElementById('reviewEnrollmentType').textContent = data.academic.enrollmentType;
    document.getElementById('reviewInstitution').textContent = data.academic.prevInstitution || '-';
    document.getElementById('reviewBoard').textContent = data.academic.prevBoard || '-';
    document.getElementById('reviewExamYear').textContent = `${data.academic.qualifyingExam} (${data.academic.passingYear})`;
    document.getElementById('reviewScore').textContent = `${data.academic.scorePercentage}%`;
    document.getElementById('reviewStream').textContent = data.academic.majorStream || '-';
    document.getElementById('reviewAchievements').textContent = data.academic.achievements || 'None mentioned';
  }

  // Handle Submission
  function handleFinalSubmit(e) {
    e.preventDefault();

    // Final checks
    if (!ValidationService.validateStep1(form)) {
      goToStep(1);
      showToast('Please check personal details.', 'error');
      return;
    }

    if (!ValidationService.validateStep2(form)) {
      goToStep(2);
      showToast('Please check academic details.', 'error');
      return;
    }

    const consentCheck = document.getElementById('finalConsent');
    const consentError = document.getElementById('consentError');
    if (!consentCheck.checked) {
      consentError.style.display = 'block';
      consentCheck.focus();
      showToast('Please accept the declaration terms.', 'error');
      return;
    }
    consentError.style.display = 'none';

    // Prepare full record
    const registrationRecord = {
      ...getFormData(),
      submissionDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      timestamp: Date.now()
    };

    // Save
    const saved = StorageService.saveSubmission(registrationRecord);
    if (saved) {
      updateSubmissionsBadge();
      showSuccessModal(registrationRecord);
      showToast('Registration submitted successfully!', 'success');
    } else {
      showToast('Failed to save record. Storage might be full.', 'error');
    }
  }

  function showSuccessModal(record) {
    const fullName = [record.personal.firstName, record.personal.middleName, record.personal.lastName]
      .filter(Boolean).join(' ');

    document.getElementById('receiptAppId').textContent = record.appId;
    document.getElementById('receiptStudentName').textContent = fullName;
    document.getElementById('receiptCourse').textContent = record.academic.targetProgram;
    document.getElementById('receiptEmail').textContent = record.personal.email;
    document.getElementById('receiptDate').textContent = record.submissionDate;

    successModal.classList.remove('hidden');
  }

  function resetForNewRegistration() {
    successModal.classList.add('hidden');
    form.reset();
    clearPhoto();
    state.appId = StorageService.generateAppId();
    appIdDisplay.textContent = state.appId;
    goToStep(1);
    showToast('Ready for a new student registration.', 'info');
  }

  // Submissions Drawer Logic
  function openSubmissionsModal() {
    renderSubmissionsTable(StorageService.getSubmissions());
    submissionsModal.classList.remove('hidden');
  }

  function closeSubmissionsModal() {
    submissionsModal.classList.add('hidden');
  }

  function renderSubmissionsTable(records) {
    const tbody = document.getElementById('submissionsTableBody');
    const emptyState = document.getElementById('noRecordsState');
    tbody.innerHTML = '';

    if (!records || records.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    records.forEach(rec => {
      const tr = document.createElement('tr');
      const fullName = [rec.personal.firstName, rec.personal.lastName].filter(Boolean).join(' ');
      const parentInfo = rec.parent && rec.parent.fatherName ? `• Father: ${rec.parent.fatherName}` : '';

      tr.innerHTML = `
        <td><strong>${escapeHtml(rec.appId)}</strong></td>
        <td>
          <div style="font-weight:600;">${escapeHtml(fullName)}</div>
          <small style="color:var(--gray-500);">${escapeHtml(rec.personal.gender || '')} ${escapeHtml(parentInfo)}</small>
        </td>
        <td>
          <div>${escapeHtml(rec.personal.email)}</div>
          <small style="color:var(--gray-500);">${escapeHtml(rec.personal.phone)}</small>
        </td>
        <td><span class="badge badge-primary" style="font-size:0.72rem;">${escapeHtml(rec.academic.targetProgram)}</span></td>
        <td><strong>${escapeHtml(rec.academic.scorePercentage)}%</strong></td>
        <td><small>${escapeHtml(rec.submissionDate || '-')}</small></td>
        <td>
          <button type="button" class="btn btn-ghost btn-sm text-danger delete-btn" data-id="${rec.appId}" title="Delete record">
            Delete
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm(`Delete student record ${id}?`)) {
          const updated = StorageService.deleteSubmission(id);
          renderSubmissionsTable(updated);
          updateSubmissionsBadge();
          showToast(`Record ${id} deleted.`, 'info');
        }
      });
    });
  }

  function filterSubmissions(query) {
    const q = query.toLowerCase().trim();
    const records = StorageService.getSubmissions();
    if (!q) {
      renderSubmissionsTable(records);
      return;
    }
    const filtered = records.filter(r => {
      const name = `${r.personal.firstName} ${r.personal.lastName}`.toLowerCase();
      const id = (r.appId || '').toLowerCase();
      const course = (r.academic.targetProgram || '').toLowerCase();
      const email = (r.personal.email || '').toLowerCase();
      const father = (r.parent && r.parent.fatherName ? r.parent.fatherName : '').toLowerCase();
      const mother = (r.parent && r.parent.motherName ? r.parent.motherName : '').toLowerCase();
      return name.includes(q) || id.includes(q) || course.includes(q) || email.includes(q) || father.includes(q) || mother.includes(q);
    });
    renderSubmissionsTable(filtered);
  }

  function handleClearAllSubmissions() {
    if (confirm('Are you sure you want to delete all saved student registrations?')) {
      StorageService.clearAllSubmissions();
      renderSubmissionsTable([]);
      updateSubmissionsBadge();
      showToast('All records deleted.', 'info');
    }
  }

  function exportSubmissionsToJson() {
    const records = StorageService.getSubmissions();
    if (records.length === 0) {
      showToast('No records available to export.', 'info');
      return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `student_registrations_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Student records exported to JSON.', 'success');
  }

  function updateSubmissionsBadge() {
    const count = StorageService.getSubmissions().length;
    submissionCountBadge.textContent = count;
  }

  // Auto-Save Draft
  function autoSaveCurrentDraft() {
    const data = getFormData();
    // Only save if at least some fields are entered
    if (data.personal.firstName || data.personal.email || data.academic.prevInstitution || data.parent.fatherName) {
      StorageService.saveDraft(data);
      draftStatus.querySelector('.text').textContent = 'Draft autosaved';
    }
  }

  // Restore Draft
  function tryRestoreDraft() {
    const saved = StorageService.loadDraft();
    if (!saved || !saved.data) return;

    const data = saved.data;
    if (data.personal) {
      form.firstName.value = data.personal.firstName || '';
      form.middleName.value = data.personal.middleName || '';
      form.lastName.value = data.personal.lastName || '';
      form.dob.value = data.personal.dob || '';
      form.gender.value = data.personal.gender || '';
      form.bloodGroup.value = data.personal.bloodGroup || '';
      form.email.value = data.personal.email || '';
      form.phone.value = data.personal.phone || '';
      form.nationality.value = data.personal.nationality || 'Indian';
      if (form.religionCategory && data.personal.category) form.religionCategory.value = data.personal.category;
      form.streetAddress.value = data.personal.streetAddress || '';
      form.city.value = data.personal.city || '';
      form.state.value = data.personal.state || '';
      form.postalCode.value = data.personal.postalCode || '';
    }

    if (data.parent) {
      form.fatherName.value = data.parent.fatherName || '';
      form.fatherOccupation.value = data.parent.fatherOccupation || '';
      form.fatherPhone.value = data.parent.fatherPhone || '';
      form.motherName.value = data.parent.motherName || '';
      form.motherOccupation.value = data.parent.motherOccupation || '';
      form.motherPhone.value = data.parent.motherPhone || '';
      form.primaryContactPerson.value = data.parent.primaryContactPerson || 'Father';
      form.guardianEmail.value = data.parent.guardianEmail || '';
      form.familyIncome.value = data.parent.familyIncome || '';
    }

    if (data.academic) {
      form.targetProgram.value = data.academic.targetProgram || '';
      form.academicYear.value = data.academic.academicYear || '2026-2027';
      form.enrollmentType.value = data.academic.enrollmentType || 'Full-Time Regular';
      form.prevInstitution.value = data.academic.prevInstitution || '';
      form.prevBoard.value = data.academic.prevBoard || '';
      form.qualifyingExam.value = data.academic.qualifyingExam || '';
      form.passingYear.value = data.academic.passingYear || '';
      form.scorePercentage.value = data.academic.scorePercentage || '';
      form.majorStream.value = data.academic.majorStream || '';
      form.rollNumber.value = data.academic.rollNumber || '';
      form.achievements.value = data.academic.achievements || '';
      form.academicDeclaration.checked = !!data.academic.declared;
    }

    if (data.photo) {
      state.uploadedPhotoData = data.photo;
      avatarPreview.src = data.photo;
      avatarPreview.classList.remove('hidden');
      avatarPlaceholder.classList.add('hidden');
      removePhotoBtn.classList.remove('hidden');
    }
  }

  // Quick Demo Fill
  function fillDemoData() {
    form.firstName.value = 'Rohan';
    form.middleName.value = 'K';
    form.lastName.value = 'Deshmukh';
    form.dob.value = '2004-06-18';
    form.gender.value = 'Male';
    form.bloodGroup.value = 'B+';
    form.email.value = 'rohan.deshmukh@example.com';
    form.phone.value = '+91 9823456780';
    form.nationality.value = 'Indian';
    if (form.religionCategory) form.religionCategory.value = 'General';
    form.streetAddress.value = 'Flat 402, Royal Residency, Shivaji Nagar';
    form.city.value = 'Pune';
    form.state.value = 'Maharashtra';
    form.postalCode.value = '411005';

    // Parent Details (Issue #1)
    form.fatherName.value = 'Ramesh Deshmukh';
    form.fatherOccupation.value = 'Senior Architect';
    form.fatherPhone.value = '+91 9822012345';
    form.motherName.value = 'Sunita Deshmukh';
    form.motherOccupation.value = 'Associate Professor';
    form.motherPhone.value = '+91 9822054321';
    form.primaryContactPerson.value = 'Father';
    form.guardianEmail.value = 'parents.deshmukh@example.com';
    form.familyIncome.value = '₹5,00,000 - ₹10,00,000';

    form.targetProgram.value = 'B.Tech Computer Science & Engineering';
    form.academicYear.value = '2026-2027';
    form.enrollmentType.value = 'Full-Time Regular';
    form.prevInstitution.value = 'Kendriya Vidyalaya Southern Command';
    form.prevBoard.value = 'CBSE';
    form.qualifyingExam.value = 'Class 12th / Higher Secondary (HSC)';
    form.passingYear.value = '2025';
    form.scorePercentage.value = '94.6';
    form.majorStream.value = 'Physics, Chemistry, Mathematics, Computer Science';
    form.rollNumber.value = 'CBSE-12-984310';
    form.achievements.value = '1st Place at State Level Science Fair 2024, Python Certification from Coursera.';
    form.academicDeclaration.checked = true;

    autoSaveCurrentDraft();
    showToast('Sample student & parent data filled! You can now test Step 1 & 2 navigation.', 'info');
  }

  // Toast Notification
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Helpers
  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
