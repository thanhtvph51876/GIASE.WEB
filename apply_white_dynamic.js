const fs = require('fs');

try {
  let css = fs.readFileSync('H:/website-clone/app/globals.css', 'utf8');

  // 1. Make it Stark White instead of Warm Cream
  css = css.replace(/--premium-bg-cream: #fdfbf7;/g, '--premium-bg-cream: #ffffff;');
  css = css.replace(/--background: #fdfbf7;/g, '--background: #ffffff;');
  css = css.replace(/--muted: #f4f1ea;/g, '--muted: #f8fafc;');
  
  // Body background
  css = css.replace(/linear-gradient\(180deg, #fdfbf7 0%, #fffaf0 42%, #ffffff 100%\)/g, 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)');

  // 2. Vibrant Aurora Mesh Gradient
  const oldGradient = `  .app-gradient-bg {
    background-color: var(--premium-bg-cream);
    background-image:
      radial-gradient(circle at 12% 8%, rgba(240, 253, 244, 0.95), transparent 30%),
      radial-gradient(circle at 88% 10%, rgba(250, 245, 255, 0.82), transparent 32%),
      radial-gradient(circle at 68% 88%, rgba(253, 230, 138, 0.28), transparent 30%),
      linear-gradient(180deg, #fdfbf7 0%, #fffaf0 48%, #ffffff 100%);
    background-size: 130% 130%, 125% 125%, 135% 135%, 100% 100%;
    animation: gradient-drift 22s ease-in-out infinite alternate;
  }`;

  const newGradient = `  .app-gradient-bg {
    background-color: #ffffff;
    background-image:
      radial-gradient(circle at 15% 0%, rgba(16, 185, 129, 0.15), transparent 25%),
      radial-gradient(circle at 85% 15%, rgba(56, 189, 248, 0.15), transparent 30%),
      radial-gradient(circle at 50% 100%, rgba(251, 146, 60, 0.1), transparent 40%),
      linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%);
    background-size: 130% 130%, 125% 125%, 135% 135%, 100% 100%;
    background-attachment: fixed;
    animation: gradient-drift 15s ease-in-out infinite alternate;
  }`;
  css = css.replace(oldGradient, newGradient);

  // 3. Pro Glass Cards (Inner borders + Deep Soft Shadows)
  const oldGlassCardStrong = `  .glass-card-strong {
    border: 1px solid rgba(255, 255, 255, 0.62);
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.78));
    box-shadow: 0 26px 80px -42px rgba(15, 23, 42, 0.38);
    backdrop-filter: blur(18px) saturate(1.08);
    -webkit-backdrop-filter: blur(18px) saturate(1.08);
  }`;

  const newGlassCardStrong = `  .glass-card-strong {
    border: 1px solid rgba(255, 255, 255, 0.9);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.75) 100%);
    box-shadow: 
      0 10px 40px -10px rgba(15, 23, 42, 0.08),
      inset 0 1px 2px rgba(255, 255, 255, 1);
    backdrop-filter: blur(24px) saturate(1.2);
    -webkit-backdrop-filter: blur(24px) saturate(1.2);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
  }
  
  .glass-card-strong:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 24px 50px -12px rgba(15, 23, 42, 0.12),
      0 10px 20px -4px rgba(16, 185, 129, 0.08),
      inset 0 1px 2px rgba(255, 255, 255, 1);
  }`;
  css = css.replace(oldGlassCardStrong, newGlassCardStrong);

  const oldGlassHeader = `  .floating-glass-header {
    border: 1px solid rgba(255, 255, 255, 0.62);
    background: rgba(255, 255, 255, 0.78);
    box-shadow: 0 18px 52px -34px rgba(15, 23, 42, 0.38);
    backdrop-filter: blur(16px) saturate(1.08);
    -webkit-backdrop-filter: blur(16px) saturate(1.08);
  }`;

  const newGlassHeader = `  .floating-glass-header {
    border: 1px solid rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.7);
    box-shadow: 
      0 8px 32px -8px rgba(15, 23, 42, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 1);
    backdrop-filter: blur(20px) saturate(1.2);
    -webkit-backdrop-filter: blur(20px) saturate(1.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }`;
  css = css.replace(oldGlassHeader, newGlassHeader);

  fs.writeFileSync('H:/website-clone/app/globals.css', css);


  // Update page.tsx
  let page = fs.readFileSync('H:/website-clone/app/page.tsx', 'utf8');

  // 1. Imports
  page = page.replace(/import Link from "next\/link"/g, 'import Link from "next/link"\nimport { useEffect } from "react"');

  // 2. useEffect
  const oldPageFunc = `export default function HomePage() {
  const { data: stats, error: statsError, mutate: refreshStats } = useSWR("public-stats", () => publicApi.stats(), {
    revalidateOnFocus: false,
  })`;
  const newPageFunc = `export default function HomePage() {
  useEffect(() => {
    document.documentElement.classList.add("reveal-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    const elements = document.querySelectorAll(".reveal, .stagger-list, .stagger-item, .content-fade-up");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const { data: stats, error: statsError, mutate: refreshStats } = useSWR("public-stats", () => publicApi.stats(), {
    revalidateOnFocus: false,
  })`;
  page = page.replace(oldPageFunc, newPageFunc);

  // 3. Hero Section blobs
  const oldHero = `      <main className="flex-1">
        <section className="gradient-mesh relative overflow-hidden pb-12 pt-14 md:pb-16 md:pt-20">
          <div className="premium-container">`;
  const newHero = `      <main className="flex-1">
        <section className="gradient-mesh relative overflow-hidden pb-12 pt-14 md:pb-16 md:pt-20">
          <div className="floating-blob blob-primary" style={{ top: "10%", left: "5%" }} />
          <div className="floating-blob blob-secondary" style={{ top: "40%", right: "10%" }} />
          <div className="floating-blob blob-accent" style={{ bottom: "20%", left: "30%" }} />
          <div className="premium-container relative z-10">`;
  page = page.replace(oldHero, newHero);

  // 4. Hero Title gradient
  const oldTitle = `<h1 className="max-w-4xl text-balance font-heading text-4xl font-bold tracking-tight text-slate-950 md:text-6xl lg:text-7xl">
                  Tìm gia sư chất lượng cho con bạn
                </h1>`;
  const newTitle = `<h1 className="max-w-4xl text-balance font-heading text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl lg:text-7xl">
                  Tìm gia sư chất lượng cho <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">con bạn</span>
                </h1>`;
  page = page.replace(oldTitle, newTitle);

  // 5. Button Hover Animations
  page = page.replace(/hover:from-emerald-700 hover:to-emerald-600" asChild>/g, 'transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:from-emerald-700 hover:to-emerald-600 hover:shadow-emerald-600/30" asChild>');
  page = page.replace(/hover:from-emerald-700 hover:to-emerald-600">/g, 'transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:from-emerald-700 hover:to-emerald-600 hover:shadow-emerald-600/30">');

  fs.writeFileSync('H:/website-clone/app/page.tsx', page);
  process.stdout.write("Applied White Dynamic Theme successfully\n");
} catch(e) {
  console.error(e);
}
