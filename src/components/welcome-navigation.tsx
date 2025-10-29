import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

interface WelcomeNavigationProps {
  currentStep: number;
  totalSteps: number;
  canProceed?: boolean;
  isSubmitting?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function WelcomeNavigation({
  currentStep,
  totalSteps,
  canProceed = true,
  isSubmitting = false,
  onPrevious,
  onNext,
  onSubmit,
}: WelcomeNavigationProps) {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0}
        className="border-white/20 bg-white/5 text-white hover:bg-white/10 disabled:opacity-50"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Anterior
      </Button>

      {isLastStep ? (
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-[#00cfb1] to-[#1effbf] font-bold text-[#21005a] hover:from-[#1effbf] hover:to-[#00cfb1] disabled:opacity-50"
        >
          {isSubmitting ? "A guardar..." : "Finalizar Configuração"}
          <CheckCircle className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-gradient-to-r from-[#00cfb1] to-[#1effbf] font-bold text-[#21005a] hover:from-[#1effbf] hover:to-[#00cfb1] disabled:opacity-50"
        >
          Próximo
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
