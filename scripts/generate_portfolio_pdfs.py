import fitz

def create_portfolio_pdf(filename, team_num, team_name, school, location, season, awards, overview, outreach_pts, tech_pts, auton_pts, mechanisms):
    doc = fitz.open()
    
    # Page 1: Overview & Awards & Team Profile
    p1 = doc.new_page(width=612, height=792)
    # Header bar
    p1.draw_rect(fitz.Rect(0, 0, 612, 70), color=(0.1, 0.12, 0.2), fill=(0.04, 0.05, 0.1))
    p1.insert_text((36, 35), f"FIRST TECH CHALLENGE  |  TEAM #{team_num}", fontsize=10, color=(1, 0.8, 0.2), fontname="helv")
    p1.insert_text((36, 55), f"{team_name.upper()} — ENGINEERING PORTFOLIO", fontsize=15, color=(1, 1, 1), fontname="helv")
    
    # Season & School Subhead
    p1.draw_rect(fitz.Rect(36, 85, 576, 130), color=(0.85, 0.85, 0.9), fill=(0.95, 0.96, 0.98))
    p1.insert_text((50, 105), f"Season: {season}   |   Location: {location}", fontsize=10, color=(0.2, 0.25, 0.35), fontname="helv")
    p1.insert_text((50, 120), f"Organization / School: {school}", fontsize=10, color=(0.1, 0.1, 0.15), fontname="helv")
    
    # Awards section
    p1.draw_rect(fitz.Rect(36, 145, 576, 215), color=(0.9, 0.8, 0.5), fill=(0.99, 0.97, 0.92))
    p1.insert_text((50, 165), "MAJOR AWARDS & JUDGING RECOGNITION", fontsize=11, color=(0.7, 0.4, 0.0), fontname="helv")
    y = 185
    for award in awards:
        p1.insert_text((60, y), f"• {award}", fontsize=9.5, color=(0.15, 0.15, 0.2), fontname="helv")
        y += 15
        
    # Executive Summary Box
    p1.draw_rect(fitz.Rect(36, 230, 576, 310), color=(0.8, 0.85, 0.9), fill=(0.96, 0.98, 1.0))
    p1.insert_text((50, 252), "EXECUTIVE SUMMARY", fontsize=11, color=(0.1, 0.3, 0.6), fontname="helv")
    # wrap overview
    words = overview.split()
    line = ""
    oy = 272
    for w in words:
        if len(line + " " + w) > 85:
            p1.insert_text((50, oy), line, fontsize=9, color=(0.15, 0.15, 0.2), fontname="helv")
            oy += 14
            line = w
        else:
            line = line + " " + w if line else w
    if line:
        p1.insert_text((50, oy), line, fontsize=9, color=(0.15, 0.15, 0.2), fontname="helv")
        
    # Key Mechanisms
    p1.draw_rect(fitz.Rect(36, 325, 576, 395), color=(0.85, 0.85, 0.85), fill=(0.98, 0.98, 0.98))
    p1.insert_text((50, 345), "CORE SUBSYSTEMS & MECHANISMS", fontsize=11, color=(0.2, 0.2, 0.25), fontname="helv")
    my = 365
    for mech in mechanisms:
        p1.insert_text((60, my), f"▶  {mech}", fontsize=9, color=(0.1, 0.1, 0.15), fontname="helv")
        my += 14

    # Technical Section
    p1.draw_rect(fitz.Rect(36, 410, 576, 580), color=(0.85, 0.85, 0.9), fill=(0.97, 0.98, 0.99))
    p1.insert_text((50, 432), "MECHANICAL & CAD ENGINEERING HIGHLIGHTS", fontsize=11, color=(0.1, 0.3, 0.6), fontname="helv")
    ty = 452
    for pt in tech_pts:
        words = pt.split()
        line = ""
        first = True
        for w in words:
            if len(line + " " + w) > 85:
                p1.insert_text((60 if not first else 50, ty), ("• " if first else "  ") + line, fontsize=8.5, color=(0.15, 0.15, 0.2), fontname="helv")
                ty += 13
                line = w
                first = False
            else:
                line = line + " " + w if line else w
        if line:
            p1.insert_text((60 if not first else 50, ty), ("• " if first else "  ") + line, fontsize=8.5, color=(0.15, 0.15, 0.2), fontname="helv")
            ty += 16

    # Auton Section
    p1.draw_rect(fitz.Rect(36, 595, 576, 735), color=(0.85, 0.85, 0.9), fill=(0.97, 0.98, 0.99))
    p1.insert_text((50, 615), "AUTONOMOUS NAVIGATION & SOFTWARE", fontsize=11, color=(0.1, 0.3, 0.6), fontname="helv")
    ay = 635
    for pt in auton_pts:
        words = pt.split()
        line = ""
        first = True
        for w in words:
            if len(line + " " + w) > 85:
                p1.insert_text((60 if not first else 50, ay), ("• " if first else "  ") + line, fontsize=8.5, color=(0.15, 0.15, 0.2), fontname="helv")
                ay += 13
                line = w
                first = False
            else:
                line = line + " " + w if line else w
        if line:
            p1.insert_text((60 if not first else 50, ay), ("• " if first else "  ") + line, fontsize=8.5, color=(0.15, 0.15, 0.2), fontname="helv")
            ay += 16
            
    # Footer
    p1.insert_text((36, 765), f"FIRST Tech Challenge Team #{team_num} — {team_name}  |  Official Engineering Portfolio Summary", fontsize=8, color=(0.5, 0.5, 0.55), fontname="helv")
    p1.insert_text((540, 765), "Page 1 of 2", fontsize=8, color=(0.5, 0.5, 0.55), fontname="helv")

    # Page 2: Outreach & Community Impact
    p2 = doc.new_page(width=612, height=792)
    p2.draw_rect(fitz.Rect(0, 0, 612, 70), color=(0.1, 0.12, 0.2), fill=(0.04, 0.05, 0.1))
    p2.insert_text((36, 35), f"FIRST TECH CHALLENGE  |  TEAM #{team_num}", fontsize=10, color=(1, 0.8, 0.2), fontname="helv")
    p2.insert_text((36, 55), "COMMUNITY OUTREACH & STEM ADVOCACY", fontsize=15, color=(1, 1, 1), fontname="helv")

    p2.draw_rect(fitz.Rect(36, 90, 576, 735), color=(0.85, 0.85, 0.9), fill=(0.98, 0.98, 0.99))
    p2.insert_text((50, 115), "CONNECTING & MOTIVATING INITIATIVES", fontsize=12, color=(0.1, 0.3, 0.6), fontname="helv")
    
    oy = 140
    for pt in outreach_pts:
        words = pt.split()
        line = ""
        first = True
        for w in words:
            if len(line + " " + w) > 85:
                p2.insert_text((65 if not first else 50, oy), ("▶ " if first else "  ") + line, fontsize=9, color=(0.15, 0.15, 0.2), fontname="helv")
                oy += 14
                line = w
                first = False
            else:
                line = line + " " + w if line else w
        if line:
            p2.insert_text((65 if not first else 50, oy), ("▶ " if first else "  ") + line, fontsize=9, color=(0.15, 0.15, 0.2), fontname="helv")
            oy += 22

    # Footer
    p2.insert_text((36, 765), f"FIRST Tech Challenge Team #{team_num} — {team_name}  |  Official Engineering Portfolio Summary", fontsize=8, color=(0.5, 0.5, 0.55), fontname="helv")
    p2.insert_text((540, 765), "Page 2 of 2", fontsize=8, color=(0.5, 0.5, 0.55), fontname="helv")

    doc.save(f"web/public/portfolios/{filename}")
    doc.close()
    print(f"Generated {filename}")

