import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AthleteChatComingSoonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  void params;

  return (
    <div className="jb-page">
      <div className="jb-page-inner flex min-h-[60vh] items-center justify-center">
        <section className="w-full max-w-md rounded-[20px] border border-arena-border bg-arena-surface p-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-[16px] border border-arena-primary/25 bg-arena-primary/10 text-arena-primary">
            <MessageCircle size={26} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-arena-text-muted">
            Em breve
          </p>
          <h1 className="mt-2 font-sora text-2xl font-bold text-arena-text">
            Chat com atleta
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-arena-text-sec">
            Esta conversa vai ficar disponível numa próxima versão. Por agora,
            usa o email no card do atleta para comunicar diretamente.
          </p>
          <Button
            asChild
            variant="outline"
            className="mt-6 rounded-[14px] border-arena-border bg-arena-bg text-arena-text-sec hover:text-arena-primary"
          >
            <Link href="/arena/squads">
              <ArrowLeft size={16} />
              Voltar ao plantel
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
