import { toast as sonnerToast, type ExternalToast } from "sonner";

/**
 * Single-instance toasts.
 *
 * Every toast in the app shares one id, so showing a new toast replaces the one
 * on screen instead of stacking — repeated clicks never produce duplicates and
 * at most one toast is ever visible.
 */
export const SINGLE_TOAST_ID = "wl-single-toast";

type Message = Parameters<typeof sonnerToast>[0];

function show(message: Message, options?: ExternalToast) {
  return sonnerToast(message, { ...options, id: SINGLE_TOAST_ID });
}

export const toast = Object.assign(show, {
  success: (message: Message, options?: ExternalToast) => sonnerToast.success(message, { ...options, id: SINGLE_TOAST_ID }),
  error: (message: Message, options?: ExternalToast) => sonnerToast.error(message, { ...options, id: SINGLE_TOAST_ID }),
  warning: (message: Message, options?: ExternalToast) => sonnerToast.warning(message, { ...options, id: SINGLE_TOAST_ID }),
  info: (message: Message, options?: ExternalToast) => sonnerToast.info(message, { ...options, id: SINGLE_TOAST_ID }),
  dismiss: () => sonnerToast.dismiss(SINGLE_TOAST_ID),
});
