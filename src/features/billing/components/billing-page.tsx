"use client";

import { cn } from "@/lib/utils";
import { Check, CreditCard, Receipt, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";

const INVOICES = [
  { id: "INV-2024-001", date: "01 Nov 2024", amount: "$15.00", status: "Paid" },
  { id: "INV-2024-002", date: "01 Oct 2024", amount: "$15.00", status: "Paid" },
  { id: "INV-2024-003", date: "01 Sep 2024", amount: "$15.00", status: "Paid" },
];

export function BillingPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"free" | "pro">("pro");

  const handleUpgrade = async (plan: "free" | "pro") => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setSelectedPlan(plan);
    setIsProcessing(false);
  };

  return (
    <div className="w-full pb-12 text-white px-4 md:px-8 mt-8 lg:mt-0 lg:pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-[#6fffe9]" />
            Gestão de Subscrição
          </h1>
          <p className="mt-2 text-sm text-white/50 max-w-xl">
            Gere a tua subscrição, faz upgrade para aceder a recursos premium e consulta o histórico de faturação.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Plans */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-white mb-4">Escolhe o teu plano</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* Free Plan */}
            <div 
              className={cn(
                "relative rounded-3xl border p-6 transition-all duration-300",
                selectedPlan === "free" 
                  ? "border-[#24ffe6]/50 bg-[#24ffe6]/5 shadow-[0_0_30px_-5px_rgba(36,255,230,0.15)]" 
                  : "border-white/10 bg-white/5 hover:border-white/20"
              )}
            >
              {selectedPlan === "free" && (
                <div className="absolute top-4 right-4 text-[#24ffe6] text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-[#24ffe6]/10 rounded-full">
                  Plano Atual
                </div>
              )}
              <h3 className="text-xl font-black text-white">Básico</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#6fffe9]">Grátis</span>
              </div>
              <p className="mt-2 text-sm text-white/50">Essencial para equipas pequenas.</p>
              
              <ul className="mt-6 space-y-3">
                {["Gerir até 1 equipa", "Estatísticas básicas", "1 membro da staff"].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white/70">
                    <Check className="h-4 w-4 text-[#24ffe6]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade("free")}
                disabled={selectedPlan === "free" || isProcessing}
                className={cn(
                  "mt-8 w-full rounded-2xl py-3 text-sm font-bold transition-all duration-200",
                  selectedPlan === "free" 
                    ? "bg-white/5 text-white/50 cursor-not-allowed" 
                    : "border border-white/20 bg-white/5 hover:bg-white/10 text-white"
                )}
              >
                {selectedPlan === "free" ? "Ativo" : "Mudar para Básico"}
              </button>
            </div>

            {/* Pro Plan */}
            <div 
              className={cn(
                "relative rounded-3xl border p-6 transition-all duration-300 overflow-hidden",
                selectedPlan === "pro" 
                  ? "border-[#24ffe6] bg-[#24ffe6]/10 shadow-[0_0_40px_-10px_rgba(36,255,230,0.3)]" 
                  : "border-white/10 bg-white/5 hover:border-white/20"
              )}
            >
              <div className="absolute -top-10 -right-10 h-32 w-32 bg-[#24ffe6]/20 blur-3xl rounded-full" />
              
              {selectedPlan === "pro" && (
                <div className="absolute top-4 right-4 text-black text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-[#24ffe6] rounded-full shadow-[0_0_15px_rgba(36,255,230,0.5)]">
                  Plano Atual
                </div>
              )}
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                Pro <Zap className="h-5 w-5 text-[#24ffe6] fill-[#24ffe6]" />
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#6fffe9]">€15</span>
                <span className="text-sm text-white/50">/mês</span>
              </div>
              <p className="mt-2 text-sm text-white/50">Tudo o que precisas para crescer.</p>
              
              <ul className="mt-6 space-y-3">
                {[
                  "Equipas ilimitadas", 
                  "Estatísticas avançadas & MVP", 
                  "Staff ilimitado",
                  "Personalização da página do clube"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white/90 font-medium">
                    <Check className="h-4 w-4 text-[#24ffe6]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade("pro")}
                disabled={selectedPlan === "pro" || isProcessing}
                className={cn(
                  "mt-8 w-full rounded-2xl py-3 text-sm font-black transition-all duration-300",
                  selectedPlan === "pro" 
                    ? "bg-white/5 text-[#24ffe6] border border-[#24ffe6]/30 cursor-not-allowed" 
                    : "bg-[#24ffe6] text-black shadow-[0_10px_30px_-10px_rgba(36,255,230,0.6)] hover:-translate-y-0.5 hover:shadow-[0_15px_40px_-10px_rgba(36,255,230,0.8)]"
                )}
              >
                {isProcessing && selectedPlan !== "pro" ? (
                  <span className="animate-pulse">Processando...</span>
                ) : selectedPlan === "pro" ? (
                  "Ativo"
                ) : (
                  "Fazer Upgrade"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Invoices */}
        <div className="space-y-6">
          {/* Payment Method */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#6fffe9]" /> Método de Pagamento
            </h3>
            
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">VISA</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">•••• 4242</p>
                  <p className="text-xs text-white/50">Expira em 12/26</p>
                </div>
              </div>
              <button className="text-[11px] font-bold text-[#6fffe9] uppercase tracking-wider hover:text-white transition-colors">
                Editar
              </button>
            </div>

            {selectedPlan === "pro" && (
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">Próximo Pagamento</p>
                  <p className="text-sm text-white">01 Dez 2024</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">Valor</p>
                  <p className="text-sm text-white">€15.00</p>
                </div>
              </div>
            )}
            
            <button className="mt-6 w-full text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-wider py-2">
              Cancelar Subscrição
            </button>
          </div>

          {/* Invoice History */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[#6fffe9]" /> Histórico de Faturas
            </h3>
            
            <div className="space-y-3">
              {INVOICES.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-[#6fffe9] transition-colors">{inv.date}</p>
                    <p className="text-xs text-white/50">{inv.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{inv.amount}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#24ffe6]">{inv.status}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="mt-4 w-full text-xs font-bold text-white/50 hover:text-white transition-colors uppercase tracking-wider py-2 border-t border-white/10">
              Ver Todas
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
