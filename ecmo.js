// ============================================================
// ECMO Study — circuit, modes, oxygenator, complications, params
// References: ELSO General Guidelines, ELSO Red Book, current literature
// ============================================================
(() => {
  // ──────────────────────────────────────────────────────────
  // Component data — each circuit element
  // ──────────────────────────────────────────────────────────
  const COMPONENTS = {
    drainage: {
      name: "Drainage Cannula",
      subtitle: "venous return out of the patient",
      whatItDoes:
        "Withdraws deoxygenated blood from the patient's venous system. In femoral approach, the cannula tip sits at the IVC/RA junction; in jugular approach, at the SVC/RA junction. Sized larger than the return cannula because it must deliver enough blood to support full ECMO flow.",
      typicalSpecs: [
        "Adult sizing: 21–25 Fr (femoral), 19–23 Fr (jugular)",
        "Color convention: blue / black tubing",
        "Multi-side-hole tip for high-volume drainage",
      ],
      monitor: [
        "Pre-pump pressure: −20 to −100 mmHg (negative — pump pulling)",
        "Line stability — chattering = inadequate drainage",
        "Visual: dark deoxygenated blood",
      ],
      problems: [
        "Suckdown / chatter — vessel wall occluding cannula",
        "Kinking with patient movement",
        "Cannula migration",
        "Thrombosis at tip",
      ],
    },
    pump: {
      name: "Centrifugal Pump",
      subtitle: "the motor of the circuit",
      whatItDoes:
        "Generates flow by spinning a magnetically levitated impeller. Modern pumps (Rotaflow, CentriMag, Maquet/Getinge) use non-contact bearings to minimize hemolysis. Flow is determined by RPM, preload (drainage volume), and afterload (resistance downstream).",
      typicalSpecs: [
        "Modern centrifugal — replaces older roller pumps",
        "Preload-dependent: needs adequate venous return",
        "Afterload-sensitive: high resistance reduces flow at same RPM",
        "Typical adult RPM: 2500–4500",
      ],
      monitor: [
        "Flow rate (L/min) — target 50–80 mL/kg/min adult",
        "RPM — should produce expected flow",
        "Post-pump pressure: 150–300 mmHg",
        "Power consumption — sudden rise suggests pump thrombosis",
      ],
      problems: [
        "Pump thrombosis (clot in pump head) — hemolysis, ↓ flow",
        "Suckdown when preload drops",
        "Bearing failure (rare with magnetic levitation)",
      ],
    },
    oxygenator: {
      name: "Oxygenator (Membrane Lung)",
      subtitle: "the gas-exchange chamber",
      whatItDoes:
        "Performs gas exchange across a polymethylpentene (PMP) hollow-fiber membrane. Blood flows on the OUTSIDE of the fibers; sweep gas (O₂ ± CO₂ blend) flows on the INSIDE. O₂ diffuses into blood, CO₂ diffuses out — driven by partial pressure gradients. Integrated heat exchanger maintains temperature.",
      typicalSpecs: [
        "PMP hollow-fiber design (e.g., Quadrox, Cardiohelp, Maquet HLS)",
        "Blood outside fibers, gas inside",
        "Integrated heat exchanger (water-based)",
        "Sweep gas (L/min) primarily controls CO₂ removal",
        "FdO₂ (fraction of delivered oxygen) primarily controls O₂",
      ],
      monitor: [
        "Pressure drop (ΔP) across oxygenator: < 50 mmHg normal",
        "Post-oxygenator PaO₂: typically > 200 mmHg with FdO₂ 1.0",
        "Post-oxygenator PaCO₂: titrate sweep to target",
        "Visual: clots, plasma leak (sweating)",
      ],
      problems: [
        "Clot formation → rising ΔP, ↓ gas exchange",
        "Plasma leak (membrane wetting) → ↓ efficiency",
        "Failure → exchange the oxygenator",
      ],
    },
    sweep: {
      name: "Sweep Gas Line",
      subtitle: "the gas supply to the oxygenator",
      whatItDoes:
        "Delivers gas mixture to the inside of the oxygenator fibers. The blender sets FdO₂ (0.21–1.0); a separate flow meter sets sweep gas flow (L/min). Sweep gas L/min is the primary control for CO₂ removal — increase sweep to drop PaCO₂, decrease sweep to raise it. FdO₂ controls oxygenation.",
      typicalSpecs: [
        "Source: oxygen + air blender",
        "Optional carbogen (5% CO₂) for finer pH control",
        "Sweep flow typically 1–10 L/min in adults",
        "FdO₂ typically 1.0 initially, weaned with lung recovery",
      ],
      monitor: [
        "Sweep gas flow (L/min) — matches CO₂ target",
        "FdO₂ — matches oxygenation target",
        "Post-oxygenator gas",
      ],
      problems: [
        "Disconnected sweep → no CO₂ removal → hypercapnia",
        "Forgetting to wean sweep with lung recovery → respiratory alkalosis",
      ],
    },
    heat: {
      name: "Heat Exchanger",
      subtitle: "temperature regulation",
      whatItDoes:
        "Integrated into the oxygenator. Uses a water-based heat-exchange system to maintain normothermia despite blood circulating through external tubing (which would otherwise cool). Can also induce therapeutic hypothermia if needed.",
      typicalSpecs: [
        "Set water temperature 36–37°C for normothermia",
        "Reusable heater-cooler unit (HCU)",
      ],
      monitor: [
        "Patient core temperature",
        "Water unit temperature setting",
      ],
      problems: [
        "Heater-cooler unit infections (rare — Mycobacterium chimaera outbreaks historically)",
        "Inadequate warming → hypothermia",
      ],
    },
    return: {
      name: "Return Cannula",
      subtitle: "oxygenated blood back to the patient",
      whatItDoes:
        "Returns gas-exchanged blood from the oxygenator back to the patient. In VV-ECMO, returns to the venous system (typically IVC, SVC, or RA). In VA-ECMO, returns to the arterial system (femoral artery, axillary, or aorta). VA return cannula is smaller because pressurized arterial flow needs a stiffer, shorter tubing path.",
      typicalSpecs: [
        "VV return: 19–23 Fr (venous)",
        "VA return: 15–21 Fr (arterial — smaller)",
        "Color convention: red tubing",
      ],
      monitor: [
        "Post-oxygenator / pre-patient pressure",
        "Cannulation site for bleeding, hematoma",
        "Distal perfusion (VA femoral — limb ischemia risk)",
      ],
      problems: [
        "Limb ischemia (VA femoral — needs distal perfusion cannula)",
        "Recirculation (VV — when too close to drainage)",
        "Cannula migration / dislodgement (catastrophic)",
        "Arterial dissection (VA)",
      ],
    },
    bridge: {
      name: "Bridge",
      subtitle: "weaning trial loop",
      whatItDoes:
        "A short tubing connection between the drainage and return lines, normally clamped. Used during weaning trials: the bridge is opened and the cannulas are clamped, allowing the circuit to continue circulating through itself while the patient is briefly off ECMO. Prevents stasis and clotting in the circuit during the trial.",
      typicalSpecs: [
        "Clamped during normal operation",
        "Opened only during weaning trial-offs",
      ],
      monitor: [
        "Clamp integrity",
        "Recirculation when bridge open (intentional during trial)",
      ],
      problems: [
        "Inadvertently open during normal flow → complete recirculation, patient gets no support",
      ],
    },
    sensors: {
      name: "Pressure Sensors",
      subtitle: "the early warning system",
      whatItDoes:
        "Multiple pressure transducers monitor circuit health. Pre-pump (drainage line) should be negative — pump is pulling. Post-pump / pre-oxygenator is the highest pressure point. Post-oxygenator should be slightly lower than pre-oxygenator. The pressure drop across the oxygenator (ΔP) is the most important indicator of oxygenator clot burden.",
      typicalSpecs: [
        "Pre-pump (drainage): −20 to −100 mmHg",
        "Post-pump (pre-oxygenator): 150–300 mmHg",
        "Post-oxygenator (pre-patient): slightly less than post-pump",
        "ΔP across oxygenator: < 50 mmHg normal",
      ],
      monitor: [
        "Trend over time, not just absolute values",
        "ΔP rising → oxygenator clot forming",
        "Pre-pump becoming more negative → poor drainage / suckdown",
      ],
      problems: [
        "Sensor drift or calibration errors",
        "Trapped air bubbles giving false readings",
      ],
    },
  };

  // ──────────────────────────────────────────────────────────
  // Complications data
  // ──────────────────────────────────────────────────────────
  const COMPLICATIONS = [
    {
      id: "recirculation",
      name: "Recirculation",
      mode: "VV only",
      icon: "🔁",
      definition:
        "Oxygenated blood from the return cannula is drawn directly back into the drainage cannula without reaching the systemic circulation. The patient stays hypoxic despite the ECMO circuit running well.",
      pathophys:
        "When drainage and return cannulas are too close together (or pointed at each other), a fraction of just-oxygenated blood gets immediately re-aspirated rather than flowing to the patient. The recirculation fraction can reach 30–50% with poor positioning.",
      signs: [
        "Pre-oxygenator (drainage) SvO₂ paradoxically HIGH (close to post-oxy SaO₂)",
        "Patient SpO₂ stays low despite full ECMO flow",
        "Bright red drainage blood (should be dark venous)",
        "Narrow pre-/post-oxygenator gas gradient",
      ],
      causes: [
        "Cannula tips too close (especially femoral-femoral configuration)",
        "Cannula malposition",
        "Excessive flow rate for the cannula geometry",
        "Low native cardiac output (less native blood through the heart)",
      ],
      management: [
        "Reposition cannula under imaging (TEE / fluoro)",
        "Reduce ECMO flow rate (paradoxically increases delivered O₂)",
        "Consider Avalon dual-lumen cannula — designed to direct return at tricuspid valve",
        "Optimize patient volume + cardiac output to push more native blood through",
      ],
    },
    {
      id: "harlequin",
      name: "Harlequin / North-South Syndrome",
      mode: "VA peripheral only",
      icon: "🎭",
      definition:
        "In peripheral VA-ECMO (femoral), retrograde oxygenated ECMO flow meets antegrade native cardiac output somewhere in the aorta. If the native lungs are diseased, the upper body gets perfused with poorly oxygenated native blood while the lower body gets the well-oxygenated ECMO blood. Visible as a 'pink legs, blue head' pattern.",
      pathophys:
        "The collision point (watershed) depends on the balance between native CO and ECMO flow. As cardiac function recovers, the watershed migrates distally — meaning the brain and heart may be perfused with the worst gas exchange the lungs can offer, while the legs get the best.",
      signs: [
        "Cyanotic upper body, pink lower body",
        "Right radial arterial blood gas: HYPOXIC",
        "Femoral arterial blood gas: well oxygenated",
        "Pulse oximetry on right hand << left foot",
        "Cerebral oximetry (NIRS) low",
      ],
      causes: [
        "Diseased native lungs + recovering native cardiac function",
        "Watershed migrating proximally as cardiac function returns",
      ],
      management: [
        "Sample right radial gas to detect (not femoral — would miss it)",
        "Hybrid V-AV configuration (add upper body venous return cannula)",
        "Switch to central VA cannulation (return to ascending aorta)",
        "Optimize ventilator settings to improve native lung function",
        "Transition to VV-ECMO if cardiac function adequate",
      ],
    },
    {
      id: "lvdistension",
      name: "LV Distension",
      mode: "VA only",
      icon: "💔",
      definition:
        "In VA-ECMO, retrograde aortic flow increases LV afterload. If the LV cannot eject against this resistance, blood continues to enter the LV from bronchial/Thebesian veins and any pulmonary venous return — stretching the chamber and increasing wall stress. Can cause pulmonary edema and LV thrombosis.",
      pathophys:
        "ECMO supports systemic circulation but doesn't unload the LV. Continued venous return + minimal forward flow → LV stretches → ↑ LV end-diastolic pressure → ↑ PA pressure → pulmonary edema. The aortic valve may stop opening entirely.",
      signs: [
        "Rising pulmonary artery pressures",
        "Pulmonary edema on imaging despite ECMO support",
        "Loss of arterial line pulsatility (flat line)",
        "Aortic valve fails to open on TTE / TEE",
        "LV thrombosis on imaging",
      ],
      causes: [
        "Severely impaired LV function on VA-ECMO",
        "High ECMO flow rates (high afterload)",
        "Excessive afterload from peripheral vasoconstriction",
      ],
      management: [
        "LV venting — Impella, IABP, surgical apical vent, or atrial septostomy",
        "Reduce ECMO flow to minimum that maintains organ perfusion",
        "Inotropes to encourage LV ejection (cautious — may worsen if not vented)",
        "Diurese aggressively if volume overloaded",
        "Daily echo to monitor aortic valve opening",
      ],
    },
    {
      id: "hemolysis",
      name: "Hemolysis",
      mode: "VV & VA",
      icon: "🩸",
      definition:
        "Mechanical destruction of red blood cells from shear stress in the circuit. Pump thrombosis, cannula suckdown, and clots increase shear and accelerate hemolysis. Free hemoglobin causes AKI from heme-pigment nephropathy.",
      pathophys:
        "Centrifugal pumps generate high shear forces. Normally tolerated, but clot formation, suckdown, or high RPM dramatically increase RBC destruction. Released free Hb depletes haptoglobin, then spills into urine and damages tubules.",
      signs: [
        "Pink or red urine (free hemoglobin)",
        "Plasma-free Hb rising (> 50 mg/dL concerning, > 100 mg/dL severe)",
        "LDH rising (>500 suggestive, often into thousands)",
        "Haptoglobin falling toward zero",
        "Hemoglobin falling without overt bleeding source",
        "Rising creatinine from heme-pigment AKI",
      ],
      causes: [
        "Pump head thrombosis",
        "Cannula chatter / suckdown",
        "Excessive negative inlet pressure",
        "Oxygenator clot",
        "High pump RPM with poor flow",
      ],
      management: [
        "Find and fix the source — image the circuit, check pump",
        "Replace pump head or full circuit if clot identified",
        "Transfuse RBCs as needed",
        "Bicarbonate to alkalinize urine, gentle hydration to support kidneys",
        "Renal replacement therapy if AKI severe",
      ],
    },
    {
      id: "suckdown",
      name: "Cannula Suckdown / Chatter",
      mode: "VV & VA",
      icon: "🎢",
      definition:
        "The drainage cannula intermittently contacts the vessel wall or atrial wall, transiently occluding flow. The line visibly shakes ('chatter') and pressures swing wildly. Common in hypovolemic patients or when flow demand exceeds drainage capacity.",
      pathophys:
        "When the pump pulls harder than the vessel can deliver, the cannula tip collapses the vessel wall against itself. Flow stops, the wall relaxes, flow resumes, and the cycle repeats — visible as line chatter and pressure oscillation.",
      signs: [
        "Drainage line shaking visibly ('chatter')",
        "Sudden swings in pre-pump pressure (more negative)",
        "Intermittent drops in flow at constant RPM",
        "Alarm trends — flow inconsistent",
      ],
      causes: [
        "Hypovolemia (most common)",
        "Cannula tip too close to vessel wall",
        "Pneumothorax / tamponade ↓ venous return",
        "Patient movement / positioning",
        "Excessive flow rate for the patient size",
      ],
      management: [
        "Volume bolus — first-line",
        "Reduce pump RPM / flow rate temporarily",
        "Reposition patient",
        "Image cannula position; adjust if needed",
        "Identify and treat underlying cause of low preload",
      ],
    },
    {
      id: "oxyfailure",
      name: "Oxygenator Failure",
      mode: "VV & VA",
      icon: "💨",
      definition:
        "Progressive loss of gas exchange efficiency from clot deposition or plasma leak across the membrane. Pressure drop (ΔP) across the oxygenator rises as fibers occlude. Eventually requires oxygenator exchange.",
      pathophys:
        "Fibrin and platelets deposit on the membrane over time. As fibers clog, blood is forced through fewer channels — pressure drop increases and gas-exchange surface decreases. Plasma can also wet the membrane, reducing the effective diffusion barrier ('plasma leak').",
      signs: [
        "ΔP across oxygenator rising (> 50 mmHg concerning, > 80 severe)",
        "Post-oxygenator PaO₂ falling at constant FdO₂",
        "Post-oxygenator PaCO₂ rising at constant sweep",
        "Visible clots within the oxygenator",
        "Plasma leak / 'sweating' on the membrane surface",
      ],
      causes: [
        "Subtherapeutic anticoagulation",
        "Inflammatory states (sepsis, post-bypass)",
        "Membrane wear over time (typical lifespan days to weeks)",
        "Heparin-induced thrombocytopenia (HIT)",
      ],
      management: [
        "Optimize anticoagulation",
        "Plan elective oxygenator exchange before failure",
        "Emergency exchange if abrupt failure",
        "Switch anticoagulant if HIT (bivalirudin, argatroban)",
      ],
    },
    {
      id: "limbischemia",
      name: "Limb Ischemia",
      mode: "VA femoral",
      icon: "🦵",
      definition:
        "The large arterial cannula in the femoral artery occludes most or all of the distal flow to the ipsilateral leg. Without intervention, the limb becomes ischemic within hours.",
      pathophys:
        "Arterial cannulas can be > 50% of the femoral artery diameter. Without a bypass route, the entire distal limb is perfused by collaterals alone — usually inadequate.",
      signs: [
        "Cool, pale, mottled distal limb",
        "Diminished or absent distal pulses (dorsalis pedis, posterior tibial)",
        "Falling distal NIRS / SpO₂",
        "Decreased motor / sensory function",
        "Compartment syndrome (severe — tense compartments, pain on stretch)",
      ],
      causes: [
        "Femoral arterial cannulation without distal perfusion",
        "Large cannula relative to vessel size",
        "Peripheral vascular disease",
      ],
      management: [
        "Place distal perfusion cannula (DPC) — small catheter into SFA distal to ECMO cannula, T'd off the return line",
        "Serial pulse / NIRS / compartment checks",
        "Fasciotomy if compartment syndrome develops",
        "Vascular surgery consultation",
      ],
    },
    {
      id: "bleeding",
      name: "Bleeding",
      mode: "VV & VA",
      icon: "🩹",
      definition:
        "The most common ECMO complication. Continuous anticoagulation combined with consumption of platelets and clotting factors by the circuit creates a hemorrhagic diathesis. Sites range from cannulation site to surgical wounds to GI to intracranial.",
      pathophys:
        "Heparin (or alternative anticoagulant) prevents circuit thrombosis but reduces native clotting. Platelets are activated and consumed by the artificial surfaces. Acquired von Willebrand syndrome develops from shear-related vWF cleavage. The result is multi-mechanism bleeding tendency.",
      signs: [
        "Bleeding at cannulation site, surgical wounds, ETT, GI, urinary, IV sites",
        "Falling hemoglobin",
        "Falling platelets",
        "Acutely altered mental status → consider intracranial bleed",
        "Hypotension with hidden source",
      ],
      causes: [
        "Therapeutic anticoagulation",
        "Acquired von Willebrand syndrome",
        "Thrombocytopenia (consumption + dilution)",
        "DIC in setting of infection / inflammation",
      ],
      management: [
        "Target lowest effective anticoagulation (ACT 160–180 if bleeding)",
        "Local pressure, surgical hemostasis at site",
        "Transfuse RBCs / platelets / FFP per institution",
        "Cryoprecipitate if low fibrinogen",
        "Antifibrinolytics (TXA, aminocaproic acid) considered in select cases",
        "Imaging for occult bleeding (head CT for AMS)",
      ],
    },
  ];

  // ──────────────────────────────────────────────────────────
  // Mode comparison (VV vs VA)
  // ──────────────────────────────────────────────────────────
  const MODES = {
    vv: {
      name: "VV-ECMO",
      purpose: "Respiratory support — lung failure with adequate cardiac function",
      cannulation: [
        "Femoral-femoral: drainage from IVC, return to RA (or vice versa)",
        "Femoral-jugular: drainage from IVC, return to SVC",
        "Avalon dual-lumen RIJ: single cannula drains SVC + IVC, returns to RA directed at tricuspid valve",
      ],
      indications: [
        "Severe ARDS refractory to optimal vent (PaO₂/FiO₂ < 80 on optimized settings)",
        "Murray score ≥ 3 or pH < 7.20 from refractory hypercapnia",
        "Bridge to lung transplant",
        "Status asthmaticus refractory to standard therapy",
        "Primary graft dysfunction post lung transplant",
      ],
      hemodynamics: "No direct hemodynamic support — relies on patient's own cardiac output for circulation. Patient must have adequate native cardiac function.",
      uniqueIssues: [
        "Recirculation (cannula position-dependent)",
        "Difficulty oxygenating if very high cardiac output dilutes ECMO contribution",
      ],
      vsAlternative: "Use VV when lungs fail and heart works. Switch to VA only if cardiac function deteriorates significantly.",
    },
    va: {
      name: "VA-ECMO",
      purpose: "Cardiopulmonary support — cardiac failure (with or without lung failure)",
      cannulation: [
        "Femoral-femoral: drainage femoral vein, return femoral artery (retrograde aortic flow)",
        "Central: drainage RA, return ascending aorta (open chest, post-cardiotomy)",
        "Axillary-femoral: drainage femoral vein, return axillary artery (antegrade, fewer Harlequin issues)",
      ],
      indications: [
        "Cardiogenic shock refractory to inotropes and pressors",
        "Cardiac arrest (ECPR — extracorporeal CPR)",
        "Post-cardiotomy failure to wean from bypass",
        "Acute myocardial infarction with cardiogenic shock",
        "Fulminant myocarditis",
        "Massive pulmonary embolism with hemodynamic collapse",
        "Bridge to LVAD or heart transplant",
      ],
      hemodynamics: "Direct hemodynamic support — pumps oxygenated blood into the arterial system, bypassing the heart. Both supports failing heart and oxygenates blood.",
      uniqueIssues: [
        "LV distension (afterload increases without ejection)",
        "Harlequin / North-South syndrome (peripheral femoral approach)",
        "Limb ischemia (femoral arterial cannulation)",
        "Loss of arterial pulsatility",
        "Aortic dissection (rare but catastrophic)",
      ],
      vsAlternative: "Use VA when the heart needs help. Adds significant risks vs VV — only use when cardiac function is genuinely inadequate.",
    },
  };

  // ──────────────────────────────────────────────────────────
  // Parameter reference
  // ──────────────────────────────────────────────────────────
  const PARAMS = [
    {
      group: "Flow & Pressures",
      items: [
        ["ECMO flow target", "50–80 mL/kg/min (adult) — ~4–6 L/min typical"],
        ["Pump RPM", "2500–4500 (varies by pump, flow, afterload)"],
        ["Pre-pump (drainage) pressure", "−20 to −100 mmHg — negative is normal"],
        ["Post-pump pressure", "150–300 mmHg"],
        ["Oxygenator ΔP (pre−post)", "< 50 mmHg normal; > 60 watch; > 80 plan exchange"],
        ["Patient MAP target", "≥ 65 mmHg (individualized)"],
      ],
    },
    {
      group: "Gas Exchange",
      items: [
        ["FdO₂ (sweep gas O₂ fraction)", "0.21–1.0 — controls oxygenation"],
        ["Sweep gas flow", "1–10 L/min — controls CO₂ removal (primarily)"],
        ["Post-oxygenator PaO₂ (FdO₂ 1.0)", "> 200 mmHg with healthy oxygenator"],
        ["PaCO₂ target", "35–45 mmHg (adjust sweep)"],
        ["Goal: reduce sweep first when CO₂ low; FdO₂ first when O₂ adequate", ""],
      ],
    },
    {
      group: "Anticoagulation",
      items: [
        ["Heparin — ACT target", "180–220 sec (institution-dependent)"],
        ["Heparin — anti-Xa target", "0.3–0.7 IU/mL"],
        ["aPTT target (where used)", "1.5–2.5× normal"],
        ["Bivalirudin (HIT or heparin resistance)", "ACT 180–220"],
        ["Bleeding patient", "Lower targets (ACT 160–180) acceptable"],
      ],
    },
    {
      group: "Daily Labs",
      items: [
        ["CBC", "Hgb, platelets (transfusion thresholds vary)"],
        ["Fibrinogen", "> 150 mg/dL — repleter with cryo if low"],
        ["Antithrombin III", "> 50% — heparin resistance if low"],
        ["LDH", "Hemolysis marker — trend, not single value"],
        ["Plasma-free hemoglobin", "< 50 mg/dL normal — rising = hemolysis"],
        ["Haptoglobin", "Falls with hemolysis"],
        ["d-dimer, fibrinogen", "DIC / consumption screen"],
        ["Mixed venous saturation", "65–75% adequate"],
      ],
    },
  ];

  // ──────────────────────────────────────────────────────────
  // SVG Diagrams
  // ──────────────────────────────────────────────────────────
  function circuitSVG() {
    // Layout: patient on far left. Drainage (blue) runs along the BOTTOM track at y=295.
    // Return (red) runs along the TOP track at y=183. No crossings, clean text bands between lines.
    return `
      <svg viewBox="0 0 880 460" class="ecmo-svg" id="ecmo-circuit-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="arrowRed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444"/>
          </marker>
          <marker id="arrowBlue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6"/>
          </marker>
          <marker id="arrowLav" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#a78bfa"/>
          </marker>
          <marker id="arrowGreen" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e"/>
          </marker>
        </defs>

        <!-- Title -->
        <text x="440" y="26" text-anchor="middle" font-family="Quicksand" font-size="16" font-weight="700" fill="#831843">ECMO Circuit — schematic (flow follows arrows)</text>

        <!-- ────────── PATIENT ────────── -->
        <ellipse cx="80" cy="240" rx="42" ry="125" fill="#fce7f3" stroke="#ec4899" stroke-width="2.5"/>
        <text x="80" y="155" text-anchor="middle" font-family="Quicksand" font-size="13" font-weight="700" fill="#831843">Patient</text>
        <circle cx="80" cy="240" r="4" fill="#831843"/>
        <text x="80" y="228" text-anchor="middle" font-family="Quicksand" font-size="9" font-style="italic" fill="#831843">heart</text>
        <!-- venous (drainage) site -->
        <circle cx="120" cy="295" r="5" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
        <!-- return site -->
        <circle cx="120" cy="183" r="5" fill="#ef4444" stroke="#991b1b" stroke-width="2"/>

        <!-- ────────── DRAINAGE LINE (blue, bottom track) ────────── -->
        <g class="ecmo-part" data-component="drainage">
          <path d="M 125 295 L 262 295" stroke="#3b82f6" stroke-width="10" stroke-linecap="round" fill="none" marker-end="url(#arrowBlue)"/>
          <text x="172" y="282" text-anchor="middle" font-family="Quicksand" font-size="12" font-weight="700" fill="#1e40af">drainage cannula</text>
        </g>

        <!-- Pre-pump pressure sensor -->
        <g class="ecmo-part" data-component="sensors">
          <circle cx="278" cy="295" r="11" fill="#fff" stroke="#9333ea" stroke-width="2"/>
          <text x="278" y="299" text-anchor="middle" font-family="Quicksand" font-size="11" font-weight="700" fill="#9333ea">P</text>
        </g>
        <line x1="289" y1="295" x2="304" y2="295" stroke="#3b82f6" stroke-width="10" stroke-linecap="round"/>

        <!-- ────────── PUMP ────────── -->
        <g class="ecmo-part" data-component="pump">
          <circle cx="340" cy="295" r="36" fill="#fff" stroke="#9333ea" stroke-width="3"/>
          <ellipse cx="340" cy="295" rx="22" ry="7" fill="#c084fc" opacity="0.55"/>
          <ellipse cx="340" cy="295" rx="7" ry="22" fill="#c084fc" opacity="0.55"/>
          <circle cx="340" cy="295" r="4" fill="#7e22ce"/>
          <text x="340" y="350" text-anchor="middle" font-family="Quicksand" font-size="13" font-weight="700" fill="#7e22ce">pump</text>
        </g>

        <!-- Post-pump tubing (lavender — about to be oxygenated) -->
        <path d="M 376 295 L 446 295" stroke="#a78bfa" stroke-width="10" stroke-linecap="round" fill="none" marker-end="url(#arrowLav)"/>

        <!-- Pre-oxygenator pressure sensor -->
        <g class="ecmo-part" data-component="sensors">
          <circle cx="460" cy="295" r="11" fill="#fff" stroke="#9333ea" stroke-width="2"/>
          <text x="460" y="299" text-anchor="middle" font-family="Quicksand" font-size="11" font-weight="700" fill="#9333ea">P</text>
        </g>
        <line x1="471" y1="295" x2="495" y2="295" stroke="#a78bfa" stroke-width="10" stroke-linecap="round"/>

        <!-- ────────── OXYGENATOR ────────── -->
        <g class="ecmo-part" data-component="oxygenator">
          <rect x="495" y="235" width="210" height="120" fill="#fff" stroke="#9333ea" stroke-width="3" rx="8"/>
          <g stroke="#cbd5e1" stroke-width="1.4">
            <line x1="510" y1="252" x2="510" y2="334"/>
            <line x1="525" y1="252" x2="525" y2="334"/>
            <line x1="540" y1="252" x2="540" y2="334"/>
            <line x1="555" y1="252" x2="555" y2="334"/>
            <line x1="570" y1="252" x2="570" y2="334"/>
            <line x1="585" y1="252" x2="585" y2="334"/>
            <line x1="600" y1="252" x2="600" y2="334"/>
            <line x1="615" y1="252" x2="615" y2="334"/>
            <line x1="630" y1="252" x2="630" y2="334"/>
            <line x1="645" y1="252" x2="645" y2="334"/>
            <line x1="660" y1="252" x2="660" y2="334"/>
            <line x1="675" y1="252" x2="675" y2="334"/>
            <line x1="690" y1="252" x2="690" y2="334"/>
          </g>
          <text x="600" y="378" text-anchor="middle" font-family="Quicksand" font-size="13" font-weight="700" fill="#7e22ce">oxygenator</text>
          <text x="600" y="393" text-anchor="middle" font-family="Quicksand" font-size="10" fill="#9ca3af">PMP hollow-fiber membrane</text>
        </g>

        <!-- Heat exchanger band (integrated, top of oxygenator) -->
        <g class="ecmo-part" data-component="heat">
          <rect x="497" y="237" width="206" height="13" fill="#fee2e2" stroke="#ef4444" stroke-width="1.2" rx="3"/>
          <text x="600" y="247" text-anchor="middle" font-family="Quicksand" font-size="10" font-weight="700" fill="#dc2626">heat exchanger</text>
        </g>

        <!-- Sweep gas IN (short stub on top-left of oxygenator) -->
        <g class="ecmo-part" data-component="sweep">
          <path d="M 540 200 L 540 225" stroke="#22c55e" stroke-width="6" stroke-linecap="round" fill="none" marker-end="url(#arrowGreen)"/>
          <text x="540" y="172" text-anchor="middle" font-family="Quicksand" font-size="11" font-weight="700" fill="#15803d">sweep gas</text>
          <text x="540" y="158" text-anchor="middle" font-family="Quicksand" font-size="9" fill="#15803d">FdO₂ + flow</text>
        </g>

        <!-- Sweep gas OUT (short dashed stub on top-right) -->
        <path d="M 660 225 L 660 200" stroke="#86efac" stroke-width="5" stroke-linecap="round" stroke-dasharray="4 3" fill="none"/>
        <text x="660" y="172" text-anchor="middle" font-family="Quicksand" font-size="10" font-weight="700" fill="#15803d">gas out</text>

        <!-- Short post-oxy tubing to P sensor (red) -->
        <line x1="705" y1="295" x2="711" y2="295" stroke="#ef4444" stroke-width="10" stroke-linecap="round"/>

        <!-- Post-oxygenator pressure sensor -->
        <g class="ecmo-part" data-component="sensors">
          <circle cx="722" cy="295" r="11" fill="#fff" stroke="#9333ea" stroke-width="2"/>
          <text x="722" y="299" text-anchor="middle" font-family="Quicksand" font-size="11" font-weight="700" fill="#9333ea">P</text>
        </g>

        <!-- ────────── RETURN LINE (red, top track back to patient) ────────── -->
        <g class="ecmo-part" data-component="return">
          <path d="M 733 295 L 790 295 L 790 183 L 125 183"
                stroke="#ef4444" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"
                fill="none" marker-end="url(#arrowRed)"/>
          <text x="320" y="172" text-anchor="middle" font-family="Quicksand" font-size="12" font-weight="700" fill="#991b1b">return cannula</text>
        </g>

        <!-- ────────── BRIDGE (clamped, between drainage and return) ────────── -->
        <g class="ecmo-part" data-component="bridge">
          <line x1="235" y1="195" x2="235" y2="287" stroke="#9ca3af" stroke-width="3" stroke-dasharray="4 3"/>
          <rect x="227" y="234" width="16" height="11" fill="#374151"/>
          <text x="250" y="237" font-family="Quicksand" font-size="9" font-weight="700" fill="#4b5563">bridge</text>
          <text x="250" y="249" font-family="Quicksand" font-size="8" font-style="italic" fill="#6b7280">(clamped)</text>
        </g>

        <!-- ────────── LEGEND ────────── -->
        <g transform="translate(50, 422)">
          <rect x="0" y="0" width="20" height="6" fill="#3b82f6"/>
          <text x="26" y="6" font-family="Quicksand" font-size="11" fill="#1e40af">deoxygenated</text>
          <rect x="116" y="0" width="20" height="6" fill="#ef4444"/>
          <text x="142" y="6" font-family="Quicksand" font-size="11" fill="#991b1b">oxygenated</text>
          <rect x="232" y="0" width="20" height="6" fill="#22c55e"/>
          <text x="258" y="6" font-family="Quicksand" font-size="11" fill="#15803d">sweep gas</text>
          <circle cx="350" cy="3" r="7" fill="#fff" stroke="#9333ea" stroke-width="1.5"/>
          <text x="350" y="6" text-anchor="middle" font-family="Quicksand" font-size="9" font-weight="700" fill="#9333ea">P</text>
          <text x="361" y="6" font-family="Quicksand" font-size="11" fill="#7e22ce">pressure sensor</text>
          <line x1="475" y1="3" x2="497" y2="3" stroke="#9ca3af" stroke-width="3" stroke-dasharray="4 3"/>
          <text x="503" y="6" font-family="Quicksand" font-size="11" fill="#6b7280">bridge</text>
        </g>
      </svg>
    `;
  }

  function torsoOutline() {
    // Reusable torso outline (head + chest + abdomen + thighs) for VV/VA diagrams
    return `
      <!-- Head -->
      <ellipse cx="190" cy="48" rx="22" ry="22" fill="#fde2ec" stroke="#ec4899" stroke-width="2"/>
      <!-- Neck -->
      <rect x="175" y="68" width="30" height="14" fill="#fde2ec" stroke="#ec4899" stroke-width="2"/>
      <!-- Torso -->
      <path d="M 105 84 Q 95 84 95 100 L 95 290 Q 95 310 105 318 L 145 350 L 145 405 Q 145 415 155 415 L 175 415 Q 185 415 185 405 L 185 360 L 195 360 L 195 405 Q 195 415 205 415 L 225 415 Q 235 415 235 405 L 235 350 L 275 318 Q 285 310 285 290 L 285 100 Q 285 84 275 84 Z"
            fill="#fce7f3" stroke="#ec4899" stroke-width="2.5"/>
    `;
  }

  function vvSVG() {
    return `
      <svg viewBox="0 0 420 470" class="ecmo-svg vva-svg" preserveAspectRatio="xMidYMid meet">
        <text x="210" y="22" text-anchor="middle" font-family="Quicksand" font-size="15" font-weight="700" fill="#831843">VV-ECMO</text>
        <text x="210" y="38" text-anchor="middle" font-family="Quicksand" font-size="10" fill="#9d174d">femoral drainage · RIJ return (most common modern config)</text>

        ${torsoOutline()}

        <!-- IVC (lower vessel) -->
        <rect x="183" y="200" width="14" height="180" fill="#dbeafe" stroke="#93c5fd" stroke-width="1" opacity="0.75"/>
        <text x="207" y="290" font-family="Quicksand" font-size="9" font-style="italic" fill="#1e40af">IVC</text>

        <!-- SVC (upper vessel) -->
        <rect x="183" y="84" width="14" height="100" fill="#dbeafe" stroke="#93c5fd" stroke-width="1" opacity="0.75"/>
        <text x="207" y="130" font-family="Quicksand" font-size="9" font-style="italic" fill="#1e40af">SVC</text>

        <!-- Heart silhouette -->
        <ellipse cx="190" cy="195" rx="32" ry="22" fill="#fee2e2" stroke="#991b1b" stroke-width="1.5"/>
        <text x="190" y="198" text-anchor="middle" font-family="Quicksand" font-size="9" font-weight="700" fill="#831843">RA</text>

        <!-- DRAINAGE cannula: femoral vein → IVC, tip near RA -->
        <path d="M 215 415 Q 215 400 200 388 L 195 350 L 192 305 L 190 218"
              stroke="#3b82f6" stroke-width="6" fill="none" stroke-linecap="round"/>
        <circle cx="190" cy="218" r="4" fill="#3b82f6" stroke="#1e40af" stroke-width="1.5"/>

        <!-- DRAINAGE tubing outside body to ECMO -->
        <path d="M 215 415 Q 280 415 305 380 L 320 325"
              stroke="#3b82f6" stroke-width="6" fill="none" stroke-linecap="round"/>

        <!-- RETURN cannula: RIJ → SVC, tip in RA -->
        <path d="M 205 68 L 200 100 L 195 145 L 192 178"
              stroke="#ef4444" stroke-width="6" fill="none" stroke-linecap="round"/>
        <circle cx="192" cy="178" r="4" fill="#ef4444" stroke="#991b1b" stroke-width="1.5"/>

        <!-- RETURN tubing outside body to ECMO -->
        <path d="M 205 68 Q 280 68 305 130 L 320 235"
              stroke="#ef4444" stroke-width="6" fill="none" stroke-linecap="round"/>

        <!-- ECMO module -->
        <rect x="310" y="235" width="100" height="92" rx="10" fill="#fff" stroke="#9333ea" stroke-width="2.5"/>
        <text x="360" y="268" text-anchor="middle" font-family="Quicksand" font-size="12" font-weight="700" fill="#7e22ce">ECMO</text>
        <text x="360" y="285" text-anchor="middle" font-family="Quicksand" font-size="9" fill="#7e22ce">pump +</text>
        <text x="360" y="297" text-anchor="middle" font-family="Quicksand" font-size="9" fill="#7e22ce">oxygenator</text>

        <!-- Cannula labels -->
        <text x="225" y="438" font-family="Quicksand" font-size="11" font-weight="700" fill="#1e40af">drainage</text>
        <text x="225" y="451" font-family="Quicksand" font-size="9" fill="#1e40af">femoral vein</text>
        <text x="220" y="62" font-family="Quicksand" font-size="11" font-weight="700" fill="#991b1b">return</text>
        <text x="220" y="74" font-family="Quicksand" font-size="9" fill="#991b1b">RIJ → SVC/RA</text>

        <!-- Lungs bypassed indicator -->
        <text x="60" y="462" font-family="Caveat" font-size="14" fill="#9d174d">venous → ECMO → venous · lungs bypassed ✿</text>
      </svg>
    `;
  }

  function vaSVG() {
    return `
      <svg viewBox="0 0 420 470" class="ecmo-svg vva-svg" preserveAspectRatio="xMidYMid meet">
        <text x="210" y="22" text-anchor="middle" font-family="Quicksand" font-size="15" font-weight="700" fill="#831843">VA-ECMO (peripheral)</text>
        <text x="210" y="38" text-anchor="middle" font-family="Quicksand" font-size="10" fill="#9d174d">femoral vein drainage · femoral artery return (retrograde aorta)</text>

        ${torsoOutline()}

        <!-- IVC (right side of midline) -->
        <rect x="187" y="200" width="14" height="180" fill="#dbeafe" stroke="#93c5fd" stroke-width="1" opacity="0.75"/>
        <text x="210" y="290" font-family="Quicksand" font-size="9" font-style="italic" fill="#1e40af">IVC</text>

        <!-- Descending aorta (left side of midline) -->
        <rect x="166" y="200" width="11" height="180" fill="#fecaca" stroke="#fca5a5" stroke-width="1" opacity="0.8"/>
        <text x="140" y="290" text-anchor="end" font-family="Quicksand" font-size="9" font-style="italic" fill="#dc2626">aorta</text>

        <!-- Heart -->
        <ellipse cx="190" cy="195" rx="32" ry="22" fill="#fee2e2" stroke="#991b1b" stroke-width="1.5"/>
        <text x="190" y="198" text-anchor="middle" font-family="Quicksand" font-size="9" font-weight="700" fill="#831843">heart</text>

        <!-- DRAINAGE cannula: femoral vein → IVC, tip near RA -->
        <path d="M 215 415 Q 215 400 205 388 L 198 350 L 195 305 L 194 218"
              stroke="#3b82f6" stroke-width="6" fill="none" stroke-linecap="round"/>
        <circle cx="194" cy="218" r="4" fill="#3b82f6" stroke="#1e40af" stroke-width="1.5"/>

        <!-- DRAINAGE tubing to ECMO -->
        <path d="M 215 415 Q 280 415 305 380 L 320 325"
              stroke="#3b82f6" stroke-width="6" fill="none" stroke-linecap="round"/>

        <!-- RETURN cannula: femoral artery → retrograde up aorta, tip at iliac/aorta -->
        <path d="M 175 415 Q 175 400 170 380 L 170 290"
              stroke="#ef4444" stroke-width="6" fill="none" stroke-linecap="round" marker-end="url(#vaArrow)"/>
        <defs>
          <marker id="vaArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444"/>
          </marker>
        </defs>

        <!-- RETURN tubing to ECMO -->
        <path d="M 175 415 Q 60 415 60 320 Q 60 245 310 245"
              stroke="#ef4444" stroke-width="6" fill="none" stroke-linecap="round"/>

        <!-- ECMO module -->
        <rect x="310" y="245" width="100" height="92" rx="10" fill="#fff" stroke="#9333ea" stroke-width="2.5"/>
        <text x="360" y="278" text-anchor="middle" font-family="Quicksand" font-size="12" font-weight="700" fill="#7e22ce">ECMO</text>
        <text x="360" y="295" text-anchor="middle" font-family="Quicksand" font-size="9" fill="#7e22ce">pump +</text>
        <text x="360" y="307" text-anchor="middle" font-family="Quicksand" font-size="9" fill="#7e22ce">oxygenator</text>

        <!-- Watershed indicator (where retrograde ECMO meets antegrade native flow) -->
        <line x1="155" y1="260" x2="225" y2="260" stroke="#fbbf24" stroke-width="2" stroke-dasharray="3 3"/>
        <text x="230" y="264" font-family="Quicksand" font-size="9" fill="#b45309">watershed</text>
        <text x="230" y="276" font-family="Quicksand" font-size="8" fill="#b45309" font-style="italic">Harlequin risk</text>

        <!-- Cannula labels -->
        <text x="225" y="438" font-family="Quicksand" font-size="11" font-weight="700" fill="#1e40af">drainage</text>
        <text x="225" y="451" font-family="Quicksand" font-size="9" fill="#1e40af">femoral vein</text>
        <text x="125" y="438" text-anchor="end" font-family="Quicksand" font-size="11" font-weight="700" fill="#991b1b">return</text>
        <text x="125" y="451" text-anchor="end" font-family="Quicksand" font-size="9" fill="#991b1b">femoral artery</text>

        <text x="60" y="462" font-family="Caveat" font-size="14" fill="#9d174d">venous → ECMO → arterial (retrograde) · heart + lungs bypassed ✿</text>
      </svg>
    `;
  }

  function oxygenatorDeepSVG(fdO2, sweep) {
    // Calculated outputs (simplified physiologic model)
    const postPaO2 = Math.round(40 + fdO2 * 400);  // 40 mmHg venous → up to ~440 at 100% O2
    const postPaCO2 = Math.round(Math.max(20, 70 - sweep * 6)); // higher sweep = more CO2 removed
    const o2Color = fdO2 >= 0.8 ? "#dc2626" : fdO2 >= 0.5 ? "#f97316" : "#fbbf24";
    return `
      <svg viewBox="0 0 700 380" class="ecmo-svg" id="ecmo-oxy-svg">
        <text x="350" y="26" text-anchor="middle" font-family="Quicksand" font-size="16" font-weight="700" fill="#831843">Oxygenator — hollow-fiber gas exchange</text>

        <!-- Blood in (venous, blue) -->
        <path d="M 30 200 L 110 200" stroke="#3b82f6" stroke-width="14" fill="none" stroke-linecap="round" marker-end="url(#bluearrow)"/>
        <defs>
          <marker id="bluearrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6"/>
          </marker>
          <marker id="redarrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444"/>
          </marker>
        </defs>
        <text x="70" y="185" text-anchor="middle" font-size="11" font-weight="700" fill="#1e40af">blood in</text>
        <text x="70" y="225" text-anchor="middle" font-size="10" fill="#1e40af">SvO₂ 65–75%</text>
        <text x="70" y="238" text-anchor="middle" font-size="10" fill="#1e40af">PaO₂ ~40 mmHg</text>

        <!-- Oxygenator chamber -->
        <rect x="120" y="120" width="430" height="160" fill="#fef7fb" stroke="#9333ea" stroke-width="3" rx="10"/>

        <!-- Hollow fibers (vertical) -->
        ${Array.from({ length: 18 }, (_, i) => {
          const x = 140 + i * 24;
          return `
            <line x1="${x}" y1="80" x2="${x}" y2="320" stroke="#cbd5e1" stroke-width="3"/>
            <circle cx="${x}" cy="80" r="4" fill="${o2Color}"/>
            <circle cx="${x}" cy="320" r="4" fill="#22c55e"/>
          `;
        }).join("")}

        <!-- Gas in (top, green) -->
        <path d="M 350 60 L 350 78" stroke="#22c55e" stroke-width="8" fill="none" stroke-linecap="round"/>
        <text x="350" y="50" text-anchor="middle" font-size="11" font-weight="700" fill="#15803d">sweep gas in (FdO₂ + flow)</text>

        <!-- Gas out (bottom, lighter green) -->
        <path d="M 350 322 L 350 350" stroke="#86efac" stroke-width="8" fill="none" stroke-linecap="round" marker-end="url(#greenarrow)"/>
        <defs>
          <marker id="greenarrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#86efac"/>
          </marker>
        </defs>
        <text x="350" y="367" text-anchor="middle" font-size="11" font-weight="700" fill="#15803d">gas out (CO₂ + excess O₂)</text>

        <!-- Diffusion arrows (in and out across fibers) -->
        <g opacity="0.7">
          <text x="180" y="115" font-size="11" font-weight="700" fill="${o2Color}">O₂ →</text>
          <text x="180" y="305" font-size="11" font-weight="700" fill="#22c55e">← CO₂</text>
        </g>

        <!-- Blood out (red) -->
        <path d="M 560 200 L 660 200" stroke="#ef4444" stroke-width="14" fill="none" stroke-linecap="round" marker-end="url(#redarrow2)"/>
        <text x="620" y="185" text-anchor="middle" font-size="11" font-weight="700" fill="#991b1b">blood out</text>
        <text x="620" y="225" text-anchor="middle" font-size="10" fill="#991b1b">PaO₂ ${postPaO2} mmHg</text>
        <text x="620" y="238" text-anchor="middle" font-size="10" fill="#991b1b">PaCO₂ ${postPaCO2} mmHg</text>

        <!-- Direction notes -->
        <text x="335" y="140" font-size="10" fill="#374151" font-style="italic">blood flows around fibers</text>
        <text x="335" y="270" font-size="10" fill="#374151" font-style="italic">gas flows inside fibers</text>
      </svg>
    `;
  }

  // ──────────────────────────────────────────────────────────
  // Renderers
  // ──────────────────────────────────────────────────────────
  function renderCircuit() {
    const view = document.getElementById("view-circuit");
    view.innerHTML = `
      <div class="view-header">
        <div>
          <h2>🩸 Interactive Circuit</h2>
          <div class="desc">tap any component to learn what it does, what to watch for, and what can go wrong ✿</div>
        </div>
      </div>
      <div class="ecmo-circuit-wrap">
        ${circuitSVG()}
      </div>
      <div class="component-detail" id="component-detail">
        <div class="empty-prompt">👆 tap a component above to see its details</div>
      </div>
    `;
    bindCircuitHotspots();
  }

  function bindCircuitHotspots() {
    document.querySelectorAll(".ecmo-part").forEach((g) => {
      g.style.cursor = "pointer";
      g.addEventListener("mouseenter", () => g.classList.add("hover"));
      g.addEventListener("mouseleave", () => g.classList.remove("hover"));
      g.addEventListener("click", () => {
        const key = g.dataset.component;
        showComponent(key);
        document.querySelectorAll(".ecmo-part").forEach((x) => x.classList.remove("selected"));
        document.querySelectorAll(`.ecmo-part[data-component="${key}"]`).forEach((x) => x.classList.add("selected"));
      });
    });
  }

  function showComponent(key) {
    const c = COMPONENTS[key];
    const target = document.getElementById("component-detail");
    if (!c) return;
    target.innerHTML = `
      <div class="component-card">
        <div class="component-header">
          <div>
            <h3>${c.name}</h3>
            <div class="component-sub">${c.subtitle}</div>
          </div>
        </div>
        <div class="component-section" data-ai="what">
          <h4>What it does</h4>
          <p>${c.whatItDoes}</p>
        </div>
        <div class="component-section" data-ai="specs">
          <h4>Specs</h4>
          <ul>${c.typicalSpecs.map((s) => `<li>${s}</li>`).join("")}</ul>
        </div>
        <div class="component-section" data-ai="monitor">
          <h4>What to monitor</h4>
          <ul>${c.monitor.map((s) => `<li>${s}</li>`).join("")}</ul>
        </div>
        <div class="component-section danger-block" data-ai="problems">
          <h4>What can go wrong</h4>
          <ul>${c.problems.map((s) => `<li>${s}</li>`).join("")}</ul>
        </div>
        <div class="export-buttons-mount"></div>
      </div>
    `;
    if (window.NotesExport) {
      window.NotesExport.attachExportButtons(target.querySelector(".export-buttons-mount"), {
        getText: () => componentToText(c),
        getSvg: () => document.getElementById("ecmo-circuit-svg"),
        baseFilename: `ecmo-${key}`,
      });
    }
    if (window.AITutor) {
      const aiTopic = `${c.name} (ECMO)`;
      const aiSections = [
        ["what", "What it does", c.whatItDoes],
        ["specs", "Specs", c.typicalSpecs],
        ["monitor", "What to monitor", c.monitor],
        ["problems", "What can go wrong", c.problems],
      ];
      aiSections.forEach(([key, label, content]) => {
        const el = target.querySelector(`[data-ai="${key}"]`);
        if (el) window.AITutor.attachAIButtons(el, { topic: aiTopic, section: label, getContent: () => content });
      });
    }
  }

  function componentToText(c) {
    return [
      `# ${c.name}`,
      `(${c.subtitle})`,
      "",
      `WHAT IT DOES`,
      c.whatItDoes,
      "",
      `SPECS`,
      ...c.typicalSpecs.map((s) => `• ${s}`),
      "",
      `MONITOR`,
      ...c.monitor.map((s) => `• ${s}`),
      "",
      `PROBLEMS`,
      ...c.problems.map((s) => `• ${s}`),
    ].join("\n");
  }

  function renderModes() {
    const view = document.getElementById("view-modes");
    view.innerHTML = `
      <div class="view-header">
        <div>
          <h2>🔄 VV vs VA</h2>
          <div class="desc">two fundamentally different goals, two configurations, two complication profiles 💕</div>
        </div>
      </div>
      <div class="modes-grid">
        <div class="mode-card" data-mode="vv">
          <div class="mode-svg-wrap">${vvSVG()}</div>
          <div class="mode-info">
            <h3>${MODES.vv.name}</h3>
            <div class="mode-purpose"><strong>Purpose:</strong> ${MODES.vv.purpose}</div>
            <h4>Cannulation</h4>
            <ul>${MODES.vv.cannulation.map((c) => `<li>${c}</li>`).join("")}</ul>
            <h4>Indications</h4>
            <ul>${MODES.vv.indications.map((i) => `<li>${i}</li>`).join("")}</ul>
            <h4>Hemodynamics</h4>
            <p>${MODES.vv.hemodynamics}</p>
            <h4 class="danger">Mode-specific issues</h4>
            <ul>${MODES.vv.uniqueIssues.map((u) => `<li>${u}</li>`).join("")}</ul>
            <div class="mode-versus">${MODES.vv.vsAlternative}</div>
            <div class="mode-ai-mount"></div>
          </div>
        </div>

        <div class="mode-card" data-mode="va">
          <div class="mode-svg-wrap">${vaSVG()}</div>
          <div class="mode-info">
            <h3>${MODES.va.name}</h3>
            <div class="mode-purpose"><strong>Purpose:</strong> ${MODES.va.purpose}</div>
            <h4>Cannulation</h4>
            <ul>${MODES.va.cannulation.map((c) => `<li>${c}</li>`).join("")}</ul>
            <h4>Indications</h4>
            <ul>${MODES.va.indications.map((i) => `<li>${i}</li>`).join("")}</ul>
            <h4>Hemodynamics</h4>
            <p>${MODES.va.hemodynamics}</p>
            <h4 class="danger">Mode-specific issues</h4>
            <ul>${MODES.va.uniqueIssues.map((u) => `<li>${u}</li>`).join("")}</ul>
            <div class="mode-versus">${MODES.va.vsAlternative}</div>
            <div class="mode-ai-mount"></div>
          </div>
        </div>
      </div>
    `;
    if (window.AITutor) {
      const summarize = (m) =>
        `Purpose: ${m.purpose}\n\nCannulation:\n${m.cannulation.map((x) => `• ${x}`).join("\n")}\n\nIndications:\n${m.indications.map((x) => `• ${x}`).join("\n")}\n\nHemodynamics: ${m.hemodynamics}\n\nMode-specific issues:\n${m.uniqueIssues.map((x) => `• ${x}`).join("\n")}`;
      const vvMount = document.querySelector('[data-mode="vv"] .mode-ai-mount');
      const vaMount = document.querySelector('[data-mode="va"] .mode-ai-mount');
      if (vvMount) window.AITutor.attachAIButtons(vvMount, { topic: "VV-ECMO", section: "VV-ECMO overview", getContent: () => summarize(MODES.vv) });
      if (vaMount) window.AITutor.attachAIButtons(vaMount, { topic: "VA-ECMO", section: "VA-ECMO overview", getContent: () => summarize(MODES.va) });
    }
  }

  function renderOxygenator() {
    const view = document.getElementById("view-oxygenator");
    let fdo2 = 1.0;
    let sweep = 4;
    function rerender() {
      view.innerHTML = `
        <div class="view-header">
          <div>
            <h2>💨 Oxygenator deep-dive</h2>
            <div class="desc">two knobs, two effects — slide to see how each setting changes output gases ✿</div>
          </div>
        </div>
        <div class="oxy-wrap">
          ${oxygenatorDeepSVG(fdo2, sweep)}
          <div class="oxy-controls">
            <div class="oxy-knob">
              <label>FdO₂ (fraction delivered O₂)</label>
              <div class="ekg-rate-row">
                <input type="range" min="0.21" max="1.0" step="0.01" value="${fdo2}" id="oxy-fdo2"/>
                <div class="ekg-rate-value">${(fdo2 * 100).toFixed(0)}<span class="unit">%</span></div>
              </div>
              <div class="oxy-explainer">controls oxygenation. raise to ↑ PaO₂</div>
            </div>
            <div class="oxy-knob">
              <label>Sweep gas flow (L/min)</label>
              <div class="ekg-rate-row">
                <input type="range" min="0.5" max="10" step="0.1" value="${sweep}" id="oxy-sweep"/>
                <div class="ekg-rate-value">${sweep.toFixed(1)}<span class="unit"> L/min</span></div>
              </div>
              <div class="oxy-explainer">controls CO₂ removal. raise to ↓ PaCO₂</div>
            </div>
          </div>
          <div class="oxy-key-concepts">
            <div class="concept-card">
              <h4>🫁 Blood path</h4>
              <p>Flows on the <strong>outside</strong> of the polymethylpentene (PMP) hollow fibers, passing over their entire surface area.</p>
            </div>
            <div class="concept-card">
              <h4>💨 Gas path</h4>
              <p>Flows <strong>inside</strong> the fibers in the opposite direction (counter-current), maximizing the partial-pressure gradient.</p>
            </div>
            <div class="concept-card">
              <h4>⚡ How exchange happens</h4>
              <p>Pure diffusion across the fiber membrane: O₂ from gas to blood (driven by high alveolar-like FdO₂), CO₂ from blood to gas (driven by high blood PaCO₂).</p>
            </div>
            <div class="concept-card">
              <h4>🧠 The decoupling trick</h4>
              <p>Sweep <strong>flow</strong> sets CO₂ clearance because CO₂ diffuses 20× more readily than O₂ — its removal is limited by how fast gas carries it away. FdO₂ sets O₂ delivery because membrane O₂ transfer is limited by partial-pressure gradient.</p>
            </div>
          </div>
        </div>
      `;
      document.getElementById("oxy-fdo2").addEventListener("input", (e) => {
        fdo2 = parseFloat(e.target.value);
        rerender();
      });
      document.getElementById("oxy-sweep").addEventListener("input", (e) => {
        sweep = parseFloat(e.target.value);
        rerender();
      });
    }
    rerender();
  }

  function renderComplications() {
    const view = document.getElementById("view-complications");
    view.innerHTML = `
      <div class="view-header">
        <div>
          <h2>⚠️ Complications</h2>
          <div class="desc">recognize early — signs, causes, what to do at the bedside ✨</div>
        </div>
      </div>
      <div class="complication-grid">
        ${COMPLICATIONS.map((c) => `
          <div class="complication-card" data-id="${c.id}">
            <div class="comp-header">
              <span class="comp-icon">${c.icon}</span>
              <div>
                <h3>${c.name}</h3>
                <span class="mode-tag">${c.mode}</span>
              </div>
            </div>
            <p class="comp-def">${c.definition}</p>
            <button class="comp-expand">see signs, causes & management ↓</button>
            <div class="comp-detail" style="display:none">
              <div data-ai="pathophys">
                <h4>Pathophysiology</h4>
                <p>${c.pathophys}</p>
              </div>
              <div data-ai="signs">
                <h4 class="warn">Signs at the bedside</h4>
                <ul>${c.signs.map((s) => `<li>${s}</li>`).join("")}</ul>
              </div>
              <div data-ai="causes">
                <h4 class="danger">Causes</h4>
                <ul>${c.causes.map((s) => `<li>${s}</li>`).join("")}</ul>
              </div>
              <div data-ai="mgmt">
                <h4 class="info">Management</h4>
                <ul>${c.management.map((s) => `<li>${s}</li>`).join("")}</ul>
              </div>
              <div class="comp-export-mount"></div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
    view.querySelectorAll(".comp-expand").forEach((btn, i) => {
      btn.addEventListener("click", () => {
        const detail = btn.nextElementSibling;
        const expanded = detail.style.display !== "none";
        detail.style.display = expanded ? "none" : "block";
        btn.textContent = expanded
          ? "see signs, causes & management ↓"
          : "hide details ↑";
        if (!expanded) {
          const comp = COMPLICATIONS[i];
          if (window.NotesExport) {
            const mount = detail.querySelector(".comp-export-mount");
            if (mount && !mount.dataset.bound) {
              mount.dataset.bound = "1";
              window.NotesExport.attachExportButtons(mount, {
                getText: () => complicationToText(comp),
                baseFilename: `ecmo-${comp.id}`,
              });
            }
          }
          if (window.AITutor && !detail.dataset.aiBound) {
            detail.dataset.aiBound = "1";
            const aiTopic = `${comp.name} (${comp.mode} ECMO complication)`;
            const aiSections = [
              ["pathophys", "Pathophysiology", comp.pathophys],
              ["signs", "Signs at the bedside", comp.signs],
              ["causes", "Causes", comp.causes],
              ["mgmt", "Management", comp.management],
            ];
            aiSections.forEach(([key, label, content]) => {
              const el = detail.querySelector(`[data-ai="${key}"]`);
              if (el) window.AITutor.attachAIButtons(el, { topic: aiTopic, section: label, getContent: () => content });
            });
          }
        }
      });
    });
  }

  function complicationToText(c) {
    return [
      `# ${c.name} (${c.mode})`,
      "",
      `DEFINITION`,
      c.definition,
      "",
      `PATHOPHYSIOLOGY`,
      c.pathophys,
      "",
      `SIGNS`,
      ...c.signs.map((s) => `• ${s}`),
      "",
      `CAUSES`,
      ...c.causes.map((s) => `• ${s}`),
      "",
      `MANAGEMENT`,
      ...c.management.map((s) => `• ${s}`),
    ].join("\n");
  }

  function renderParams() {
    const view = document.getElementById("view-params");
    view.innerHTML = `
      <div class="view-header">
        <div>
          <h2>📊 Parameter Reference</h2>
          <div class="desc">the numbers you'll see on the screen — and what they should be ✿</div>
        </div>
      </div>
      <div class="param-grid">
        ${PARAMS.map((g) => `
          <div class="param-card">
            <h3>${g.group}</h3>
            <table class="param-table">
              ${g.items.map(([k, v]) => `
                <tr>
                  <td class="param-key">${k}</td>
                  <td class="param-val">${v}</td>
                </tr>
              `).join("")}
            </table>
            <div class="param-export-mount" data-group="${g.group}"></div>
          </div>
        `).join("")}
      </div>
    `;
    if (window.NotesExport) {
      view.querySelectorAll(".param-export-mount").forEach((mount, i) => {
        window.NotesExport.attachExportButtons(mount, {
          getText: () => paramGroupToText(PARAMS[i]),
          baseFilename: `ecmo-params-${PARAMS[i].group.replace(/\s+/g, '-').toLowerCase()}`,
        });
      });
    }
    if (window.AITutor) {
      view.querySelectorAll(".param-export-mount").forEach((mount, i) => {
        const g = PARAMS[i];
        const contentLines = g.items.map(([k, v]) => v ? `${k}: ${v}` : k).join("\n");
        window.AITutor.attachAIButtons(mount, {
          topic: `ECMO ${g.group}`,
          section: g.group,
          getContent: () => contentLines,
        });
      });
    }
  }

  function paramGroupToText(g) {
    const lines = [`# ECMO Parameters — ${g.group}`, ""];
    g.items.forEach(([k, v]) => {
      lines.push(v ? `${k}: ${v}` : k);
    });
    return lines.join("\n");
  }

  // ──────────────────────────────────────────────────────────
  // View switching
  // ──────────────────────────────────────────────────────────
  function switchView(viewId) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.querySelectorAll(".mode-tab").forEach((t) => t.classList.remove("active"));
    document.getElementById(viewId).classList.add("active");
    document.querySelector(`[data-view="${viewId}"]`)?.classList.add("active");
    if (viewId === "view-circuit") renderCircuit();
    if (viewId === "view-modes") renderModes();
    if (viewId === "view-oxygenator") renderOxygenator();
    if (viewId === "view-complications") renderComplications();
    if (viewId === "view-params") renderParams();
  }

  function init() {
    document.querySelectorAll(".mode-tab").forEach((tab) => {
      tab.addEventListener("click", () => switchView(tab.dataset.view));
    });
    switchView("view-circuit");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
