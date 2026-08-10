import React, { useRef, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileTabBar from "./MobileTabBar";
import OfflineBanner from "./OfflineBanner";

export default function Layout({ children, title, subtitle, showTitleOnMobile, hideHeaderActions }) {
  const [collapsed, setCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mainRef = useRef(null);

  const toggleSidebar = () => setCollapsed(!collapsed);
  const handleScroll = () => setScrolled((mainRef.current?.scrollTop || 0) > 8);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[var(--color-primary-soft)] via-[var(--color-background)] to-[var(--color-background)] dark:bg-none dark:bg-background text-text relative">
      <Sidebar collapsed={collapsed} />
      <OfflineBanner />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar
          toggleSidebar={toggleSidebar}
          title={title}
          subtitle={subtitle}
          showTitleOnMobile={showTitleOnMobile}
          hideHeaderActions={hideHeaderActions}
          scrolled={scrolled}
        />

        {/* Contenido scrolleable: pasa POR DEBAJO del header (absolute) para que el blur tenga algo que desenfocar */}
        <main
          ref={mainRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 pt-20 pb-24 md:px-8 md:pt-20 md:pb-6 relative"
        >
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-teal-100/30 to-teal-200/20 dark:from-teal-500/10 dark:to-teal-700/5 blur-3xl"></div>
            <div className="absolute bottom-[-15%] left-[-5%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-blue-100/20 to-teal-200/10 dark:from-blue-500/10 dark:to-teal-700/5 blur-3xl"></div>
          </div>
          <div className="relative z-10">
          {children}
          </div>
        </main>
      </div>

      <MobileTabBar />
    </div>
  );
}
