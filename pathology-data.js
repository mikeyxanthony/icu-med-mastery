// ============================================================
// Pathology Data — cardiac + respiratory + sepsis
// References: AHA/ACC, Berlin ARDS criteria, Sepsis-3, GOLD,
//             current critical care literature
// ============================================================

window.CORONARIES = [
  {
    id: "lad",
    name: "LAD",
    fullName: "Left Anterior Descending Artery",
    color: "#16a34a",
    origin: "Anterior division of the left main coronary artery",
    branches: [
      "Septal perforators (anterior 2/3 of interventricular septum)",
      "Diagonal branches (anterolateral LV wall)",
    ],
    perfuses: [
      "Anterior LV wall",
      "Apex",
      "Anterior 2/3 of the interventricular septum",
      "Anterior papillary muscle of the mitral valve",
      "Most of the right bundle and left anterior fascicle",
    ],
    mi: {
      region: "Anterior wall MI (± septal, ± apical, ± lateral)",
      leads: "V1–V4 (ST elevation); proximal LAD adds I, aVL",
      reciprocal: "II, III, aVF (often reciprocal depression)",
      complications: [
        "LV failure / cardiogenic shock (large infarct)",
        "Apical thrombus formation",
        "Ventricular septal rupture (sub-acute, days 3–7)",
        "Free wall rupture",
        "New right bundle branch block or anterior fascicular block",
        "Heart block (rarely — septal perforator territory)",
        "Sudden cardiac death from VT/VF",
      ],
    },
    keyPearl:
      "Proximal LAD = 'widowmaker.' Supplies ~40% of LV myocardium. Anterior MI carries the highest mortality of any STEMI location.",
  },
  {
    id: "lcx",
    name: "LCx",
    fullName: "Left Circumflex Artery",
    color: "#2563eb",
    origin: "Posterior division of the left main coronary artery",
    branches: [
      "Obtuse marginal branches (lateral LV wall)",
      "Posterior descending artery in left-dominant circulation (~10–15% of people)",
    ],
    perfuses: [
      "Lateral LV wall",
      "Posterior LV wall (if left-dominant)",
      "SA node (~40–45%)",
      "AV node (~10%)",
      "Posterior papillary muscle of the mitral valve",
    ],
    mi: {
      region: "Lateral wall MI; posterolateral if proximal",
      leads: "I, aVL, V5, V6 (often subtle ST changes)",
      reciprocal: "III, aVF (ST depression)",
      complications: [
        "Mitral regurgitation from posterior papillary muscle ischemia/rupture",
        "Atrial arrhythmias if SA node involved",
        "AV block if AV node territory involved (left-dominant)",
        "Posterior MI presenting as 'reciprocal' V1–V3 ST depression with tall R waves",
      ],
    },
    keyPearl:
      "The 'silent' STEMI — frequently missed on 12-lead because lateral lead changes are subtle. Always check posterior leads (V7–V9) when V1–V3 show prominent R waves with ST depression.",
  },
  {
    id: "rca",
    name: "RCA",
    fullName: "Right Coronary Artery",
    color: "#dc2626",
    origin: "Right coronary cusp of the aorta",
    branches: [
      "Conus branch (often first — RVOT)",
      "SA nodal artery (~55–60%)",
      "Acute marginal branches (right ventricle)",
      "AV nodal artery (~90%)",
      "Posterior descending artery (in 85% — right-dominant circulation)",
    ],
    perfuses: [
      "Right ventricle",
      "Inferior LV wall",
      "Posterior 1/3 of septum (right-dominant)",
      "SA node (majority)",
      "AV node (most)",
      "Posterior papillary muscle (right-dominant)",
    ],
    mi: {
      region: "Inferior MI; check for RV and posterior involvement",
      leads: "II, III, aVF; V4R for RV infarct; V7–V9 for posterior extension",
      reciprocal: "I, aVL (ST depression)",
      complications: [
        "Sinus bradycardia / SA nodal dysfunction",
        "AV blocks (AV node territory — Wenckebach common)",
        "Right ventricular infarction → preload-dependent hypotension",
        "Bezold–Jarisch reflex (bradycardia + hypotension)",
        "Posterior wall extension",
        "Acute mitral regurgitation from posterior papillary muscle (right-dominant)",
      ],
    },
    keyPearl:
      "Inferior MI with hypotension → check V4R for RV infarct. RV infarct patients are preload-dependent — give FLUID, AVOID nitrates and morphine, which drop preload.",
  },
  {
    id: "leftmain",
    name: "Left Main",
    fullName: "Left Main Coronary Artery",
    color: "#7c3aed",
    origin: "Left coronary cusp of the aorta",
    branches: ["LAD (anterior division)", "LCx (posterior division)"],
    perfuses: ["~50–70% of LV myocardium (LAD + LCx territories combined)"],
    mi: {
      region: "Massive anterolateral MI — often cardiogenic shock or arrest",
      leads:
        "Widespread ST depression with ST elevation in aVR (aVR > V1) is the classic pattern; can also present as anterolateral STEMI",
      reciprocal: "Inferior leads",
      complications: [
        "Profound cardiogenic shock",
        "Mechanical circulatory support frequently required",
        "Multi-vessel disease often coexists",
        "Very high mortality — emergent CABG or PCI",
      ],
    },
    keyPearl:
      "aVR ST elevation > V1 ST elevation with widespread ST depression in 8+ leads → left main / proximal LAD / triple-vessel disease. Treat as critical.",
  },
];

