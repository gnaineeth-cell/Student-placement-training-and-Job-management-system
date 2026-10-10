import { useMemo, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Ban,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Download,
  Edit3,
  Filter,
  GraduationCap,
  Inbox,
  LogOut,
  Mail,
  MailOpen,
  Megaphone,
  PlusCircle,
  School,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import './App.css'
import { FALLBACK_DATA, loadPlacementData, loginUser, registerUser } from './api'
import PlacementChatbot from './components/PlacementChatbot'

export function evaluatePlacementEligibility(student, rules, job = null) {
  if (!student) {
    return {
      isEligible: false,
      criteria: [],
      reasons: ['Student profile record not found'],
      deadlinePassed: false,
      daysRemaining: null,
    }
  }

  const activeRules = rules || {
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
  }

  const cgpa = Number(student.cgpa) || 0
  const minCgpa = Number(activeRules.minCgpa) || 6.0
  const passCgpa = cgpa >= minCgpa

  const currentBacklogs = Number(student.currentBacklogs) || 0
  const maxCurrentBacklogs = Number(activeRules.maxCurrentBacklogs) || 0
  const passCurrentBacklogs = currentBacklogs <= maxCurrentBacklogs

  const historyOfBacklogs = Number(student.historyOfBacklogs) || 0
  const maxHistory =
    activeRules.maxHistoryBacklogs !== null &&
    activeRules.maxHistoryBacklogs !== '' &&
    activeRules.maxHistoryBacklogs !== undefined
      ? Number(activeRules.maxHistoryBacklogs)
      : null
  const passHistory = maxHistory === null || historyOfBacklogs <= maxHistory

  const attendance = Number(student.attendancePercentage) || 0
  const minAttendance = Number(activeRules.minAttendance) || 75
  const passAttendance = attendance >= minAttendance

  const tenth = Number(student.tenthPercentage) || 0
  const minTenth = Number(activeRules.minTenthPercentage) || 60
  const passTenth = tenth >= minTenth

  const twelfth = Number(student.twelfthPercentage) || 0
  const minTwelfth = Number(activeRules.minTwelfthPercentage) || 60
  const passTwelfth = twelfth >= minTwelfth

  const trainingAtt = Number(student.trainingAttendancePercentage) || 0
  const minTrainingAtt = Number(activeRules.minTrainingAttendance) || 80
  const mockTests = Number(student.mockTestsPassed) || 0
  const minMockTests = Number(activeRules.minMockTestsPassed) || 1
  const passTraining =
    !activeRules.trainingCompletionRequired ||
    (trainingAtt >= minTrainingAtt && mockTests >= minMockTests)

  const hasResume = Boolean(
    student.resumeUrl && student.resumeUrl !== '#' && student.resumeUrl.trim().length > 0,
  )
  const isProfileComplete = Boolean(
    student.fullName &&
      student.email &&
      student.branch &&
      student.graduationYear &&
      hasResume &&
      student.tenthPercentage != null &&
      student.twelfthPercentage != null,
  )
  const passProfile = !activeRules.requireProfileComplete || (isProfileComplete && hasResume)

  const studentStatus = student.status || 'Approved'
  const passStatus =
    studentStatus.toLowerCase() === (activeRules.requiredStudentStatus || 'Approved').toLowerCase() &&
    studentStatus.toLowerCase() !== 'debarred'

  const criteria = [
    {
      id: 'cgpa',
      title: 'Minimum CGPA / Percentage',
      requirement: `>= ${minCgpa} CGPA`,
      actual: `${cgpa} CGPA`,
      passed: passCgpa,
      failReason: `CGPA (${cgpa}) is below required ${minCgpa}`,
    },
    {
      id: 'currentBacklogs',
      title: 'Current Backlogs Allowed',
      requirement: `<= ${maxCurrentBacklogs} backlog(s)`,
      actual: `${currentBacklogs} active`,
      passed: passCurrentBacklogs,
      failReason: `Active backlogs (${currentBacklogs}) exceed threshold (${maxCurrentBacklogs})`,
    },
    {
      id: 'historyBacklogs',
      title: 'History of Backlogs',
      requirement: maxHistory !== null ? `<= ${maxHistory} past backlog(s)` : 'No limit set (optional)',
      actual: `${historyOfBacklogs} historical`,
      passed: passHistory,
      failReason: `Backlog history (${historyOfBacklogs}) exceeds limit (${maxHistory})`,
    },
    {
      id: 'attendance',
      title: 'Minimum Attendance Percentage',
      requirement: `>= ${minAttendance}%`,
      actual: `${attendance}%`,
      passed: passAttendance,
      failReason: `Attendance (${attendance}%) is below mandatory minimum ${minAttendance}%`,
    },
    {
      id: 'schooling',
      title: 'Minimum 10th & 12th/Diploma %',
      requirement: `10th >= ${minTenth}%, 12th >= ${minTwelfth}%`,
      actual: `10th: ${tenth}%, 12th: ${twelfth}%`,
      passed: passTenth && passTwelfth,
      failReason: `School percentages (${tenth}% / ${twelfth}%) do not meet required minimums`,
    },
    {
      id: 'training',
      title: 'Training Completion Required',
      requirement: `>= ${minTrainingAtt}% att. & >= ${minMockTests} passed mock test`,
      actual: `${trainingAtt}% att. • ${mockTests} mock(s) passed`,
      passed: passTraining,
      failReason: `Training criteria not met (${trainingAtt}% att., ${mockTests} mock test passed)`,
    },
    {
      id: 'profileResume',
      title: 'Profile 100% Complete & Resume Uploaded',
      requirement: '100% complete profile + verified resume file',
      actual: hasResume ? 'Profile & Resume ready' : 'Resume pending upload',
      passed: passProfile,
      failReason: 'Candidate profile must be 100% complete with resume uploaded',
    },
    {
      id: 'status',
      title: 'Student Clearance Status',
      requirement: 'Must be “Approved” and not “Debarred”',
      actual: studentStatus,
      passed: passStatus,
      failReason:
        studentStatus.toLowerCase() === 'debarred'
          ? 'Candidate is Debarred from placements by administration'
          : `Status is "${studentStatus}", requires Approved`,
    },
  ]

  const failing = criteria.filter((c) => !c.passed)
  const isEligible = failing.length === 0

  let deadlinePassed = false
  let daysRemaining = null
  if (job && job.applicationDeadline) {
    const deadlineDate = new Date(job.applicationDeadline + 'T23:59:59')
    const now = new Date()
    deadlinePassed = now > deadlineDate
    const diffTime = deadlineDate - now
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  }

  return {
    isEligible,
    criteria,
    reasons: failing.map((f) => f.failReason),
    deadlinePassed,
    daysRemaining,
  }
}

export function getSkillMatchDetails(studentSkillsString, jobSkillsString) {
  if (!studentSkillsString || !jobSkillsString) {
    return {
      matchCount: 0,
      totalJobSkills: 0,
      matchPercentage: 0,
      matchedSkills: [],
      isMatch: false,
    }
  }

  const studentSkills = String(studentSkillsString)
    .split(/[,;/|]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

  const jobSkills = String(jobSkillsString)
    .split(/[,;/|]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const matched = jobSkills.filter((jobSkill) => {
    const jsLower = jobSkill.toLowerCase()
    return studentSkills.some(
      (s) => jsLower === s || jsLower.includes(s) || s.includes(jsLower),
    )
  })

  const matchPercentage =
    jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 0

  return {
    matchCount: matched.length,
    totalJobSkills: jobSkills.length,
    matchPercentage,
    matchedSkills: matched,
    isMatch: matched.length > 0,
  }
}

const DEFAULT_USERS = [
  { id: 1, name: 'Aditi Sharma', email: 'student@placementpro.com', password: 'student123', role: 'Student' },
  { id: 2, name: 'Rohit Verma', email: 'admin@placementpro.com', password: 'admin123', role: 'Admin' },
  { id: 3, name: 'Nisha Patel', companyName: 'CodePeak Technologies', email: 'company@placementpro.com', password: 'company123', role: 'Company' },
]

const formatRolePath = (role) => (role || 'student').toLowerCase().replace(/\s+/g, '-')

function readStoredData() {
  const raw = localStorage.getItem('placementpro-data')
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      return {
        ...FALLBACK_DATA,
        ...parsed,
        institutionRules: {
          ...FALLBACK_DATA.institutionRules,
          ...(parsed.institutionRules || {}),
        },
      }
    } catch {
      return FALLBACK_DATA
    }
  }
  return FALLBACK_DATA
}

function writeStoredData(data) {
  localStorage.setItem('placementpro-data', JSON.stringify(data))
}

function readUsers() {
  const raw = localStorage.getItem('placementpro-users')
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      return DEFAULT_USERS
    }
  }
  return DEFAULT_USERS
}

function writeUsers(users) {
  localStorage.setItem('placementpro-users', JSON.stringify(users))
}

