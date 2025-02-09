// app/(public)/layout.tsx
import type React from "react";

export default function PublicLayout({
  children,
  modal, // Rota paralela para o modal
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {modal}
      {children}
    </>
  );
}
