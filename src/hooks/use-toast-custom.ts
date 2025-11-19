import { useToast as useToastPrimitive } from "@/components/ui/use-toast";

export function useToast() {
  const { toast: toastPrimitive } = useToastPrimitive();

  const toast = {
    success: (message: string, description?: string) => {
      toastPrimitive({
        title: message,
        description,
        variant: "default",
        className: "border-brand-green bg-toast-bg text-white shadow-xl backdrop-blur-xl",
      });
    },
    error: (message: string, description?: string) => {
      toastPrimitive({
        title: message,
        description,
        variant: "destructive",
        className: "border-red-500 bg-toast-bg text-white shadow-xl backdrop-blur-xl",
      });
    },
    info: (message: string, description?: string) => {
      toastPrimitive({
        title: message,
        description,
        variant: "default",
        className: "border-secondary-text bg-toast-bg text-white shadow-xl backdrop-blur-xl",
      });
    },
    warning: (message: string, description?: string) => {
      toastPrimitive({
        title: message,
        description,
        className: "border-yellow-500 bg-toast-bg text-white shadow-xl backdrop-blur-xl",
      });
    },
  };

  return { toast };
}