window.HEART_SOUNDS = [
  {
    name: "S1",
    timing: "Start of systole",
    cause: "Closure of mitral and tricuspid (AV) valves",
    clinical:
      "Loud S1: mitral stenosis (early), short PR, hyperdynamic states. Soft S1: severe mitral regurgitation, prolonged PR, calcified mitral valve.",
  },
  {
    name: "S2",
    timing: "End of systole / start of diastole",
    cause: "Closure of aortic (A2) and pulmonic (P2) valves",
    clinical:
      "Wide split (P2 delayed): RBBB, pulmonic stenosis, ASD. Fixed split (no change with respiration): ASD. Paradoxical split (A2 delayed): LBBB, severe AS, RV pacing.",
  },
  {
    name: "S3",
    timing: "Early diastole, ~150 ms after S2",
    cause: "Rapid passive ventricular filling against a volume-overloaded chamber",
    clinical:
      "'Ventricular gallop.' Normal in young athletes and during pregnancy. Pathologic in adults > 40: indicates HF, severe MR, severe AR. Best heard at apex, left lateral decubitus position, with bell.",
  },
  {
    name: "S4",
    timing: "Late diastole, just before S1",
    cause: "Atrial contraction forcing blood into a stiff, non-compliant ventricle",
    clinical:
      "'Atrial gallop.' Always pathologic. Stiff LV from HTN, HCM, aortic stenosis, acute ischemia, restrictive cardiomyopathy. By definition absent in AFib (no atrial kick).",
  },
];

