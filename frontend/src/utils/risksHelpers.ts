export const FEATURE_META: Record<string, {
  label:       string
  icon:        string
  riskNote:    (val: number | string) => string
  safeNote:    (val: number | string) => string
}> = {
  'ST Segment Slope': {
    label:    "Heart Signal Pattern",
    icon:     "📈",
    riskNote: () => "The shape of your heart's electrical signal during activity suggests your heart may be under strain.",
    safeNote: () => "Your heart's electrical signal pattern during activity looks normal.",
  },
  'ST Depression': {
    label:    "Heart Strain During Activity",
    icon:     "❤️",
    riskNote: (v) => `Your heart showed signs of stress during physical effort. This can be an early warning sign worth investigating.`,
    safeNote: (v) => `Your heart handled physical effort well with minimal strain.`,
  },
  'Fasting Blood Sugar': {
    label:    "Blood Sugar (Fasting)",
    icon:     "🩸",
    riskNote: (v) => `Your blood sugar level when fasting was ${v} > 120 mg/dL, which is above the healthy range and may be putting extra stress on your heart.`,
    safeNote: (v) => `Your fasting blood sugar was ${v} (≤120 mg/dL), within a healthy range.`,
  },
  'Exercise-Induced Angina': {
    label:    "Chest Discomfort During Exercise",
    icon:     "🏃",
    riskNote: () => "You reported experiencing chest discomfort or pain during physical activity. This is a sign your heart may not be getting enough blood flow when working hard.",
    safeNote: () => "You did not experience chest discomfort during physical activity, which is a good sign.",
  },
  'Chest Pain Type': {
    label:    "Type of Chest Pain",
    icon:     "💢",
    riskNote: (v) => `Your chest pain was recorded as "${v}". This type of pain pattern is associated with higher cardiac risk and should be evaluated by a doctor.`,
    safeNote: (v) => `Your chest pain type ("${v}") is less likely to be related to a serious heart condition.`,
  },
  'Resting Blood Pressure': {
    label:    "Resting Blood Pressure",
    icon:     "🫀",
    riskNote: (v) => `Your resting blood pressure was ${v} mmHg, which is higher than the recommended range (around 120 mmHg or lower). Persistently high blood pressure strains the heart.`,
    safeNote: (v) => `Your resting blood pressure was ${v} mmHg, which is within an acceptable range.`,
  },
  'Maximum Heart Rate': {
    label:    "Peak Heart Rate During Exercise",
    icon:     "⚡",
    riskNote: (v) => `Your maximum heart rate during exercise was ${v} bpm. A lower-than-expected peak heart rate for your age can sometimes indicate reduced heart capacity.`,
    safeNote: (v) => `Your peak heart rate during exercise was ${v} bpm, appropriate for your age and activity level.`,
  },
  'Age': {
    label:    "Age",
    icon:     "🎂",
    riskNote: (v) => `At age ${v}, your natural risk for heart disease increases. This is not something you can change, but it makes regular checkups more important.`,
    safeNote: (v) => `Your age (${v}) places you in a lower natural risk category for heart disease.`,
  },
  'Resting ECG': {
    label:    "Heart Scan at Rest (ECG)",
    icon:     "📋",
    riskNote: (v) => `Your resting ECG result was "${v}". Even when a result appears normal, combined with other factors it can still contribute to overall risk.`,
    safeNote: (v) => `Your resting ECG result was "${v}", which is reassuring.`,
  },
  'Cholesterol': {
    label:    "Cholesterol Level",
    icon:     "🧪",
    riskNote: (v) => `Your cholesterol was ${v} mg/dL, which is above the healthy limit of 200 mg/dL. High cholesterol can cause fatty build-up in arteries over time.`,
    safeNote: (v) => `Your cholesterol level of ${v} mg/dL is within a manageable range.`,
  },
  'Gender': {
    label:    "Biological Sex",
    icon:     "👤",
    riskNote: (v) => `Your biological sex (${v}) is statistically associated with slightly higher cardiovascular risk in this model.`,
    safeNote: (v) => `Your biological sex (${v}) is associated with a lower statistical risk for heart disease in this model.`,
  },
}

export function getMeta(feature: string) {
  return FEATURE_META[feature] ?? {
    label:    feature,
    icon:     '🔬',
    riskNote: (v: number | string) => `This factor (value: ${v}) is contributing to your risk score.`,
    safeNote: (v: number | string) => `This factor (value: ${v}) is helping lower your risk score.`,
  }
}