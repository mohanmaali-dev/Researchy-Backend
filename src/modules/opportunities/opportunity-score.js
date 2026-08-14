const scoreFrequency = (frequency) => {
  const normalized = frequency.toLowerCase();

  if (/hour|daily|every day|multiple times|each day/.test(normalized)) {
    return { score: 20, reason: `High-frequency problem: ${frequency}` };
  }

  if (/week/.test(normalized)) {
    return { score: 15, reason: `Occurs weekly: ${frequency}` };
  }

  if (/month/.test(normalized)) {
    return { score: 10, reason: `Occurs monthly: ${frequency}` };
  }

  if (/quarter|year|rare|occasion/.test(normalized)) {
    return { score: 5, reason: `Occurs occasionally: ${frequency}` };
  }

  return { score: 8, reason: `Frequency recorded as: ${frequency}` };
};

const scoreImpact = (problem) => {
  const hasTimeImpact = Boolean(problem.timeImpact?.trim());
  const hasFinancialImpact = Boolean(problem.financialImpact?.trim());

  if (hasTimeImpact && hasFinancialImpact) {
    return { score: 20, reason: 'Both time and financial impacts are known' };
  }

  if (hasFinancialImpact) {
    return { score: 16, reason: 'A financial impact is known' };
  }

  if (hasTimeImpact) {
    return { score: 12, reason: 'A time impact is known' };
  }

  return { score: 0, reason: 'No time or financial impact recorded' };
};

const scoreWillingness = (willingnessToPay) => {
  const scores = { Yes: 20, Unknown: 10, No: 0 };
  return {
    score: scores[willingnessToPay] ?? 0,
    reason: `Willingness to pay: ${willingnessToPay}`,
  };
};

const scoreRepeatedDemand = (uniqueBusinessCount) => {
  if (uniqueBusinessCount >= 5) {
    return { score: 15, reason: `Reported by ${uniqueBusinessCount} unique businesses` };
  }

  if (uniqueBusinessCount >= 3) {
    return { score: 10, reason: `Reported by ${uniqueBusinessCount} unique businesses` };
  }

  if (uniqueBusinessCount >= 2) {
    return { score: 5, reason: 'Reported by 2 unique businesses' };
  }

  return { score: 0, reason: 'Reported by 1 unique business so far' };
};

const scoreEase = (difficulty) => {
  const scores = { Low: 5, Medium: 3, High: 1 };
  return {
    score: scores[difficulty] ?? 0,
    reason: `${difficulty} difficulty to solve`,
  };
};

export const calculateOpportunityScore = ({ problem, difficulty, uniqueBusinessCount }) => {
  const breakdown = {
    pain: {
      score: problem.painLevel * 2,
      max: 20,
      reason: `Pain level ${problem.painLevel}/10`,
    },
    frequency: { ...scoreFrequency(problem.frequency), max: 20 },
    impact: { ...scoreImpact(problem), max: 20 },
    willingness: { ...scoreWillingness(problem.willingnessToPay), max: 20 },
    repeatedDemand: { ...scoreRepeatedDemand(uniqueBusinessCount), max: 15 },
    ease: { ...scoreEase(difficulty), max: 5 },
    uniqueBusinessCount,
  };

  const total = [
    breakdown.pain,
    breakdown.frequency,
    breakdown.impact,
    breakdown.willingness,
    breakdown.repeatedDemand,
    breakdown.ease,
  ].reduce((sum, component) => sum + component.score, 0);

  return { total: Math.max(0, Math.min(100, total)), breakdown };
};
