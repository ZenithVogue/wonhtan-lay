/** Lets other components (e.g. the command palette) open the shop modal owned by ShopSwitcher. */

export const OPEN_SHOP_MODAL_EVENT = "wl:open-shop-modal";

export type OpenShopModalDetail = { kind: "create" } | { kind: "edit"; shopId?: string };

export function openShopModal(detail: OpenShopModalDetail): void {
  window.dispatchEvent(new CustomEvent<OpenShopModalDetail>(OPEN_SHOP_MODAL_EVENT, { detail }));
}
