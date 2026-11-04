export interface PortfolioAward {
  name: string;
  type: 'inspire' | 'think' | 'connect' | 'innovate' | 'design' | 'control' | 'motivate' | 'finalist';
  level?: string;
}

export interface PortfolioSummary {
  overview: string;
  outreach: string[];
  technical: string[];
  software: string[];
}

export interface FtcPortfolio {
  id: string;
  teamNumber: string;
  teamName: string;
  schoolOrOrg: string;
  location: string;
  season: string;
  seasonYear?: string;
  gameName?: string;
  awards: PortfolioAward[];
  summary: PortfolioSummary;
  pdfUrl: string;
  fileSize: string;
  pageCount: number;
  notableMechanisms: string[];
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Genuine static fallback containing only verified team submissions.
 * Placeholder teams have been strictly removed per user requirements.
 */
export const FTC_PORTFOLIOS: FtcPortfolio[] = [
  {
    id: '7444-ultimate-goal',
    teamNumber: '7444',
    teamName: 'Sisters of the Motherboard',
    schoolOrOrg: 'Salem Academy',
    location: 'Winston-Salem, NC, USA',
    season: 'Ultimate Goal (2020-21)',
    seasonYear: '2020-2021',
    gameName: 'Ultimate Goal',
    awards: [
      { name: 'Inspire Award Winner', type: 'inspire', level: 'Regional Championship' },
      { name: 'Think Award 1st Place', type: 'think', level: 'State Qualifier' },
      { name: 'Connect Award', type: 'connect', level: 'NC Triad' },
    ],
    summary: {
      overview:
        '8th-year all-girls team from Salem Academy demonstrating elite mechanical prototyping, lead-screw angle adjustments, and pandemic-adapted community STEM initiatives.',
      outreach: [
        'Sister Team Mentorship: Paired experienced high schoolers with rookie members from sister team FTC #15333 Code Sisters to cross-pollinate mechanical CAD and Java skills.',
        'FRC 5679 "Girls on Fire" Partnership: Collaborated with the Triad\'s only all-girls FRC team to champion female representation in competitive engineering.',
        'Kaleideum Science Center Internships: Volunteered as counselors at local science museum camps, teaching hands-on STEM experiments during pandemic restrictions.',
        'Girl Scouts STEM Badges: Developed curriculum and hosted day camps helping local troops earn their Junior Coding and Robotics badges.',
        'Virtual Science Workshops: Engineered interactive Zoom-friendly science activities and live robot demonstrations for elementary schools.',
      ],
      technical: [
        'Pasta Roller-Inspired Intake: Utilized rotating chain/servo drives with pool noodles and airbag materials for high-friction ring acquisition without jamming.',
        'Flywheel Launch Mechanism: Single primary high-RPM flywheel assisted by 3 progressive guide rollers for repeatable ring compression and exit velocity.',
        'Lead Screw Angle Elevator: Rolling dual-wheel lead-screw mechanism that dynamically shifts outtake pitch for both high-goal and power-shot trajectories.',
        'goBILDA Strafer Chassis: Low-profile omnidirectional Mecanum drivetrain with integrated wobble goal clamp.',
        'Parametric Onshape CAD: Complete robot modeled before assembly with strict weight budgeting and torque ratio verification.',
      ],
      software: [
        'Computer Vision Pipeline: Autonomous webcam ring-stack detection (0, 1, or 4 rings) to determine target delivery zones.',
        'Dual Wobble Goal Autonomous: Consistent multi-stage autonomous routine dropping both wobble goals and parking over the launch line.',
        'Closed-Loop Flywheel Tuning: Velocity PID control on flywheel shooter maintaining target RPM within 1.5% under battery drain.',
      ],
    },
    pdfUrl: '/portfolios/7444-ug.pdf',
    fileSize: '1.36 MB',
    pageCount: 15,
    notableMechanisms: [
      'Pasta Roller Intake',
      'Lead Screw Pitch Adjuster',
      'Single-Wheel Flywheel',
      'goBILDA Strafer Chassis',
    ],
    tags: ['All-Girls', 'Inspire Winner', 'Lead Screw', 'Flywheel', 'Ultimate Goal'],
  },
];