window.MURMURS = [
  {
    id: "as",
    name: "Aortic Stenosis",
    type: "Systolic",
    timing: "Mid-systolic, ejection",
    shape: "Crescendo–decrescendo (diamond)",
    location: "Right upper sternal border (2nd ICS, R)",
    radiates: "Carotids (both sides)",
    pitch: "Harsh",
    maneuvers: "↓ with Valsalva (less preload). ↑ with squat. Delayed peak = severe.",
    associatedSigns: [
      "Pulsus parvus et tardus (delayed, weak carotid upstroke)",
      "Soft or absent A2 in severe disease",
      "S4 (stiff LV)",
      "Sustained, non-displaced apex",
    ],
    classic:
      "Triad: syncope, angina, dyspnea (each carries worsening prognosis when symptomatic).",
    causes: [
      "Calcific degenerative (most common in >70)",
      "Bicuspid aortic valve (presents earlier, 40s–60s)",
      "Rheumatic (uncommon now, classically MS + AS)",
    ],
    nursing:
      "Avoid afterload reduction (nitro, ACE-I) and venodilators in severe AS — drops gradient-dependent perfusion. Fixed CO — they cannot compensate for hypotension.",
  },
  {
    id: "mr",
    name: "Mitral Regurgitation",
    type: "Systolic",
    timing: "Holosystolic (pansystolic)",
    shape: "Plateau / blowing",
    location: "Apex (5th ICS, midclavicular)",
    radiates: "Left axilla",
    pitch: "Blowing",
    maneuvers: "↑ with handgrip (↑ afterload). No significant change with respiration.",
    associatedSigns: [
      "Displaced apex beat (LV dilation in chronic)",
      "S3 if severe (volume overload)",
      "Pulmonary congestion in acute MR",
    ],
    classic:
      "Acute MR (papillary muscle rupture post-MI) = flash pulmonary edema, often without prominent murmur. Chronic MR = compensated until late.",
    causes: [
      "Acute: papillary muscle rupture (inferior MI), endocarditis, chordal rupture",
      "Chronic: mitral valve prolapse, rheumatic, LV dilation (functional MR)",
    ],
    nursing:
      "Acute MR after inferior MI is a surgical emergency. New systolic murmur post-MI = think MR or VSD.",
  },
  {
    id: "tr",
    name: "Tricuspid Regurgitation",
    type: "Systolic",
    timing: "Holosystolic",
    shape: "Plateau / blowing",
    location: "Left lower sternal border (4th–5th ICS, L)",
    radiates: "Right sternal edge (minimal radiation)",
    pitch: "Blowing",
    maneuvers: "Carvallo's sign: ↑ with inspiration (↑ venous return to RV)",
    associatedSigns: [
      "Prominent CV waves in JVP",
      "Pulsatile liver",
      "Peripheral edema, ascites if severe",
      "Right-sided S3",
    ],
    causes: [
      "Functional (RV dilation from pulmonary HTN, LV failure)",
      "Endocarditis (IV drug users — right-sided IE classically affects tricuspid)",
      "Ebstein anomaly (congenital)",
      "Carcinoid syndrome",
    ],
    nursing:
      "Inspiration distinguishes TR from MR — Carvallo's sign. In IVDU patient with new TR + fever, think right-sided endocarditis.",
  },
  {
    id: "vsd",
    name: "Ventricular Septal Defect",
    type: "Systolic",
    timing: "Holosystolic",
    shape: "Harsh, plateau",
    location: "Left lower sternal border (4th ICS, L)",
    radiates: "Across precordium",
    pitch: "Harsh",
    maneuvers: "↑ with handgrip (↑ afterload, ↑ shunt)",
    associatedSigns: [
      "Often palpable thrill at LLSB",
      "Smaller VSDs have louder murmurs (high-velocity flow)",
    ],
    classic:
      "Post-MI VSD: sub-acute mechanical complication days 3–7 after anterior or inferior MI. New harsh murmur + cardiogenic shock = ER for surgical repair.",
    causes: [
      "Congenital (most common congenital cardiac defect)",
      "Post-MI rupture of septum (sub-acute mechanical complication)",
    ],
    nursing:
      "Always part of the differential for 'new murmur post-MI' along with acute MR and free wall rupture.",
  },
  {
    id: "hcm",
    name: "HCM (Hypertrophic Cardiomyopathy)",
    type: "Systolic",
    timing: "Mid-systolic ejection",
    shape: "Crescendo–decrescendo",
    location: "Left lower sternal border / apex",
    radiates: "Does NOT radiate to carotids (distinguishes from AS)",
    pitch: "Harsh",
    maneuvers:
      "PARADOX: ↑ with Valsalva, ↑ with squat-to-stand, ↑ with standing (anything that ↓ preload). ↓ with handgrip, ↓ with squat. Opposite of AS.",
    associatedSigns: [
      "Bifid (bisferiens) carotid pulse",
      "Sustained, hyperdynamic apex",
      "S4 from stiff hypertrophied LV",
      "Mitral regurgitation murmur often co-exists (SAM of mitral valve)",
    ],
    classic:
      "Young athlete with syncope on exertion → think HCM. Maneuvers that decrease preload bring out the murmur — opposite of every other systolic murmur.",
    causes: ["Genetic (autosomal dominant, sarcomere mutations — MYH7, MYBPC3)"],
    nursing:
      "AVOID anything that worsens LVOT obstruction: dehydration, diuretics in obstructive, vasodilators, sympathomimetics. Treat with β-blockers, non-DHP CCBs (verapamil, diltiazem), and disopyramide.",
  },
  {
    id: "mvp",
    name: "Mitral Valve Prolapse",
    type: "Systolic",
    timing: "Mid-systolic click + late systolic murmur",
    shape: "Click followed by crescendo murmur",
    location: "Apex",
    radiates: "Axilla",
    pitch: "Click is high-pitched; murmur blowing",
    maneuvers:
      "Valsalva and standing move click EARLIER in systole and lengthen the murmur. Squat moves click LATER and shortens murmur.",
    associatedSigns: ["Young thin patient", "Often associated with connective tissue disease (Marfan, Ehlers-Danlos)"],
    causes: ["Idiopathic (most common)", "Connective tissue disorders"],
    nursing:
      "Usually benign but watch for progression to significant MR, endocarditis risk, arrhythmias.",
  },
  {
    id: "ar",
    name: "Aortic Regurgitation",
    type: "Diastolic",
    timing: "Early diastolic, immediately after S2",
    shape: "Decrescendo",
    location: "Left sternal border (3rd–4th ICS, L)",
    radiates: "Apex",
    pitch: "High-pitched, blowing — use diaphragm, patient leaning forward, end-expiration",
    maneuvers: "↑ with handgrip (↑ afterload, ↑ regurgitant volume)",
    associatedSigns: [
      "Wide pulse pressure (high systolic, low diastolic)",
      "Water-hammer / Corrigan's pulse (rapid rise and collapse)",
      "Quincke's sign (nail-bed pulsation)",
      "de Musset's sign (head bobbing)",
      "Austin Flint murmur (functional MS rumble at apex)",
    ],
    causes: [
      "Bicuspid valve",
      "Aortic root dilation (HTN, Marfan, syphilis)",
      "Endocarditis",
      "Acute: aortic dissection, endocarditis",
    ],
    nursing:
      "Acute AR (dissection, endocarditis) is a surgical emergency — patient cannot compensate. Chronic AR tolerated for years.",
  },
  {
    id: "ms",
    name: "Mitral Stenosis",
    type: "Diastolic",
    timing: "Mid-to-late diastolic, after opening snap",
    shape: "Decrescendo–crescendo (rumble that builds before S1)",
    location: "Apex, with patient in left lateral decubitus",
    radiates: "Localized — minimal radiation",
    pitch: "Low-pitched rumble — use bell",
    maneuvers: "↑ with exercise (↑ HR shortens diastole). Quiet — listen carefully.",
    associatedSigns: [
      "Opening snap (high-pitched, just after S2)",
      "Loud S1",
      "AFib common (atrial enlargement)",
      "Pulmonary HTN, RV failure in late disease",
    ],
    classic:
      "Almost always rheumatic in origin. Opening snap closer to S2 = more severe (higher LA pressure).",
    causes: ["Rheumatic heart disease (overwhelming majority)", "Mitral annular calcification (elderly)"],
    nursing:
      "Watch for AFib with rapid response — fixed CO, poor tolerance. Anticoagulation for AFib (CHA₂DS₂-VASc adjusted).",
  },
];

