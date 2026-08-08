import { useEffect, useState } from "react";
import {
  Check,
  Tag,
  ShoppingCart,
  Coffee,
  Home,
  Car,
  Bus,
  Train,
  Heart,
  Pill,
  DollarSign,
  Gift,
  CreditCard,
  Briefcase,
  Utensils,
  Gamepad2,
  Shirt,
  Plane,
  Smartphone,
  Book,
  Scissors,
  Baby,
  Bike,
  Dumbbell,
  Laptop,
  Tv,
  GraduationCap,
  Wine,
  Music,
  Ticket,
  Wallet,
  PiggyBank,
  Landmark,
  Building2,
  TrendingUp,
  TrendingDown,
  Fuel,
  Wrench,
  Stethoscope,
  PawPrint,
  Trees,
  Umbrella,
  Wifi,
  Camera,
  Film,
  Headphones,
  ShoppingBag,
  Package,
  Truck,
  Coins,
  Banknote,
  ReceiptText,
  Droplet,
  Zap,
  Flame,
  Trash2,
  Paintbrush,
  Guitar,
  BookOpen,
  Newspaper,
  Users,
  HeartHandshake,
  HandCoins,
  Cat,
  Dog,
  MapPin,
} from "lucide-react";
import ModalPortal from "./ModalPortal";

const ICONS = [
  { component: Tag, englishName: "Tag" },
  { component: ShoppingCart, englishName: "ShoppingCart" },
  { component: Coffee, englishName: "Coffee" },
  { component: Home, englishName: "Home" },
  { component: Car, englishName: "Car" },
  { component: Bus, englishName: "Bus" },
  { component: Train, englishName: "Train" },
  { component: Heart, englishName: "Heart" },
  { component: Pill, englishName: "Pill" },
  { component: DollarSign, englishName: "DollarSign" },
  { component: Gift, englishName: "Gift" },
  { component: CreditCard, englishName: "CreditCard" },
  { component: Briefcase, englishName: "Briefcase" },
  { component: Utensils, englishName: "Utensils" },
  { component: Gamepad2, englishName: "Gamepad2" },
  { component: Shirt, englishName: "Shirt" },
  { component: Plane, englishName: "Plane" },
  { component: Smartphone, englishName: "Smartphone" },
  { component: Book, englishName: "Book" },
  { component: Scissors, englishName: "Scissors" },
  { component: Baby, englishName: "Baby" },
  { component: Bike, englishName: "Bike" },
  { component: Dumbbell, englishName: "Dumbbell" },
  { component: Laptop, englishName: "Laptop" },
  { component: Tv, englishName: "Tv" },
  { component: GraduationCap, englishName: "GraduationCap" },
  { component: Wine, englishName: "Wine" },
  { component: Music, englishName: "Music" },
  { component: Ticket, englishName: "Ticket" },
  { component: Wallet, englishName: "Wallet" },
  { component: PiggyBank, englishName: "PiggyBank" },
  { component: Landmark, englishName: "Landmark" },
  { component: Building2, englishName: "Building2" },
  { component: TrendingUp, englishName: "TrendingUp" },
  { component: TrendingDown, englishName: "TrendingDown" },
  { component: Fuel, englishName: "Fuel" },
  { component: Wrench, englishName: "Wrench" },
  { component: Stethoscope, englishName: "Stethoscope" },
  { component: PawPrint, englishName: "PawPrint" },
  { component: Trees, englishName: "Trees" },
  { component: Umbrella, englishName: "Umbrella" },
  { component: Wifi, englishName: "Wifi" },
  { component: Camera, englishName: "Camera" },
  { component: Film, englishName: "Film" },
  { component: Headphones, englishName: "Headphones" },
  { component: ShoppingBag, englishName: "ShoppingBag" },
  { component: Package, englishName: "Package" },
  { component: Truck, englishName: "Truck" },
  { component: Coins, englishName: "Coins" },
  { component: Banknote, englishName: "Banknote" },
  { component: ReceiptText, englishName: "ReceiptText" },
  { component: Droplet, englishName: "Droplet" },
  { component: Zap, englishName: "Zap" },
  { component: Flame, englishName: "Flame" },
  { component: Trash2, englishName: "Trash2" },
  { component: Paintbrush, englishName: "Paintbrush" },
  { component: Guitar, englishName: "Guitar" },
  { component: BookOpen, englishName: "BookOpen" },
  { component: Newspaper, englishName: "Newspaper" },
  { component: Users, englishName: "Users" },
  { component: HeartHandshake, englishName: "HeartHandshake" },
  { component: HandCoins, englishName: "HandCoins" },
  { component: Cat, englishName: "Cat" },
  { component: Dog, englishName: "Dog" },
  { component: MapPin, englishName: "MapPin" },
];