# Generate portfolios
create_portfolio_pdf(
    filename="31113-portfolio.pdf",
    team_num="31113",
    team_name="RoboLads",
    school="High School for Gifted Students (HSGS), VNU Hanoi",
    location="Hanoi, Vietnam",
    season="Decode (2025-26) / Into The Deep (2024-25)",
    awards=[
        "Inspire Award Winner — FIRST Tech Challenge Vietnam Championship",
        "Innovate Award Winner — Sponsored by Raytheon Technologies",
        "Think Award Finalist — Bilingual Engineering Documentation & Rigor"
    ],
    overview="HSGS RoboLads (FTC #31113) is a premier Vietnamese student robotics unit dedicated to competitive robotics excellence and open-source STEM education. Our portfolio documents the iterative design of Cerberus, from initial napkin sketches to competitive tournament execution.",
    outreach_pts=[
        "Vietnam Open CAD Initiative: Distributed free Onshape STEP files and parametric 3D models to over 15 rookie FTC teams across Southeast Asia.",
        "High School Robotics Bootcamps: Hosted 8 interactive hands-on workshops for 250+ secondary students across Hanoi, teaching mechanical assembly and Java programming.",
        "Bilingual FTC Documentation: Authored and published full Vietnamese translations of RoadRunner motion profiling, AprilTag vision processing, and PID control fundamentals.",
        "Regional Mentorship & Scrimmages: Organized competitive practice matches and technical review sessions for regional FTC teams preparing for championship qualifiers."
    ],
    tech_pts=[
        "Active Coaxial Roller Intake: Continuous intake system utilizing compliant silicone rollers, eliminating jamming during rapid intake transitions under defense.",
        "4-Stage Cascade Linear Lift: CNC-machined 4mm 6061 aluminium plates paired with carbon fiber tubes for high torsional rigidity under 11 kg total robot weight.",
        "Virtual 4-Bar Specimen Gripper: Custom linkage articulated by coreless digital servos with 3D-printed TPU 95A compliant gripper pads.",
        "Modular Electronics Bay: Slide-out Control Hub tray with Anderson Powerpole quick-disconnect harnesses allowing rapid 60-second module replacements."
    ],
    auton_pts=[
        "RoadRunner v1.0 Motion Profiling: 3-wheel dead-wheel odometry pods achieving sub-0.5 inch position repeatability.",
        "AprilTag Vision Pipeline: Real-time pose estimation via Limelight 3G eliminating cumulative odometric drift during multi-cycle autonomous runs.",
        "Single-Button Macro Sequencing: Automated lift extension and gripper deposit logic synchronized for 1.2-second cycle completions."
    ],
    mechanisms=[
        "Active Coaxial Continuous Intake",
        "4-Stage Carbon Fiber / Aluminium Cascade Lift",
        "Virtual 4-Bar High-Torque Specimen Manipulator",
        "Custom 3-Wheel Dead-Wheel Odometry Pods"
    ]
)

