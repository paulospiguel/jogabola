import Footer from "@/components/footer";
import HeaderHome from "@/components/header";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <HeaderHome />
      {children}
      <Footer />
    </div>
  );
}
