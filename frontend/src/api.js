const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('placementpro-token');
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    throw new Error(payload?.message || payload || 'Request failed');
  }

  return payload;
}

export const FALLBACK_DATA = {
  stats: [
    { label: 'Students Placed', value: '1,248', color: '#2dd4bf' },
    { label: 'Training Programs', value: '32', color: '#60a5fa' },
    { label: 'Hiring Partners', value: '86', color: '#a78bfa' },
    { label: 'Avg. Offer Rate', value: '92%', color: '#fbbf24' },
  ],
  institutionRules: {
    minCgpa: 6.0,
    maxCurrentBacklogs: 0,
    maxHistoryBacklogs: 2,
    minAttendance: 75,
    minTenthPercentage: 60,
    minTwelfthPercentage: 60,
    trainingCompletionRequired: true,
    minTrainingAttendance: 80,
    minMockTestsPassed: 1,
    requireProfileComplete: true,
    requiredStudentStatus: 'Approved',
  },
  announcements: [
    { id: 1, title: 'Internship Drive', message: 'Final-year students can register for the campus internship drive before 12th October.', targetRole: 'STUDENT' },
    { id: 2, title: 'Trainer Review', message: 'Weekly trainer review meeting is scheduled for Friday at 3:00 PM.', targetRole: 'TRAINER' },
    { id: 3, title: 'Hiring Update', message: 'Company onboarding checklist has been refreshed for the new placement cycle.', targetRole: 'COMPANY' },
  ],
  trainingPrograms: [
    { id: 1, title: 'Full Stack Bootcamp', trainerName: 'Aman Sharma', startDate: '2026-10-10', endDate: '2026-11-15', capacity: 40, status: 'ACTIVE', description: 'Hands-on MERN and Java full stack training for final-year students.' },
    { id: 2, title: 'Aptitude Mastery', trainerName: 'Priya Nair', startDate: '2026-10-12', endDate: '2026-10-28', capacity: 50, status: 'ACTIVE', description: 'Speed, accuracy and aptitude practice for interview preparation.' },
    { id: 3, title: 'Cloud DevOps Intensive', trainerName: 'Karthik Rao', startDate: '2026-10-18', endDate: '2026-11-20', capacity: 35, status: 'ACTIVE', description: 'Docker, Kubernetes, CI/CD pipeline automation & cloud deployment architectures.' },
  ],
  jobs: [
    { id: 1, title: 'Frontend Engineer', companyId: 1, companyName: 'NovaStack', location: 'Bengaluru', jobType: 'Full-time', description: 'Build responsive interfaces and collaborate with design and platform teams.', skillsRequired: 'React, JavaScript, UI Design', salaryRange: '₹12-18 LPA', postedDate: '2026-10-01', applicationDeadline: '2026-10-25', active: true },
    { id: 2, title: 'Java Developer', companyId: 2, companyName: 'CodePeak', location: 'Hyderabad', jobType: 'Full-time', description: 'Develop backend services and maintain microservice integrations.', skillsRequired: 'Java, Spring Boot, SQL', salaryRange: '₹15-20 LPA', postedDate: '2026-10-04', applicationDeadline: '2026-10-30', active: true },
    { id: 3, title: 'Cloud & DevOps Intern', companyId: 1, companyName: 'NovaStack', location: 'Remote', jobType: 'Internship', description: 'Assist in automating build-test-deploy pipelines and monitoring production clusters.', skillsRequired: 'Linux, Docker, AWS', salaryRange: '₹40,000 / month', postedDate: '2026-10-05', applicationDeadline: '2026-11-05', active: true },
  ],
  companies: [
    { id: 1, name: 'NovaStack', industry: 'SaaS', location: 'Bengaluru', website: 'https://novastack.example', description: 'Product company hiring product-minded frontend engineers.' },
    { id: 2, name: 'CodePeak', industry: 'Enterprise Software', location: 'Hyderabad', website: 'https://codepeak.example', description: 'Engineering-focused platform team building enterprise workflows.' },
    { id: 3, name: 'CloudWorks', industry: 'Cloud & Infrastructure', location: 'Pune', website: 'https://cloudworks.example', description: 'Next-generation cloud infrastructure and managed services firm.' },
  ],
  students: [
    { id: 1, fullName: 'Aditi Sharma', email: 'student@placementpro.com', phone: '+91 98765 43210', branch: 'Computer Science', graduationYear: 2027, cgpa: 8.9, tenthPercentage: 89.2, twelfthPercentage: 87.5, currentBacklogs: 0, historyOfBacklogs: 0, attendancePercentage: 88, trainingAttendancePercentage: 92, mockTestsPassed: 2, status: 'Approved', skills: 'Java, React, DSA', resumeUrl: 'https://example.com/aditi-resume.pdf' },
    { id: 2, fullName: 'Arjun Kumar', email: 'arjun.kumar@example.com', phone: '+91 90000 00002', branch: 'Information Technology', graduationYear: 2027, cgpa: 9.1, tenthPercentage: 91.0, twelfthPercentage: 90.5, currentBacklogs: 0, historyOfBacklogs: 1, attendancePercentage: 84, trainingAttendancePercentage: 85, mockTestsPassed: 2, status: 'Approved', skills: 'Spring Boot, MySQL, APIs', resumeUrl: 'https://example.com/arjun-resume.pdf' },
    { id: 3, fullName: 'Pooja Reddy', email: 'pooja.reddy@example.com', phone: '+91 98888 12345', branch: 'Electronics & Communication', graduationYear: 2027, cgpa: 8.7, tenthPercentage: 84.0, twelfthPercentage: 82.0, currentBacklogs: 0, historyOfBacklogs: 0, attendancePercentage: 78, trainingAttendancePercentage: 80, mockTestsPassed: 1, status: 'Approved', skills: 'Python, C++, Embedded', resumeUrl: 'https://example.com/pooja-resume.pdf' },
    { id: 4, fullName: 'Vikram Singh', email: 'vikram.singh@example.com', phone: '+91 97777 44321', branch: 'Mechanical Engineering', graduationYear: 2027, cgpa: 5.8, tenthPercentage: 62.0, twelfthPercentage: 58.0, currentBacklogs: 2, historyOfBacklogs: 3, attendancePercentage: 68, trainingAttendancePercentage: 65, mockTestsPassed: 0, status: 'Debarred', skills: 'AutoCAD, SolidWorks', resumeUrl: '#' },
  ],
  applications: [
    { id: 1, studentId: 1, studentName: 'Aditi Sharma', jobId: 1, jobTitle: 'Frontend Engineer', status: 'SHORTLISTED', appliedAt: '2026-10-05T10:00:00', applicationDeadline: '2026-10-25' },
    { id: 2, studentId: 2, studentName: 'Arjun Kumar', jobId: 2, jobTitle: 'Java Developer', status: 'INTERVIEW_SCHEDULED', appliedAt: '2026-10-06T09:00:00', applicationDeadline: '2026-10-30' },
  ],
  studentMails: [
    {
      id: 101,
      toEmail: 'student@placementpro.com',
      recipientName: 'Aditi Sharma',
      companyName: 'CodePeak',
      jobTitle: 'Systems Architect Intern',
      subject: 'Application Update: Systems Architect Intern at CodePeak',
      content: 'Dear Aditi Sharma,\n\nThank you for taking the time to apply for the Systems Architect Intern opening at CodePeak through the campus placement drive.\n\nAfter careful consideration of our technical prerequisites and current cohort requirements, we regret to inform you that we will not be moving forward with your application for this position at this time.\n\nWe encourage you to continue applying for other active campus drives and training programs on PlacementPro.\n\nWarm regards,\nCampus Recruitment Team\nCodePeak',
      sentAt: '2026-10-08T14:30:00',
      type: 'REJECTION',
      read: false,
    },
  ],
};

