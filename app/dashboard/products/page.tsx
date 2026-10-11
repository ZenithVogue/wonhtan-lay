"use client";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type DragEvent,
  type FormEvent,
  type SetStateAction,
} from "react";
import {
  ChevronRight,
  Edit3,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type Product = {
  id: number | string;
  name: string;
  category: string;
  price: number;
  command: string;
  description: string;
  color: string;
  inStock: boolean;
  imageUrl?: string;
};

type ProductForm = {
  name: string;
  price: string;
  description: string;
  command: string;
  category: string;
};

const PRODUCTS_STORAGE_KEY = "wonhtan-lay-products-v1";
const PRODUCT_IMAGES_BUCKET = "product-images";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const EMPTY_FORM: ProductForm = {
  name: "",
  price: "",
  description: "",
  command: "",
  category: "Skincare",
};

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Cica Toner",
    category: "Skincare",
    price: 12000,
    command: "/item_01",
    description: "Calming toner for everyday skin care.",
    color: "from-indigo-100 to-sky-50",
    inStock: true,
  },
  {
    id: 2,
    name: "Sunscreen SPF50",
    category: "Skincare",
    price: 16500,
    command: "/item_02",
    description: "Lightweight daily UV protection.",
    color: "from-amber-100 to-orange-50",
    inStock: true,
  },
  {
    id: 3,
    name: "Lip Tint Set",
    category: "Beauty",
    price: 15000,
    command: "/item_03",
    description: "Three shades in one ready-to-gift set.",
    color: "from-rose-100 to-pink-50",
    inStock: true,
  },
  {
    id: 4,
    name: "Everyday Tote Bag",
    category: "Fashion",
    price: 22000,
    command: "/item_04",
    description: "Durable canvas tote for everyday carry.",
    color: "from-emerald-100 to-teal-50",
    inStock: false,
  },
  {
    id: 5,
    name: "Moisturizer",
    category: "Skincare",
    price: 20000,
    command: "/item_05",
    description: "Hydrating gel moisturizer for all skin types.",
    color: "from-violet-100 to-indigo-50",
    inStock: true,
  },
  {
    id: 6,
    name: "Body Lotion",
    category: "Body Care",
    price: 13000,
    command: "/item_06",
    description: "Soft floral body lotion with lasting moisture.",
    color: "from-cyan-100 to-sky-50",
    inStock: true,
  },
];

function formatMMK(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function createUniqueId() {
  return typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeCommandKey(value: string) {
  const trimmed = value.trim();
  return trimmed ? `/${trimmed.replace(/^\/+/, "")}` : "";
}

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const product = value as Record<string, unknown>;
  return (
    (typeof product.id === "number" || typeof product.id === "string") &&
    typeof product.name === "string" &&
    typeof product.category === "string" &&
    typeof product.price === "number" &&
    typeof product.command === "string" &&
    typeof product.description === "string" &&
    typeof product.color === "string" &&
    typeof product.inStock === "boolean" &&
    (product.imageUrl === undefined || typeof product.imageUrl === "string")
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(new Error("The selected image could not be read."));
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("The selected image could not be read."));
    };
    reader.readAsDataURL(file);
  });
}

async function uploadProductImage(file: File) {
  const supabase = getSupabaseBrowserClient();

  // Keep the catalog usable in local/demo mode. When Supabase is configured,
  // upload the file and store the public URL on the product instead.
  if (!supabase) return readFileAsDataUrl(file);

  const extensionByMimeType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  };
  const filePath = `products/${createUniqueId()}.${extensionByMimeType[file.type] ?? "img"}`;
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(filePath);
  return data.publicUrl;
}