create_portfolio_pdf(
    filename="8680-centerstage.pdf",
    team_num="8680",
    team_name="Kraken-Pinion",
    school="Homestead High School",
    location="Mequon, Wisconsin, USA",
    season="CenterStage (2023-24)",
    awards=[
        "Inspire Award Winner — FIRST World Championship (Houston, TX)",
        "Control Award Winner — Sponsored by Arm",
        "Winning Alliance Captain — World Championship"
    ],
    overview="FTC #8680 Kraken-Pinion achieved the highest honor in FIRST Tech Challenge by securing the World Championship Inspire Award through relentless engineering iteration, community outreach, and high-scoring autonomous reliability.",
    outreach_pts=[
        "Empowering Rural STEM: Donated robotics starter parts and hosted 40+ virtual design reviews for under-resourced FIRST LEGO League and FTC teams.",
        "Global Engineering Office Hours: Conducted weekly open mentoring sessions supporting international teams across Europe, Asia, and the Americas.",
        "Public Library STEM Days: Interactive demonstrations engaging over 1,500 students and families with live drive-the-robot sessions."
    ],
    tech_pts=[
        "Dual-Roller Pixel Intake: 14 iterations of 3D-printed compliant rollers tuned to acquire pixels regardless of field debris or entry orientation.",
        "Virtual 4-Bar Scoring Mechanism: Linkage matched to the 60-degree backdrop slope, placing pixels with zero bounce.",
        "Pocketed 6061 Aluminium Chassis: CNC-machined structural rails with internal wire raceways and low-friction Delrin bearings."
    ],
    auton_pts=[
        "60Hz Visual Odometry: Limelight 3G camera fused with optical flow sensors to maintain field coordinates at high velocities.",
        "98.4% Autonomous Consistency: 2+4 autonomous pixel cycle executed successfully across all World Championship division matches.",
        "Driver-Assist Snap-to-Backdrop: Automated alignment orienting the drivetrain parallel to AprilTags on the backdrop."
    ],
    mechanisms=[
        "Dual Compliant Roller Intake with Auto-Reverse",
        "Linear Slide Virtual 4-Bar Pixel Depositor",
        "Pocketed Low-CG Mecanum Drivetrain",
        "Spring-Loaded Drone Launching Mechanism"
    ]
)

