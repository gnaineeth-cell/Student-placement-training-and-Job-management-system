import { useState, useRef, useEffect } from 'react'
import {
  MessageSquare,
  Bot,
  Send,
  X,
  Sparkles,
  RefreshCw,
  Clock,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  CalendarClock,
  ChevronDown,
  ShieldCheck,
  Award,
} from 'lucide-react'

export default function PlacementChatbot({ session, data, onApply }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const studentProfile =
    (data?.students || []).find((s) => s.email === session?.email) || (data?.students || [])[0]
  const institutionRules = data?.institutionRules || {
    minCgpa: 6.0,
    maxCurrentBacklogs: 0,
    minAttendance: 75,
    requiredStudentStatus: 'Approved',
  }

  // Initial welcome message
  useEffect(() => {
    const userName = session?.name || studentProfile?.fullName || 'Candidate'
    const userRole = session?.role || 'STUDENT'

    let welcomeText = `Hello ${userName}! 👋 I'm your **PlacementPro Career Assistant**.\n\nI can help you check your **recruitment drive deadlines**, verify your **placement clearance & eligibility**, browse open campus jobs, or review your application status.`

    if (userRole === 'COMPANY') {
      welcomeText = `Welcome ${userName}! 🏢 I'm your Corporate Placement Assistant.\n\nI can help you review incoming candidate submissions, manage drive deadlines, and track applicant shortlisting.`
    } else if (userRole === 'TPO' || userRole === 'ADMIN') {
      welcomeText = `Welcome, Placement Officer ${userName}! 🎓\n\nI can provide real-time updates on active drive deadlines, institutional eligibility compliance, and overall student placement stats.`
    }

    setMessages([
      {
        id: 'welcome-1',
        sender: 'bot',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: '⏳ Check Drive Deadlines', query: 'Show application deadlines for all active jobs' },
          { label: '🎯 Am I Eligible to Apply?', query: 'Check my placement eligibility and institutional criteria' },
          { label: '📌 My Application Status', query: 'What is the status of my job applications?' },
          { label: '💼 Browse Top Openings', query: 'What campus job openings are available right now?' },
          { label: '📚 Training Bootcamps', query: 'List upcoming training programs and bootcamps' },
          { label: '💡 Interview & Resume Tips', query: 'Give me tips to crack campus placement interviews' },
        ],
      },
    ])
  }, [session, studentProfile])

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false)
      setTimeout(() => {
        inputRef.current?.focus()
        scrollToBottom()
      }, 150)
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleResetChat = () => {
    const userName = session?.name || studentProfile?.fullName || 'Candidate'
    setMessages([
      {
        id: 'reset-' + Date.now(),
        sender: 'bot',
        text: `Chat restarted. Hello ${userName}! How can I assist you with your placement training or job applications?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: '⏳ Check Drive Deadlines', query: 'Show application deadlines for all active jobs' },
          { label: '🎯 Am I Eligible to Apply?', query: 'Check my placement eligibility and institutional criteria' },
          { label: '📌 My Application Status', query: 'What is the status of my job applications?' },
          { label: '💼 Browse Top Openings', query: 'What campus job openings are available right now?' },
        ],
      },
    ])
  }

  // Answer generator with domain intelligence & live state inspection
  const generateBotResponse = (query) => {
    const q = query.toLowerCase().trim()
    const jobs = data?.jobs || []
    const applications = data?.applications || []
    const trainings = data?.trainingPrograms || []

    // 1. DEADLINE QUERIES
    if (
      q.includes('deadline') ||
      q.includes('last date') ||
      q.includes('expire') ||
      q.includes('due date') ||
      q.includes('when does') ||
      q.includes('clso') ||
      q.includes('close')
    ) {
      if (jobs.length === 0) {
        return {
          text: 'There are currently no active job postings registered in the system.',
        }
      }

      const now = new Date()
      const jobDeadlineList = jobs.map((job) => {
        let status = 'Active'
        let daysLeft = null
        if (job.applicationDeadline) {
          const dDate = new Date(job.applicationDeadline + 'T23:59:59')
          const diffTime = dDate - now
          daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          if (daysLeft < 0) {
            status = 'Expired / Closed'
          } else if (daysLeft === 0) {
            status = 'Closes TODAY!'
          } else if (daysLeft <= 3) {
            status = `URGENT (${daysLeft} days remaining)`
          } else {
            status = `${daysLeft} days remaining`
          }
        } else {
          status = 'Rolling / Ongoing'
        }

        return {
          id: job.id,
          title: job.title,
          company: job.companyName || 'Corporate Partner',
          deadline: job.applicationDeadline || 'Not specified',
          salary: job.salaryRange || 'Competitive',
          status,
          daysLeft,
        }
      })

      const formatted = jobDeadlineList
        .map(
          (j) =>
            `• **${j.title}** at **${j.company}**\n  - 📅 **Deadline:** ${j.deadline} (${j.status})\n  - 💰 **Package:** ${j.salary}`,
        )
        .join('\n\n')

      return {
        text: `Here is the real-time application deadline schedule for campus recruitment drives:\n\n${formatted}\n\n⚠️ **Important:** Applications cannot be submitted once a drive deadline has passed. Make sure your resume is up-to-date before applying!`,
        suggestedActions: [
          { label: '🎯 Am I Eligible to Apply?', query: 'Check my placement eligibility and institutional criteria' },
          { label: '📌 My Application Status', query: 'What is the status of my job applications?' },
        ],
      }
    }

    // 2. ELIGIBILITY / CRITERIA QUERIES
    if (
      q.includes('eligible') ||
      q.includes('eligibility') ||
      q.includes('criteria') ||
      q.includes('rule') ||
      q.includes('cutoff') ||
      q.includes('cgpa') ||
      q.includes('backlog') ||
      q.includes('attendance') ||
      q.includes('clearance')
    ) {
      if (!studentProfile) {
        return {
          text: `The standard institutional placement eligibility criteria are:\n\n• **Minimum CGPA:** ${institutionRules.minCgpa || 6.0}\n• **Maximum Active Backlogs:** ${institutionRules.maxCurrentBacklogs || 0}\n• **Minimum Attendance:** ${institutionRules.minAttendance || 75}%\n• **Disciplinary Clearance:** Status must be 'Approved' (Not Debarred)\n• **Profile:** 100% complete with resume uploaded`,
        }
      }

      const cgpa = Number(studentProfile.cgpa) || 0
      const minCgpa = Number(institutionRules.minCgpa) || 6.0
      const passCgpa = cgpa >= minCgpa

      const backlogs = Number(studentProfile.currentBacklogs) || 0
      const maxBacklogs = Number(institutionRules.maxCurrentBacklogs) || 0
      const passBacklogs = backlogs <= maxBacklogs

      const attendance = Number(studentProfile.attendancePercentage) || 0
      const minAttendance = Number(institutionRules.minAttendance) || 75
      const passAttendance = attendance >= minAttendance

      const status = studentProfile.status || 'Approved'
      const passStatus = status.toLowerCase() === 'approved'

      const hasResume = Boolean(
        studentProfile.resumeUrl &&
          studentProfile.resumeUrl !== '#' &&
          studentProfile.resumeUrl.trim().length > 0,
      )

      const isOverallEligible = passCgpa && passBacklogs && passAttendance && passStatus && hasResume

      const summary = [
        `• **CGPA:** ${cgpa} / 10 (Cutoff: >= ${minCgpa}) ${passCgpa ? '✅' : '❌ Below cutoff'}`,
        `• **Current Backlogs:** ${backlogs} (Allowed: <= ${maxBacklogs}) ${passBacklogs ? '✅' : '❌ Exceeds limit'}`,
        `• **Class Attendance:** ${attendance}% (Mandatory: >= ${minAttendance}%) ${passAttendance ? '✅' : '❌ Below 75%'}`,
        `• **Administration Clearance:** ${status} ${passStatus ? '✅' : '❌ Action needed'}`,
        `• **Resume Uploaded:** ${hasResume ? 'Verified ✅' : 'Missing ❌ (Upload on profile)'}`,
      ].join('\n')

      if (isOverallEligible) {
        return {
          text: `🎉 **Clearance Approved!** You meet all mandatory institutional placement rules for campus recruitment drives:\n\n${summary}\n\nYou are officially cleared to apply for all active drives before their respective application deadlines!`,
          suggestedActions: [
            { label: '⏳ Check Drive Deadlines', query: 'Show application deadlines for all active jobs' },
            { label: '💼 Browse Top Openings', query: 'What campus job openings are available right now?' },
          ],
        }
      } else {
        return {
          text: `⚠️ **Placement Clearance Notice:** One or more requirements need attention before you can submit job applications:\n\n${summary}\n\nPlease update your profile, consult the TPO for clearance approval, or clear any academic constraints.`,
          suggestedActions: [
            { label: '💡 How to Improve My Score?', query: 'Give me tips to crack campus placement interviews' },
            { label: '📚 View Bootcamps', query: 'List upcoming training programs and bootcamps' },
          ],
        }
      }
    }

    // 3. APPLICATION STATUS QUERIES
    if (
      q.includes('my application') ||
      q.includes('application status') ||
      q.includes('applied') ||
      q.includes('submission') ||
      q.includes('interview round')
    ) {
      const myApps = applications.filter(
        (a) => a.studentId === session?.id || a.studentName === session?.name,
      )

      if (myApps.length === 0) {
        return {
          text: `You haven't submitted any job applications yet.\n\nBrowse active drives in your dashboard and click **Apply Now** before the drive deadlines!`,
          suggestedActions: [
            { label: '⏳ View Drive Deadlines', query: 'Show application deadlines for all active jobs' },
            { label: '💼 View Job Openings', query: 'What campus job openings are available right now?' },
          ],
        }
      }

      const formatted = myApps
        .map((app) => {
          const matchingJob = jobs.find((j) => j.id === app.jobId)
          const deadline = app.applicationDeadline || matchingJob?.applicationDeadline || 'Rolling'
          return `• **${app.jobTitle}**\n  - 🏷️ **Status:** ${app.status.replace(/_/g, ' ')}\n  - 📅 **Applied On:** ${(app.appliedAt || '').slice(0, 10) || 'Recent'}\n  - ⏰ **Drive Deadline:** ${deadline}`
        })
        .join('\n\n')

      return {
        text: `Here are your live campus job submissions (${myApps.length} total):\n\n${formatted}\n\nYou will receive real-time notifications when the recruiting company shortlists your profile or schedules interview rounds.`,
        suggestedActions: [
          { label: '⏳ Check Other Deadlines', query: 'Show application deadlines for all active jobs' },
          { label: '💡 Interview Preparation', query: 'Give me tips to crack campus placement interviews' },
        ],
      }
    }

    // 4. JOBS / OPENINGS QUERIES
    if (
      q.includes('job') ||
      q.includes('opening') ||
      q.includes('vacancy') ||
      q.includes('hiring') ||
      q.includes('role') ||
      q.includes('company') ||
      q.includes('companies') ||
      q.includes('salary') ||
      q.includes('ctc')
    ) {
      if (jobs.length === 0) {
        return {
          text: 'There are no active campus recruitment drives posted currently.',
        }
      }

      const formatted = jobs
        .map(
          (j) =>
            `• **${j.title}** at **${j.companyName}** (${j.location})\n  - 💰 **Package:** ${j.salaryRange}\n  - 🛠️ **Skills:** ${j.skillsRequired}\n  - ⏰ **Application Deadline:** ${j.applicationDeadline || 'Ongoing'}`,
        )
        .join('\n\n')

      return {
        text: `Here are the currently active campus recruitment opportunities:\n\n${formatted}\n\nClick **Apply Now** on any card in the dashboard before the deadline date!`,
        suggestedActions: [
          { label: '⏳ Check Deadlines', query: 'Show application deadlines for all active jobs' },
          { label: '🎯 Am I Eligible?', query: 'Check my placement eligibility and institutional criteria' },
        ],
      }
    }

    // 5. TRAINING / BOOTCAMPS QUERIES
    if (
      q.includes('training') ||
      q.includes('bootcamp') ||
      q.includes('workshop') ||
      q.includes('course') ||
      q.includes('mock') ||
      q.includes('aptitude')
    ) {
      if (trainings.length === 0) {
        return {
          text: 'There are currently no training bootcamps scheduled.',
        }
      }

      const formatted = trainings
        .map(
          (t) =>
            `• **${t.title}** (Trainer: ${t.trainerName})\n  - 🗓️ **Dates:** ${t.startDate} to ${t.endDate}\n  - 👥 **Capacity:** ${t.capacity} candidates (Status: ${t.status || 'ACTIVE'})\n  - 📝 ${t.description || ''}`,
        )
        .join('\n\n')

      return {
        text: `Here are the upcoming Placement Training Programs:\n\n${formatted}\n\nAttending bootcamps contributes directly to your **80% Training Attendance** placement clearance requirement!`,
        suggestedActions: [
          { label: '🎯 Check My Eligibility', query: 'Check my placement eligibility and institutional criteria' },
          { label: '💡 Interview Preparation', query: 'Give me tips to crack campus placement interviews' },
        ],
      }
    }

    // 6. INTERVIEW & RESUME TIPS
    if (
      q.includes('interview') ||
      q.includes('tip') ||
      q.includes('resume') ||
      q.includes('prepare') ||
      q.includes('crack') ||
      q.includes('dsa') ||
      q.includes('advice')
    ) {
      return {
        text: `Here is the **Proven 4-Step Campus Placement Strategy**:\n\n1. **Technical Foundation (DSA & Core CS):**\n   - Master Arrays, Strings, Hashing, Trees, and Graph BFS/DFS.\n   - Review OOP Concepts, DBMS (indexing, SQL normalization), and Operating Systems.\n\n2. **Resume Optimization:**\n   - Keep to a clean 1-page layout.\n   - Highlight 2-3 production-grade projects with GitHub links and live demos.\n   - Quantify achievements (e.g. *"improved API throughput by 40%"*).\n\n3. **Behavioral & HR Rounds:**\n   - Structure situational answers using the **STAR method** (Situation, Task, Action, Result).\n   - Prepare answers for "Tell me about yourself" and "Why this company?".\n\n4. **Placement Drive Readiness:**\n   - Apply well before the application deadline.\n   - Ensure your profile has 0 backlogs and >= 75% attendance to maintain institutional clearance.`,
        suggestedActions: [
          { label: '⏳ Check Drive Deadlines', query: 'Show application deadlines for all active jobs' },
          { label: '🎯 Check My Eligibility', query: 'Check my placement eligibility and institutional criteria' },
        ],
      }
    }

    // 7. DEFAULT / FALLBACK
    return {
      text: `I'm here to assist you with all aspects of the Placement & Training Management System. Here is what I can do:\n\n• **Deadlines:** Track application closing dates for corporate drives\n• **Eligibility Verification:** Check your CGPA, backlogs, and clearance status against TPO criteria\n• **Application Tracking:** Monitor stages (Applied, Shortlisted, Interview, Offered)\n• **Training Bootcamps:** View schedule for aptitude and technical training\n• **Interview Preparation:** Resume tips, technical drills, and placement guides\n\nFeel free to ask a question or choose one of the options below!`,
      suggestedActions: [
        { label: '⏳ Check Drive Deadlines', query: 'Show application deadlines for all active jobs' },
        { label: '🎯 Am I Eligible to Apply?', query: 'Check my placement eligibility and institutional criteria' },
        { label: '📌 My Application Status', query: 'What is the status of my job applications?' },
        { label: '💼 Browse Top Openings', query: 'What campus job openings are available right now?' },
      ],
    }
  }

  const handleSendMessage = (textToSend = null) => {
    const text = textToSend || inputValue
    if (!text || !text.trim()) return

    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputValue('')
    setIsTyping(true)

    // Simulate smart agent response latency
    setTimeout(() => {
      const response = generateBotResponse(text)
      const botMsg = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: response.suggestedActions || [],
      }
      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
      if (!isOpen) setHasUnread(true)
    }, 600)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="placement-chatbot-launcher-wrap">
        <button
          type="button"
          className={`placement-chatbot-btn ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle Placement AI Chatbot"
          title="Placement Career Assistant"
        >
          {isOpen ? (
            <X size={22} className="chatbot-btn-icon" />
          ) : (
            <>
              <Bot size={24} className="chatbot-btn-icon" />
              <span className="chatbot-sparkle-badge">
                <Sparkles size={12} />
              </span>
              {hasUnread && <span className="chatbot-unread-dot" />}
            </>
          )}
        </button>
        {!isOpen && (
          <div className="placement-chatbot-callout" onClick={() => setIsOpen(true)}>
            <Sparkles size={13} className="callout-icon" />
            <span>Need Help? Ask AI Assistant</span>
          </div>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="placement-chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar">
                <Bot size={20} />
                <span className="online-indicator" />
              </div>
              <div className="chatbot-header-info">
                <h4>Placement Assistant</h4>
                <span className="chatbot-status-text">
                  <Sparkles size={11} /> AI Career & Deadline Advisor
                </span>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                type="button"
                className="chatbot-icon-btn"
                onClick={handleResetChat}
                title="Restart Chat"
              >
                <RefreshCw size={14} />
              </button>
              <button
                type="button"
                className="chatbot-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Close Chat"
              >
                <ChevronDown size={17} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="chatbot-messages-body">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message-row ${msg.sender === 'user' ? 'msg-user' : 'msg-bot'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="chat-bot-icon-small">
                    <Bot size={14} />
                  </div>
                )}
                <div className="chat-bubble-wrap">
                  <div className={`chat-bubble ${msg.sender === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
                    <div className="chat-bubble-content">
                      {msg.text.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx} className="chat-paragraph">
                          {paragraph.split('\n').map((line, lIdx) => {
                            // Format bold markers **text**
                            const parts = line.split(/(\*\*.*?\*\*)/g)
                            return (
                              <span key={lIdx} className="chat-line">
                                {parts.map((part, partIdx) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={partIdx}>{part.slice(2, -2)}</strong>
                                  }
                                  return part
                                })}
                                {lIdx < paragraph.split('\n').length - 1 && <br />}
                              </span>
                            )
                          })}
                        </p>
                      ))}
                    </div>
                    <span className="chat-timestamp">{msg.timestamp}</span>
                  </div>

                  {/* Quick Action Chips attached to bot responses */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="chat-actions-container">
                      <span className="chat-actions-label">Suggested actions:</span>
                      <div className="chat-chips-wrap">
                        {msg.suggestedActions.map((action, aIdx) => (
                          <button
                            key={aIdx}
                            type="button"
                            className="chat-action-chip"
                            onClick={() => handleSendMessage(action.query)}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chat-message-row msg-bot">
                <div className="chat-bot-icon-small">
                  <Bot size={14} />
                </div>
                <div className="chat-bubble bubble-bot typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="chatbot-input-footer">
            <div className="chatbot-input-wrap">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask about deadlines, jobs, eligibility..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
              />
              <button
                type="button"
                className="chatbot-send-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </div>
            <div className="chatbot-footer-hint">
              <span>Verified with Institutional Placement Rules & Live Drives</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
