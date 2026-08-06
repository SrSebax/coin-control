import { Menu, X } from "lucide-react";

export default function NavigationControls({ mobileOpen, toggleMobile }) {
  return (
    <button
      onClick={toggleMobile}
      title={mobileOpen ? "Cerrar menú" : "Abrir menú"}
      className="md:hidden text-text-secondary hover:text-text mr-1 cursor-pointer"
      aria-label="Alternar menú móvil"
    >
      {mobileOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );
}
