import { beforeEach, describe, expect, it, vi } from "vitest";

const { calls, sonner } = vi.hoisted(() => {
  const calls: { message: unknown; id: unknown }[] = [];
  const record = (message: unknown, options?: { id?: unknown }) => {
    calls.push({ message, id: options?.id });
  };
  const sonner = Object.assign(vi.fn(record), {
    success: vi.fn(record),
    error: vi.fn(record),
    warning: vi.fn(record),
    info: vi.fn(record),
    dismiss: vi.fn(),
  });
  return { calls, sonner };
});
vi.mock("sonner", () => ({ toast: sonner }));

import { SINGLE_TOAST_ID, toast } from "./toast";

describe("single-instance toast", () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it("always uses the same id so repeated toasts replace each other", () => {
    toast("a");
    toast("b");
    toast.success("c");
    toast.error("d");
    expect(calls).toHaveLength(4);
    expect(new Set(calls.map(call => call.id))).toEqual(new Set([SINGLE_TOAST_ID]));
  });

  it("dismiss targets the shared toast", () => {
    toast.dismiss();
    expect(sonner.dismiss).toHaveBeenCalledWith(SINGLE_TOAST_ID);
  });
});
