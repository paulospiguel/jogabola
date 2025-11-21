import { useToast as useToastPrimitive } from "@/components/ui/use-toast";

export function useToast() {
  const { toast: toastPrimitive } = useToastPrimitive();

  const toast = {
    success: (message: string, description?: string) => {
      toastPrimitive({
        title: message,
        description,
        variant: "success", // Use the variant we added to toast.tsx
        className:
          "border-[#24ffe6]/50 bg-[#050312]/95 text-[#24ffe6] shadow-[0_0_30px_-10px_rgba(36,255,230,0.4)] backdrop-blur-xl",
      });
    },
    error: (message: string, description?: string) => {
      toastPrimitive({
        title: message,
        description,
        variant: "destructive",
        className:
          "border-red-500/50 bg-[#050312]/95 text-red-400 shadow-[0_0_30px_-10px_rgba(239,68,68,0.6)] backdrop-blur-xl",
      });
    },
    info: (message: string, description?: string) => {
      toastPrimitive({
        title: message,
        description,
        variant: "default",
        className:
          "border-accent-blue/50 bg-[#050312]/95 text-accent-blue shadow-[0_0_30px_-10px_rgba(2,167,255,0.4)] backdrop-blur-xl",
      });
    },
    warning: (message: string, description?: string) => {
      toastPrimitive({
        title: message,
        description,
        variant: "default",
        className:
          "border-yellow-500/50 bg-[#050312]/95 text-yellow-400 shadow-[0_0_30px_-10px_rgba(234,179,8,0.4)] backdrop-blur-xl",
      });
    },
  };

  return { toast };
}