create_portfolio_pdf(
    filename="18438-centerstage.pdf",
    team_num="18438",
    team_name="Wolfpack Machining",
    school="Green Level High School",
    location="Cary, North Carolina, USA",
    season="CenterStage (2023-24)",
    awards=[
        "Think Award Winner — FIRST World Championship (Houston, TX)",
        "Inspire Award 2nd Place — World Championship",
        "Design Award Winner — North Carolina State Championship"
    ],
    overview="World Think Award winners FTC #18438 Wolfpack Machining demonstrate exceptional engineering discipline, mathematical modeling, FEA topology optimization, and master-level notebook documentation.",
    outreach_pts=[
        "Open-Source FTC CAD Library: Published 35+ verified parametric assemblies on Onshape, used by more than 300 teams globally.",
        "International Technical Webinars: Hosted bi-weekly workshops covering custom gear calculations, FEA analysis, and autonomous control theory.",
        "Diversity in Engineering Summer Camps: Targeted hands-on STEM programs introducing underrepresented middle schoolers to CAD modeling."
    ],
    tech_pts=[
        "Custom Differential Bevel Wrist: CNC-machined bevel gearbox delivering two degrees of freedom with sub-0.2 degree backlash.",
        "FEA Topology Optimization: Generative design on suspension brackets and elevator mounts shaving 140g without losing structural rigidity.",
        "FMEA Failure Mode Analysis: Exhaustive failure logging and risk matrices applied to every subsystem before tournament deployment."
    ],
    auton_pts=[
        "Cubic Spline Trajectory Generation: Native Java spline solver generating dynamic collision-free navigation paths in real time.",
        "Multi-Sensor Kalman Filtering: Encoders fused with 6-axis IMU to eliminate drift over high-speed match cycles.",
        "Telemetry Pit Dashboards: Real-time telemetry streaming motor thermal health and battery sag over custom WebSocket connections."
    ],
    mechanisms=[
        "Custom CNC Differential Bevel Wrist",
        "Carbon Fiber Sandwich Plate Chassis",
        "Magnetic Latch Intake Shroud",
        "Active Tensioned Constant-Force Cascade Lift"
    ]
)

create_portfolio_pdf(
    filename="11260-powerplay.pdf",
    team_num="11260",
    team_name="Up-A-Creek Robotics",
    school="St. Vrain Valley School District",
    location="Longmont, Colorado, USA",
    season="PowerPlay (2022-23)",
    awards=[
        "World Championship Finalist Alliance — Houston Worlds",
        "Innovate Award Winner — Sponsored by Raytheon Technologies",
        "Think Award Finalist — Colorado Regional Championship"
    ],
    overview="FTC #11260 Up-A-Creek Robotics pioneered the continuous 360-degree turret in FIRST Tech Challenge, setting world-record scoring cycles through mechanical innovation and seamless driver integration.",
    outreach_pts=[
        "Mobile STEM Discovery Trailer: Traveled to rural communities across Colorado, engaging 3,000+ students in hands-on robotics activities.",
        "Aerospace Industry Mentorship Pipeline: Partnered with local aerospace manufacturers to provide student internships.",
        "Colorado FTC Scrimmages: Hosted preseason events and safety workshops for 24 regional robotics teams."
    ],
    tech_pts=[
        "Continuous 360° Turret: Custom ball-bearing race with slip-ring wire pass-through enabling infinite turret rotation while moving.",
        "Carbon Fiber Box-Tube Lift: Constant-force spring counterbalancing reducing motor draw during rapid 34-inch vertical extensions.",
        "Compliant Cone Centering Gripper: Molded silicone gripper pads accommodating severe cone misalignments during high-speed pickup."
    ],
    auton_pts=[
        "Field-Centric Turret Slaving: Turret autonomously targets scoring junctions regardless of robot chassis orientation.",
        "On-The-Fly Dynamic Pathing: Adaptive trajectory recalculation avoiding defense robots while maintaining cycle tempo.",
        "Dual-Camera Computer Vision: Color thresholding and contour analysis detecting junction poles with 99.2% accuracy."
    ],
    mechanisms=[
        "360-Degree Continuous Planetary Turret",
        "Dual Carbon Fiber Elevator with Spring Assist",
        "Compliant Molded Silicone Cone Centering Gripper",
        "Ultra-Compact Low-CG Odometry Pods"
    ]
)
