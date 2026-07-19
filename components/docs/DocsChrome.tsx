import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CalcRain from "@/components/CalcRain";
import WikiShell from "@/components/docs/WikiShell";

export default function DocsChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="scanlines" aria-hidden />
      <CalcRain />
      <Nav />
      <main className="relative z-[2] pt-20 md:pt-24">
        <WikiShell>{children}</WikiShell>
      </main>
      <Footer />
    </>
  );
}
