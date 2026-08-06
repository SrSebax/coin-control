import React from "react";
import { 
  ShoppingCart, Coffee, Home, Car, Bus, Train, 
  Heart, Pill, DollarSign, Gift, CreditCard, Briefcase,
  Utensils, Gamepad2, Shirt, Plane, Smartphone, Book,
  Scissors, Baby, Bike, Dumbbell, Laptop, Tv,
  GraduationCap, Wine, Music, Ticket
} from "lucide-react";

const icons = [
  { name: "Carrito", component: ShoppingCart, englishName: "ShoppingCart" },
  { name: "Café", component: Coffee, englishName: "Coffee" },
  { name: "Casa", component: Home, englishName: "Home" },
  { name: "Coche", component: Car, englishName: "Car" },
  { name: "Autobús", component: Bus, englishName: "Bus" },
  { name: "Tren", component: Train, englishName: "Train" },
  { name: "Corazón", component: Heart, englishName: "Heart" },
  { name: "Medicina", component: Pill, englishName: "Pill" },
  { name: "Dinero", component: DollarSign, englishName: "DollarSign" },
  { name: "Regalo", component: Gift, englishName: "Gift" },
  { name: "Tarjeta", component: CreditCard, englishName: "CreditCard" },
  { name: "Trabajo", component: Briefcase, englishName: "Briefcase" },
  { name: "Comida", component: Utensils, englishName: "Utensils" },
  { name: "Juegos", component: Gamepad2, englishName: "Gamepad2" },
  { name: "Ropa", component: Shirt, englishName: "Shirt" },
  { name: "Avión", component: Plane, englishName: "Plane" },
  { name: "Móvil", component: Smartphone, englishName: "Smartphone" },
  { name: "Libro", component: Book, englishName: "Book" },
  { name: "Tijeras", component: Scissors, englishName: "Scissors" },
  { name: "Bebé", component: Baby, englishName: "Baby" },
  { name: "Bicicleta", component: Bike, englishName: "Bike" },
  { name: "Deporte", component: Dumbbell, englishName: "Dumbbell" },
  { name: "Portátil", component: Laptop, englishName: "Laptop" },
  { name: "TV", component: Tv, englishName: "Tv" },
  { name: "Educación", component: GraduationCap, englishName: "GraduationCap" },
  { name: "Vino", component: Wine, englishName: "Wine" },
  { name: "Música", component: Music, englishName: "Music" },
  { name: "Entradas", component: Ticket, englishName: "Ticket" }
];

export default function IconInput({ value, onChange, label = "Icono", name = "icon", error = false }) {
  // El valor sigue siendo el nombre en inglés para mantener compatibilidad
  const selectedIcon = icons.find(icon => icon.englishName === value);

  const handleIconSelect = (iconEnglishName) => {
    onChange({ target: { name, value: iconEnglishName } });
  };

  return (
    <div className="w-full h-full flex flex-col">
      <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-2">
        {label}
      </label>
      
      {selectedIcon && (
        <div className="mb-3 p-2 bg-surface-alt border border-divider rounded-md flex items-center">
          <div className="p-1.5 bg-surface rounded-md shadow-sm mr-2">
            <selectedIcon.component size={20} />
          </div>
          <div className="text-sm font-medium">
            {selectedIcon.name}
          </div>
        </div>
      )}
      
      <div className="w-full p-3 border border-divider rounded-md bg-surface flex-grow">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-2 pb-2 pl-2 pt-2">
          {icons.map((icon) => (
            <button
              key={icon.englishName}
              type="button"
              onClick={() => handleIconSelect(icon.englishName)}
              className={`cursor-pointer p-3 rounded-md hover:bg-surface-alt transition-all duration-200 ${
                icon.englishName === value ? "bg-[var(--color-primary-light)] ring-2 ring-[var(--color-primary)]" : "border border-divider"
              }`}
            >
              <div className="flex flex-col items-center w-full">
                <div className="mb-2 p-1.5">
                  <icon.component size={22} />
                </div>
                <span className="text-xs text-center leading-tight">{icon.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">Por favor selecciona un icono</p>
      )}
    </div>
  );
}