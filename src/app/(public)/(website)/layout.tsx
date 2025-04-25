import Footer from "@/components/footer";
import HeaderHome from "@/components/header";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="bg-background sticky top-0 z-20 flex min-h-16 items-center gap-4 border-b px-4 py-4 md:px-6 dark:border-zinc-800 dark:bg-black">
        <HeaderHome />
      </header>
      {children}
      <Footer />
    </div>
  );
}
