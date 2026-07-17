"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lock, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CreateTeamSheet } from "./create-team-sheet";

interface NoTeamModalProps {
  open: boolean;
  onClose: () => void;
}

export function NoTeamModal({ open, onClose }: NoTeamModalProps) {
  const t = useTranslations("arenaNoTeamModal");
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  const handleCreateClick = () => {
    setShowCreateSheet(true);
  };

  const handleCloseAll = () => {
    setShowCreateSheet(false);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {open && !showCreateSheet && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.93, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="fixed top-1/2 left-1/2 z-[101] w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl"
            >
              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 flex size-7 items-center justify-center rounded-full bg-white/8 text-white/40 transition-colors hover:bg-white/15 hover:text-white/70"
              >
                <X size={14} />
              </button>

              {/* Icon */}
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-arena-primary/10">
                <Lock size={20} className="text-arena-primary" />
              </div>

              {/* Content */}
              <h2 className="mb-2 text-base font-bold text-white">
                {t("title")}
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-white/50">
                {t("description")}
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleCreateClick}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl bg-arena-primary text-sm font-semibold text-black transition-all hover:bg-arena-primary/90"
                >
                  <Plus size={15} />
                  {t("createTeam")}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 rounded-xl text-sm font-medium text-white/40 transition-colors hover:text-white/70"
                >
                  {t("notNow")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {showCreateSheet && <CreateTeamSheet onClose={handleCloseAll} />}
    </>
  );
}
