import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NexusButton } from '@/components/ui/nexus-button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  variant?: 'nexus' | 'secondary' | 'outline';
  popular?: boolean;
  onCtaClick: () => void;
  isLoading?: boolean;
  currentPlan?: boolean;
}

export const PricingCard = ({
  name,
  price,
  period = '/mês',
  description,
  features,
  cta,
  variant = 'nexus',
  popular = false,
  onCtaClick,
  isLoading = false,
  currentPlan = false,
}: PricingCardProps) => {
  return (
    <Card
      className={cn(
        'relative transition-all duration-300 hover:shadow-xl',
        popular && 'border-primary shadow-lg shadow-primary/10 scale-105',
        'hover:-translate-y-2'
      )}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-gradient-nexus text-white px-4 py-1 shadow-lg">
            Mais Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-8 pt-8">
        <CardTitle className="text-2xl font-bold mb-2">{name}</CardTitle>
        <CardDescription className="text-muted-foreground mb-4">
          {description}
        </CardDescription>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold bg-gradient-nexus bg-clip-text text-transparent">
            {price}
          </span>
          <span className="text-muted-foreground text-sm">{period}</span>
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground flex-1">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <NexusButton
          variant={variant}
          className="w-full"
          onClick={onCtaClick}
          disabled={isLoading || currentPlan}
          loading={isLoading}
        >
          {currentPlan ? 'Plano Atual' : cta}
        </NexusButton>
      </CardFooter>
    </Card>
  );
};
