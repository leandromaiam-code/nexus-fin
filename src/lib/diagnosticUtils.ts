export interface DiagnosticData {
  income_input_typical?: number | null;
  income_input_best?: number | null;
  income_input_worst?: number | null;
  cost_of_living_reported?: number | null;
  financial_archetype?: string | null;
}

export const isDiagnosticComplete = (userData: DiagnosticData): boolean => {
  return !!(
    userData.income_input_typical &&
    userData.income_input_best &&
    userData.income_input_worst &&
    userData.cost_of_living_reported &&
    userData.financial_archetype
  );
};