export interface DiagnosticData {
  income_input_typical?: number | null;
  income_input_best?: number | null;
  income_input_worst?: number | null;
  cost_of_living_reported?: number | null;
  financial_archetype?: string | null;
}

export const archetypeData = {
  investor: {
    name: 'Investidor',
    description: 'Você tem uma visão de longo prazo e um superávit para alocar em seus investimentos.',
    icon: '🚀',
  },
  equilibrist: {
    name: 'Equilibrista',
    description: 'Você balanceia bem entre economia e gastos, adaptando-se às situações.',
    icon: '⚖️',
  },
  rescuer: {
    name: 'Piloto de Resgate',
    description: 'Sua missão é reverter o déficit e reestruturar suas finanças para retomar o controle.',
    icon: '🛡️',
  }
} as const;

export type ArchetypeKey = keyof typeof archetypeData;

export const normalizeArchetype = (archetype?: string | null): ArchetypeKey => {
  if (!archetype) return 'equilibrist';
  const normalized = archetype.toLowerCase();
  if (normalized.includes('invest')) return 'investor';
  if (normalized.includes('equilib')) return 'equilibrist';
  if (normalized.includes('piloto') || normalized.includes('rescue') || normalized.includes('resgate')) return 'rescuer';
  return 'equilibrist';
};

export const getArchetypeName = (archetype?: string | null): string => {
  return archetypeData[normalizeArchetype(archetype)].name;
};

export const isDiagnosticComplete = (userData: DiagnosticData): boolean => {
  return !!(
    userData.income_input_typical &&
    userData.income_input_best &&
    userData.income_input_worst &&
    userData.cost_of_living_reported &&
    userData.financial_archetype
  );
};