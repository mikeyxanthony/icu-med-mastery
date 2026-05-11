// ICU Medication Database — receptor-level detail for study
window.MEDICATIONS = [
  // ─────────────────────────── VASOPRESSORS ───────────────────────────
  {
    id: "norepinephrine",
    name: "Norepinephrine",
    aliases: ["Levophed", "NE", "Norepi"],
    category: "Vasopressors",
    mechanism:
      "Direct-acting sympathomimetic. Potent α1 stimulation with moderate β1 activity and minimal β2 effect — produces powerful vasoconstriction with modest inotropic support.",
    receptors:
      "α1 ≫ β1 ≫ β2 (clinically negligible). Net effect: ↑↑ SVR, ↑ MAP, modest ↑ contractility, reflex baroreceptor slowing of HR.",
    uses: [
      "First-line vasopressor for septic / distributive shock (SSC guidelines)",
      "Cardiogenic shock with low SVR",
      "Neurogenic shock",
      "Post-cardiac-arrest hypotension",
    ],
    dose:
      "Infusion 0.01–3 mcg/kg/min (commonly 5–30 mcg/min). Push-dose 8–16 mcg IV in extremis. Titrate to MAP ≥ 65 mmHg.",
    sideEffects: [
      "Arrhythmias",
      "Reflex bradycardia",
      "Peripheral / digital ischemia",
      "Extravasation → tissue necrosis",
      "Mesenteric hypoperfusion",
      "Hyperglycemia",
    ],
    contraindications: [
      "Uncorrected hypovolemia (relative — fluid resuscitate first)",
      "Mesenteric or peripheral vascular thrombosis (relative)",
      "Hypersensitivity to sulfites in some preparations",
    ],
    icuPearls: [
      "Central line preferred — but evidence supports short-term peripheral use in well-monitored, large-vein IVs",
      "Extravasation antidote: phentolamine 5–10 mg in 10 mL NS, infiltrate SC around site",
      "Doesn't blunt cardiac output the way pure α agents do — gold standard in sepsis",
      "If escalating > 0.25 mcg/kg/min, add vasopressin to spare catecholamines",
    ],
    highYield:
      "The single most important pressor to know cold. SSC: NE first, vaso second, epi third. Lactate trending up on NE ≠ shock progression — could be β1 effect; correlate with mixed venous / ScvO2.",
  },
  {
    id: "vasopressin",
    name: "Vasopressin",
    aliases: ["AVP", "ADH", "Pitressin"],
    category: "Vasopressors",
    mechanism:
      "Synthetic analog of antidiuretic hormone. Acts on V1a vascular receptors causing potent vasoconstriction independent of the adrenergic pathway — preserves activity in acidemic / catecholamine-resistant states.",
    receptors:
      "V1a — vascular smooth muscle (vasoconstriction). V2 — renal collecting ducts (free water reabsorption, aquaporin-2 insertion). V1b — anterior pituitary (ACTH release).",
    uses: [
      "Adjunct in septic shock (added to norepinephrine)",
      "Vasoplegic shock post-cardiopulmonary bypass",
      "Cardiac arrest (no longer in ACLS but used in some protocols)",
      "Central diabetes insipidus",
      "Variceal / GI bleeding (rare modern use)",
    ],
    dose:
      "Septic shock: fixed dose 0.03–0.04 units/min (do NOT titrate — higher doses cause ischemia). DI: 0.5–10 units/hr titrated to UOP / Na.",
    sideEffects: [
      "Splanchnic / mesenteric ischemia (especially > 0.04 u/min)",
      "Digital ischemia",
      "Hyponatremia (V2 effect)",
      "Coronary vasoconstriction / MI",
      "Decreased cardiac output",
      "Bronchoconstriction",
    ],
    contraindications: [
      "Severe coronary artery disease (relative)",
      "Chronic nephritis with elevated nitrogen retention",
      "Known hypersensitivity",
    ],
    icuPearls: [
      "Catecholamine-sparing — endogenous AVP is depleted in late septic shock",
      "VASST trial: vasopressin + norepi reduced mortality in less-severe septic shock",
      "Doesn't cause tachycardia — useful when patient is tachyarrhythmic on NE",
      "Abrupt discontinuation can drop BP — wean before stopping",
    ],
    highYield:
      "Fixed dose — not titrated. When you see 'add a second pressor in septic shock,' default answer is vasopressin. Bonus: may preserve renal blood flow via efferent arteriolar constriction (theoretical benefit).",
  },
  {
    id: "epinephrine",
    name: "Epinephrine",
    aliases: ["Epi", "Adrenaline"],
    category: "Vasopressors",
    mechanism:
      "Non-selective catecholamine agonist at all α and β receptors. Receptor dominance is dose-dependent — low doses favor β effects, high doses favor α-mediated vasoconstriction.",
    receptors:
      "Low dose (≤ 0.05 mcg/kg/min): β1 / β2 dominant — ↑ HR, ↑ contractility, bronchodilation, vasodilation. High dose (> 0.1 mcg/kg/min): α1 dominant — vasoconstriction, ↑ SVR. Always activates all four.",
    uses: [
      "Anaphylaxis — first-line, IM (no ceiling, no contraindications)",
      "Cardiac arrest (ACLS): 1 mg IV q3–5 min",
      "Refractory septic shock (3rd-line per SSC)",
      "Severe bronchospasm / status asthmaticus",
      "Symptomatic bradycardia (infusion)",
      "Post-cardiac surgery low cardiac output",
    ],
    dose:
      "Cardiac arrest: 1 mg IV q3–5 min. Anaphylaxis: 0.3–0.5 mg IM (1:1000). Push-dose pressor: 5–20 mcg IV. Infusion: 0.01–1 mcg/kg/min.",
    sideEffects: [
      "Tachyarrhythmias",
      "Myocardial ischemia / MI",
      "Hyperglycemia",
      "Hyperlactatemia (β2-mediated glycolysis — NOT necessarily hypoperfusion)",
      "Anxiety / tremor",
      "Hypokalemia (β2 drives K+ intracellular)",
    ],
    contraindications: [
      "None absolute in cardiac arrest or anaphylaxis",
      "Caution: coronary artery disease, severe HTN, hyperthyroidism",
    ],
    icuPearls: [
      "Push-dose mix: 1 mL of 1:10,000 (100 mcg) into 9 mL NS = 10 mcg/mL — give 1 mL boluses",
      "Lactate may rise on epi without indicating worsening perfusion — interpret cautiously",
      "Best inopressor when both CO and SVR are needed (e.g., post-bypass low CO state)",
      "Anaphylaxis: IM lateral thigh > SC > IV bolus (IV reserved for arrest or refractory)",
    ],
    highYield:
      "Anaphylaxis dose: 0.3–0.5 mg IM 1:1000. Cardiac arrest: 1 mg IV 1:10,000. Confusing these is a common board pitfall. The β2 lactate bump is a classic ICU red herring.",
  },
  {
    id: "phenylephrine",
    name: "Phenylephrine",
    aliases: ["Neo", "Neo-Synephrine"],
    category: "Vasopressors",
    mechanism:
      "Pure α1 adrenergic agonist. Produces vasoconstriction without direct cardiac stimulation — the cleanest 'squeeze without speeding up the heart' agent.",
    receptors:
      "α1 only (no β activity). Result: ↑ SVR, ↑ MAP, reflex bradycardia via baroreceptor response, slight ↓ in cardiac output from increased afterload.",
    uses: [
      "Hypotension with tachycardia (esp. post-induction, AFib RVR)",
      "Anesthesia-induced hypotension",
      "Neurogenic shock",
      "Hypotension in HOCM / aortic stenosis (avoid β effects)",
      "Priapism (intracavernosal)",
    ],
    dose:
      "Bolus: 50–200 mcg IV. Infusion: 0.5–5 mcg/kg/min (or 25–300 mcg/min).",
    sideEffects: [
      "Reflex bradycardia",
      "↓ Cardiac output (↑ afterload)",
      "Peripheral / mesenteric ischemia",
      "Severe HTN",
      "Headache",
    ],
    contraindications: [
      "Severe hypertension",
      "Narrow-angle glaucoma",
      "Severe bradycardia (relative)",
      "Pheochromocytoma",
    ],
    icuPearls: [
      "Workhorse of the OR — single-bolus rescue for anesthesia-induced ↓BP",
      "Reflex bradycardia can be therapeutic (e.g., AFib with RVR, hypotension)",
      "Safe peripherally for short courses — common pre-central-line bridge",
      "Won't fix septic shock — doesn't address inotropy, can worsen splanchnic flow",
    ],
    highYield:
      "When BP is low AND heart rate is high → phenylephrine. When BP is low AND heart rate is low → avoid (worsens brady). Pure squeeze, no speed.",
  },

  // ─────────────────────────── INOTROPES ───────────────────────────
  {
    id: "dobutamine",
    name: "Dobutamine",
    aliases: ["Dobutrex"],
    category: "Inotropes",
    mechanism:
      "Synthetic catecholamine with predominant β1 activity, modest β2, and minimal α1. Increases contractility and stroke volume while modestly reducing afterload via β2 vasodilation.",
    receptors:
      "β1 ≫ β2 > α1. Effects: ↑↑ inotropy, ↑ chronotropy, mild peripheral vasodilation. Net result: ↑ CO, often modest ↓ in SVR and BP.",
    uses: [
      "Cardiogenic shock (esp. with preserved BP)",
      "Acute decompensated heart failure with low cardiac output",
      "Bridge to LVAD / transplant",
      "Dobutamine stress echocardiography",
      "Septic shock with cardiomyopathy (sepsis-induced)",
    ],
    dose:
      "2–20 mcg/kg/min IV infusion. Start 2.5–5, titrate to CO / mixed venous / clinical response. Doses > 10 mcg/kg/min increase arrhythmia risk significantly.",
    sideEffects: [
      "Tachycardia",
      "Atrial / ventricular arrhythmias (esp. AFib)",
      "Hypotension (β2 vasodilation, especially in volume-depleted)",
      "↑ Myocardial O2 demand → ischemia risk",
      "Tolerance after 72 hours (receptor downregulation)",
      "Eosinophilic myocarditis (rare, with prolonged use)",
    ],
    contraindications: [
      "Hypertrophic obstructive cardiomyopathy (HOCM / IHSS) — worsens LVOT obstruction",
      "Severe aortic stenosis",
      "Uncorrected tachyarrhythmias",
    ],
    icuPearls: [
      "Often described as the 'inodilator' — ↑ CO but ↓ SVR; pair with norepi if BP drops",
      "Tachyphylaxis develops in 1–3 days — receptor downregulation",
      "Can unmask or worsen AFib — monitor rhythm continuously",
      "Useful in chronic β-blocker patients (still works but blunted) vs. milrinone which bypasses β",
    ],
    highYield:
      "'Dob makes the heart bob' — primary inotrope when contractility is the issue. Watch for the BP dip; have a pressor ready. Stress echo dose 5–40 mcg/kg/min in graded steps.",
  },
  {
    id: "milrinone",
    name: "Milrinone",
    aliases: ["Primacor"],
    category: "Inotropes",
    mechanism:
      "Selective phosphodiesterase-3 (PDE-3) inhibitor. Prevents cAMP breakdown → ↑ intracellular Ca²⁺ in cardiomyocytes (inotropy) and ↑ cAMP in vascular smooth muscle (vasodilation). Bypasses the β-adrenergic pathway entirely.",
    receptors:
      "Not receptor-mediated — enzyme inhibition (PDE-3). End result mimics β1/β2 stimulation downstream of the receptor. ↑ contractility, ↓ SVR, ↓ PVR.",
    uses: [
      "Acute decompensated heart failure (low CO, high SVR)",
      "Cardiogenic shock",
      "Right ventricular failure / pulmonary hypertension",
      "Post-cardiotomy low-output syndrome",
      "Bridge to LVAD / transplant",
      "Patients on chronic β-blockers (still effective when β is blocked)",
    ],
    dose:
      "Optional load: 50 mcg/kg over 10 min (often skipped — causes hypotension). Maintenance: 0.125–0.75 mcg/kg/min. RENALLY ADJUSTED — reduce in CrCl < 50.",
    sideEffects: [
      "Hypotension (often dose-limiting)",
      "Ventricular arrhythmias",
      "Thrombocytopenia",
      "Headache",
      "Hypokalemia",
    ],
    contraindications: [
      "Severe aortic / pulmonic valve disease",
      "Hypovolemia (uncorrected)",
      "Acute MI (relative — increased mortality in some studies)",
    ],
    icuPearls: [
      "Long half-life (~2.3 hours) vs. dobutamine's minutes — slow to titrate, slow to clear",
      "First-line inotrope for RV failure and pulmonary HTN — pulmonary vasodilator effect",
      "Works when β-receptors are blocked or downregulated — chronic HF patient on carvedilol still responds",
      "Often requires concurrent vasopressor (norepi or vasopressin) for BP support",
      "Inhaled milrinone bypasses systemic effects for selective pulmonary vasodilation",
    ],
    highYield:
      "'Inodilator' — increases contractility AND drops SVR. Best agent when patient is on β-blockers or has pulmonary HTN. Renal dosing matters — easy to over-shoot in AKI.",
  },

  // ─────────────────────── SEDATION & INDUCTION ──────────────────────
  {
    id: "propofol",
    name: "Propofol",
    aliases: ["Diprivan"],
    category: "Sedation & Induction",
    mechanism:
      "Potentiates GABA-A receptor activity → increased chloride conductance → neuronal hyperpolarization → CNS depression. Rapid onset, rapid offset via redistribution.",
    receptors:
      "GABA-A receptor (allosteric potentiation at β subunit). Some NMDA antagonism and sodium channel modulation at higher doses.",
    uses: [
      "ICU sedation (intubated patients)",
      "Induction of anesthesia",
      "Refractory status epilepticus",
      "Procedural sedation",
      "Therapeutic burst suppression",
    ],
    dose:
      "Induction: 1–2.5 mg/kg IV. ICU sedation: 5–50 mcg/kg/min (rarely up to 80). Avoid sustained doses > 4 mg/kg/hr for > 48 hr (PRIS risk).",
    sideEffects: [
      "Hypotension (vasodilation + myocardial depression)",
      "Bradycardia",
      "Respiratory depression / apnea",
      "Hypertriglyceridemia (lipid emulsion)",
      "Pancreatitis",
      "Green urine (harmless)",
      "PROPOFOL INFUSION SYNDROME (PRIS): metabolic acidosis, rhabdomyolysis, AKI, cardiac collapse, hyperkalemia",
      "Injection pain",
    ],
    contraindications: [
      "Egg / soy / peanut allergy (relative — modern formulations lower risk)",
      "Hemodynamic instability (relative — use low-dose induction with pressor)",
      "Hypertriglyceridemia",
    ],
    icuPearls: [
      "Lipid carrier: ~1.1 kcal/mL — count toward total caloric intake (TPN adjustment)",
      "Change tubing q12h — bacterial growth medium",
      "PRIS workup: lactate, CK, triglycerides, ABG, CMP daily on prolonged high-dose infusions",
      "Hemodynamic dip on induction is dose-dependent — use 0.5–1 mg/kg in shock (ketamine or etomidate preferred)",
      "Excellent for neuro monitoring — fast wakeup for exams",
    ],
    highYield:
      "PRIS triad: metabolic acidosis + rhabdo + cardiac failure. Risk factors: high dose, prolonged duration, kids, head injury, vasopressors, steroids. Stop infusion immediately if suspected.",
  },
  {
    id: "dexmedetomidine",
    name: "Dexmedetomidine",
    aliases: ["Precedex", "Dex"],
    category: "Sedation & Induction",
    mechanism:
      "Highly selective central α2-adrenergic agonist. Activates pre-synaptic α2 receptors in the locus coeruleus → ↓ norepinephrine release → sedation, anxiolysis, analgesia without significant respiratory depression.",
    receptors:
      "α2 ≫ α1 (8× more selective than clonidine). α2A subtype mediates sedation; α2B causes initial vasoconstriction with bolus dosing.",
    uses: [
      "ICU sedation — light, 'cooperative' sedation",
      "Facilitation of ventilator weaning / extubation",
      "Procedural sedation (awake fiberoptic intubation)",
      "Alcohol / opioid withdrawal adjunct",
      "Delirium-sparing sedation strategy",
      "Pediatric sedation",
    ],
    dose:
      "Optional load: 1 mcg/kg over 10 min (often skipped — causes hypotension/bradycardia). Maintenance: 0.2–1.5 mcg/kg/hr.",
    sideEffects: [
      "Bradycardia (can be profound)",
      "Hypotension",
      "Initial paradoxical hypertension (α1/α2B with bolus)",
      "Dry mouth",
      "Rebound hypertension / tachycardia on abrupt discontinuation",
      "Nausea",
    ],
    contraindications: [
      "Advanced heart block (without pacemaker)",
      "Severe LV dysfunction (relative)",
      "Hypovolemia / hemodynamic instability (relative)",
    ],
    icuPearls: [
      "No clinically significant respiratory depression — patient can be extubated while on infusion",
      "'Arousable sedation' — patient sleeps but wakes to stimulation, returns to sleep",
      "Less delirium than benzodiazepines (PADIS guideline preferred over midazolam)",
      "Slow onset — not a rescue agent for acute agitation",
      "Costly — formulary restrictions in many units",
      "Wean over 12–24 hours to avoid rebound HTN/tachycardia (like clonidine withdrawal)",
    ],
    highYield:
      "Sedation without intubation requirement. Excellent for delirium prevention. The α2 mechanism explains both the bradycardia and the lack of respiratory depression — same family as clonidine.",
  },
  {
    id: "etomidate",
    name: "Etomidate",
    aliases: ["Amidate"],
    category: "Sedation & Induction",
    mechanism:
      "Imidazole derivative that potentiates GABA-A receptors → CNS depression. Hemodynamically neutral due to minimal effects on sympathetic tone and myocardial contractility.",
    receptors:
      "GABA-A receptor (β2/β3 subunit selectivity). Also inhibits 11-β-hydroxylase in the adrenal cortex → cortisol synthesis suppression.",
    uses: [
      "RSI induction — particularly in hemodynamically unstable patients",
      "Procedural sedation (cardioversion, joint reduction) — though propofol now more common",
      "Short anesthetic induction in trauma / shock / cardiac patients",
    ],
    dose:
      "Induction: 0.3 mg/kg IV (typical adult 20 mg). Onset 30–60 sec, duration 5–15 min.",
    sideEffects: [
      "MYOCLONUS on induction (involuntary muscle movements — not seizure)",
      "ADRENAL SUPPRESSION (11-β-hydroxylase inhibition — even single dose suppresses for 12–24 hr)",
      "Pain on injection",
      "Nausea / vomiting (high incidence)",
      "Lowers seizure threshold (controversial)",
      "No analgesia",
    ],
    contraindications: [
      "Known adrenal insufficiency",
      "Septic shock — controversial (concern for added adrenal suppression worsening outcomes)",
      "Hypersensitivity",
    ],
    icuPearls: [
      "Hemodynamic gold standard for the crashing patient — minimal BP change",
      "Pretreat with fentanyl to blunt sympathetic response (etomidate doesn't)",
      "Adrenal suppression debate: single-dose effect is real but clinical significance contested — many centers still use in sepsis",
      "Consider stress-dose hydrocortisone in septic patient post-etomidate induction",
      "No bronchodilation (vs. ketamine) and no histamine release",
    ],
    highYield:
      "The 'safe' induction agent for shock — but pay the adrenal tax. Modern alternative for hemodynamically unstable patient: ketamine. Know both arguments cold.",
  },
  {
    id: "ketamine",
    name: "Ketamine",
    aliases: ["Ketalar"],
    category: "Sedation & Induction",
    mechanism:
      "Non-competitive NMDA receptor antagonist producing 'dissociative anesthesia' — cortical-limbic disconnection. Indirect sympathomimetic (inhibits NE reuptake), bronchodilator, potent analgesic.",
    receptors:
      "NMDA receptor (primary, antagonist). Also: μ-, κ-, δ-opioid agonism; monoaminergic effects (↑ NE, ↑ dopamine, ↑ serotonin); muscarinic antagonism; HCN-1 channel modulation.",
    uses: [
      "RSI induction in hemodynamically unstable patients (sepsis, trauma, hemorrhage)",
      "Induction in severe bronchospasm / asthma (bronchodilator)",
      "Analgesia — sub-dissociative dosing (great opioid-sparing adjunct)",
      "Refractory status epilepticus",
      "ICU sedation infusion",
      "Treatment-resistant depression / suicidality (low-dose IV)",
      "Burn dressing changes",
    ],
    dose:
      "Induction: 1–2 mg/kg IV (or 4–6 mg/kg IM). Analgesia: 0.1–0.5 mg/kg IV bolus or 0.1–0.5 mg/kg/hr infusion. Procedural: 0.5–1 mg/kg.",
    sideEffects: [
      "Hypertension / tachycardia (sympathomimetic)",
      "Hypotension in catecholamine-depleted patients (chronic shock) — direct cardiac depressant unmasked",
      "Emergence reactions / hallucinations (pretreat or pair with benzo)",
      "Hypersalivation (consider glycopyrrolate)",
      "Laryngospasm (rare)",
      "Increased ICP — modern evidence suggests minimal/no effect, classic teaching being challenged",
      "Increased IOP",
    ],
    contraindications: [
      "Schizophrenia / psychotic disorders (relative — may worsen)",
      "Severe uncontrolled hypertension",
      "Severe coronary artery disease (relative — ↑ MVO2)",
      "Increased ICP (historical contraindication — controversial)",
    ],
    icuPearls: [
      "Maintains airway reflexes and respiratory drive — unique among induction agents",
      "Bronchodilator of choice in status asthmaticus needing intubation",
      "Sympathetic boost is INDIRECT — exhausted catecholamine stores (chronic septic shock, severe HF) may unmask direct myocardial depression → hypotension",
      "Pair with midazolam 1–2 mg or propofol to blunt emergence phenomena",
      "Sub-dissociative analgesia: 0.1–0.3 mg/kg IV — game changer for opioid-sparing",
    ],
    highYield:
      "The 'shock dose' induction agent rivaling etomidate. NMDA antagonism = dissociation. Knowing the indirect sympathomimetic vs. direct myocardial depressant duality is key — works great in acute shock, can crash a chronic shock patient.",
  },
  {
    id: "midazolam",
    name: "Midazolam",
    aliases: ["Versed"],
    category: "Sedation & Induction",
    mechanism:
      "Short-acting benzodiazepine that binds the benzodiazepine site on GABA-A receptors → ↑ frequency of chloride channel opening → CNS depression, anxiolysis, amnesia, anticonvulsant.",
    receptors:
      "GABA-A receptor (BZD allosteric site — α1, α2, α3, α5 subunits). High lipophilicity → rapid CNS penetration and onset.",
    uses: [
      "Procedural sedation",
      "ICU sedation (less preferred now — delirium / accumulation)",
      "Status epilepticus (second-line after lorazepam, or IM if no IV)",
      "Anxiolysis / amnesia pre-procedure",
      "Alcohol withdrawal (along with diazepam, lorazepam)",
    ],
    dose:
      "IV push: 0.02–0.1 mg/kg (typical 1–2 mg titrated). Infusion: 0.02–0.1 mg/kg/hr. IM: 10 mg for status (RAMPART trial).",
    sideEffects: [
      "Respiratory depression (synergistic with opioids — high mortality combo)",
      "Hypotension",
      "DELIRIUM (major ICU problem)",
      "Accumulation in renal / hepatic failure (active metabolite 1-OH-midazolam)",
      "Paradoxical agitation (esp. elderly / kids)",
      "Tolerance and withdrawal with prolonged use",
    ],
    contraindications: [
      "Acute narrow-angle glaucoma",
      "Severe respiratory depression",
      "Hypersensitivity",
      "Concurrent strong CYP3A4 inhibitors (markedly ↑ levels)",
    ],
    icuPearls: [
      "REVERSAL: flumazenil 0.2 mg IV — CAUTION can precipitate seizures in chronic users or mixed overdoses",
      "PADIS guidelines: AVOID for routine ICU sedation when possible (propofol or dex preferred)",
      "Active metabolite renally cleared — AKI → prolonged sedation for days after stopping",
      "Still first-line IM for status seizures when no IV access (10 mg IM)",
      "Synergistic respiratory depression with opioids — biggest cause of inpatient opioid-related deaths",
    ],
    highYield:
      "Falling out of favor for ICU sedation due to delirium. Still essential for status epilepticus and procedural sedation. Flumazenil reversal carries seizure risk — use with caution.",
  },

  // ───────────────────────────── PARALYTICS ─────────────────────────────
  {
    id: "rocuronium",
    name: "Rocuronium",
    aliases: ["Roc", "Zemuron"],
    category: "Paralytics",
    mechanism:
      "Non-depolarizing (competitive) neuromuscular blocker. Competes with acetylcholine at the nicotinic ACh receptor on the motor end plate → prevents depolarization → flaccid paralysis. No fasciculations.",
    receptors:
      "Nicotinic acetylcholine receptor (nAChR) at the neuromuscular junction — competitive antagonist at α subunits. No effect on muscarinic receptors.",
    uses: [
      "RSI when succinylcholine contraindicated",
      "Surgical paralysis",
      "Ventilator dyssynchrony in ARDS",
      "Reduction of ICP (paralysis prevents coughing / Valsalva spikes)",
      "Therapeutic paralysis in severe ARDS (ACURASYS / ROSE trials)",
    ],
    dose:
      "RSI: 1.0–1.2 mg/kg IV (faster onset). Maintenance: 0.6 mg/kg or infusion 8–12 mcg/kg/min. Onset 60–90 sec at RSI dose; duration 30–70 min.",
    sideEffects: [
      "Prolonged paralysis (esp. with hepatic dysfunction — hepatically cleared)",
      "Anaphylaxis (most common NMB cause of anaphylaxis)",
      "Tachycardia (mild vagolytic effect at high doses)",
      "ICU-acquired weakness with prolonged use",
    ],
    contraindications: [
      "Hypersensitivity to rocuronium or aminosteroid NMBs",
      "Inability to manage airway after paralysis",
      "Caution: severe hepatic dysfunction (prolonged duration)",
    ],
    icuPearls: [
      "ALWAYS ensure adequate sedation FIRST — paralyzed without sedation is awareness, a catastrophic harm",
      "REVERSAL: sugammadex 2–16 mg/kg (encapsulates the molecule — works through deep block) OR neostigmine + glycopyrrolate (only moderate block)",
      "Sugammadex onset ~3 min vs. neostigmine ~10 min — game-changer for can't-intubate-can't-ventilate scenarios",
      "Monitor with train-of-four (TOF) — goal 1–2 twitches for therapeutic paralysis",
      "Hepatically cleared — duration prolonged in cirrhosis / hepatic failure",
    ],
    highYield:
      "'Roc to lock.' RSI dose 1.2 mg/kg matches succinylcholine onset. Sugammadex reversal made it competitive in difficult airways. Pair with continuous sedation always.",
  },
  {
    id: "succinylcholine",
    name: "Succinylcholine",
    aliases: ["Sux", "Anectine", "Quelicin", "SCh"],
    category: "Paralytics",
    mechanism:
      "Depolarizing neuromuscular blocker. Binds nAChR as an AGONIST causing sustained depolarization → receptors become unresponsive to subsequent ACh → flaccid paralysis after initial fasciculations.",
    receptors:
      "Nicotinic acetylcholine receptor (nAChR) — agonist. Persistent depolarization prevents repolarization (Phase I block). With high doses or repeated dosing → Phase II block (resembles non-depolarizing).",
    uses: [
      "RSI when fastest possible onset / shortest duration needed",
      "ECT (brief paralysis)",
      "Laryngospasm relief (small dose IM)",
    ],
    dose:
      "RSI: 1.0–1.5 mg/kg IV. Onset 30–60 sec, duration 5–10 min. IM: 3–4 mg/kg (laryngospasm).",
    sideEffects: [
      "HYPERKALEMIA — typically ↑ K+ 0.5 mEq/L; up to several mEq in susceptible patients",
      "MALIGNANT HYPERTHERMIA (genetic — RYR1 mutation) — treat with dantrolene",
      "Bradycardia (especially in kids with repeat dosing — muscarinic effect)",
      "↑ ICP, IOP, intragastric pressure",
      "Fasciculations → post-op myalgias",
      "Prolonged paralysis in pseudocholinesterase deficiency",
      "Masseter rigidity (may herald MH)",
    ],
    contraindications: [
      "Hyperkalemia (or risk of severe hyperkalemic response):",
      "  • Burns > 24 hr old",
      "  • Crush / massive trauma > 24 hr old",
      "  • Denervation injury (stroke, SCI) > 24–72 hr old",
      "  • Severe sepsis > 24 hr",
      "  • Prolonged immobilization",
      "Known or family history of malignant hyperthermia",
      "Skeletal muscle myopathies (Duchenne's, etc.)",
      "Open globe injury (relative — ↑ IOP)",
    ],
    icuPearls: [
      "The hyperkalemia mechanism: extrajunctional ACh receptor upregulation in chronic denervation/burns → massive K+ efflux on depolarization",
      "Safe in acute burns / acute SCI in first 24–48 hr — receptor upregulation hasn't occurred yet",
      "Pseudocholinesterase deficiency: paralysis lasts hours instead of minutes — supportive care, intubation maintained",
      "Pre-treatment with defasciculating dose of non-depolarizer (e.g., roc 10 mg) historically used to reduce fasciculation pain — rarely done now",
      "MH treatment: stop trigger, dantrolene 2.5 mg/kg IV q5 min up to 10 mg/kg + cooling + bicarb + cardiology",
    ],
    highYield:
      "Fastest onset, shortest duration of any paralytic. Memorize the contraindication list — board favorite. The hyperK risk in chronic denervation/burns is the most clinically important pitfall.",
  },

  // ──────────────────────── ANTIHYPERTENSIVES ───────────────────────
  {
    id: "nicardipine",
    name: "Nicardipine",
    aliases: ["Cardene"],
    category: "Antihypertensives",
    mechanism:
      "Dihydropyridine (DHP) calcium channel blocker. Selectively blocks L-type voltage-gated calcium channels on vascular smooth muscle → arterial vasodilation → ↓ SVR → ↓ BP. Minimal myocardial effect.",
    receptors:
      "L-type calcium channels (vascular smooth muscle selective vs. cardiac). Unlike non-DHPs (verapamil, diltiazem), nicardipine does NOT affect AV node conduction or contractility meaningfully at therapeutic doses.",
    uses: [
      "Hypertensive emergency (esp. neurologic — stroke, SAH, ICH)",
      "Acute aortic dissection (combined with β-blocker)",
      "Perioperative hypertension",
      "Pulmonary hypertension (less common)",
      "Cerebral vasospasm in SAH",
    ],
    dose:
      "Initial: 5 mg/hr IV. Titrate by 2.5 mg/hr every 5–15 min to BP goal. Max 15 mg/hr. Once at goal, titrate down to maintenance 3 mg/hr.",
    sideEffects: [
      "Reflex tachycardia",
      "Headache",
      "Flushing",
      "Hypotension",
      "Peripheral edema (with chronic use)",
      "Phlebitis (peripheral IV) — rotate site every 12 hr",
      "Increased ICP (theoretical — but cerebral autoregulation usually preserved)",
    ],
    contraindications: [
      "Advanced aortic stenosis (afterload reduction → cardiac collapse)",
      "Severe LV dysfunction (relative)",
      "Hypersensitivity",
    ],
    icuPearls: [
      "Easier titration than nitroprusside — no cyanide toxicity, fewer fluctuations",
      "Preferred for neuro patients — no cerebral vasodilation issues, predictable BP control",
      "Cause phlebitis with peripheral lines — switch IV site q12h or use central line",
      "No AV nodal blockade — safe in WPW, sick sinus (unlike diltiazem)",
      "Clevidipine is a similar agent with shorter half-life (1 min) and lipid carrier — used in cardiac surgery",
    ],
    highYield:
      "Workhorse for neuro hypertensive emergencies. Dihydropyridine = peripheral vasodilator, no AV block. Combine with β-blocker (esmolol) for aortic dissection — never DHP alone (reflex tachy worsens dissection).",
  },

  // ────────────── IMMUNOSUPPRESSANTS / TRANSPLANT MEDS ─────────────
  {
    id: "tacrolimus",
    name: "Tacrolimus",
    aliases: ["Prograf", "FK506", "Astagraf XL"],
    category: "Immunosuppressants",
    mechanism:
      "Calcineurin inhibitor. Binds intracellular FKBP-12 → tacrolimus-FKBP complex inhibits calcineurin phosphatase → blocks dephosphorylation of NFAT → ↓ IL-2 transcription → suppressed T-cell activation and proliferation.",
    receptors:
      "Intracellular binding to FKBP-12 (FK-binding protein). Not a cell-surface receptor. Downstream target: calcineurin phosphatase. Net effect: T-cell suppression via blocked IL-2 expression.",
    uses: [
      "Solid organ transplant rejection prevention (kidney, liver, heart, lung, pancreas, intestine)",
      "GVHD prophylaxis in allogeneic stem cell transplant",
      "Severe refractory atopic dermatitis (topical)",
      "Off-label autoimmune diseases (myasthenia, IBD)",
    ],
    dose:
      "PO: 0.05–0.1 mg/kg/day divided BID (target trough varies by organ: kidney 5–10 ng/mL, liver 5–15, heart/lung 10–15 early). IV: 0.01–0.03 mg/kg/day continuous infusion (5× the PO dose conversion).",
    sideEffects: [
      "NEPHROTOXICITY (afferent arteriole vasoconstriction — dose-dependent)",
      "NEUROTOXICITY: tremor (classic), headache, insomnia; severe: seizures, PRES (posterior reversible encephalopathy syndrome)",
      "NEW-ONSET DIABETES AFTER TRANSPLANT (NODAT) — beta-cell toxicity",
      "Hypertension",
      "HYPERKALEMIA + HYPOMAGNESEMIA + HYPOPHOSPHATEMIA (electrolyte havoc)",
      "QT prolongation",
      "Infection risk (CMV, BK virus, PJP)",
      "Malignancy risk (skin cancers, PTLD)",
      "Alopecia (vs. cyclosporine's hirsutism)",
    ],
    contraindications: [
      "Hypersensitivity to tacrolimus or polyoxyl 60 hydrogenated castor oil (IV formulation)",
      "Pregnancy (Category C — risk vs. benefit)",
      "Concurrent cyclosporine (overlapping nephrotoxicity)",
    ],
    icuPearls: [
      "CYP3A4/5 substrate — MASSIVE drug interactions:",
      "  ↑ levels: azole antifungals (fluconazole, voriconazole), macrolides, diltiazem, grapefruit, protease inhibitors",
      "  ↓ levels: rifampin, phenytoin, carbamazepine, St. John's Wort",
      "Whole-blood trough (12 hr post-dose) is gold standard monitoring",
      "Narrow therapeutic index — keep within target range; toxicity overlaps with rejection (both → renal dysfunction)",
      "Hold or reduce dose for severe nephrotoxicity / neurotoxicity / supratherapeutic levels",
      "PRES presentation: HA, vision changes, seizures, AMS + posterior brain edema on MRI — emergency hold + BP control",
      "Replaces cyclosporine as first-line CNI — fewer side effects, more potent",
    ],
    highYield:
      "Calcineurin inhibitor #1 in modern transplant. Narrow therapeutic window + CYP3A4 + nephrotoxic = pharmacy and ICU are best friends. The 'tacrolimus tremor' is a board classic; PRES is the dangerous version.",
  },
  {
    id: "mycophenolate",
    name: "Mycophenolate Mofetil",
    aliases: ["CellCept", "MMF", "Myfortic (sodium form)"],
    category: "Immunosuppressants",
    mechanism:
      "Prodrug → metabolized to mycophenolic acid (MPA). MPA reversibly inhibits inosine monophosphate dehydrogenase (IMPDH) → blocks de novo purine (guanosine) synthesis. Lymphocytes lack the salvage pathway → selectively suppresses T and B cell proliferation.",
    receptors:
      "Enzyme inhibitor (IMPDH type II — the lymphocyte-specific isoform). Not a true receptor. Mechanism is lineage-selective due to lymphocytes' dependence on de novo purine synthesis.",
    uses: [
      "Solid organ transplant rejection prevention (adjunct to tacrolimus + steroids — 'triple therapy')",
      "Lupus nephritis (induction and maintenance)",
      "Autoimmune: myasthenia gravis, vasculitis, IBD, scleroderma, refractory rheumatologic dz",
      "GVHD treatment / prevention",
    ],
    dose:
      "Transplant: 1–1.5 g PO/IV BID (CellCept). Myfortic equivalent: 720 mg BID. Lupus nephritis: 1–1.5 g PO BID.",
    sideEffects: [
      "GI: DIARRHEA (most common — dose-limiting), N/V, abdominal pain, esophagitis, GI bleeding, perforation (rare)",
      "Hematologic: leukopenia (esp. neutropenia), anemia, thrombocytopenia",
      "Infection: opportunistic — CMV reactivation, BK virus, PJP, HSV, fungal",
      "Increased malignancy risk: skin cancer, lymphoma (PTLD)",
      "TERATOGENIC — major congenital malformations, first-trimester pregnancy loss (REMS program)",
      "Pure red cell aplasia (rare)",
    ],
    contraindications: [
      "PREGNANCY (Category D — REMS program, 2 forms of contraception required)",
      "Breastfeeding",
      "Hypersensitivity to mycophenolate or polysorbate 80 (IV)",
      "Active serious infection (relative)",
    ],
    icuPearls: [
      "Holds in ICU: severe GI symptoms (often resolved with dose reduction or switch to Myfortic), absolute neutropenia < 1.3, active CMV viremia",
      "Antacids (Mg/Al) and PPIs ↓ MMF absorption — separate by 2 hr or switch to Myfortic (enteric-coated, less affected)",
      "Cholestyramine and other bile acid sequestrants ↓ enterohepatic recirculation → ↓ MPA levels",
      "Therapeutic drug monitoring (MPA AUC or trough) used variably — not standard but increasingly common",
      "CMV PCR surveillance is standard in transplant patients on MMF",
      "Switch CellCept ↔ Myfortic when GI side effects are dose-limiting (different release profile)",
    ],
    highYield:
      "GI side effects + leukopenia + teratogenicity — the three things to remember. Selective lymphocyte suppression via the de novo purine pathway = elegant mechanism worth knowing. 'Triple therapy' = tacro + MMF + steroid in most modern transplant regimens.",
  },
];

// Categories for filtering/grouping
window.CATEGORIES = [
  "Vasopressors",
  "Inotropes",
  "Sedation & Induction",
  "Paralytics",
  "Antihypertensives",
  "Immunosuppressants",
];
