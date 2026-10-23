# AcademiaPortal - Single Page Student Registration Application

A modern, responsive, and feature-rich Single Page Application (SPA) for student registration, designed to capture comprehensive **Personal Details** and **Academic Details** with client-side validation, auto-draft saving, review summary, receipt generation, and local record management.

---

## 🌟 Key Features

### 1. Personal Details Section
- **Student Profile Photo Upload**: Real-time image preview with format and file size checks, with remove action.
- **Identity Details**: First Name, Middle Name, Last Name, Date of Birth (with age range logic), Gender, Blood Group, Nationality.
- **Contact & Family**: Validated Email Address, Phone Number, Parent/Guardian Full Name.
- **Permanent Address**: Street Address, City / District, State / Province, Postal / ZIP Code.

### 2. Academic Details Section
- **Program Preference**: Target Degree / Course selection (B.Tech CSE, AI & Data Science, BBA, MCA, etc.), Academic Year & Session (Fall/Spring), and Enrollment Mode (Full-Time, Part-Time, Distance).
- **Previous Qualifying Examination**: Name of School/College/Institute, Board or University (CBSE, ICSE, State Board, IB, etc.), Qualifying Level (10+2, Diploma, Undergrad, etc.), Year of Passing, and Marks/CGPA/Percentage.
- **Academic Profile**: Major Stream/Subjects studied, Previous Roll/Registration Number, Academic Honors/Certifications.
- **Academic Declaration**: Required certification acknowledgment before proceeding.

### 3. Review & Confirmation (Step 3)
- Unified summary sheet showing student avatar, target program badge, and structured key-value overview of both Personal and Academic details.
- Quick **Edit** buttons to jump straight back to Step 1 or Step 2.
- Final agreement checkbox before submitting.

### 4. Usability & Utility Features
- **Progress Stepper**: 3-step intuitive navigation with live validation states.
- **Quick Demo Fill Button**: One-click autofill with realistic sample data for instant testing.
- **Autosave Draft**: Automatically saves in-progress form inputs to browser `localStorage` so data is never lost on refresh.
- **Submissions Management Drawer**:
  - View list of all registered students with App ID, Name, Contact, Course, and Scores.
  - Live search filter by name, ID, course, or email.
  - Export registered records as formatted JSON file.
  - Delete individual records or clear all submissions.
- **Printable Registration Receipt**: Clean receipt popup with print layout (`Ctrl+P` / `Cmd+P` optimized).
- **Toast Notifications**: Non-intrusive alerts for errors, info, and success feedback.

---

## 🚀 How to Run the Project

No complicated build setups or compilers are required. You can run it in multiple ways:

### Method 1: Directly in Browser (No Server Needed)
Simply open the [`index.html`](index.html) file in your web browser:
```bash
# On macOS:
open index.html

# On Windows:
start index.html

# On Linux:
xdg-open index.html
```

### Method 2: Using Node.js / npm
```bash
# Start a local static file server
npm start
```
Or with `npx serve`:
```bash
npx serve .
```

### Method 3: Using Python
```bash
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.

---

## 📁 Project Structure

```
TestProject1/
├── index.html         # Main single-page HTML markup with 3-step flow & modals
├── css/
│   └── styles.css     # Clean modern CSS (responsive grid, variables, print styles)
├── js/
│   ├── app.js         # Core application logic & UI event listeners
│   ├── validation.js  # Field validation & error state feedback
│   └── storage.js     # Browser localStorage handling & unique App ID generation
├── package.json       # Project scripts & metadata
└── README.md          # Documentation & user guide
```
