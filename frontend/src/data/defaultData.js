export const uid = () => Math.random().toString(36).slice(2, 9);

export const defaultSettings = {
  template:      'jakes',    // 'jakes' | 'awesomecv' | 'deedy'
  fontSize:      '',
  marginTop:     '',
  marginBottom:  '',
  marginLeft:    '',
  marginRight:   '',
  deedyColumnRatio: '',
  deedySectionSpacing: '',
};

export const defaultResumeData = {
  header: {
    name: 'Paarangat Jain',
    phone: '0410 215 889',
    email: 'paarangatj@gmail.com',
    linkedin: 'linkedin.com/in/paarangat-jain',
    website: 'p-jain.dev',
  },
  sections: [
    {
      id: 'sec-edu',
      type: 'education',
      title: 'Education',
      entries: [
        {
          id: 'edu-1',
          institution: 'Monash University',
          location: 'Clayton, VIC',
          degree: 'Bachelor of Computer Science (Mathematics Minor), WAM: 73.84, GPA: 3.063',
          dateRange: { startMonth: 'Jan', startYear: '2024', endMonth: 'Jun', endYear: '2027', present: false },
        },
        {
          id: 'edu-2',
          institution: 'Viewbank College',
          location: 'Rosanna, VIC',
          degree: 'Victorian Certificate of Education (VCE), ATAR: 90.15',
          dateRange: { startMonth: 'Jan', startYear: '2019', endMonth: 'Dec', endYear: '2023', present: false },
        },
      ],
    },
    {
      id: 'sec-exp',
      type: 'experience',
      title: 'Experience',
      entries: [
        {
          id: 'exp-1',
          role: 'Outreach Officer',
          company: 'Monash Assistive Technology Team (MATT)',
          location: 'Clayton, VIC',
          dateRange: { startMonth: 'Mar', startYear: '2026', endMonth: '', endYear: '', present: true },
          bullets: [
            'Engage with schools supporting students with disabilities to build partnerships to support technology-driven empowerment',
            "Communicate the organisation's mission and coordinate collaborative initiatives such as workshops and programs",
            'Develop and maintain relationships with stakeholders to support ongoing outreach and improve impact',
          ],
        },
        {
          id: 'exp-2',
          role: 'Volunteer -- Website Support & Management',
          company: 'Ocean Connect',
          location: 'Remote',
          dateRange: { startMonth: 'Mar', startYear: '2026', endMonth: '', endYear: '', present: true },
          bullets: [
            "Support management and maintenance of Ocean Connect's website to ensure program, event, and initiative information remains accurate and accessible",
            'Update and organise website content to improve navigation, clarity, and usability for volunteers and community members',
            "Assist in strengthening the organisation's digital presence to better communicate marine conservation initiatives and community programs",
          ],
        },
        {
          id: 'exp-3',
          role: 'Operations Officer',
          company: 'Monash Assistive Technology Team (MATT)',
          location: 'Clayton, VIC',
          dateRange: { startMonth: 'Feb', startYear: '2026', endMonth: '', endYear: '', present: true },
          bullets: [
            'Assist in the technical operations of the Monash Assistive Technology Team, supporting delivery of accessibility-focused projects',
            'Collaborate with peers to ensure smooth execution of technical initiatives and internal processes',
            'Contribute to the effective functioning of the organisation by supporting coordination, communication, and operational workflows',
          ],
        },
        {
          id: 'exp-4',
          role: 'Project Coordinator',
          company: 'Monash Assistive Technology Team (MATT)',
          location: 'Clayton, VIC',
          dateRange: { startMonth: 'Aug', startYear: '2025', endMonth: '', endYear: '', present: true },
          bullets: [
            'Lead collaboration with academic supervisor to define project goals and strategies for developing low-cost tactile and refreshable braille displays',
            'Guide and coordinate team of project officers in brainstorming and innovation for accessibility technology',
            'Conduct user interviews and design surveys to gather insights for user-centred development',
            'Lead development of React Native mobile application to support the Tactile Display project',
            'Received 90%+ positive reviews from team members for effective leadership and communication',
          ],
        },
        {
          id: 'exp-5',
          role: 'Projects Officer',
          company: 'Monash Assistive Technology Team (MATT)',
          location: 'Clayton, VIC',
          dateRange: { startMonth: 'Mar', startYear: '2025', endMonth: 'Aug', endYear: '2025', present: false },
          bullets: [
            'Collaborated with academic supervisor and fellow officers to brainstorm accessibility solutions',
            'Assisted in design, development, and testing of tactile display components for blind and low-vision users',
          ],
        },
      ],
    },
    {
      id: 'sec-proj',
      type: 'projects',
      title: 'Projects',
      entries: [
        {
          id: 'proj-1',
          name: 'Personal Portfolio Website',
          tech: 'Web Development, VPS',
          link: 'p-jain.dev',
          dateRange: { startMonth: 'Jan', startYear: '2025', endMonth: '', endYear: '', present: true },
          bullets: [
            'Developed and maintain portfolio website showcasing projects and technical skills',
            'Deployed on Virtual Private Server (VPS) with custom domain configuration',
          ],
        },
        {
          id: 'proj-2',
          name: 'Skill-Issue (Skilliton)',
          tech: 'Next.js, TypeScript, Firebase, Genkit, Gemini, Tailwind CSS',
          link: '',
          dateRange: { startMonth: 'Feb', startYear: '2026', endMonth: '', endYear: '', present: false },
          bullets: [
            'Built AI-powered peer-to-peer skill exchange platform at UniHack 2026 enabling university students to find partners for skill swaps',
            'Developed full-stack web application using Next.js, TypeScript, and Firebase Authentication with Google OAuth support',
            'Integrated AI assistant "Skilliton" using Google Genkit and Gemini to provide personalised skill recommendations and real-time chat',
            'Implemented booking system generating Google Meet links via API and downloadable .ics calendar events for scheduled sessions',
          ],
        },
        {
          id: 'proj-3',
          name: 'Tactile Display Project',
          tech: 'React Native, Hardware',
          link: '',
          dateRange: { startMonth: 'Mar', startYear: '2025', endMonth: '', endYear: '', present: true },
          bullets: [
            'Contributed to open-source project developing low-cost refreshable braille displays (MagnePins) for blind and low-vision users',
            'Developed React Native mobile application to interact with the tactile display hardware',
            'Utilised Figma to develop mock prototypes and create an accessible companion website',
          ],
        },
        {
          id: 'proj-4',
          name: 'Braille Character Quiz Game',
          tech: 'React, TypeScript, RxJS',
          link: '',
          dateRange: { startMonth: 'May', startYear: '2025', endMonth: '', endYear: '', present: true },
          bullets: [
            'Developed an interactive web-based game for learning and practising Braille characters',
            'Implemented real-time feedback, scoring system, and streak tracking utilising RxJS for reactive state management',
            'Designed a modern, responsive, and accessible interface with timed challenges and custom animations',
          ],
        },
        {
          id: 'proj-5',
          name: 'Pomodoro Timer App',
          tech: 'React Native, Expo, TypeScript',
          link: '',
          dateRange: { startMonth: 'Dec', startYear: '2025', endMonth: '', endYear: '', present: true },
          bullets: [
            'Developed full-featured iOS productivity application with unique liquid animation timer using an Expo routing system',
            'Integrated glassmorphism UI design with ambient sound playback, haptic feedback, and multi-theme support',
            'Designed modular component architecture with file-based routing (Expo Router) and persistent storage',
          ],
        },
        {
          id: 'proj-6',
          name: 'Appointment Booking System',
          tech: 'Next.js, React, TypeScript, MongoDB, Tailwind CSS',
          link: '',
          dateRange: { startMonth: '', startYear: '2023', endMonth: '', endYear: '2026', present: false },
          bullets: [
            'Modern rewrite of VCE Software Development Project, migrated from PHP/MySQL to a Next.js and MongoDB stack',
            'Implements full CRUD operations with server-side validation and double-booking conflict prevention',
            'Features an admin dashboard for managing appointments, doctor profiles, and clinic settings; includes automated .ics calendar file generation',
          ],
        },
      ],
    },
    {
      id: 'sec-skills',
      type: 'skills',
      title: 'Technical Skills',
      entries: [
        { id: 'sk-1', label: 'Languages', value: 'Haskell, Python, JavaScript, PHP, MySQL, R, TypeScript, HTML/CSS' },
        { id: 'sk-2', label: 'Operating Systems', value: 'Linux (Manjaro), macOS, Windows' },
        { id: 'sk-3', label: 'Technologies', value: 'React Native, React, Next.js, Expo, Docker, Git, Arduino, MongoDB, Figma, VPS Deployment, Functional Programming, Statistical Analysis' },
      ],
    },
    {
      id: 'sec-certs',
      type: 'certifications',
      title: 'Awards / Certifications',
      entries: [
        { id: 'cert-1', text: 'Deloitte Australia Technology Job Simulation (2025)', url: '' },
        { id: 'cert-2', text: 'Google Technical Support Fundamentals Certificate (Grade: 98.35%)', url: '' },
        { id: 'cert-3', text: 'AWS Generative AI Applications', url: '' },
      ],
    },
  ],
};
