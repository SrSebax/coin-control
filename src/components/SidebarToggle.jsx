import { Menu } from "lucide-react";

export default function SidebarToggle({ toggleSidebar }) {
  return (
    <button
      onClick={toggleSidebar}
      className="hidden md:inline-flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-text hover:bg-hover cursor-pointer"
      aria-label="Alternar sidebar"
    >
      <Menu size={22} />
    </button>
  );
}
