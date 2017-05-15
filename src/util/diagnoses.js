import rawDiagnoses from '../data/diagnoses';

// e.g. "HPV (human papilloma virus)" => ["HPV", "human papilloma virus"]
function getTerms(diagnosis) {
  if (diagnosis.includes(' (')) {
    const [beforeParen, afterOpenParen] = diagnosis.split(' ('),
          [betweenParens] = afterOpenParen.split(')');
    return [beforeParen, betweenParens];
  } else {
    return [diagnosis];
  }
}

// e.g. ["AIDS", "chronic fatigue syndrome (CFS)"] =>
// [
//   {
//      text: "AIDS",
//      terms: ["aids"]
//   }
//   {
//      text: "chronic fatigue syndrome (CFS)",
//      terms: ["chronic fatigue syndrome", "cfs"]
//   }
// ]
const processedDiagnoses = rawDiagnoses.map((rawDiagnosis) => ({
  text: rawDiagnosis,
  terms: getTerms(rawDiagnosis.toLowerCase())
}));

export default processedDiagnoses;
