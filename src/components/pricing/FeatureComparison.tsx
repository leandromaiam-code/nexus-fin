import { Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Feature {
  name: string;
  free: boolean | string;
  plus: boolean | string;
  premium: boolean | string;
}

const features: Feature[] = [
  {
    name: 'Transações ilimitadas',
    free: false,
    plus: true,
    premium: true,
  },
  {
    name: 'Contas bancárias',
    free: '2',
    plus: '5',
    premium: 'Ilimitadas',
  },
  {
    name: 'Categorização IA',
    free: '10/mês',
    plus: 'Ilimitada',
    premium: 'Ilimitada',
  },
  {
    name: 'Análises avançadas',
    free: false,
    plus: true,
    premium: true,
  },
  {
    name: 'Categorias personalizadas',
    free: false,
    plus: true,
    premium: true,
  },
  {
    name: 'Exportar dados',
    free: false,
    plus: true,
    premium: true,
  },
  {
    name: 'Alertas de orçamento',
    free: false,
    plus: true,
    premium: true,
  },
  {
    name: 'Membros da família',
    free: false,
    plus: false,
    premium: 'Até 6',
  },
  {
    name: 'Suporte prioritário',
    free: false,
    plus: false,
    premium: true,
  },
];

const renderCell = (value: boolean | string) => {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-primary mx-auto" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
    );
  }
  return <span className="text-sm text-center block">{value}</span>;
};

export const FeatureComparison = () => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-3xl">Comparação Detalhada</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4 font-semibold">Recursos</th>
                <th className="text-center py-4 px-4 font-semibold">Gratuito</th>
                <th className="text-center py-4 px-4 font-semibold bg-primary/5">Plus</th>
                <th className="text-center py-4 px-4 font-semibold">Premium</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4 text-sm">{feature.name}</td>
                  <td className="py-4 px-4">{renderCell(feature.free)}</td>
                  <td className="py-4 px-4 bg-primary/5">{renderCell(feature.plus)}</td>
                  <td className="py-4 px-4">{renderCell(feature.premium)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