export default function Products() {
  const [products, setProducts] = useState(initialProducts);
  const [productsHydrated, setProductsHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<Product["id"] | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedProducts = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (savedProducts) {
        const parsed: unknown = JSON.parse(savedProducts);
        if (Array.isArray(parsed) && parsed.every(isProduct))
          setProducts(parsed);
      }
    } catch (error) {
      console.warn("Could not restore the saved product catalog:", error);
    } finally {
      setProductsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!productsHydrated) return;
    try {
      window.localStorage.setItem(
        PRODUCTS_STORAGE_KEY,
        JSON.stringify(products)
      );
    } catch (error) {
      // Supabase-hosted images remain available even if the browser's local
      // catalog storage is full; keep the current session usable regardless.
      console.warn(
        "Could not persist the product catalog in this browser:",
        error
      );
    }
  }, [products, productsHydrated]);

  const filteredProducts = products.filter(product =>
    `${product.name} ${product.category} ${product.command}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setImageUrl(null);
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: String(product.price),
      description: product.description,
      command: normalizeCommandKey(product.command),
      category: product.category,
    });
    setImageUrl(product.imageUrl ?? null);
    setShowModal(true);
  };

  const submitProduct = async (
    event: FormEvent<HTMLFormElement>,
    selectedImage: File | null
  ) => {
    event.preventDefault();
    const name = form.name.trim();
    const price = Number(form.price);

    if (!name || !form.price.trim() || !Number.isFinite(price) || price < 0) {
      toast("Product name နဲ့ မှန်ကန်တဲ့ price ဖြည့်ပေးပါ");
      return;
    }

    let nextImageUrl = imageUrl ?? undefined;
    if (selectedImage) {
      try {
        nextImageUrl = await uploadProductImage(selectedImage);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Please try again.";
        toast("Image upload failed", {
          description: `${message} Supabase အသုံးပြုနေပါက product-images storage migration ကို run လုပ်ထားကြောင်း စစ်ဆေးပါ။`,
        });
        return;
      }
    }

    const existingProduct = products.find(product => product.id === editingId);
    const normalizedCommand = normalizeCommandKey(form.command);
    const nextProduct: Product = {
      id: editingId ?? createUniqueId(),
      name,
      category: form.category,
      price,
      command:
        normalizedCommand ||
        existingProduct?.command ||
        `/item_${String(products.length + 1).padStart(2, "0")}`,
      description: form.description.trim() || "New product in your catalog.",
      color: existingProduct?.color ?? "from-indigo-100 to-sky-50",
      inStock: existingProduct?.inStock ?? true,
      imageUrl: nextImageUrl,
    };

    if (editingId === null) {
      setProducts(items => [nextProduct, ...items]);
    } else {
      setProducts(items =>
        items.map(item => (item.id === editingId ? nextProduct : item))
      );
    }

    setShowModal(false);
    toast(editingId === null ? "Product added" : "Product updated", {
      description: `${nextProduct.name} ကို catalog ထဲ ${editingId === null ? "ထည့်ပြီး" : "ပြင်ဆင်ပြီး"}ပါပြီ။`,
    });
  };

  const deleteProduct = (product: Product) => {
    setProducts(items => items.filter(item => item.id !== product.id));
    toast("Product deleted", {
      description: `${product.name} ကို catalog မှ ဖယ်ရှားပြီးပါပြီ။`,
    });
  };

  return (
    <DashboardShell title="Products" titleMyanmar="ပစ္စည်းစာရင်းများ">
      <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <Link
              href="/workspace"
              className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Workspace
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-emerald-300">Products</span>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            ပစ္စည်းစာရင်းများ{" "}
            <span className="text-indigo-600 dark:text-indigo-300">
              (Product Catalog)
            </span>
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Bot က အော်ဒါလက်ခံတဲ့အခါ အသုံးပြုမယ့် ပစ္စည်းနဲ့ ဈေးနှုန်းတွေကို
            စီမံပါ။
          </p>
        </div>
        <button className="button-primary w-fit" onClick={openAdd}>
          <Plus className="size-4" /> ပစ္စည်းအသစ်ထည့်မည်
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            className="dashboard-search w-full pl-9"
            placeholder="ပစ္စည်းအမည်၊ category သို့မဟုတ် command ရှာရန်"
            aria-label="Search products"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <Package className="size-4 text-indigo-600 dark:text-indigo-300" />{" "}
          {products.length} products
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.map(product => (
          <article
            key={product.id}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="relative">
              <ProductThumbnail product={product} />
              <span
                className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                  product.inStock
                    ? "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
                    : "border-slate-300 bg-white/80 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {product.inStock ? "In stock" : "Out of stock"}
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">
                    {product.category}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
                    {product.name}
                  </h3>
                </div>
                <p className="whitespace-nowrap text-sm font-bold text-slate-900 dark:text-white">
                  {formatMMK(product.price)}{" "}
                  <span className="text-[10px] text-slate-500">MMK</span>
                </p>
              </div>
              <p className="mt-3 min-h-10 text-xs leading-5 text-slate-600 dark:text-slate-400">
                {product.description}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <code className="rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {product.command}
                </code>
                <label className="flex cursor-pointer items-center gap-2 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={product.inStock}
                    onChange={() =>
                      setProducts(items =>
                        items.map(item =>
                          item.id === product.id
                            ? { ...item, inStock: !item.inStock }
                            : item
                        )
                      )
                    }
                  />
                  <span className="relative h-5 w-9 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500 dark:bg-slate-700">
                    <span className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
                  </span>
                  {product.inStock ? "Active" : "Off"}
                </label>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  onClick={() => openEdit(product)}
                >
                  <Edit3 className="size-3.5" /> Edit Product
                </button>
                <button
                  className="flex size-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 dark:border-rose-400/20 dark:text-rose-300 dark:hover:bg-rose-400/10"
                  onClick={() => deleteProduct(product)}
                  aria-label={`Delete ${product.name}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {filteredProducts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <Package className="mx-auto size-8 text-slate-400" />
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            ပစ္စည်းမတွေ့ပါ
          </p>
        </div>
      )}

      {showModal && (
        <AddProductModal
          key={editingId ?? "new-product"}
          form={form}
          setForm={setForm}
          imageUrl={imageUrl}
          isEditing={editingId !== null}
          onClose={() => setShowModal(false)}
          onSubmit={submitProduct}
        />
      )}
    </DashboardShell>
  );
}

