/** Sample catalog used by the Products page and the global search palette. */

export type Product = { id: number; name: string; category: string; price: number; command: string; description: string; color: string; inStock: boolean };
export const initialProducts: Product[] = [
  { id: 1, name: "Cica Toner", category: "Skincare", price: 12000, command: "/item_01", description: "Calming toner for everyday skin care.", color: "from-indigo-100 to-sky-50", inStock: true },
  { id: 2, name: "Sunscreen SPF50", category: "Skincare", price: 16500, command: "/item_02", description: "Lightweight daily UV protection.", color: "from-amber-100 to-orange-50", inStock: true },
  { id: 3, name: "Lip Tint Set", category: "Beauty", price: 15000, command: "/item_03", description: "Three shades in one ready-to-gift set.", color: "from-rose-100 to-pink-50", inStock: true },
  { id: 4, name: "Everyday Tote Bag", category: "Fashion", price: 22000, command: "/item_04", description: "Durable canvas tote for everyday carry.", color: "from-emerald-100 to-teal-50", inStock: false },
  { id: 5, name: "Moisturizer", category: "Skincare", price: 20000, command: "/item_05", description: "Hydrating gel moisturizer for all skin types.", color: "from-violet-100 to-indigo-50", inStock: true },
  { id: 6, name: "Body Lotion", category: "Body Care", price: 13000, command: "/item_06", description: "Soft floral body lotion with lasting moisture.", color: "from-cyan-100 to-sky-50", inStock: true },
];