function readSession() {
  const raw = localStorage.getItem('placementpro-session')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function App() {
  const [data, setData] = useState(() => readStoredData())
  const [session, setSession] = useState(() => readSession())
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type })
  }

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    loadPlacementData().then((next) => {
      setData((current) => {
        // Keep any existing locally stored additions
        const hasCustomItems = current && current.jobs && current.jobs.length > FALLBACK_DATA.jobs.length
        return hasCustomItems ? current : next
      })
      writeStoredData(next)
    })
  }, [])

  useEffect(() => {
    writeStoredData(data)
  }, [data])

  const handleLogin = async (loginData) => {
    try {
      const result = await loginUser({
        email: loginData.email,
        password: loginData.password,
      })

      const sessionUser = {
        id: Date.now(),
        name: result.username || loginData.email,
        companyName: result.companyName || (result.role === 'COMPANY' ? 'CodePeak Technologies' : undefined),
        email: loginData.email,
        role: result.role === 'STUDENT' ? 'Student' : result.role === 'ADMIN' ? 'Admin' : result.role === 'COMPANY' ? 'Company' : 'Student',
        token: result.token,
      }

      setSession(sessionUser)
      localStorage.setItem('placementpro-session', JSON.stringify(sessionUser))
      if (result.token) localStorage.setItem('placementpro-token', result.token)
      showToast(`Welcome back, ${sessionUser.name}!`)
      return { ok: true, role: sessionUser.role }
    } catch {
      const users = readUsers()
      const match = users.find(
        (user) => user.email.toLowerCase() === loginData.email.toLowerCase() && user.password === loginData.password,
      )

      if (!match) {
        return { ok: false, message: 'Invalid email or password. Use demo credentials below.' }
      }

      const sessionUser = {
        id: match.id,
        name: match.name,
        companyName: match.companyName || (match.role === 'Company' ? 'CodePeak Technologies' : undefined),
        email: match.email,
        role: match.role,
        token: 'mock-jwt-token',
      }

      setSession(sessionUser)
      localStorage.setItem('placementpro-session', JSON.stringify(sessionUser))
      localStorage.setItem('placementpro-token', 'mock-jwt-token')
      showToast(`Signed in as ${sessionUser.name} (${sessionUser.role})`)
      return { ok: true, role: match.role }
    }
  }

  const handleRegister = async (payload) => {
    try {
      await registerUser(payload)
      showToast('Registration successful! Please login.')
      return { ok: true }
    } catch {
      const users = readUsers()
      const existing = users.find((user) => user.email.toLowerCase() === payload.email.toLowerCase())
      if (existing) {
        return { ok: false, message: 'An account with this email already exists.' }
      }

      const nextUser = {
        id: Date.now(),
        name: payload.name,
        email: payload.email,
        password: payload.password,
        role: payload.role,
      }

      users.push(nextUser)
      writeUsers(users)

      if (payload.role === 'Student') {
        setData((current) => ({
          ...current,
          students: [
            {
              id: Date.now() + 1,
              fullName: payload.name,
              email: payload.email,
              phone: payload.phone || '+91 90000 00000',
              branch: payload.branch || 'Computer Science',
              graduationYear: Number(payload.graduationYear) || 2027,
              cgpa: Number(payload.cgpa) || 8.5,
              skills: payload.skills || 'Java, SQL, React',
              resumeUrl: payload.resumeUrl || '#',
            },
            ...current.students,
          ],
        }))
      }

      if (payload.role === 'Company') {
        setData((current) => ({
          ...current,
          companies: [
            {
              id: Date.now() + 2,
              name: payload.companyName || payload.name,
              industry: payload.industry || 'Technology',
              location: payload.location || 'Bengaluru',
              website: payload.website || 'https://example.com',
              description: payload.companyDescription || 'Hiring partner',
            },
            ...current.companies,
          ],
        }))
      }

      showToast('Registration successful! You can now log in.')
      return { ok: true }
    }
  }

  const handleLogout = () => {
    setSession(null)
    localStorage.removeItem('placementpro-session')
    localStorage.removeItem('placementpro-token')
    showToast('Logged out successfully', 'info')
  }

  const switchRole = (newRole) => {
    if (!session) return
    const updated = {
      ...session,
      role: newRole,
      name:
        newRole === 'Student' ? 'Aditi Sharma' : newRole === 'Admin' ? 'Rohit Verma' : 'Nisha Patel',
      companyName: newRole === 'Company' ? 'CodePeak Technologies' : undefined,
      email:
        newRole === 'Student'
          ? 'student@placementpro.com'
          : newRole === 'Admin'
          ? 'admin@placementpro.com'
          : 'company@placementpro.com',
    }
    setSession(updated)
    localStorage.setItem('placementpro-session', JSON.stringify(updated))
    showToast(`Switched view to ${newRole} Dashboard`, 'info')
  }

  const applyToJob = (jobId) => {
    if (!session) return

    const job = data.jobs.find((entry) => entry.id === jobId)
    if (!job) return

    const studentProfile =
      data.students.find((student) => student.email === session.email) || data.students[0]
    const rules = data.institutionRules || FALLBACK_DATA.institutionRules
    const evalResult = evaluatePlacementEligibility(studentProfile, rules, job)

    if (evalResult.deadlinePassed) {
      showToast(
        `Application Closed: Deadline expired on ${job.applicationDeadline || 'passed'}.`,
        'error',
      )
      return
    }

    if (!evalResult.isEligible) {
      showToast(
        `Ineligible: ${evalResult.reasons[0] || 'Institution criteria not met'}. Review your Verification Dossier.`,
        'error',
      )
      return
    }

    setData((current) => {
      const existing = current.applications.find(
        (application) => application.studentId === session.id && application.jobId === jobId,
      )

      if (existing) {
        showToast(`You have already applied for ${job.title}!`, 'info')
        return current
      }

      showToast(`Successfully applied for ${job.title} at ${job.companyName}!`)
      return {
        ...current,
        applications: [
          {
            id: Date.now(),
            studentId: session.id,
            studentName: session.name,
            jobId: job.id,
            jobTitle: job.title,
            applicationDeadline: job.applicationDeadline || null,
            status: 'APPLIED',
            appliedAt: new Date().toISOString(),
          },
          ...current.applications,
        ],
      }
    })
  }

  const updateInstitutionRules = (newRules) => {
    setData((current) => ({
      ...current,
      institutionRules: {
        ...(current.institutionRules || FALLBACK_DATA.institutionRules),
        ...newRules,
      },
    }))
    showToast('Institution placement eligibility criteria updated successfully!')
  }

  const updateStudentStatus = (studentId, nextStatus) => {
    setData((current) => ({
      ...current,
      students: current.students.map((s) =>
        s.id === studentId ? { ...s, status: nextStatus } : s,
      ),
    }))
    showToast(`Student clearance status set to "${nextStatus}"!`)
  }

  const withdrawApplication = (applicationId) => {
    setData((current) => ({
      ...current,
      applications: current.applications.filter((app) => app.id !== applicationId),
    }))
    showToast('Application withdrawn successfully', 'info')
  }

  const registerForCourse = (courseId) => {
    setData((current) => {
      const program = current.trainingPrograms.find((p) => p.id === courseId)
      const isAlreadyRegistered = program?.status === 'REGISTERED'

      const updated = current.trainingPrograms.map((p) => {
        if (p.id === courseId) {
          return {
            ...p,
            status: isAlreadyRegistered ? 'ACTIVE' : 'REGISTERED',
          }
        }
        return p
      })

      if (isAlreadyRegistered) {
        showToast(`Unregistered from ${program?.title}`, 'info')
      } else {
        showToast(`Successfully registered for ${program?.title}!`)
      }

      return {
        ...current,
        trainingPrograms: updated,
      }
    })
  }

  const updateStudentProfile = (updatedProfile) => {
    setData((current) => {
      const exists = current.students.some((s) => s.email === updatedProfile.email)
      const nextStudents = exists
        ? current.students.map((s) => (s.email === updatedProfile.email ? { ...s, ...updatedProfile } : s))
        : [{ id: Date.now(), ...updatedProfile }, ...current.students]
      return {
        ...current,
        students: nextStudents,
      }
    })
    showToast('Profile updated successfully!')
  }

  const exportReportsCsv = () => {
    const rows = [
      ['PLACEMENTPRO SUMMARY REPORT', new Date().toLocaleString()],
      ['', ''],
      ['Category', 'Count / Value'],
      ['Total Registered Students', String(data.students.length)],
      ['Hiring Partner Companies', String(data.companies.length)],
      ['Live Job Openings', String(data.jobs.length)],
      ['Total Applications Submitted', String(data.applications.length)],
      ['Shortlisted Candidates', String(data.applications.filter((a) => a.status === 'SHORTLISTED').length)],
      ['Interviews Scheduled', String(data.applications.filter((a) => a.status === 'INTERVIEW_SCHEDULED').length)],
      ['Offers Released', String(data.applications.filter((a) => a.status === 'OFFERED').length)],
      ['Active Training Programs', String(data.trainingPrograms.length)],
      ['', ''],
      ['JOB LISTINGS', ''],
      ['Job Title', 'Company', 'Location', 'Type', 'Salary', 'Status'],
      ...data.jobs.map((j) => [j.title, j.companyName, j.location, j.jobType, j.salaryRange, j.active ? 'Active' : 'Closed']),
      ['', ''],
      ['STUDENT APPLICATIONS', ''],
      ['Applicant Name', 'Job Role', 'Status', 'Date'],
      ...data.applications.map((a) => [a.studentName, a.jobTitle, a.status, (a.appliedAt || '').slice(0, 10)]),
    ]

    const csvContent = rows
      .map((row) => row.map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = `placement-report-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast('Placement report CSV downloaded!')
  }

  const createTrainingProgram = (payload) => {
    setData((current) => ({
      ...current,
      trainingPrograms: [
        {
          id: Date.now(),
          title: payload.title,
          trainerName: payload.trainerName,
          startDate: payload.startDate,
          endDate: payload.endDate,
          capacity: Number(payload.capacity),
          status: 'ACTIVE',
          description: payload.description,
        },
        ...current.trainingPrograms,
      ],
    }))
    showToast(`Created training program: ${payload.title}!`)
  }

  const deleteTrainingProgram = (id) => {
    setData((current) => ({
      ...current,
      trainingPrograms: current.trainingPrograms.filter((p) => p.id !== id),
    }))
    showToast('Training program removed', 'info')
  }

  const createJobPosting = (payload) => {
    const resolvedCompanyName = (
      payload.companyName?.trim() ||
      session?.companyName ||
      session?.name ||
      'CodePeak Technologies'
    ).trim()

    const existingCompany = data.companies.find(
      (c) => c.name.toLowerCase() === resolvedCompanyName.toLowerCase(),
    )
    const resolvedCompanyId = existingCompany ? existingCompany.id : (session?.id || Date.now())

    setData((current) => {
      const newJob = {
        id: Date.now(),
        title: payload.title,
        companyId: resolvedCompanyId,
        companyName: resolvedCompanyName,
        location: payload.location,
        jobType: payload.jobType,
        description: payload.description,
        skillsRequired: payload.skillsRequired,
        salaryRange: payload.salaryRange,
        postedDate: new Date().toISOString().slice(0, 10),
        applicationDeadline:
          payload.applicationDeadline ||
          new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        active: true,
      }

      let updatedCompanies = current.companies
      if (!existingCompany) {
        updatedCompanies = [
          {
            id: resolvedCompanyId,
            name: resolvedCompanyName,
            industry: 'Software & Technology',
            location: payload.location || 'Bengaluru',
            website: `https://${resolvedCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.example`,
            description: `Corporate placement recruitment partner for ${payload.title} roles.`,
          },
          ...current.companies,
        ]
      }

      return {
        ...current,
        companies: updatedCompanies,
        jobs: [newJob, ...current.jobs],
      }
    })
    showToast(
      `New job published by ${resolvedCompanyName}: ${payload.title}! Deadline: ${
        payload.applicationDeadline || '14 days'
      }`,
    )
  }

  const toggleJobStatus = (jobId) => {
    setData((current) => ({
      ...current,
      jobs: current.jobs.map((job) =>
        job.id === jobId ? { ...job, active: !job.active } : job,
      ),
    }))
    showToast('Job status updated')
  }

  const deleteJob = (jobId) => {
    setData((current) => ({
      ...current,
      jobs: current.jobs.filter((j) => j.id !== jobId),
      applications: current.applications.filter((a) => a.jobId !== jobId),
    }))
    showToast('Job opening deleted', 'info')
  }

  const updateApplicationStatus = (applicationId, nextStatus) => {
    let studentTargetEmail = ''
    let jobTitleTarget = ''
    let companyTarget = ''
    let studentTargetName = ''

    setData((current) => {
      const targetApp = current.applications.find((app) => app.id === applicationId)
      if (targetApp) {
        const studentObj = current.students.find(
          (s) => s.id === targetApp.studentId || s.fullName === targetApp.studentName,
        )
        const jobObj = current.jobs.find(
          (j) => j.id === targetApp.jobId || j.title === targetApp.jobTitle,
        )
        studentTargetEmail = studentObj?.email || 'student@placementpro.com'
        studentTargetName = targetApp.studentName || studentObj?.fullName || 'Candidate'
        jobTitleTarget = targetApp.jobTitle || jobObj?.title || 'Job Opening'
        companyTarget =
          jobObj?.companyName || session?.companyName || session?.name || 'CodePeak Technologies'
      }

      const updatedApps = current.applications.map((app) =>
        app.id === applicationId ? { ...app, status: nextStatus } : app,
      )

      let updatedMails = current.studentMails || []
      if (nextStatus === 'REJECTED' && targetApp) {
        const rejectionMail = {
          id: Date.now(),
          toEmail: studentTargetEmail,
          recipientName: studentTargetName,
          companyName: companyTarget,
          jobTitle: jobTitleTarget,
          subject: `Application Update: ${jobTitleTarget} at ${companyTarget}`,
          content: `Dear ${studentTargetName},\n\nThank you for taking the time to apply and participate in our campus placement recruitment drive for the ${jobTitleTarget} position at ${companyTarget}.\n\nAfter careful evaluation of all applications and technical prerequisites for this role, we regret to inform you that the recruitment team has decided not to advance your application for this position at this time.\n\nWe truly appreciate your interest in ${companyTarget} and encourage you to continue applying for other active campus drives and training bootcamps.\n\nWe wish you all the very best in your academic journey and career endeavors!\n\nSincerely,\nCampus Talent Acquisition Team\n${companyTarget}`,
          sentAt: new Date().toISOString(),
          type: 'REJECTION',
          read: false,
        }
        updatedMails = [rejectionMail, ...updatedMails]
      }

      return {
        ...current,
        applications: updatedApps,
        studentMails: updatedMails,
      }
    })

    if (nextStatus === 'REJECTED') {
      showToast(
        `Application rejected. Official rejection email sent to student (${studentTargetEmail || 'candidate'})!`,
        'info',
      )
    } else {
      showToast(`Applicant status changed to ${nextStatus}`)
    }
  }

  const rolePath = session ? formatRolePath(session.role) : 'student'

  return (
    <BrowserRouter>
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          <div className="toast-content">
            <CheckCircle2 size={18} />
            <span>{toast.message}</span>
          </div>
          <button type="button" className="toast-close" onClick={() => setToast(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Navigate to={session ? `/dashboard/${rolePath}` : '/login'} replace />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} onQuickLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage onRegister={handleRegister} />} />
        <Route
          path="/dashboard/:role"
          element={
            session ? (
              <DashboardPage
                data={data}
                session={session}
                onLogout={handleLogout}
                onSwitchRole={switchRole}
                onApply={applyToJob}
                onWithdrawApplication={withdrawApplication}
                onRegisterCourse={registerForCourse}
                onUpdateProfile={updateStudentProfile}
                onCreateTraining={createTrainingProgram}
                onDeleteTraining={deleteTrainingProgram}
                onCreateJob={createJobPosting}
                onToggleJobStatus={toggleJobStatus}
                onDeleteJob={deleteJob}
                onUpdateApplicationStatus={updateApplicationStatus}
                exportReportsCsv={exportReportsCsv}
                onUpdateInstitutionRules={updateInstitutionRules}
                onUpdateStudentStatus={updateStudentStatus}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to={session ? `/dashboard/${rolePath}` : '/login'} replace />} />
      </Routes>

      <PlacementChatbot session={session} data={data} onApply={applyToJob} />
    </BrowserRouter>
  )
}

