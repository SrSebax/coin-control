import { useCurrentUser } from "../hooks/useCurrentUser";

export default function UserActions() {
  const { user } = useCurrentUser();

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative">
      <div className="w-9 h-9 bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-sm">
        <span className="text-white text-sm font-bold">
          {getUserInitials(user?.displayName || user?.email?.split("@")[0] || "Usuario")}
        </span>
      </div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-surface rounded-full shadow-sm" />
    </div>
  );
}
