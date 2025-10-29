import { useToast as useToastPrimitive } from "@/components/ui/use-toast";

export function useToast() {
  const { toast: toastPrimitive } = useToastPrimitive();

  const toast = {
    success: (message: string, description?: string) => {
      toastPrimitive({
        title: message,
        description,
        variant: "default",
        className: "border-[#00cfb1] bg-[#21005a] text-white shadow-xl backdrop-blur-xl",
      });
    },
    error: (message: string, description?: string) => {
      toastPrimitive({
        title: message,
        description,
        variant: "destructive",
        className: "border-red-500 bg-[#21005a] text-white shadow-xl backdrop-blur-xl",
      });
    },
    info: (message: string, description?: string) => {
      toastPrimitive({
        title: message,
        description,
        variant: "default",
        className: "border-[#ba93ff] bg-[#21005a] text-white shadow-xl backdrop-blur-xl",
      });
    },
    warning: (message: string, description?: string) => {
      toastPrimitive({
        title: message,
        description,
        className: "border-yellow-500 bg-[#21005a] text-white shadow-xl backdrop-blur-xl",
      });
    },
  };

  return { toast };
}