function LoginPage({ onLogin, onQuickLogin }) {
  const [email, setEmail] = useState('student@placementpro.com')
  const [password, setPassword] = useState('student123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    const result = await onLogin({ email, password })
    setLoading(false)
    if (!result.ok) {
      setError(result.message)
      return
    }

    navigate(`/dashboard/${formatRolePath(result.role)}`)
  }

  const handleDemoFill = async (demoEmail, demoPass) => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setError('')
    setLoading(true)
    const result = await onQuickLogin({ email: demoEmail, password: demoPass })
    setLoading(false)
    if (result.ok) {
      navigate(`/dashboard/${formatRolePath(result.role)}`)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <GraduationCap size={32} className="brand-icon" />
          <div>
            <p className="section-tag">PlacementPro Suite</p>
            <h1>Welcome back</h1>
          </div>
        </div>
        <p className="auth-subtitle">Unified campus placements, training programs & hiring portal.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Email Address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@placementpro.com"
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          {error && <div className="error-banner">{error}</div>}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="demo-box">
          <div className="demo-title">
            <UserCheck size={16} />
            <span>Quick 1-Click Demo Login</span>
          </div>
          <div className="demo-pills">
            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => handleDemoFill('student@placementpro.com', 'student123')}
            >
              🎓 Student
            </button>
            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => handleDemoFill('admin@placementpro.com', 'admin123')}
            >
              🛡️ Admin / TPO
            </button>
            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => handleDemoFill('company@placementpro.com', 'company123')}
            >
              🏢 Recruiter
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <span>New to PlacementPro?</span>
          <Link to="/register" className="auth-link">
            Create an account <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}

function RegisterPage({ onRegister }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student',
    companyName: '',
    phone: '',
    branch: 'Computer Science',
    graduationYear: '2027',
    cgpa: '8.8',
    skills: 'Java, React, DSA',
    resumeUrl: '',
    location: 'Bengaluru',
    industry: 'Technology',
    companyDescription: '',
    website: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    const result = await onRegister(form)
    setLoading(false)
    if (!result.ok) {
      setError(result.message)
      return
    }

    navigate('/login')
  }

  return (
    <div className="auth-shell">
      <div className="auth-card wide-card">
        <div className="auth-brand">
          <GraduationCap size={32} className="brand-icon" />
          <div>
            <p className="section-tag">Account Setup</p>
            <h1>Join PlacementPro</h1>
          </div>
        </div>
        <p className="auth-subtitle">Register to unlock jobs, skill training programs, and hiring workflows.</p>

        <div className="role-toggle-bar">
          <button
            type="button"
            className={`role-tab-btn ${form.role === 'Student' ? 'active' : ''}`}
            onClick={() => setForm((c) => ({ ...c, role: 'Student' }))}
          >
            <GraduationCap size={16} /> Student Candidate
          </button>
          <button
            type="button"
            className={`role-tab-btn ${form.role === 'Company' ? 'active' : ''}`}
            onClick={() => setForm((c) => ({ ...c, role: 'Company' }))}
          >
            <Building2 size={16} /> Hiring Company
          </button>
        </div>

        <form className="auth-form register-form" onSubmit={handleSubmit}>
          <label>
            <span>Full Name</span>
            <input
              value={form.name}
              onChange={handleChange('name')}
              placeholder={form.role === 'Student' ? 'e.g. Aditi Sharma' : 'e.g. Nisha Patel'}
              required
            />
          </label>
          <label>
            <span>Email Address</span>
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="e.g. yourname@domain.com"
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              placeholder="Create strong password"
              required
            />
          </label>
          <label>
            <span>Phone Number</span>
            <input
              value={form.phone}
              onChange={handleChange('phone')}
              placeholder="+91 98765 43210"
              required
            />
          </label>

          {form.role === 'Student' && (
            <>
              <label>
                <span>Engineering Branch</span>
                <select value={form.branch} onChange={handleChange('branch')}>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Data Science & AI">Data Science & AI</option>
                </select>
              </label>
              <label>
                <span>Graduation Year</span>
                <input
                  type="number"
                  value={form.graduationYear}
                  onChange={handleChange('graduationYear')}
                  min="2024"
                  max="2030"
                />
              </label>
              <label>
                <span>Cumulative CGPA</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={form.cgpa}
                  onChange={handleChange('cgpa')}
                />
              </label>
              <label>
                <span>Key Technical Skills</span>
                <input
                  value={form.skills}
                  onChange={handleChange('skills')}
                  placeholder="Java, React, SQL, Python"
                />
              </label>
            </>
          )}

          {form.role === 'Company' && (
            <>
              <label>
                <span>Company Name</span>
                <input
                  value={form.companyName}
                  onChange={handleChange('companyName')}
                  placeholder="e.g. NovaStack Technologies"
                  required
                />
              </label>
              <label>
                <span>Industry Sector</span>
                <input
                  value={form.industry}
                  onChange={handleChange('industry')}
                  placeholder="SaaS / FinTech / AI"
                />
              </label>
              <label>
                <span>Headquarters / Location</span>
                <input
                  value={form.location}
                  onChange={handleChange('location')}
                  placeholder="Bengaluru / Hyderabad"
                />
              </label>
              <label>
                <span>Official Website</span>
                <input
                  value={form.website}
                  onChange={handleChange('website')}
                  placeholder="https://company.example"
                />
              </label>
              <label className="full-width">
                <span>Company Description</span>
                <textarea
                  value={form.companyDescription}
                  onChange={handleChange('companyDescription')}
                  placeholder="Brief overview of hiring philosophy and technology stack"
                />
              </label>
            </>
          )}

          {error && <div className="error-banner">{error}</div>}

          <div className="full-width">
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Complete Registration'} <ArrowRight size={16} />
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <span>Already registered?</span>
          <Link to="/login" className="auth-link">
            Sign in to existing account <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}

