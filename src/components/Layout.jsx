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
          {children}
        </main>
      </div>

      <MobileTabBar />
    </div>
  );
}
