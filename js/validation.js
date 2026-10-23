/**
 * Validation rules and field state handlers
 */

const ValidationService = {
  // Regex patterns
  patterns: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    phone: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,14}$/,
    name: /^[a-zA-Z\s.'-]{2,50}$/,
    postal: /^[a-zA-Z0-9\s-]{3,10}$/
  },

  // Mark field validity
  setFieldState(inputElement, isValid, customMsg = null) {
    const parentGroup = inputElement.closest('.form-group') || inputElement.closest('.checkbox-card');
    if (!parentGroup) return isValid;

    const errorEl = parentGroup.querySelector('.field-error');
    if (customMsg && errorEl) {
      errorEl.textContent = customMsg;
    }

    if (!isValid) {
      inputElement.classList.add('is-invalid');
      parentGroup.classList.add('has-error');
      if (errorEl) errorEl.style.display = 'block';
    } else {
      inputElement.classList.remove('is-invalid');
      parentGroup.classList.remove('has-error');
      if (errorEl) errorEl.style.display = 'none';
    }

    return isValid;
  },

  // Step 1: Personal Details Validation
  validateStep1(form) {
    let isValid = true;
    let firstInvalidField = null;

    // First Name
    const firstName = form.firstName.value.trim();
    if (!this.patterns.name.test(firstName)) {
      this.setFieldState(form.firstName, false);
      if (!firstInvalidField) firstInvalidField = form.firstName;
      isValid = false;
    } else {
      this.setFieldState(form.firstName, true);
    }

    // Last Name
    const lastName = form.lastName.value.trim();
    if (!this.patterns.name.test(lastName)) {
      this.setFieldState(form.lastName, false);
      if (!firstInvalidField) firstInvalidField = form.lastName;
      isValid = false;
    } else {
      this.setFieldState(form.lastName, true);
    }

    // DOB (Must be reasonable student age, at least 10 years old)
    const dobVal = form.dob.value;
    if (!dobVal) {
      this.setFieldState(form.dob, false, "Please enter your date of birth.");
      if (!firstInvalidField) firstInvalidField = form.dob;
      isValid = false;
    } else {
      const birthDate = new Date(dobVal);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 10 || age > 90) {
        this.setFieldState(form.dob, false, "Applicant age must be between 10 and 90 years.");
        if (!firstInvalidField) firstInvalidField = form.dob;
        isValid = false;
      } else {
        this.setFieldState(form.dob, true);
      }
    }

    // Gender
    if (!form.gender.value) {
      this.setFieldState(form.gender, false);
      if (!firstInvalidField) firstInvalidField = form.gender;
      isValid = false;
    } else {
      this.setFieldState(form.gender, true);
    }

    // Email
    const emailVal = form.email.value.trim();
    if (!this.patterns.email.test(emailVal)) {
      this.setFieldState(form.email, false);
      if (!firstInvalidField) firstInvalidField = form.email;
      isValid = false;
    } else {
      this.setFieldState(form.email, true);
    }

    // Phone
    const phoneVal = form.phone.value.trim();
    if (!this.patterns.phone.test(phoneVal) || phoneVal.replace(/\D/g, '').length < 7) {
      this.setFieldState(form.phone, false);
      if (!firstInvalidField) firstInvalidField = form.phone;
      isValid = false;
    } else {
      this.setFieldState(form.phone, true);
    }

    // Nationality
    if (!form.nationality.value.trim()) {
      this.setFieldState(form.nationality, false);
      if (!firstInvalidField) firstInvalidField = form.nationality;
      isValid = false;
    } else {
      this.setFieldState(form.nationality, true);
    }

    // Street Address
    if (!form.streetAddress.value.trim()) {
      this.setFieldState(form.streetAddress, false);
      if (!firstInvalidField) firstInvalidField = form.streetAddress;
      isValid = false;
    } else {
      this.setFieldState(form.streetAddress, true);
    }

    // City
    if (!form.city.value.trim()) {
      this.setFieldState(form.city, false);
      if (!firstInvalidField) firstInvalidField = form.city;
      isValid = false;
    } else {
      this.setFieldState(form.city, true);
    }

    // State
    if (!form.state.value.trim()) {
      this.setFieldState(form.state, false);
      if (!firstInvalidField) firstInvalidField = form.state;
      isValid = false;
    } else {
      this.setFieldState(form.state, true);
    }

    // Postal Code
    if (!this.patterns.postal.test(form.postalCode.value.trim())) {
      this.setFieldState(form.postalCode, false);
      if (!firstInvalidField) firstInvalidField = form.postalCode;
      isValid = false;
    } else {
      this.setFieldState(form.postalCode, true);
    }

    // ================= PARENT DETAILS VALIDATION (ISSUE #1) =================
    // Father's Name
    const fatherNameVal = form.fatherName.value.trim();
    if (!this.patterns.name.test(fatherNameVal)) {
      this.setFieldState(form.fatherName, false, "Please enter a valid father's name.");
      if (!firstInvalidField) firstInvalidField = form.fatherName;
      isValid = false;
    } else {
      this.setFieldState(form.fatherName, true);
    }

    // Father's Phone
    const fatherPhoneVal = form.fatherPhone.value.trim();
    if (!this.patterns.phone.test(fatherPhoneVal) || fatherPhoneVal.replace(/\D/g, '').length < 7) {
      this.setFieldState(form.fatherPhone, false, "Please enter a valid 10-15 digit phone number.");
      if (!firstInvalidField) firstInvalidField = form.fatherPhone;
      isValid = false;
    } else {
      this.setFieldState(form.fatherPhone, true);
    }

    // Mother's Name
    const motherNameVal = form.motherName.value.trim();
    if (!this.patterns.name.test(motherNameVal)) {
      this.setFieldState(form.motherName, false, "Please enter a valid mother's name.");
      if (!firstInvalidField) firstInvalidField = form.motherName;
      isValid = false;
    } else {
      this.setFieldState(form.motherName, true);
    }

    // Mother's Phone (Optional, but validate if entered)
    const motherPhoneVal = form.motherPhone.value.trim();
    if (motherPhoneVal && (!this.patterns.phone.test(motherPhoneVal) || motherPhoneVal.replace(/\D/g, '').length < 7)) {
      this.setFieldState(form.motherPhone, false, "Please enter a valid phone number.");
      if (!firstInvalidField) firstInvalidField = form.motherPhone;
      isValid = false;
    } else {
      this.setFieldState(form.motherPhone, true);
    }

    // Guardian Email (Optional, but validate if entered)
    const guardianEmailVal = form.guardianEmail.value.trim();
    if (guardianEmailVal && !this.patterns.email.test(guardianEmailVal)) {
      this.setFieldState(form.guardianEmail, false, "Please enter a valid email address.");
      if (!firstInvalidField) firstInvalidField = form.guardianEmail;
      isValid = false;
    } else {
      this.setFieldState(form.guardianEmail, true);
    }

    if (firstInvalidField) {
      firstInvalidField.focus();
    }

    return isValid;
  },

  // Step 2: Academic Details Validation
  validateStep2(form) {
    let isValid = true;
    let firstInvalidField = null;

    // Target Program
    if (!form.targetProgram.value) {
      this.setFieldState(form.targetProgram, false);
      if (!firstInvalidField) firstInvalidField = form.targetProgram;
      isValid = false;
    } else {
      this.setFieldState(form.targetProgram, true);
    }

    // Academic Year
    if (!form.academicYear.value) {
      this.setFieldState(form.academicYear, false);
      if (!firstInvalidField) firstInvalidField = form.academicYear;
      isValid = false;
    } else {
      this.setFieldState(form.academicYear, true);
    }

    // Previous Institution
    if (!form.prevInstitution.value.trim()) {
      this.setFieldState(form.prevInstitution, false);
      if (!firstInvalidField) firstInvalidField = form.prevInstitution;
      isValid = false;
    } else {
      this.setFieldState(form.prevInstitution, true);
    }

    // Board
    if (!form.prevBoard.value) {
      this.setFieldState(form.prevBoard, false);
      if (!firstInvalidField) firstInvalidField = form.prevBoard;
      isValid = false;
    } else {
      this.setFieldState(form.prevBoard, true);
    }

    // Qualifying Exam
    if (!form.qualifyingExam.value) {
      this.setFieldState(form.qualifyingExam, false);
      if (!firstInvalidField) firstInvalidField = form.qualifyingExam;
      isValid = false;
    } else {
      this.setFieldState(form.qualifyingExam, true);
    }

    // Passing Year
    if (!form.passingYear.value) {
      this.setFieldState(form.passingYear, false);
      if (!firstInvalidField) firstInvalidField = form.passingYear;
      isValid = false;
    } else {
      this.setFieldState(form.passingYear, true);
    }

    // Score / Percentage
    const score = parseFloat(form.scorePercentage.value);
    if (isNaN(score) || score < 0 || score > 100) {
      this.setFieldState(form.scorePercentage, false);
      if (!firstInvalidField) firstInvalidField = form.scorePercentage;
      isValid = false;
    } else {
      this.setFieldState(form.scorePercentage, true);
    }

    // Major Stream
    if (!form.majorStream.value.trim()) {
      this.setFieldState(form.majorStream, false);
      if (!firstInvalidField) firstInvalidField = form.majorStream;
      isValid = false;
    } else {
      this.setFieldState(form.majorStream, true);
    }

    // Declaration Checkbox
    const declaration = form.academicDeclaration;
    const declError = document.getElementById('declarationError');
    if (!declaration.checked) {
      if (declError) declError.style.display = 'block';
      if (!firstInvalidField) firstInvalidField = declaration;
      isValid = false;
    } else {
      if (declError) declError.style.display = 'none';
    }

    if (firstInvalidField) {
      firstInvalidField.focus();
    }

    return isValid;
  },

  // Setup auto-clear on input event
  bindLiveClear(form) {
    form.querySelectorAll('input, select, textarea').forEach(el => {
      el.addEventListener('input', () => {
        el.classList.remove('is-invalid');
        const parent = el.closest('.form-group');
        if (parent) {
          parent.classList.remove('has-error');
          const errorEl = parent.querySelector('.field-error');
          if (errorEl) errorEl.style.display = 'none';
        }
      });
      el.addEventListener('change', () => {
        el.classList.remove('is-invalid');
        const parent = el.closest('.form-group');
        if (parent) {
          parent.classList.remove('has-error');
          const errorEl = parent.querySelector('.field-error');
          if (errorEl) errorEl.style.display = 'none';
        }
      });
    });
  }
};