function DashboardPage({
  data,
  session,
  onLogout,
  onSwitchRole,
  onApply,
  onWithdrawApplication,
  onRegisterCourse,
  onUpdateProfile,
  onCreateTraining,
  onDeleteTraining,
  onCreateJob,
  onToggleJobStatus,
  onDeleteJob,
  onUpdateApplicationStatus,
  exportReportsCsv,
  onUpdateInstitutionRules,
  onUpdateStudentStatus,
}) {
  const { role } = useParams()
  const navigate = useNavigate()
  const normalizedRole = role
    ? role.charAt(0).toUpperCase() + role.slice(1).replace(/-/g, ' ')
    : session.role

  const institutionRules = data.institutionRules || FALLBACK_DATA.institutionRules

  const studentProfile =
    data.students.find((student) => student.email === session.email) || data.students[0]

  // Student Profile Editing State
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    fullName: studentProfile?.fullName || session.name,
    email: studentProfile?.email || session.email,
    branch: studentProfile?.branch || 'Computer Science',
    cgpa: String(studentProfile?.cgpa ?? '8.9'),
    tenthPercentage: String(studentProfile?.tenthPercentage ?? '89.2'),
    twelfthPercentage: String(studentProfile?.twelfthPercentage ?? '87.5'),
    currentBacklogs: String(studentProfile?.currentBacklogs ?? '0'),
    historyOfBacklogs: String(studentProfile?.historyOfBacklogs ?? '0'),
    attendancePercentage: String(studentProfile?.attendancePercentage ?? '88'),
    trainingAttendancePercentage: String(studentProfile?.trainingAttendancePercentage ?? '92'),
    mockTestsPassed: String(studentProfile?.mockTestsPassed ?? '2'),
    status: studentProfile?.status || 'Approved',
    phone: studentProfile?.phone || '+91 98765 43210',
    skills: studentProfile?.skills || 'Java, React, DSA',
    resumeUrl: studentProfile?.resumeUrl || '',
  })

  // Admin Institution Rules Form State
  const [rulesForm, setRulesForm] = useState({
    minCgpa: String(institutionRules.minCgpa ?? '6.0'),
    maxCurrentBacklogs: String(institutionRules.maxCurrentBacklogs ?? '0'),
    maxHistoryBacklogs: String(institutionRules.maxHistoryBacklogs ?? '2'),
    minAttendance: String(institutionRules.minAttendance ?? '75'),
    minTenthPercentage: String(institutionRules.minTenthPercentage ?? '60'),
    minTwelfthPercentage: String(institutionRules.minTwelfthPercentage ?? '60'),
    trainingCompletionRequired: Boolean(institutionRules.trainingCompletionRequired ?? true),
    minTrainingAttendance: String(institutionRules.minTrainingAttendance ?? '80'),
    minMockTestsPassed: String(institutionRules.minMockTestsPassed ?? '1'),
    requireProfileComplete: Boolean(institutionRules.requireProfileComplete ?? true),
    requiredStudentStatus: institutionRules.requiredStudentStatus || 'Approved',
  })

  // Job Search, Company Selection & Skill Filtering
  const [jobSearch, setJobSearch] = useState('')
  const [jobTypeFilter, setJobTypeFilter] = useState('ALL')
  const [companyFilter, setCompanyFilter] = useState('ALL')
  const [onlySkillMatches, setOnlySkillMatches] = useState(false)

  // Forms
  const [trainingForm, setTrainingForm] = useState({
    title: '',
    trainerName: '',
    startDate: '',
    endDate: '',
    capacity: '40',
    description: '',
  })

  const [selectedMail, setSelectedMail] = useState(null)

  const myMails = useMemo(() => {
    const email = session?.email || studentProfile?.email || 'student@placementpro.com'
    const name = session?.name || studentProfile?.fullName || ''
    return (data.studentMails || []).filter(
      (m) =>
        m.toEmail?.toLowerCase() === email.toLowerCase() ||
        m.recipientName?.toLowerCase() === name.toLowerCase(),
    )
  }, [data.studentMails, session, studentProfile])

  const [jobForm, setJobForm] = useState({
    title: '',
    companyName:
      session?.companyName ||
      (session?.role === 'Company' ? 'CodePeak Technologies' : data.companies[0]?.name || 'NovaStack'),
    location: 'Bengaluru',
    jobType: 'Full-time',
    description: '',
    skillsRequired: '',
    salaryRange: '₹12-18 LPA',
    applicationDeadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  })

  // Unique Company Names list for Company Selection
  const uniqueCompanies = useMemo(() => {
    const list = []
    const seen = new Set()
    for (const c of data.companies || []) {
      if (c.name && !seen.has(c.name)) {
        seen.add(c.name)
        list.push(c.name)
      }
    }
    for (const j of data.jobs || []) {
      if (j.companyName && !seen.has(j.companyName)) {
        seen.add(j.companyName)
        list.push(j.companyName)
      }
    }
    return list
  }, [data.companies, data.jobs])

  // Skill Match Recommendations Summary
  const skillMatchSummary = useMemo(() => {
    const activeJobs = data.jobs.filter((j) => j.active)
    const matches = activeJobs.filter(
      (job) => getSkillMatchDetails(studentProfile?.skills, job.skillsRequired).isMatch,
    )
    const fullTimeMatches = matches.filter((j) => j.jobType?.toLowerCase().includes('full'))
    const internshipMatches = matches.filter((j) => j.jobType?.toLowerCase().includes('intern'))
    return {
      totalMatches: matches.length,
      fullTimeMatches: fullTimeMatches.length,
      internshipMatches: internshipMatches.length,
    }
  }, [data.jobs, studentProfile?.skills])

  // Stats calculation
  const totalPlaced = data.applications.filter((app) =>
    ['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'SELECTED'].includes(app.status),
  ).length

  const hasResume = Boolean(studentProfile?.resumeUrl && studentProfile.resumeUrl !== '#')
  const profileCompletion = Math.min(
    100,
    Math.round(
      ((studentProfile?.fullName ? 1 : 0) * 10 +
        (studentProfile?.email ? 1 : 0) * 10 +
        (studentProfile?.phone ? 1 : 0) * 10 +
        (studentProfile?.branch ? 1 : 0) * 10 +
        (studentProfile?.cgpa ? 1 : 0) * 10 +
        (studentProfile?.tenthPercentage != null ? 1 : 0) * 10 +
        (studentProfile?.twelfthPercentage != null ? 1 : 0) * 10 +
        (studentProfile?.skills ? 1 : 0) * 15 +
        (hasResume ? 1 : 0) * 15),
    ),
  )

  const studentEligibility = useMemo(() => {
    return evaluatePlacementEligibility(studentProfile, institutionRules)
  }, [studentProfile, institutionRules])

  const studentJobs = useMemo(() => {
    return data.jobs
      .filter((job) => {
        if (!job.active && normalizedRole === 'Student') return false

        // Select company name filter
        if (companyFilter !== 'ALL' && job.companyName.toLowerCase() !== companyFilter.toLowerCase()) {
          return false
        }

        // Skill-based matching details
        const skillDetails = getSkillMatchDetails(studentProfile?.skills, job.skillsRequired)

        // Filter based on skill matches toggle or SKILL_MATCH tab
        if ((onlySkillMatches || jobTypeFilter === 'SKILL_MATCH') && !skillDetails.isMatch) {
          return false
        }

        // Filter by job type (Full-time, Internship, etc.)
        if (jobTypeFilter !== 'ALL' && jobTypeFilter !== 'SKILL_MATCH') {
          if (job.jobType.toUpperCase() !== jobTypeFilter.toUpperCase()) {
            return false
          }
        }

        // Keyword search
        const query = jobSearch.toLowerCase().trim()
        if (!query) return true

        const matchesSearch =
          job.title.toLowerCase().includes(query) ||
          job.companyName.toLowerCase().includes(query) ||
          job.skillsRequired.toLowerCase().includes(query) ||
          (job.location && job.location.toLowerCase().includes(query))
        return matchesSearch
      })
      .sort((a, b) => {
        // Prioritize skill matches so the candidate gets the best matching jobs first
        const matchA = getSkillMatchDetails(studentProfile?.skills, a.skillsRequired).matchPercentage
        const matchB = getSkillMatchDetails(studentProfile?.skills, b.skillsRequired).matchPercentage
        return matchB - matchA
      })
  }, [
    data.jobs,
    jobSearch,
    jobTypeFilter,
    companyFilter,
    onlySkillMatches,
    normalizedRole,
    studentProfile?.skills,
  ])

  const myApplications = useMemo(() => {
    return data.applications.filter((a) => a.studentId === session.id || a.studentName === session.name)
  }, [data.applications, session])

  const handleProfileSave = (e) => {
    e.preventDefault()
    onUpdateProfile({
      ...studentProfile,
      fullName: profileForm.fullName,
      email: profileForm.email,
      branch: profileForm.branch,
      cgpa: parseFloat(profileForm.cgpa) || 8.5,
      tenthPercentage: parseFloat(profileForm.tenthPercentage) || 60,
      twelfthPercentage: parseFloat(profileForm.twelfthPercentage) || 60,
      currentBacklogs: parseInt(profileForm.currentBacklogs, 10) || 0,
      historyOfBacklogs: parseInt(profileForm.historyOfBacklogs, 10) || 0,
      attendancePercentage: parseFloat(profileForm.attendancePercentage) || 75,
      trainingAttendancePercentage: parseFloat(profileForm.trainingAttendancePercentage) || 80,
      mockTestsPassed: parseInt(profileForm.mockTestsPassed, 10) || 1,
      status: profileForm.status || 'Approved',
      phone: profileForm.phone,
      skills: profileForm.skills,
      resumeUrl: profileForm.resumeUrl || 'https://example.com/uploaded-resume.pdf',
    })
    setIsEditingProfile(false)
  }

  const handleSaveInstitutionRules = (e) => {
    e.preventDefault()
    onUpdateInstitutionRules({
      minCgpa: parseFloat(rulesForm.minCgpa) || 6.0,
      maxCurrentBacklogs: parseInt(rulesForm.maxCurrentBacklogs, 10) ?? 0,
      maxHistoryBacklogs: rulesForm.maxHistoryBacklogs === '' ? null : parseInt(rulesForm.maxHistoryBacklogs, 10),
      minAttendance: parseFloat(rulesForm.minAttendance) || 75,
      minTenthPercentage: parseFloat(rulesForm.minTenthPercentage) || 60,
      minTwelfthPercentage: parseFloat(rulesForm.minTwelfthPercentage) || 60,
      trainingCompletionRequired: Boolean(rulesForm.trainingCompletionRequired),
      minTrainingAttendance: parseFloat(rulesForm.minTrainingAttendance) || 80,
      minMockTestsPassed: parseInt(rulesForm.minMockTestsPassed, 10) || 1,
      requireProfileComplete: Boolean(rulesForm.requireProfileComplete),
      requiredStudentStatus: rulesForm.requiredStudentStatus || 'Approved',
    })
  }

  const handleMockResumeUpload = () => {
    const mockUrl = `https://example.com/resumes/${(studentProfile?.fullName || 'student').toLowerCase().replace(/\s+/g, '_')}_resume.pdf`
    setProfileForm((c) => ({ ...c, resumeUrl: mockUrl }))
    onUpdateProfile({
      ...studentProfile,
      resumeUrl: mockUrl,
    })
  }

  const renderStudent = () => (
    <div className="dashboard-layout">
      {/* Top Banner & Stats */}
      <section className="card highlight-card">
        <div className="section-header">
          <div>
            <p className="section-tag">Candidate Placement Hub</p>
            <h2>Welcome back, {session.name} 👋</h2>
            <p className="card-subtext">Track campus drives, explore verified job listings, and enroll in training bootcamps.</p>
          </div>
          <div className="header-actions">
            <button
              className="action-btn-outline"
              type="button"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
            >
              <Edit3 size={15} /> {isEditingProfile ? 'Close Editor' : 'Edit Profile'}
            </button>
            <button className="ghost-btn" type="button" onClick={onLogout}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Profile completion</span>
            <strong>{profileCompletion}%</strong>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${profileCompletion}%` }} />
            </div>
          </div>
          <div className="stat-card">
            <span>Active Applications</span>
            <strong>{myApplications.length}</strong>
          </div>
          <div className="stat-card">
            <span>Interviews Scheduled</span>
            <strong>
              {myApplications.filter((app) => app.status === 'INTERVIEW_SCHEDULED').length}
            </strong>
          </div>
          <div className="stat-card">
            <span>Registered Bootcamps</span>
            <strong>
              {data.trainingPrograms.filter((p) => p.status === 'REGISTERED').length}
            </strong>
          </div>
        </div>
      </section>

      {/* Institution Placement Eligibility Clearance Card */}
      <section className="card eligibility-hub-card">
        <div className="section-header">
          <div className="eligibility-title-wrap">
            <span className="section-tag">Central Institution Compliance</span>
            <div className="eligibility-header-line">
              <ShieldCheck size={22} className="accent-teal" />
              <h3>Placement Eligibility Verification Dossier</h3>
              <span
                className={`status-badge ${
                  studentEligibility.isEligible ? 'status-cleared' : 'status-blocked'
                }`}
              >
                {studentEligibility.isEligible ? (
                  <>
                    <CheckCircle2 size={14} /> Drive Cleared (Eligible)
                  </>
                ) : (
                  <>
                    <AlertTriangle size={14} /> Action Required (Ineligible)
                  </>
                )}
              </span>
            </div>
            <p className="card-subtext">
              Institution-level rules are configured by the TPO / Placement Cell and apply strictly to every recruitment drive.
            </p>
          </div>
          <span className="tag-pill">
            {studentEligibility.criteria.filter((c) => c.passed).length} of {studentEligibility.criteria.length} Rules Satisfied
          </span>
        </div>

        {/* Global Clearance Banner */}
        <div
          className={`eligibility-alert-strip ${
            studentEligibility.isEligible ? 'strip-success' : 'strip-warning'
          }`}
        >
          {studentEligibility.isEligible ? (
            <div className="strip-content">
              <CheckCircle2 size={20} className="strip-icon-success" />
              <div>
                <strong>All Institutional Placement Criteria Satisfied</strong>
                <p>
                  You satisfy all 8 institution-level rules. You are officially cleared to apply for all active recruitment drives before each respective application deadline.
                </p>
              </div>
            </div>
          ) : (
            <div className="strip-content">
              <AlertTriangle size={20} className="strip-icon-warning" />
              <div>
                <strong>
                  Drive Application Restrictions in Effect ({studentEligibility.reasons.length} unmet rule
                  {studentEligibility.reasons.length > 1 ? 's' : ''})
                </strong>
                <p>
                  You are restricted from submitting drive applications until the failing criteria are rectified: {studentEligibility.reasons.join(' • ')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 8 Rules Breakdown Grid */}
        <div className="eligibility-criteria-grid">
          {studentEligibility.criteria.map((item) => (
            <div key={item.id} className={`rule-card ${item.passed ? 'rule-pass' : 'rule-fail'}`}>
              <div className="rule-card-top">
                <div className="rule-name-group">
                  <span className={`rule-status-dot ${item.passed ? 'dot-pass' : 'dot-fail'}`} />
                  <strong>{item.title}</strong>
                </div>
                <span className={`rule-chip ${item.passed ? 'chip-pass' : 'chip-fail'}`}>
                  {item.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div className="rule-details">
                <div className="rule-data-row">
                  <span className="rule-label">Required:</span>
                  <span className="rule-req">{item.requirement}</span>
                </div>
                <div className="rule-data-row">
                  <span className="rule-label">Your Record:</span>
                  <span className={`rule-actual ${item.passed ? 'text-success' : 'text-danger'}`}>
                    {item.actual}
                  </span>
                </div>
              </div>
              {!item.passed && (
                <div className="rule-fail-hint">
                  <AlertCircle size={12} /> {item.failReason}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Profile Editor Modal / Inline form */}
      {isEditingProfile && (
        <section className="card edit-profile-box">
          <div className="section-header">
            <h3>Update Candidate Profile & Academic Scores</h3>
            <button type="button" className="close-btn" onClick={() => setIsEditingProfile(false)}>
              <X size={16} />
            </button>
          </div>
          <form className="auth-form register-form" onSubmit={handleProfileSave}>
            <label>
              <span>Full Name</span>
              <input
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                required
              />
            </label>
            <label>
              <span>Email</span>
              <input
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                required
              />
            </label>
            <label>
              <span>Engineering Branch</span>
              <input
                value={profileForm.branch}
                onChange={(e) => setProfileForm({ ...profileForm, branch: e.target.value })}
                required
              />
            </label>
            <label>
              <span>Cumulative CGPA</span>
              <input
                type="number"
                step="0.01"
                value={profileForm.cgpa}
                onChange={(e) => setProfileForm({ ...profileForm, cgpa: e.target.value })}
                required
              />
            </label>
            <label>
              <span>10th Percentage (%)</span>
              <input
                type="number"
                step="0.1"
                value={profileForm.tenthPercentage}
                onChange={(e) => setProfileForm({ ...profileForm, tenthPercentage: e.target.value })}
                required
              />
            </label>
            <label>
              <span>12th / Diploma Percentage (%)</span>
              <input
                type="number"
                step="0.1"
                value={profileForm.twelfthPercentage}
                onChange={(e) => setProfileForm({ ...profileForm, twelfthPercentage: e.target.value })}
                required
              />
            </label>
            <label>
              <span>Current Active Backlogs</span>
              <input
                type="number"
                min="0"
                value={profileForm.currentBacklogs}
                onChange={(e) => setProfileForm({ ...profileForm, currentBacklogs: e.target.value })}
                required
              />
            </label>
            <label>
              <span>History of Backlogs</span>
              <input
                type="number"
                min="0"
                value={profileForm.historyOfBacklogs}
                onChange={(e) => setProfileForm({ ...profileForm, historyOfBacklogs: e.target.value })}
                required
              />
            </label>
            <label>
              <span>Academic Attendance (%)</span>
              <input
                type="number"
                step="0.1"
                value={profileForm.attendancePercentage}
                onChange={(e) => setProfileForm({ ...profileForm, attendancePercentage: e.target.value })}
                required
              />
            </label>
            <label>
              <span>Training Attendance (%)</span>
              <input
                type="number"
                step="0.1"
                value={profileForm.trainingAttendancePercentage}
                onChange={(e) => setProfileForm({ ...profileForm, trainingAttendancePercentage: e.target.value })}
                required
              />
            </label>
            <label>
              <span>Passed Mock Tests</span>
              <input
                type="number"
                min="0"
                value={profileForm.mockTestsPassed}
                onChange={(e) => setProfileForm({ ...profileForm, mockTestsPassed: e.target.value })}
                required
              />
            </label>
            <label>
              <span>Student Clearance Status</span>
              <select
                value={profileForm.status}
                onChange={(e) => setProfileForm({ ...profileForm, status: e.target.value })}
              >
                <option value="Approved">Approved</option>
                <option value="Debarred">Debarred</option>
                <option value="Pending">Pending</option>
              </select>
            </label>
            <label>
              <span>Phone</span>
              <input
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                required
              />
            </label>
            <label>
              <span>Key Skills (comma separated)</span>
              <input
                value={profileForm.skills}
                onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                required
              />
            </label>
            <label className="full-width">
              <span>Resume URL</span>
              <input
                value={profileForm.resumeUrl}
                onChange={(e) => setProfileForm({ ...profileForm, resumeUrl: e.target.value })}
                placeholder="https://example.com/resume.pdf"
              />
            </label>
            <div className="full-width btn-group">
              <button type="submit" className="primary-btn">
                <CheckCircle2 size={16} /> Save Profile Changes
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={handleMockResumeUpload}
              >
                <Upload size={16} /> Instant Resume Upload
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Split Profile and Training */}
      <section className="card split-panel">
        <div className="panel-block">
          <div className="panel-header">
            <h3>Candidate Academic Dossier</h3>
            <button
              type="button"
              className="text-btn"
              onClick={handleMockResumeUpload}
            >
              <Upload size={14} /> Upload Resume
            </button>
          </div>
          <ul className="info-list">
            <li>
              <strong>Candidate Name:</strong> {studentProfile?.fullName || session.name}
            </li>
            <li>
              <strong>College Email:</strong> {studentProfile?.email || session.email}
            </li>
            <li>
              <strong>Degree Branch:</strong> {studentProfile?.branch || 'Computer Science'}
            </li>
            <li>
              <strong>Cumulative CGPA:</strong> {studentProfile?.cgpa ?? '8.9'} / 10.0
            </li>
            <li>
              <strong>10th & 12th/Diploma:</strong> 10th: {studentProfile?.tenthPercentage ?? 89.2}% • 12th: {studentProfile?.twelfthPercentage ?? 87.5}%
            </li>
            <li>
              <strong>Backlogs (Active / History):</strong> {studentProfile?.currentBacklogs ?? 0} active • {studentProfile?.historyOfBacklogs ?? 0} historical
            </li>
            <li>
              <strong>Academic Attendance:</strong> {studentProfile?.attendancePercentage ?? 88}%
            </li>
            <li>
              <strong>Training Attendance & Mocks:</strong> {studentProfile?.trainingAttendancePercentage ?? 92}% att. • {studentProfile?.mockTestsPassed ?? 2} passed test(s)
            </li>
            <li>
              <strong>Institutional Clearance:</strong>{' '}
              <span
                className={`badge ${
                  (studentProfile?.status || 'Approved') === 'Approved'
                    ? 'badge-success'
                    : 'badge-danger'
                }`}
              >
                {studentProfile?.status || 'Approved'}
              </span>
            </li>
            <li>
              <strong>Core Competencies:</strong> {studentProfile?.skills || 'Java, React, SQL'}
            </li>
            <li>
              <strong>Resume Status:</strong>{' '}
              {studentProfile?.resumeUrl && studentProfile.resumeUrl !== '#' ? (
                <span className="badge badge-success">
                  <ClipboardCheck size={12} /> Uploaded & Verified
                </span>
              ) : (
                <span className="badge badge-warning">Pending Upload</span>
              )}
            </li>
          </ul>
        </div>

        <div className="panel-block">
          <div className="panel-header">
            <h3>Skill Training & Bootcamps</h3>
            <span className="tag-pill">{data.trainingPrograms.length} Available</span>
          </div>
          <div className="stack-list">
            {data.trainingPrograms.map((program) => {
              const isRegistered = program.status === 'REGISTERED'
              return (
                <div key={program.id} className="stack-item">
                  <div>
                    <strong>{program.title}</strong>
                    <span className="muted-text">
                      Mentor: {program.trainerName} • Capacity: {program.capacity} Seats
                    </span>
                    <p className="tiny-desc">{program.description}</p>
                  </div>
                  <button
                    type="button"
                    className={isRegistered ? 'registered-btn' : 'register-btn'}
                    onClick={() => onRegisterCourse(program.id)}
                  >
                    {isRegistered ? (
                      <>
                        <CheckCircle2 size={14} /> Enrolled
                      </>
                    ) : (
                      'Register Now'
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* My Submitted Applications */}
      {myApplications.length > 0 && (
        <section className="card">
          <div className="section-header">
            <h3>My Job Applications & Interview Rounds</h3>
            <span className="tag-pill">{myApplications.length} Submissions</span>
          </div>
          <div className="job-list">
            {myApplications.map((app) => {
              const matchingJob = data.jobs.find((j) => j.id === app.jobId || j.title === app.jobTitle)
              const deadline = app.applicationDeadline || matchingJob?.applicationDeadline
              let deadlinePassed = false
              let daysRemaining = null
              if (deadline) {
                const deadlineDate = new Date(deadline + 'T23:59:59')
                const now = new Date()
                deadlinePassed = now > deadlineDate
                const diffTime = deadlineDate - now
                daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
              }

              return (
                <article key={app.id} className="job-card applied-card">
                  <div className="job-head">
                    <div>
                      <h4>{app.jobTitle}</h4>
                      <div className="application-meta-row">
                        <span className="muted-text">
                          Applied on: {(app.appliedAt || '').slice(0, 10) || 'Recent'}
                        </span>
                        {deadline && (
                          <span
                            className={`app-deadline-badge ${
                              deadlinePassed ? 'deadline-badge-expired' : 'deadline-badge-active'
                            }`}
                          >
                            <Clock size={12} /> Drive Deadline: {deadline}{' '}
                            {deadlinePassed ? '(Closed)' : `(${daysRemaining}d left)`}
                          </span>
                        )}
                      </div>
                    </div>
                  <span
                    className={`badge ${
                      app.status === 'OFFERED'
                        ? 'badge-success'
                        : app.status === 'INTERVIEW_SCHEDULED'
                        ? 'badge-warning'
                        : app.status === 'SHORTLISTED'
                        ? 'badge-purple'
                        : 'badge-info'
                    }`}
                  >
                    {app.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="application-actions">
                  <button
                    type="button"
                    className="danger-btn-sm"
                    onClick={() => onWithdrawApplication(app.id)}
                  >
                    <Trash2 size={13} /> Withdraw Application
                  </button>
                </div>
              </article>
            )})}
          </div>
        </section>
      )}

      {/* Browse Job Postings */}
      <section className="card">
        <div className="section-header">
          <div>
            <h3>Campus Recruitment Drives</h3>
            <span className="card-subtext">Verified job openings with direct partner interview tracks</span>
          </div>

          <div className="filter-controls">
            {/* Select Company Name Dropdown */}
            <div className="company-filter-box">
              <Building2 size={15} />
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                aria-label="Select Company Name"
              >
                <option value="ALL">All Companies ({uniqueCompanies.length})</option>
                {uniqueCompanies.map((cName) => (
                  <option key={cName} value={cName}>
                    {cName}
                  </option>
                ))}
              </select>
            </div>

            <div className="search-box">
              <Search size={15} />
              <input
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                placeholder="Search jobs, skills, companies..."
              />
              {jobSearch && (
                <button type="button" className="clear-search" onClick={() => setJobSearch('')}>
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="filter-pills">
              <button
                type="button"
                className={`filter-btn ${jobTypeFilter === 'ALL' && !onlySkillMatches ? 'active' : ''}`}
                onClick={() => {
                  setJobTypeFilter('ALL')
                  setOnlySkillMatches(false)
                }}
              >
                All
              </button>
              <button
                type="button"
                className={`filter-btn ${jobTypeFilter === 'SKILL_MATCH' || onlySkillMatches ? 'active' : ''}`}
                onClick={() => {
                  setJobTypeFilter('SKILL_MATCH')
                  setOnlySkillMatches(true)
                }}
              >
                <Sparkles size={12} /> Skill Matches ({skillMatchSummary.totalMatches})
              </button>
              <button
                type="button"
                className={`filter-btn ${jobTypeFilter === 'FULL-TIME' ? 'active' : ''}`}
                onClick={() => setJobTypeFilter('FULL-TIME')}
              >
                Full-time
              </button>
              <button
                type="button"
                className={`filter-btn ${jobTypeFilter === 'INTERNSHIP' ? 'active' : ''}`}
                onClick={() => setJobTypeFilter('INTERNSHIP')}
              >
                Internship
              </button>
              <button
                type="button"
                className={`filter-btn ${jobTypeFilter === 'REMOTE' ? 'active' : ''}`}
                onClick={() => setJobTypeFilter('REMOTE')}
              >
                Remote
              </button>
            </div>
          </div>
        </div>

        {/* Intelligent Skill-Matched Recommendations Banner */}
        <div className="skill-recommendations-banner">
          <div className="skill-rec-left">
            <div className="skill-rec-title">
              <Sparkles size={18} className="accent-teal" />
              <strong>Intelligent Skill-Matched Drives</strong>
              <span className="skill-count-badge">
                {skillMatchSummary.totalMatches} Matched Openings
              </span>
            </div>
            <p>
              Tailored for your profile skills (
              <span className="text-highlight">
                {studentProfile?.skills || 'Add skills in profile'}
              </span>
              ): Found <strong>{skillMatchSummary.fullTimeMatches} Full-time</strong> jobs &{' '}
              <strong>{skillMatchSummary.internshipMatches} Internships</strong> aligned with your stack.
            </p>
          </div>
          <div className="skill-rec-actions">
            <button
              type="button"
              className={`rec-chip-btn ${onlySkillMatches || jobTypeFilter === 'SKILL_MATCH' ? 'active' : ''}`}
              onClick={() => {
                setOnlySkillMatches(!onlySkillMatches)
                if (jobTypeFilter === 'SKILL_MATCH') setJobTypeFilter('ALL')
              }}
            >
              <Sparkles size={13} /> {onlySkillMatches ? 'Show All Openings' : 'Filter Matched Skills Only'}
            </button>
            <button
              type="button"
              className={`rec-chip-btn ${jobTypeFilter === 'FULL-TIME' && onlySkillMatches ? 'active' : ''}`}
              onClick={() => {
                setJobTypeFilter('FULL-TIME')
                setOnlySkillMatches(true)
              }}
            >
              Matched Full-Time ({skillMatchSummary.fullTimeMatches})
            </button>
            <button
              type="button"
              className={`rec-chip-btn ${jobTypeFilter === 'INTERNSHIP' && onlySkillMatches ? 'active' : ''}`}
              onClick={() => {
                setJobTypeFilter('INTERNSHIP')
                setOnlySkillMatches(true)
              }}
            >
              Matched Internships ({skillMatchSummary.internshipMatches})
            </button>
          </div>
        </div>

        <div className="job-list">
          {studentJobs.map((job) => {
            const hasApplied = data.applications.some(
              (app) =>
                app.jobId === job.id &&
                (app.studentId === session.id || app.studentName === session.name),
            )
            const applicationRecord = data.applications.find(
              (app) =>
                app.jobId === job.id &&
                (app.studentId === session.id || app.studentName === session.name),
            )
            const jobEligibility = evaluatePlacementEligibility(studentProfile, institutionRules, job)
            const matchDetails = getSkillMatchDetails(studentProfile?.skills, job.skillsRequired)

            return (
              <article key={job.id} className="job-card">
                <div className="job-head">
                  <div>
                    <h4>{job.title}</h4>
                    <span className="company-tag">
                      <Building2 size={14} /> {job.companyName}
                    </span>
                  </div>
                  <span className="badge badge-info">{job.jobType}</span>
                </div>

                {matchDetails.isMatch && (
                  <div className="skill-match-row">
                    <span className="skill-match-tag">
                      <Sparkles size={12} /> {matchDetails.matchPercentage}% Skill Match ({matchDetails.matchCount}/{matchDetails.totalJobSkills} skills)
                    </span>
                  </div>
                )}

                <p>{job.description}</p>
                <div className="skill-tags">
                  {job.skillsRequired.split(',').map((skill) => {
                    const trimmed = skill.trim()
                    const isMatched = matchDetails.matchedSkills.some(
                      (m) => m.toLowerCase() === trimmed.toLowerCase(),
                    )
                    return (
                      <span
                        key={trimmed}
                        className={`skill-pill ${isMatched ? 'skill-pill-matched' : ''}`}
                        title={isMatched ? 'Matches your skill profile!' : undefined}
                      >
                        {isMatched && <Check size={11} />} {trimmed}
                      </span>
                    )
                  })}
                </div>
                <div className="job-meta">
                  <span>📍 {job.location}</span>
                  <span>💰 {job.salaryRange}</span>
                </div>

                <div className="job-deadline-bar">
                  <span
                    className={`deadline-tag ${
                      jobEligibility.deadlinePassed
                        ? 'deadline-expired'
                        : jobEligibility.daysRemaining !== null && jobEligibility.daysRemaining <= 3
                        ? 'deadline-urgent'
                        : 'deadline-normal'
                    }`}
                  >
                    <Clock size={13} />
                    {jobEligibility.deadlinePassed
                      ? `Application Deadline Closed (${job.applicationDeadline || 'Expired'})`
                      : `Application Deadline: ${job.applicationDeadline || 'Ongoing'} (${jobEligibility.daysRemaining ?? '14'} days left)`}
                  </span>
                </div>

                {hasApplied ? (
                  <div className="applied-btn-wrap">
                    <button type="button" className="applied-btn" disabled>
                      <CheckCircle2 size={15} /> Applied ({applicationRecord?.status || 'PENDING'})
                    </button>
                    <button
                      type="button"
                      className="withdraw-link-btn"
                      onClick={() => onWithdrawApplication(applicationRecord.id)}
                    >
                      Withdraw
                    </button>
                  </div>
                ) : jobEligibility.deadlinePassed ? (
                  <button type="button" className="btn-disabled-deadline" disabled>
                    <Clock size={14} /> Deadline Closed
                  </button>
                ) : !studentEligibility.isEligible ? (
                  <button
                    type="button"
                    className="ineligible-btn"
                    onClick={() =>
                      showToast(
                        `Placement Ineligible: ${studentEligibility.reasons[0] || 'Institution criteria unmet'}. Check your Placement Verification Dossier above.`,
                        'info',
                      )
                    }
                  >
                    <Ban size={14} /> Ineligible (Rules Unmet)
                  </button>
                ) : (
                  <button type="button" className="primary-btn" onClick={() => onApply(job.id)}>
                    Apply Now <ArrowRight size={14} />
                  </button>
                )}
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )

  const renderAdmin = () => (
    <div className="dashboard-layout">
      {/* Top Banner & Stats */}
      <section className="card highlight-card">
        <div className="section-header">
          <div>
            <p className="section-tag">Placement Officer Command Center</p>
            <h2>Training & Placement Administration</h2>
            <p className="card-subtext">Manage enterprise drives, student eligibility, training programs & placement metrics.</p>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="action-btn-primary"
              onClick={exportReportsCsv}
            >
              <Download size={16} /> Export Placement Report CSV
            </button>
            <button className="ghost-btn" type="button" onClick={onLogout}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Enrolled Students</span>
            <strong>{data.students.length}</strong>
          </div>
          <div className="stat-card">
            <span>Partner Companies</span>
            <strong>{data.companies.length}</strong>
          </div>
          <div className="stat-card">
            <span>Active Job Openings</span>
            <strong>{data.jobs.filter((job) => job.active).length}</strong>
          </div>
          <div className="stat-card">
            <span>Placed / Shortlisted</span>
            <strong>{totalPlaced}</strong>
          </div>
        </div>
      </section>

      {/* Institution-Level Placement Eligibility Rules (Admin Control Center) */}
      <section className="card admin-rules-card">
        <div className="section-header">
          <div>
            <div className="eligibility-header-line">
              <Settings size={20} className="accent-teal" />
              <h3>Institution-Level Placement Eligibility Rules</h3>
            </div>
            <p className="card-subtext">
              Set by Admin • Centrally enforced across every campus drive & job application
            </p>
          </div>
          <span className="tag-pill">Drive Compliance Engine</span>
        </div>

        <form onSubmit={handleSaveInstitutionRules}>
          <div className="rules-form-grid">
            <div className="rules-field">
              <span>Minimum CGPA (e.g. 6.0)</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={rulesForm.minCgpa}
                onChange={(e) => setRulesForm({ ...rulesForm, minCgpa: e.target.value })}
                required
              />
            </div>
            <div className="rules-field">
              <span>Max Current Backlogs Allowed (e.g. 0 or 1)</span>
              <input
                type="number"
                min="0"
                value={rulesForm.maxCurrentBacklogs}
                onChange={(e) => setRulesForm({ ...rulesForm, maxCurrentBacklogs: e.target.value })}
                required
              />
            </div>
            <div className="rules-field">
              <span>Max History of Backlogs (Optional)</span>
              <input
                type="number"
                min="0"
                placeholder="Leave empty or set limit"
                value={rulesForm.maxHistoryBacklogs}
                onChange={(e) => setRulesForm({ ...rulesForm, maxHistoryBacklogs: e.target.value })}
              />
            </div>
            <div className="rules-field">
              <span>Minimum Attendance % (e.g. 75%)</span>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={rulesForm.minAttendance}
                onChange={(e) => setRulesForm({ ...rulesForm, minAttendance: e.target.value })}
                required
              />
            </div>
            <div className="rules-field">
              <span>Minimum 10th Percentage</span>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={rulesForm.minTenthPercentage}
                onChange={(e) => setRulesForm({ ...rulesForm, minTenthPercentage: e.target.value })}
                required
              />
            </div>
            <div className="rules-field">
              <span>Minimum 12th / Diploma Percentage</span>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={rulesForm.minTwelfthPercentage}
                onChange={(e) => setRulesForm({ ...rulesForm, minTwelfthPercentage: e.target.value })}
                required
              />
            </div>
            <div className="rules-field">
              <span>Min Training Attendance % (e.g. 80%)</span>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={rulesForm.minTrainingAttendance}
                onChange={(e) => setRulesForm({ ...rulesForm, minTrainingAttendance: e.target.value })}
                required
              />
            </div>
            <div className="rules-field">
              <span>Min Mock Tests Passed (e.g. 1)</span>
              <input
                type="number"
                min="0"
                value={rulesForm.minMockTestsPassed}
                onChange={(e) => setRulesForm({ ...rulesForm, minMockTestsPassed: e.target.value })}
                required
              />
            </div>
            <div className="rules-field">
              <span>Student Clearance Requirement</span>
              <select
                value={rulesForm.requiredStudentStatus}
                onChange={(e) => setRulesForm({ ...rulesForm, requiredStudentStatus: e.target.value })}
              >
                <option value="Approved">Status must be "Approved" (Not Debarred)</option>
                <option value="Any">Allow Any Status</option>
              </select>
            </div>
            <div className="rules-toggle-item">
              <input
                type="checkbox"
                id="reqProfileComplete"
                checked={rulesForm.requireProfileComplete}
                onChange={(e) => setRulesForm({ ...rulesForm, requireProfileComplete: e.target.checked })}
              />
              <label htmlFor="reqProfileComplete">
                Profile 100% complete and resume uploaded
              </label>
            </div>
            <div className="rules-toggle-item">
              <input
                type="checkbox"
                id="reqTrainingCompletion"
                checked={rulesForm.trainingCompletionRequired}
                onChange={(e) => setRulesForm({ ...rulesForm, trainingCompletionRequired: e.target.checked })}
              />
              <label htmlFor="reqTrainingCompletion">
                Training completion required (attendance & passed mock test)
              </label>
            </div>
          </div>
          <div className="save-rules-btn-wrap">
            <button type="submit" className="primary-btn">
              <ShieldCheck size={16} /> Save & Enforce Institutional Rules to Every Drive
            </button>
          </div>
        </form>
      </section>

      {/* Split: Create Training & Reports */}
      <section className="card split-panel">
        <div className="panel-block">
          <div className="panel-header">
            <h3>Schedule New Training Program</h3>
            <span className="tag-pill">Skill Development</span>
          </div>
          <form
            className="compact-form"
            onSubmit={(event) => {
              event.preventDefault()
              onCreateTraining(trainingForm)
              setTrainingForm({
                title: '',
                trainerName: '',
                startDate: '',
                endDate: '',
                capacity: '40',
                description: '',
              })
            }}
          >
            <input
              value={trainingForm.title}
              onChange={(e) => setTrainingForm({ ...trainingForm, title: e.target.value })}
              placeholder="Program Title (e.g., Cloud DevOps & Microservices)"
              required
            />
            <input
              value={trainingForm.trainerName}
              onChange={(e) => setTrainingForm({ ...trainingForm, trainerName: e.target.value })}
              placeholder="Lead Trainer / Instructor Name"
              required
            />
            <div className="two-col">
              <label>
                <span className="tiny-label">Start Date</span>
                <input
                  type="date"
                  value={trainingForm.startDate}
                  onChange={(e) => setTrainingForm({ ...trainingForm, startDate: e.target.value })}
                  required
                />
              </label>
              <label>
                <span className="tiny-label">End Date</span>
                <input
                  type="date"
                  value={trainingForm.endDate}
                  onChange={(e) => setTrainingForm({ ...trainingForm, endDate: e.target.value })}
                  required
                />
              </label>
            </div>
            <div className="two-col">
              <input
                type="number"
                value={trainingForm.capacity}
                onChange={(e) => setTrainingForm({ ...trainingForm, capacity: e.target.value })}
                placeholder="Student Capacity (Seats)"
                required
              />
              <input
                value={trainingForm.description}
                onChange={(e) => setTrainingForm({ ...trainingForm, description: e.target.value })}
                placeholder="Curriculum Summary"
                required
              />
            </div>
            <button type="submit" className="primary-btn">
              <PlusCircle size={16} /> Schedule Training Program
            </button>
          </form>
        </div>

        <div className="panel-block">
          <div className="panel-header">
            <h3>Placement Analytics & Quick Export</h3>
            <span className="tag-pill">Real-time</span>
          </div>
          <ul className="info-list">
            <li>
              <strong>Department Placed %:</strong> CSE: 86% • ECE: 78% • IT: 82%
            </li>
            <li>
              <strong>Total Campus Drives:</strong> {data.companies.length} Tier-1 & Tier-2 firms
            </li>
            <li>
              <strong>Highest Package:</strong> ₹24.5 LPA (Cloud Security Engineer)
            </li>
            <li>
              <strong>Average Package:</strong> ₹14.2 LPA
            </li>
            <li>
              <strong>Total Student Offers:</strong>{' '}
              {data.applications.filter((a) => a.status === 'OFFERED').length} Confirmed
            </li>
          </ul>
          <div className="btn-group-column">
            <button type="button" className="action-btn-primary" onClick={exportReportsCsv}>
              <Download size={16} /> Download Placement Report (CSV)
            </button>
          </div>
        </div>
      </section>

      {/* Review Candidate Applications */}
      <section className="card">
        <div className="section-header">
          <div>
            <h3>Candidate Selection & Status Pipeline</h3>
            <span className="card-subtext">Review applications and advance student candidates through rounds</span>
          </div>
          <span className="tag-pill">{data.applications.length} Applications</span>
        </div>

        <div className="applicant-table-wrap">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Applied Job</th>
                <th>Applied Date</th>
                <th>Application Deadline</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {data.applications.map((application) => {
                const jobMatch = data.jobs.find(
                  (j) => j.id === application.jobId || j.title === application.jobTitle,
                )
                const deadline = application.applicationDeadline || jobMatch?.applicationDeadline
                let isExpired = false
                let daysLeft = null
                if (deadline) {
                  const dDate = new Date(deadline + 'T23:59:59')
                  const now = new Date()
                  isExpired = now > dDate
                  daysLeft = Math.max(0, Math.ceil((dDate - now) / (1000 * 60 * 60 * 24)))
                }

                return (
                  <tr key={application.id}>
                    <td>
                      <strong>{application.studentName}</strong>
                    </td>
                    <td>{application.jobTitle}</td>
                    <td>{(application.appliedAt || '').slice(0, 10)}</td>
                    <td>
                      {deadline ? (
                        <span
                          className={`deadline-cell-badge ${
                            isExpired ? 'deadline-badge-expired' : 'deadline-badge-active'
                          }`}
                        >
                          <Clock size={12} /> {deadline}{' '}
                          <span className="deadline-cell-sub">
                            {isExpired ? '(Closed)' : `(${daysLeft}d left)`}
                          </span>
                        </span>
                      ) : (
                        <span className="muted-text">Rolling</span>
                      )}
                    </td>
                  <td>
                    <span
                      className={`badge ${
                        application.status === 'OFFERED'
                          ? 'badge-success'
                          : application.status === 'INTERVIEW_SCHEDULED'
                          ? 'badge-warning'
                          : application.status === 'SHORTLISTED'
                          ? 'badge-purple'
                          : application.status === 'REJECTED'
                          ? 'badge-danger'
                          : 'badge-info'
                      }`}
                    >
                      {application.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn-tiny btn-purple"
                        onClick={() => onUpdateApplicationStatus(application.id, 'SHORTLISTED')}
                      >
                        Shortlist
                      </button>
                      <button
                        type="button"
                        className="btn-tiny btn-amber"
                        onClick={() => onUpdateApplicationStatus(application.id, 'INTERVIEW_SCHEDULED')}
                      >
                        Interview
                      </button>
                      <button
                        type="button"
                        className="btn-tiny btn-emerald"
                        onClick={() => onUpdateApplicationStatus(application.id, 'OFFERED')}
                      >
                        Offer
                      </button>
                      <button
                        type="button"
                        className="btn-tiny btn-red"
                        onClick={() => onUpdateApplicationStatus(application.id, 'REJECTED')}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </section>

      {/* Student Placement Clearance & Disciplinary Governance */}
      <section className="card">
        <div className="section-header">
          <div>
            <h3>Student Placement Clearance & Disciplinary Governance</h3>
            <span className="card-subtext">
              Review institutional eligibility criteria compliance and approve or debar students from campus drives
            </span>
          </div>
          <span className="tag-pill">{data.students.length} Candidates</span>
        </div>

        <div className="applicant-table-wrap">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Branch & CGPA</th>
                <th>Academic % (10th / 12th)</th>
                <th>Backlogs (Cur / Hist)</th>
                <th>Attendance (Col / Trn)</th>
                <th>Clearance Status</th>
                <th>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((student) => {
                const evalResult = evaluatePlacementEligibility(student, institutionRules)
                return (
                  <tr key={student.id}>
                    <td>
                      <div>
                        <strong>{student.fullName}</strong>
                        <div className="tiny-label">{student.email}</div>
                      </div>
                    </td>
                    <td>
                      <div>{student.branch}</div>
                      <div className="tiny-label">CGPA: {student.cgpa}</div>
                    </td>
                    <td>
                      <div>10th: {student.tenthPercentage ?? 'N/A'}%</div>
                      <div className="tiny-label">12th: {student.twelfthPercentage ?? 'N/A'}%</div>
                    </td>
                    <td>
                      <span className={student.currentBacklogs > 0 ? 'text-danger' : 'text-success'}>
                        Curr: {student.currentBacklogs ?? 0}
                      </span>{' '}
                      • Hist: {student.historyOfBacklogs ?? 0}
                    </td>
                    <td>
                      <div>Col: {student.attendancePercentage ?? 0}%</div>
                      <div className="tiny-label">
                        Trn: {student.trainingAttendancePercentage ?? 0}% (Mocks: {student.mockTestsPassed ?? 0})
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          student.status === 'Approved'
                            ? 'badge-success'
                            : student.status === 'Debarred'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {student.status || 'Pending'}
                      </span>
                      {!evalResult.isEligible && (
                        <div className="tiny-label text-danger" title={evalResult.reasons.join(', ')}>
                          ⚠ Criteria Unmet ({evalResult.reasons.length})
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn-tiny btn-emerald"
                          title="Clear & Approve student for drives"
                          onClick={() => onUpdateStudentStatus(student.id, 'Approved')}
                        >
                          <Check size={12} /> Approve
                        </button>
                        <button
                          type="button"
                          className="btn-tiny btn-red"
                          title="Debar student from participating in drives"
                          onClick={() => onUpdateStudentStatus(student.id, 'Debarred')}
                        >
                          <Ban size={12} /> Debar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Training Programs Management */}
      <section className="card">
        <div className="section-header">
          <h3>Manage Scheduled Training Programs</h3>
          <span className="tag-pill">{data.trainingPrograms.length} Bootcamps</span>
        </div>
        <div className="job-list">
          {data.trainingPrograms.map((prog) => (
            <article key={prog.id} className="job-card">
              <div className="job-head">
                <div>
                  <h4>{prog.title}</h4>
                  <span className="muted-text">Trainer: {prog.trainerName}</span>
                </div>
                <span className="badge badge-info">{prog.status}</span>
              </div>
              <p>{prog.description}</p>
              <div className="job-meta">
                <span>Start: {prog.startDate}</span>
                <span>Capacity: {prog.capacity}</span>
              </div>
              <div className="action-row">
                <button
                  type="button"
                  className="danger-btn-sm"
                  onClick={() => onDeleteTraining(prog.id)}
                >
                  <Trash2 size={14} /> Remove Program
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )

  const renderCompany = () => (
    <div className="dashboard-layout">
      {/* Top Banner & Stats */}
      <section className="card highlight-card">
        <div className="section-header">
          <div>
            <p className="section-tag">Corporate Recruitment Console</p>
            <h2>{session.name} Recruiter Workspace</h2>
            <p className="card-subtext">Publish campus job drives, screen student profiles & schedule technical interviews.</p>
          </div>
          <button className="ghost-btn" type="button" onClick={onLogout}>
            <LogOut size={15} /> Logout
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Active Openings</span>
            <strong>{data.jobs.filter((job) => job.active).length}</strong>
          </div>
          <div className="stat-card">
            <span>Total Applicants</span>
            <strong>{data.applications.length}</strong>
          </div>
          <div className="stat-card">
            <span>Shortlisted for Screening</span>
            <strong>
              {data.applications.filter((app) => app.status === 'SHORTLISTED').length}
            </strong>
          </div>
          <div className="stat-card">
            <span>Interviews in Pipeline</span>
            <strong>
              {data.applications.filter((app) => app.status === 'INTERVIEW_SCHEDULED').length}
            </strong>
          </div>
        </div>
      </section>

      {/* Split: Post Job & Applicants */}
      <section className="card split-panel">
        <div className="panel-block">
          <div className="panel-header">
            <h3>Publish New Campus Job Posting</h3>
            <span className="tag-pill">Job Opening</span>
          </div>
          <form
            className="compact-form"
            onSubmit={(event) => {
              event.preventDefault()
              onCreateJob(jobForm)
              setJobForm({
                title: '',
                companyName: session?.name || data.companies[0]?.name || 'NovaStack',
                location: 'Bengaluru',
                jobType: 'Full-time',
                description: '',
                skillsRequired: '',
                salaryRange: '₹12-18 LPA',
                applicationDeadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
              })
            }}
          >
            <div className="two-col">
              <input
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                placeholder="Job Title (e.g. Backend Software Engineer)"
                required
              />
              <select
                value={jobForm.companyName}
                onChange={(e) => setJobForm({ ...jobForm, companyName: e.target.value })}
                required
                aria-label="Select Company Name"
              >
                <option value="">-- Select Company Name --</option>
                {data.companies.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.industry || 'Tech'})
                  </option>
                ))}
                {session?.name && !data.companies.some((c) => c.name === session.name) && (
                  <option value={session.name}>{session.name} (My Account)</option>
                )}
              </select>
            </div>
            <div className="two-col">
              <input
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                placeholder="Job Location"
                required
              />
              <select
                value={jobForm.jobType}
                onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            <div className="two-col">
              <input
                value={jobForm.skillsRequired}
                onChange={(e) => setJobForm({ ...jobForm, skillsRequired: e.target.value })}
                placeholder="Required Skills (e.g. Java, Spring Boot, MySQL, REST)"
                required
              />
              <input
                value={jobForm.salaryRange}
                onChange={(e) => setJobForm({ ...jobForm, salaryRange: e.target.value })}
                placeholder="Salary / CTC Range (e.g. ₹14-20 LPA)"
                required
              />
            </div>
            <label>
              <span className="tiny-label">Drive Application Deadline</span>
              <input
                type="date"
                value={jobForm.applicationDeadline}
                onChange={(e) => setJobForm({ ...jobForm, applicationDeadline: e.target.value })}
                required
              />
            </label>
            <textarea
              value={jobForm.description}
              onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              placeholder="Detailed Role Responsibilities & Requirements"
              required
            />
            <button type="submit" className="primary-btn">
              <PlusCircle size={16} /> Publish Campus Job Opening
            </button>
          </form>
        </div>

        <div className="panel-block">
          <div className="panel-header">
            <h3>Candidate Application Pipeline</h3>
            <span className="tag-pill">{data.applications.length} Submissions</span>
          </div>
          <div className="stack-list">
            {data.applications.slice(0, 5).map((application) => {
              const jobMatch = data.jobs.find(
                (j) => j.id === application.jobId || j.title === application.jobTitle,
              )
              const deadline = application.applicationDeadline || jobMatch?.applicationDeadline
              let isExpired = false
              let daysLeft = null
              if (deadline) {
                const dDate = new Date(deadline + 'T23:59:59')
                const now = new Date()
                isExpired = now > dDate
                daysLeft = Math.max(0, Math.ceil((dDate - now) / (1000 * 60 * 60 * 24)))
              }

              return (
                <div key={application.id} className="stack-item candidate-item">
                  <div className="candidate-details">
                    <strong>{application.studentName}</strong>
                    <span className="muted-text">Role: {application.jobTitle}</span>
                    {deadline && (
                      <span className={`candidate-deadline-tag ${isExpired ? 'deadline-tag-expired' : 'deadline-tag-active'}`}>
                        <Clock size={11} /> Deadline: {deadline} {isExpired ? '(Closed)' : `(${daysLeft}d left)`}
                      </span>
                    )}
                    <span
                      className={`badge ${
                        application.status === 'OFFERED'
                          ? 'badge-success'
                          : application.status === 'INTERVIEW_SCHEDULED'
                          ? 'badge-warning'
                          : application.status === 'SHORTLISTED'
                          ? 'badge-purple'
                          : 'badge-info'
                      }`}
                    >
                      {application.status}
                    </span>
                  </div>
                <div className="applicant-quick-actions">
                  <button
                    type="button"
                    className="btn-tiny btn-purple"
                    title="Shortlist Candidate"
                    onClick={() => onUpdateApplicationStatus(application.id, 'SHORTLISTED')}
                  >
                    Shortlist
                  </button>
                  <button
                    type="button"
                    className="btn-tiny btn-amber"
                    title="Schedule Interview Round"
                    onClick={() => onUpdateApplicationStatus(application.id, 'INTERVIEW_SCHEDULED')}
                  >
                    Interview
                  </button>
                  <button
                    type="button"
                    className="btn-tiny btn-emerald"
                    title="Release Job Offer"
                    onClick={() => onUpdateApplicationStatus(application.id, 'OFFERED')}
                  >
                    Offer
                  </button>
                  <button
                    type="button"
                    className="btn-tiny btn-red"
                    title="Reject Application"
                    onClick={() => onUpdateApplicationStatus(application.id, 'REJECTED')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* Posted Job Openings Management */}
      <section className="card">
        <div className="section-header">
          <h3>Manage Live Corporate Postings</h3>
          <span className="tag-pill">{data.jobs.length} Postings</span>
        </div>
        <div className="job-list">
          {data.jobs.map((job) => (
            <article key={job.id} className="job-card">
              <div className="job-head">
                <div>
                  <h4>{job.title}</h4>
                  <span className="company-tag">
                    <Building2 size={14} /> {job.companyName}
                  </span>
                </div>
                <span className={`badge ${job.active ? 'badge-success' : 'badge-danger'}`}>
                  {job.active ? 'Active' : 'Closed'}
                </span>
              </div>
              <p>{job.description}</p>
              <div className="job-meta">
                <span>📍 {job.location}</span>
                <span>💰 {job.salaryRange}</span>
                {job.applicationDeadline && (
                  <span className="deadline-tag deadline-normal">
                    <Clock size={13} /> Closes: {job.applicationDeadline}
                  </span>
                )}
              </div>
              <div className="action-row">
                <button
                  type="button"
                  className={job.active ? 'warning-btn-sm' : 'action-btn-primary-sm'}
                  onClick={() => onToggleJobStatus(job.id)}
                >
                  {job.active ? 'Close Opening' : 'Reopen Opening'}
                </button>
                <button
                  type="button"
                  className="danger-btn-sm"
                  onClick={() => onDeleteJob(job.id)}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )

  return (
    <div className="app-shell dashboard-shell">
      {/* Top Navbar */}
      <header className="dashboard-topbar">
        <div className="brand-group">
          <div className="brand-logo-icon">
            <GraduationCap size={26} />
          </div>
          <div>
            <p className="eyebrow">PlacementPro Platform</p>
            <h1>{normalizedRole} Workspace</h1>
          </div>
        </div>

        <nav className="dashboard-nav">
          <div className="role-switcher-pills">
            <span className="switcher-label">
              <Filter size={13} /> View:
            </span>
            <button
              type="button"
              className={`switcher-btn ${normalizedRole === 'Student' ? 'active' : ''}`}
              onClick={() => {
                onSwitchRole('Student')
                navigate('/dashboard/student')
              }}
            >
              Student
            </button>
            <button
              type="button"
              className={`switcher-btn ${normalizedRole === 'Admin' || normalizedRole === 'Admin / Tpo' ? 'active' : ''}`}
              onClick={() => {
                onSwitchRole('Admin')
                navigate('/dashboard/admin')
              }}
            >
              Admin
            </button>
            <button
              type="button"
              className={`switcher-btn ${normalizedRole === 'Company' || normalizedRole === 'Company / Recruiter' ? 'active' : ''}`}
              onClick={() => {
                onSwitchRole('Company')
                navigate('/dashboard/company')
              }}
            >
              Company
            </button>
          </div>

          <button type="button" onClick={onLogout} className="logout-btn">
            <LogOut size={16} /> Sign Out
          </button>
        </nav>
      </header>

      {/* Quick Summary Strip */}
      <div className="dashboard-actions">
        <div className="summary-pills">
          <span>
            <BriefcaseBusiness size={16} /> {data.jobs.length} Active Drives
          </span>
          <span>
            <Users size={16} /> {data.students.length} Registered Candidates
          </span>
          <span>
            <Building2 size={16} /> {data.companies.length} Corporate Partners
          </span>
          <span>
            <CalendarClock size={16} /> {data.trainingPrograms.length} Bootcamps
          </span>
          <span>
            <ClipboardCheck size={16} /> {data.applications.length} Applications
          </span>
        </div>
      </div>

      {/* Dynamic Role Views */}
      {normalizedRole === 'Student' && renderStudent()}
      {(normalizedRole === 'Admin' || normalizedRole === 'Admin / Tpo') && renderAdmin()}
      {(normalizedRole === 'Company' || normalizedRole === 'Company / Recruiter') && renderCompany()}

      {/* Footer Info Cards */}
      <footer className="dashboard-footer">
        <div className="footer-card">
          <ShieldCheck size={18} className="footer-icon-accent" />
          <div>
            <strong>End-to-End Security</strong>
            <span>Verified candidate records and secure auth</span>
          </div>
        </div>
        <div className="footer-card">
          <Megaphone size={18} className="footer-icon-accent" />
          <div>
            <strong>Automated Placement Alerts</strong>
            <span>Interview and shortlisting notifications</span>
          </div>
        </div>
        <div className="footer-card">
          <School size={18} className="footer-icon-accent" />
          <div>
            <strong>Integrated Training System</strong>
            <span>Direct curriculum alignment with corporate roles</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function AppRoot() {
  return <App />
}