function ProductThumbnail({ product }: { product: Product }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [product.imageUrl]);

  return (
    <div
      className={`relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br ${product.color}`}
    >
      {product.imageUrl && !imageFailed ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="flex size-16 items-center justify-center rounded-2xl bg-white/75 text-indigo-700 shadow-sm backdrop-blur">
          <Package className="size-8" />
        </div>
      )}
    </div>
  );
}

function AddProductModal({
  form,
  setForm,
  imageUrl,
  isEditing,
  onClose,
  onSubmit,
}: {
  form: ProductForm;
  setForm: Dispatch<SetStateAction<ProductForm>>;
  imageUrl: string | null;
  isEditing: boolean;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
    selectedImage: File | null
  ) => Promise<void>;
}) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previewObjectUrl = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (previewObjectUrl.current)
        URL.revokeObjectURL(previewObjectUrl.current);
    },
    []
  );

  const update = (key: keyof ProductForm, value: string) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const chooseImage = (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast("Unsupported image format", {
        description: "JPG, PNG, WebP, GIF သို့မဟုတ် AVIF ပုံကို ရွေးပါ။",
      });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast("Image is too large", {
        description: "ပုံဖိုင်အရွယ်အစား 5 MB ထက် မကျော်ရပါ။",
      });
      return;
    }

    if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    const objectUrl = URL.createObjectURL(file);
    previewObjectUrl.current = objectUrl;
    setSelectedImage(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    chooseImage(event.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(event, selectedImage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? "Edit product" : "Add product"}
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[calc(100vh-3rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">
              Product catalog
            </p>
            <h2 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
              {isEditing ? "ပစ္စည်းပြင်ဆင်မည်" : "ပစ္စည်းအသစ်ထည့်မည်"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="form-label">Product Name</span>
            <input
              className="form-input"
              value={form.name}
              onChange={event => update("name", event.target.value)}
              placeholder="ဥပမာ - Cica Toner"
              required
            />
          </label>
          <label>
            <span className="form-label">Price (MMK)</span>
            <input
              className="form-input"
              type="number"
              min={0}
              step={50}
              value={form.price}
              onChange={event => update("price", event.target.value)}
              placeholder="12000"
              required
            />
          </label>
          <label>
            <span className="form-label">Category</span>
            <select
              className="form-input"
              value={form.category}
              onChange={event => update("category", event.target.value)}
            >
              <option>Skincare</option>
              <option>Fashion</option>
              <option>Beauty</option>
              <option>Body Care</option>
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className="form-label">Description</span>
            <textarea
              className="form-input min-h-20 resize-none"
              value={form.description}
              onChange={event => update("description", event.target.value)}
              placeholder="ပစ္စည်းအကြောင်း အတိုချုံးဖော်ပြပါ"
            />
          </label>

          <div className="sm:col-span-2">
            <span className="form-label">Image Upload</span>
            <label
              className={`mt-1 flex min-h-28 cursor-pointer items-center gap-4 rounded-xl border border-dashed p-4 text-xs transition ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-400/10"
                  : "border-slate-300 bg-slate-50 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-400"
              }`}
              onDragOver={event => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Product image preview"
                  className="size-20 shrink-0 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
                />
              ) : (
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300">
                  <Package className="size-6" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-slate-700 dark:text-slate-200">
                  {selectedImage?.name ??
                    (previewUrl
                      ? "Current product image"
                      : "ပုံဖိုင်ရွေးရန် သို့မဟုတ် ဒီနေရာကို ဆွဲချပါ")}
                </span>
                <span className="mt-1 block text-[11px] text-slate-500">
                  JPG, PNG, WebP, GIF, AVIF · 5 MB အထိ
                </span>
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                Browse
              </span>
              <input
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                className="sr-only"
                aria-label="Choose product image"
                onChange={event => {
                  chooseImage(event.currentTarget.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>

          <label className="sm:col-span-2">
            <span className="form-label">Bot Command Key</span>
            <input
              className="form-input font-mono"
              value={form.command}
              onChange={event =>
                update("command", normalizeCommandKey(event.target.value))
              }
              placeholder="/item_01"
            />
            <span className="mt-1.5 block text-[11px] leading-5 text-slate-500 dark:text-slate-400">
              Telegram Bot တွင် အသုံးပြုမည့် Command ဟု သတ်မှတ်ပါ (ဥပမာ-
              /skincare_01)
            </span>
          </label>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="button-secondary justify-center"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button-primary justify-center"
            disabled={isSubmitting}
          >
            {isEditing ? (
              <Edit3 className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