window.AUSCULTATION_AREAS = [
  { area: "Aortic", location: "Right upper sternal border, 2nd ICS R", best: "AS, AR" },
  { area: "Pulmonic", location: "Left upper sternal border, 2nd ICS L", best: "PS, PR, P2 split" },
  { area: "Erb's point", location: "3rd ICS, left sternal border", best: "AR (lean forward), HOCM" },
  { area: "Tricuspid", location: "Left lower sternal border, 4th–5th ICS L", best: "TR, VSD (Carvallo's sign with inspiration)" },
  { area: "Mitral / Apex", location: "5th ICS, midclavicular line", best: "MR, MS (left lateral decubitus), S3/S4" },
];

// ────────────────────────────────────────────────────────────
// Critical care conditions
// ────────────────────────────────────────────────────────────
window.CONDITIONS = [
  {
    id: "ards",
    name: "ARDS",
    fullName: "Acute Respiratory Distress Syndrome",
    category: "Respiratory",
    emoji: "🫁",
    sections: [
      {
        title: "Berlin Definition (all four required)",
        items: [
          "Onset within 1 week of known clinical insult or new/worsening respiratory symptoms",
          "Bilateral opacities on chest imaging not fully explained by effusions, lobar/lung collapse, or nodules",
          "Respiratory failure not fully explained by cardiac failure or fluid overload — objective assessment (echo) needed if no obvious risk factor",
          "Oxygenation: PaO₂/FiO₂ ratio on PEEP ≥ 5 cmH₂O — Mild 200–300, Moderate 100–200, Severe ≤ 100",
        ],
      },
      {
        title: "Pathophysiology",
        items: [
          "Diffuse alveolar damage with three overlapping phases: exudative (days 1–7, edema + hyaline membranes), proliferative (days 7–21, fibroblast proliferation), fibrotic (>21 days, may resolve or progress)",
          "Increased alveolar–capillary permeability → non-cardiogenic pulmonary edema",
          "Loss of surfactant + alveolar flooding → atelectasis + V/Q mismatch + intrapulmonary shunt",
          "Refractory hypoxemia (poor response to ↑ FiO₂ — true shunt physiology)",
        ],
      },
      {
        title: "Common Causes",
        items: [
          "Pulmonary: pneumonia (bacterial, viral including COVID-19), aspiration, pulmonary contusion, inhalation injury, drowning",
          "Extrapulmonary: sepsis, pancreatitis, multi-trauma, massive transfusion (TRALI), drug overdose, fat embolism",
        ],
      },
      {
        title: "Lung-Protective Ventilation (ARDSnet)",
        items: [
          "Tidal volume 4–6 mL/kg IDEAL body weight (use predicted body weight formula based on height + sex)",
          "Plateau pressure ≤ 30 cmH₂O",
          "Driving pressure (Pplat − PEEP) ≤ 15 cmH₂O (associated with survival)",
          "PEEP titration: ARDSnet table (PEEP/FiO₂ pairs) or based on lung mechanics / esophageal pressures",
          "Permissive hypercapnia: tolerate PaCO₂ 50–70 with pH ≥ 7.20",
          "SpO₂ goal 88–95% / PaO₂ 55–80 mmHg",
        ],
      },
      {
        title: "Beyond the Ventilator",
        items: [
          "Prone positioning ≥ 12–16 hr/day for moderate–severe ARDS (P/F < 150) — PROSEVA trial showed mortality benefit",
          "Conservative fluid strategy after initial resuscitation (FACTT trial — fewer vent days)",
          "Neuromuscular blockade for severe ARDS: 48-hour infusion of cisatracurium (ACURASYS — earlier benefit; ROSE — newer trial less conclusive)",
          "ECMO for refractory hypoxemia (EOLIA-style criteria: P/F < 50 for 3 hr or < 80 for 6 hr despite optimization)",
          "Inhaled pulmonary vasodilators (iNO, epoprostenol) — improves oxygenation but no mortality benefit",
        ],
      },
      {
        title: "Nursing Pearls",
        items: [
          "Suctioning carefully — derecruitment from open suctioning, prefer in-line",
          "Prone positioning needs a TEAM — pressure ulcer prevention, ETT/line security, eye care",
          "Sedation goals balance synchrony with awakening — RASS targets per protocol",
          "Watch for VAP, DVT prophylaxis, GI prophylaxis (FASTHUG approach)",
          "Family communication — long ICU stays, slow recovery, post-ICU syndrome common",
        ],
      },
    ],
  },
  {
    id: "sepsis",
    name: "Sepsis & Septic Shock",
    fullName: "Sepsis-3 Definition",
    category: "Multisystem",
    emoji: "🦠",
    sections: [
      {
        title: "Definitions (Sepsis-3)",
        items: [
          "Sepsis: life-threatening organ dysfunction caused by a dysregulated host response to infection — operationally, infection + SOFA score increase ≥ 2 from baseline",
          "Septic shock: subset of sepsis with circulatory and cellular/metabolic dysfunction — requires vasopressors to maintain MAP ≥ 65 AND lactate > 2 mmol/L despite adequate fluid resuscitation",
          "qSOFA (bedside screen — not diagnostic): RR ≥ 22, altered mentation, SBP ≤ 100. Any 2 → consider sepsis. Note: qSOFA misses many sepsis cases — high specificity, lower sensitivity",
        ],
      },
      {
        title: "SOFA Components (organ dysfunction scoring)",
        items: [
          "Respiratory: PaO₂/FiO₂",
          "Coagulation: platelets",
          "Liver: bilirubin",
          "Cardiovascular: MAP / pressor requirement",
          "CNS: Glasgow Coma Scale",
          "Renal: creatinine / urine output",
        ],
      },
      {
        title: "1-Hour Bundle (Surviving Sepsis Campaign)",
        items: [
          "Measure lactate; re-measure if initial > 2 mmol/L",
          "Obtain blood cultures BEFORE antibiotics (do not delay antibiotics for cultures > 45 min)",
          "Administer broad-spectrum antibiotics targeted to likely source",
          "Begin 30 mL/kg crystalloid IV for hypotension OR lactate ≥ 4 mmol/L",
          "Apply vasopressors during/after fluids if MAP < 65 to keep MAP ≥ 65",
        ],
      },
      {
        title: "Hemodynamic Management",
        items: [
          "Norepinephrine first-line vasopressor",
          "Add vasopressin (fixed 0.03 units/min) at norepi ≥ 0.25 mcg/kg/min — catecholamine-sparing",
          "Add epinephrine if MAP target not met (3rd line) or for cardiomyopathy",
          "Hydrocortisone 200 mg/day IV in refractory shock (vasopressor escalation despite fluids)",
          "Targeted MAP ≥ 65 generally; higher (75–85) in chronic HTN may help renal perfusion",
          "Lactate trend more important than absolute value — re-check q2–4 hr in early sepsis",
        ],
      },
      {
        title: "Source Control",
        items: [
          "Identify and address: abscess drainage, infected line removal, debridement, cholecystectomy, etc.",
          "De-escalate antibiotics based on culture results — narrow as soon as possible",
          "Source control within 6–12 hr when feasible",
        ],
      },
      {
        title: "Nursing Pearls",
        items: [
          "Don't delay antibiotics — every hour of delay in septic shock ↑ mortality ~7%",
          "Monitor for ICU-acquired complications: AKI, ARDS, delirium, ICU-acquired weakness, stress ulcer",
          "Watch for relative adrenal insufficiency — refractory shock despite multiple pressors",
          "Glycemic control: target glucose 140–180 mg/dL (avoid both hypo- and severe hyperglycemia)",
          "Lactate clearance > 10% in 2 hr is favorable; persistently elevated = ongoing dysoxia or non-perfusion source (look for it!)",
        ],
      },
    ],
  },
  {
    id: "copd",
    name: "COPD Exacerbation",
    fullName: "Chronic Obstructive Pulmonary Disease",
    category: "Respiratory",
    emoji: "🚬",
    sections: [
      {
        title: "Definition & GOLD Severity (post-bronchodilator FEV₁ % predicted)",
        items: [
          "COPD = airflow limitation that is not fully reversible (post-bronchodilator FEV₁/FVC < 0.70)",
          "GOLD 1 (Mild): FEV₁ ≥ 80% predicted",
          "GOLD 2 (Moderate): FEV₁ 50–79%",
          "GOLD 3 (Severe): FEV₁ 30–49%",
          "GOLD 4 (Very severe): FEV₁ < 30%",
        ],
      },
      {
        title: "Pathophysiology",
        items: [
          "Mix of chronic bronchitis (small-airway inflammation, mucus hypersecretion) and emphysema (alveolar destruction, loss of elastic recoil)",
          "Air trapping → dynamic hyperinflation → ↑ work of breathing",
          "V/Q mismatch + dead-space ventilation → hypoxemia + hypercapnia",
          "Chronic CO₂ retainers shift to hypoxic drive — important consideration but DON'T withhold needed O₂",
        ],
      },
      {
        title: "Exacerbation Triggers",
        items: [
          "Bacterial infection (H. influenzae, S. pneumoniae, M. catarrhalis)",
          "Viral (rhinovirus, influenza, RSV)",
          "Air pollution / environmental exposure",
          "Heart failure (often co-exists)",
          "Medication non-adherence",
          "Pulmonary embolism (always in the differential)",
        ],
      },
      {
        title: "Exacerbation Treatment",
        items: [
          "Bronchodilators: short-acting β2-agonist (albuterol) + anticholinergic (ipratropium) by nebulizer or MDI with spacer",
          "Systemic corticosteroids: prednisone 40 mg PO × 5 days (or IV equivalent) — shortens exacerbation, reduces relapse",
          "Antibiotics if 2 of 3 Anthonisen criteria: ↑ dyspnea, ↑ sputum volume, ↑ sputum purulence (typically azithromycin or amoxicillin-clavulanate; doxycycline)",
          "Oxygen target SpO₂ 88–92% (avoid hyperoxia — worsens V/Q matching and can worsen hypercapnia)",
          "Non-invasive ventilation (BiPAP) for hypercapnic respiratory failure with pH < 7.35 — STRONG evidence; reduces intubation and mortality",
          "Intubation if NIV fails or contraindicated (severe acidosis, AMS, instability)",
        ],
      },
      {
        title: "Vent Strategy if Intubated",
        items: [
          "Long expiratory time — low respiratory rate (10–12), I:E ratio 1:3 or 1:4 to prevent breath-stacking / auto-PEEP",
          "Low tidal volume (6 mL/kg IBW)",
          "Permissive hypercapnia (pH > 7.20) — slow correction to avoid post-hypercapnic alkalosis",
          "Bronchodilators every 1–2 hr via in-line nebulizer initially",
          "Watch peak vs plateau pressure — high peak with normal plateau = airway resistance (bronchospasm, mucus, ETT issue)",
        ],
      },
      {
        title: "Nursing Pearls",
        items: [
          "DON'T withhold needed O₂ from fear of suppressing drive — target 88–92% SpO₂",
          "Position patient upright, lean-forward / tripod position helps work of breathing",
          "Watch for auto-PEEP — disconnect from vent briefly if hemodynamically unstable to assess (carefully)",
          "Early NIV in appropriate patient is life-saving; have BiPAP ready in COPD floor patients showing fatigue",
          "Smoking cessation counseling at every encounter — most important intervention for long-term outcomes",
        ],
      },
    ],
  },
  {
    id: "hcm",
    name: "Hypertrophic Cardiomyopathy",
    fullName: "HCM (Genetic Sarcomeric Cardiomyopathy)",
    category: "Cardiac",
    emoji: "💪",
    sections: [
      {
        title: "Definition",
        items: [
          "Most common genetic cardiac disorder — prevalence ~1:500",
          "Autosomal dominant; mutations in sarcomere protein genes (MYH7, MYBPC3, TNNT2 most common)",
          "Unexplained LV hypertrophy (wall thickness > 15 mm, or > 13 mm with family history) NOT explained by HTN, AS, etc.",
          "Asymmetric septal hypertrophy is most common pattern; apical, concentric, and mid-cavity variants exist",
        ],
      },
      {
        title: "Hemodynamics",
        items: [
          "Diastolic dysfunction (stiff, hypertrophied LV with impaired relaxation)",
          "LV outflow tract obstruction (LVOT) in ~25–30% — dynamic, not fixed",
          "Systolic anterior motion (SAM) of the mitral valve contributes to LVOT obstruction and causes mitral regurgitation",
          "Obstruction WORSENS with: ↓ preload (Valsalva, standing, dehydration, diuretics), ↓ afterload (vasodilators, spinal anesthesia), ↑ contractility (sympathomimetics, exercise, hypovolemia)",
          "Obstruction IMPROVES with: ↑ preload, ↑ afterload, ↓ contractility — opposite of every other systolic murmur in this regard",
        ],
      },
      {
        title: "Clinical Presentation",
        items: [
          "Often asymptomatic until first event",
          "Exertional dyspnea (most common symptom)",
          "Chest pain (small-vessel ischemia)",
          "Pre-syncope / syncope (worsening obstruction with exertion)",
          "Palpitations / arrhythmias",
          "Sudden cardiac death — leading cause in young athletes",
        ],
      },
      {
        title: "Risk Stratification for Sudden Cardiac Death",
        items: [
          "Family history of SCD in 1st-degree relative",
          "Unexplained syncope (especially exertional)",
          "Massive LV hypertrophy ≥ 30 mm",
          "Non-sustained VT on ambulatory monitoring",
          "Abnormal blood pressure response to exercise (failure to rise > 20 mmHg, or drop)",
          "Extensive late gadolinium enhancement on cardiac MRI",
          "Apical aneurysm",
          "Prior cardiac arrest",
        ],
      },
      {
        title: "Management",
        items: [
          "β-blockers first-line (negative inotropy + chronotropy)",
          "Non-DHP calcium channel blockers (verapamil, diltiazem) — alternative to β-blockers",
          "Disopyramide (Norpace) — negative inotrope, helpful for refractory symptoms",
          "Mavacamten — newer cardiac myosin inhibitor approved for symptomatic obstructive HCM",
          "Surgical septal myectomy or alcohol septal ablation for refractory obstructive disease",
          "ICD for high SCD risk patients",
          "AVOID: digoxin, diuretics (in obstructive), nitrates, ACE-I (in obstructive), sympathomimetics",
        ],
      },
      {
        title: "Nursing Pearls",
        items: [
          "DEHYDRATION IS DANGEROUS — maintain euvolemia. Hypovolemia ↓ preload → worsens LVOT obstruction → can precipitate shock",
          "AVOID empiric epinephrine, dobutamine — increase contractility and worsen obstruction. If they need pressor, phenylephrine (pure α1) is preferred",
          "First-degree relatives need screening echo + ECG starting in adolescence; genetic counseling",
          "Athletes should be restricted from competitive sports per ACC/AHA recommendations",
          "Pregnancy is high-risk — multidisciplinary management",
        ],
      },
    ],
  },
  {
    id: "mi-types",
    name: "MI Patterns by Territory",
    fullName: "Coronary Artery → Infarct Region Mapping",
    category: "Cardiac",
    emoji: "💔",
    sections: [
      {
        title: "Anterior MI (LAD)",
        items: [
          "Leads: V1–V4 ST elevation; proximal LAD adds I, aVL (anterolateral)",
          "Reciprocal: II, III, aVF",
          "Highest mortality location due to large myocardium at risk",
          "Watch for: cardiogenic shock, apical thrombus (anticoagulate if present), new bundle branch block, ventricular septal rupture (sub-acute), free wall rupture",
        ],
      },
      {
        title: "Inferior MI (RCA in 85%, LCx in 15%)",
        items: [
          "Leads: II, III, aVF ST elevation",
          "Reciprocal: I, aVL",
          "Always check V4R for RV infarct — proximal RCA",
          "Always check V7–V9 for posterior extension (or look for tall R with ST depression in V1–V3)",
          "Bradyarrhythmias common — AV blocks (Wenckebach > Mobitz II), sinus bradycardia",
          "RV infarct → preload-dependent — FLUID, AVOID nitrates/morphine/diuretics",
        ],
      },
      {
        title: "Lateral MI (LCx, or diagonal LAD)",
        items: [
          "Leads: I, aVL, V5, V6",
          "Reciprocal: III, aVF",
          "Often subtle — most commonly missed STEMI",
          "Posterior MI may co-exist (distal LCx)",
          "Mitral regurgitation from posterior papillary muscle dysfunction",
        ],
      },
      {
        title: "Posterior MI",
        items: [
          "Direct visualization on posterior leads V7–V9 (ST elevation)",
          "Or: V1–V3 with ST depression and TALL R wave (reciprocal posterior STEMI pattern)",
          "Usually with inferior or lateral involvement",
          "Often missed if posterior leads not obtained",
        ],
      },
      {
        title: "Right Ventricular MI",
        items: [
          "Almost always with inferior MI (proximal RCA before RV branches)",
          "Lead V4R ST elevation ≥ 1 mm = diagnostic",
          "Clinical triad: hypotension, clear lungs, elevated JVP",
          "FLUID-RESPONSIVE — preload-dependent",
          "AVOID nitrates, morphine, β-blockers (worsen hypotension)",
        ],
      },
      {
        title: "Left Main / Triple-Vessel Pattern",
        items: [
          "aVR ST elevation > V1 ST elevation, with diffuse ST depression in 8+ leads",
          "Often cardiogenic shock or pre-arrest",
          "Emergent revascularization — surgical (CABG) often preferred over PCI",
          "Mechanical circulatory support (IABP, Impella, ECMO) bridge while arranging",
        ],
      },
      {
        title: "Time Targets",
        items: [
          "Door-to-balloon (PCI) ≤ 90 minutes",
          "Door-to-needle (thrombolytics) ≤ 30 minutes",
          "Total ischemic time ideally < 120 minutes",
          "First medical contact to PCI ≤ 90 min (or transfer to PCI ≤ 120 min from first contact)",
        ],
      },
      {
        title: "Nursing Pearls",
        items: [
          "MONA-B mnemonic is OUTDATED for some elements — nitrates and morphine cause harm in RV MI; oxygen only if hypoxic (SpO₂ < 90%)",
          "Aspirin 162–325 mg chewed (full dose, immediate) is the universal early intervention",
          "Heparin per protocol once cath lab plan established",
          "P2Y12 inhibitor (ticagrelor, prasugrel, clopidogrel) — timing per cath lab preference",
          "Right-sided ECG + posterior leads on ANY inferior MI",
        ],
      },
    ],
  },
];
