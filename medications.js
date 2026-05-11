// ICU Medication Database — receptor-level detail for study
window.MEDICATIONS = [
  // ─────────────────────────── VASOPRESSORS ───────────────────────────
  {
    id: "norepinephrine",
    name: "Norepinephrine",
    aliases: ["Levophed", "NE", "Norepi"],
    category: "Vasopressors",
    mechanism:
      "Norepinephrine activates α1 adrenergic receptors on vascular smooth muscle, triggering a calcium-mediated contractile cascade that produces powerful vasoconstriction and raises systemic vascular resistance to elevate mean arterial pressure. It also stimulates β1 receptors in the heart, modestly increasing contractility through enhanced calcium handling in cardiomyocytes, though the rising blood pressure activates baroreceptors that reflexively dampen any change in heart rate.",
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
      "Vasopressin acts on V1a receptors in vascular smooth muscle, producing a calcium-mediated vasoconstriction that operates entirely outside the adrenergic pathway and remains effective even when catecholamine stores are depleted or receptors are downregulated. It also stimulates V2 receptors in the renal collecting ducts, inserting aquaporin water channels into the apical membrane to drive free water reabsorption and concentrate the urine. Endogenous vasopressin becomes depleted in late septic shock, which is why exogenous replacement restores vascular tone in patients no longer responding well to catecholamines.",
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
      "Epinephrine is a non-selective adrenergic agonist whose effects shift with dose. At lower doses it preferentially activates β1 receptors in the heart and β2 receptors in smooth muscle, increasing contractility and heart rate while causing bronchodilation and vasodilation in skeletal muscle beds. At higher doses, α1 stimulation dominates and produces widespread vasoconstriction, raising systemic vascular resistance and blood pressure; β2-driven muscle glycolysis simultaneously elevates serum lactate, which is metabolic in origin and does not reflect worsening perfusion.",
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
      "Phenylephrine is a pure α1 adrenergic agonist with no meaningful activity at β receptors. It binds α1 receptors on vascular smooth muscle and triggers a calcium-mediated contractile cascade, producing widespread arterial and venous vasoconstriction that raises systemic vascular resistance and mean arterial pressure. Because there is no β1 stimulation, contractility is unchanged and the rising blood pressure triggers a baroreceptor-mediated reflex bradycardia.",
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
      "Dobutamine is a synthetic catecholamine that primarily stimulates β1 receptors in the heart, raising cAMP and protein kinase A activity to increase contractility, stroke volume, and cardiac output with relatively little change in heart rate. Its weaker β2 activity produces mild peripheral vasodilation that often lowers systemic vascular resistance slightly. Prolonged infusion downregulates and uncouples β1 receptors, producing tachyphylaxis within 48 to 72 hours.",
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
      "Milrinone inhibits phosphodiesterase-3, the enzyme that hydrolyzes cAMP in cardiomyocytes and vascular smooth muscle. By raising cAMP downstream of the β-adrenergic receptor, it increases cardiac contractility and improves diastolic relaxation while simultaneously causing systemic and pulmonary vasodilation — the classic 'inodilator' profile. Because the effect bypasses β receptors entirely, milrinone remains effective in patients on chronic β-blockers or with downregulated β1 receptors.",
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
      "Propofol positively modulates the GABA-A receptor at the β subunit, enhancing receptor activity by prolonging chloride channel opening, which increases chloride influx and leads to neuronal hyperpolarization and CNS inhibition, producing sedation, hypnosis, and amnesia. At higher concentrations, it can directly activate GABA-A receptors even in the absence of endogenous GABA, amplifying its depressant effects on neuronal activity.",
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
      "Dexmedetomidine is a highly selective α2 adrenergic agonist, roughly eight times more selective for α2 than clonidine. It acts on presynaptic α2A receptors in the locus coeruleus to reduce norepinephrine release, producing a sedation pattern that closely resembles natural NREM sleep with patients arousable to stimulation. Because it does not act on GABA receptors and does not suppress respiratory drive, patients can be safely extubated while remaining on the infusion.",
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
      "Etomidate potentiates GABA-A receptors at β2 and β3 subunit-containing subtypes, enhancing chloride influx to produce rapid hypnosis with notably stable hemodynamics — minimal direct cardiac depression and preserved baroreceptor reflexes make it the favored induction agent for patients in shock. It also reversibly inhibits 11-β-hydroxylase in the adrenal cortex, suppressing cortisol synthesis for 12 to 24 hours even after a single induction dose, which is the basis for ongoing debate about its use in septic shock.",
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
      "Ketamine is a non-competitive antagonist of the NMDA glutamate receptor that binds inside the open ion channel and blocks excitatory neurotransmission throughout the cortex, thalamus, and limbic system, producing a 'dissociative anesthesia' in which patients are unresponsive while often appearing awake. It also inhibits monoamine reuptake, indirectly raising synaptic norepinephrine to increase heart rate, blood pressure, and bronchodilation in normovolemic patients. In patients with depleted catecholamine stores from prolonged shock, this indirect sympathetic boost fails and ketamine's underlying direct myocardial depressant effect can cause hypotension.",
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
      "Midazolam binds the benzodiazepine site on the GABA-A receptor, an allosteric pocket distinct from the GABA binding site itself. This binding increases the frequency of chloride channel opening when GABA is present, enhancing chloride influx and producing the membrane hyperpolarization that delivers sedation, anxiolysis, anterograde amnesia, and anticonvulsant effects. Its active metabolite 1-hydroxy-midazolam is renally cleared and accumulates in acute kidney injury, prolonging sedation for days after the infusion is stopped.",
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
      "Rocuronium is a non-depolarizing neuromuscular blocker that competes with acetylcholine for binding at the nicotinic receptor on the motor end plate, occupying the receptor without opening its ion channel. Acetylcholine can no longer trigger an end-plate potential, so the muscle fiber cannot generate an action potential and flaccid paralysis develops without the fasciculations seen with succinylcholine. The block is rapidly reversed by sugammadex, a cyclodextrin that encapsulates the rocuronium molecule and pulls it off the receptor.",
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
      "Succinylcholine is structurally two acetylcholine molecules joined end to end and acts as a nicotinic receptor agonist, opening the ion channel and depolarizing the motor end plate. Unlike acetylcholine, it is not broken down by junctional acetylcholinesterase, so it persists at the receptor and keeps the end plate continuously depolarized; nearby sodium channels remain inactivated and the muscle cannot fire again, producing flaccid paralysis after a brief burst of fasciculations. The sustained depolarization releases intracellular potassium, which can become dangerous in patients with upregulated extrajunctional receptors from burns, denervation injury, or prolonged immobilization.",
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
      "Nicardipine is a dihydropyridine calcium channel blocker that binds L-type calcium channels on vascular smooth muscle, blocking transmembrane calcium entry and relaxing arterioles to lower systemic vascular resistance and blood pressure. Its vascular selectivity spares cardiac L-type channels, so contractility and AV nodal conduction remain essentially unaffected at therapeutic doses. The drop in blood pressure activates baroreceptors and produces a reflex tachycardia, which is why nicardipine is paired with a beta-blocker in aortic dissection rather than used alone.",
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
      "Tacrolimus diffuses into T lymphocytes and binds the intracellular protein FKBP-12, forming a complex that inhibits calcineurin, a calcium-dependent phosphatase activated downstream of T-cell receptor engagement. With calcineurin blocked, the transcription factor NFAT cannot be dephosphorylated and cannot enter the nucleus, halting the production of IL-2 and other cytokines that drive T-cell activation and proliferation. Its narrow therapeutic window and CYP3A4 metabolism make trough monitoring and attention to drug interactions central to safe use.",
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
      "Mycophenolate is the prodrug of mycophenolic acid, which inhibits inosine monophosphate dehydrogenase, the rate-limiting enzyme in de novo purine synthesis. Lymphocytes are uniquely dependent on this pathway because they lack the salvage enzymes that other cells use to recycle purines, so blocking it selectively halts B and T cell proliferation while sparing most other tissues. The active drug undergoes enterohepatic recirculation, which extends its effective half-life and explains why antibiotics that disturb gut flora can lower its serum levels.",
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