async function apiFetch(endpoint) {
  return apiRequest(endpoint);
}

export async function loadPlacementData() {
  try {
    const [announcements, trainingPrograms, jobs, companies, students, applications] = await Promise.all([
      apiFetch('/api/announcements').catch(() => FALLBACK_DATA.announcements),
      apiFetch('/api/training').catch(() => FALLBACK_DATA.trainingPrograms),
      apiFetch('/api/jobs').catch(() => FALLBACK_DATA.jobs),
      apiFetch('/api/companies').catch(() => FALLBACK_DATA.companies),
      apiFetch('/api/students').catch(() => FALLBACK_DATA.students),
      apiFetch('/api/applications').catch(() => FALLBACK_DATA.applications),
    ]);

    return { announcements, trainingPrograms, jobs, companies, students, applications, studentMails: FALLBACK_DATA.studentMails, institutionRules: FALLBACK_DATA.institutionRules };
  } catch {
    return FALLBACK_DATA;
  }
}

export async function loginUser({ email, password }) {
  const payload = { username: email, email, password, fullName: email.split('@')[0] };
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function registerUser(payload) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: payload.email,
      email: payload.email,
      password: payload.password,
      fullName: payload.name,
      role: payload.role ? payload.role.toUpperCase() : 'STUDENT',
    }),
  });
}