const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#ca8a04", "#84cc16",
  "#65a30d", "#22c55e", "#10b981", "#14b8a6", "#06b6d4",
  "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
  "#d946ef", "#ec4899", "#f43f5e", "#fb7185", "#fda4af",
  "#94a3b8", "#78716c", "#57534e", "#44403c", "#1c1917",
  "#b91c1c", "#7c2d12", "#9a3412", "#c2410c", "#a16207",
];

export default function IconColorPickerSheet({ open, onClose, icon, color, onApply }) {
  const [tab, setTab] = useState("icon");
  const [draftIcon, setDraftIcon] = useState(icon);
  const [draftColor, setDraftColor] = useState(color);

  useEffect(() => {
    if (open) {
      setDraftIcon(icon);
      setDraftColor(color);
      setTab("icon");
    }
  }, [open, icon, color]);

  const handleApply = () => {
    onApply(draftIcon, draftColor);
    onClose();
  };

  const DraftIcon = ICONS.find((i) => i.englishName === draftIcon)?.component || Tag;

  return (
    <ModalPortal isOpen={open}>
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full self-end rounded-t-3xl bg-surface border-t border-divider shadow-2xl pt-5 px-5 pb-8 max-h-[75vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 rounded-full bg-divider mx-auto mb-4 shrink-0" />

        <div className="flex justify-center mb-4 shrink-0">
          <span
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${draftColor}20` }}
          >
            <DraftIcon size={28} style={{ color: draftColor }} />
          </span>
        </div>

        <div className="flex items-center gap-6 border-b border-divider mb-4 shrink-0">
          <button
            type="button"
            onClick={() => setTab("icon")}
            className={`cursor-pointer pb-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === "icon"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-text-tertiary"
            }`}
          >
            Ícono
          </button>
          <button
            type="button"
            onClick={() => setTab("color")}
            className={`cursor-pointer pb-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === "color"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-text-tertiary"
            }`}
          >
            Color
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-1">
          {tab === "icon" ? (
            <div className="grid grid-cols-5 gap-3 pb-2">
              {ICONS.map((item) => {
                const IconComp = item.component;
                const isSelected = item.englishName === draftIcon;
                return (
                  <button
                    key={item.englishName}
                    type="button"
                    onClick={() => setDraftIcon(item.englishName)}
                    className={`cursor-pointer aspect-square rounded-2xl flex items-center justify-center transition-colors ${
                      isSelected ? "bg-surface-alt ring-2 ring-[var(--color-primary)]" : "hover:bg-hover"
                    }`}
                  >
                    <IconComp size={20} style={{ color: isSelected ? draftColor : undefined }} className={isSelected ? "" : "text-text-secondary"} />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-3 pb-2">
              {COLORS.map((hex) => {
                const isSelected = hex === draftColor;
                return (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setDraftColor(hex)}
                    aria-label={hex}
                    className="cursor-pointer aspect-square rounded-full flex items-center justify-center"
                    style={{ backgroundColor: hex }}
                  >
                    {isSelected && <Check size={18} className="text-white" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 shrink-0">
          <button
            type="button"
            onClick={handleApply}
            className="cursor-pointer text-sm font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-1"
          >
            Aplicar
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}
