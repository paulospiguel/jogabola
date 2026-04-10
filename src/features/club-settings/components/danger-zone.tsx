"use client";

import { ShieldAlert, Trash2, ArrowRightLeft } from "lucide-react";
import { useState } from "react";

export function DangerZone() {
  const [confirmName, setConfirmName] = useState("");
  const showDeleteButton = confirmName === "Sporting FC"; // Mock validation

  return (
    <div className="space-y-6">
      {/* Warning callout */}
      <div className="flex items-start gap-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5">
        <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500" />
        <div>
          <h4 className="text-sm font-bold text-rose-400">Atenção: Ações Irreversíveis</h4>
          <p className="mt-1 text-xs text-rose-400/80 leading-relaxed">
            As ações nesta secção podem resultar na perda definitiva de dados estatísticos, jogadores, e histórico de plantel. 
            Certifique-se de realizar backups e ter a certeza absoluta antes de proceder.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Transfer Ownership */}
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6 flex flex-col justify-between">
          <div>
            <h5 className="text-sm font-bold text-white mb-2">Transferir Gestão do Clube</h5>
            <p className="text-xs text-white/50 leading-relaxed mb-6">
              Transfere o controlo total, acesso de administração financeira e definição de equipas para outro utilizador existente no plantel.
            </p>
          </div>
          <button
            type="button"
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-xs font-bold text-white transition-all hover:bg-white/10 hover:border-[#6fffe9]/40"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Transferir Gestão
          </button>
        </div>

        {/* Delete Club */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 flex flex-col justify-between">
          <div>
            <h5 className="text-sm font-bold text-rose-500 mb-2">Eliminar Clube</h5>
            <p className="text-xs text-white/50 leading-relaxed mb-4">
              Esta ação removerá para sempre o clube, jogadores, agenda e todos os dados registados. Não é possível recuperar após confirmação.
            </p>
            
            <div className="mb-4">
              <label className="text-[10px] font-bold uppercase tracking-wider text-rose-500/70 mb-2 block">
                Digita "Sporting FC" para confirmar
              </label>
              <input
                type="text"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder="Sporting FC"
                className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-white placeholder-rose-500/30 focus-visible:ring-[3px] focus-visible:ring-rose-500/40 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={!showDeleteButton}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-xs font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-600 shadow-[0_8px_25px_-8px_rgba(244,63,94,0.5)] disabled:shadow-none"
          >
            <Trash2 className="h-4 w-4" />
            Sim, Eliminar Permanentemente
          </button>
        </div>
      </div>
    </div>
  );
}
