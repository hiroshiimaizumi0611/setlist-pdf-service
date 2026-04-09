import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SetlistTable } from "../../components/setlist-table";

type TestItem = {
  id: string;
  eventId: string;
  position: number;
  itemType: "song" | "heading" | "mc" | "transition";
  title: string;
  artist: string | null;
  durationSeconds: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const eventId = "event-1";
const baseTimestamp = new Date("2026-03-21T00:00:00.000Z");

afterEach(() => {
  vi.useRealTimers();
});

function createItem(
  id: string,
  title: string,
  itemType: TestItem["itemType"] = "song",
): TestItem {
  return {
    id,
    eventId,
    position: 1,
    itemType,
    title,
    artist: null,
    durationSeconds: null,
    notes: null,
    createdAt: baseTimestamp,
    updatedAt: baseTimestamp,
  };
}

function deferredPromise<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

function getRenderedTitles(section: HTMLElement) {
  return Array.from(section.querySelectorAll("article")).map((row) => {
    const title = row.querySelector("[data-row-title], [data-row-cue=\"heading\"]");

    if (!title) {
      throw new Error("expected row title");
    }

    return title.textContent ?? "";
  });
}

describe("SetlistTable", () => {
  it("updates the DOM order immediately after a drag drop while the reorder action is in flight", async () => {
    const pendingReorder = deferredPromise<void>();
    const reorderItemsAction = vi.fn().mockReturnValue(pendingReorder.promise);
    const items = [
      createItem("item-1", "1曲目"),
      createItem("item-2", "2曲目"),
      createItem("item-3", "3曲目"),
    ];

    const { rerender } = render(
      <SetlistTable
        currentTheme="light"
        eventId={eventId}
        items={items}
        reorderItemsAction={reorderItemsAction}
      />,
    );

    const setlistSection = screen.getByRole("heading", { name: "セットリスト" }).closest("section");
    expect(setlistSection).toBeTruthy();
    if (!setlistSection) {
      throw new Error("expected setlist section");
    }

    const songRows = setlistSection.querySelectorAll('article[data-row-variant="song"]');
    const firstRow = songRows[0] as HTMLElement;
    const thirdRow = songRows[2] as HTMLElement;
    const firstHandle = within(firstRow).getByLabelText("1曲目 をドラッグして並び替え");

    fireEvent.dragStart(firstHandle, {
      dataTransfer: {
        effectAllowed: "move",
        setData: vi.fn(),
      },
    });
    fireEvent.dragOver(thirdRow, {
      dataTransfer: {
        dropEffect: "move",
      },
    });
    fireEvent.drop(thirdRow, {
      dataTransfer: {
        dropEffect: "move",
      },
    });

    expect(getRenderedTitles(setlistSection)).toEqual(["2曲目", "1曲目", "3曲目"]);
    expect(screen.getByText("並び順を更新中...")).toBeInTheDocument();
    expect(reorderItemsAction).toHaveBeenCalledWith({
      eventId,
      orderedItemIds: ["item-2", "item-1", "item-3"],
    });

    const secondHandle = within(songRows[1] as HTMLElement).getByLabelText("2曲目 をドラッグして並び替え");
    fireEvent.dragStart(secondHandle, {
      dataTransfer: {
        effectAllowed: "move",
        setData: vi.fn(),
      },
    });
    fireEvent.dragOver(thirdRow, {
      dataTransfer: {
        dropEffect: "move",
      },
    });
    fireEvent.drop(thirdRow, {
      dataTransfer: {
        dropEffect: "move",
      },
    });

    expect(reorderItemsAction).toHaveBeenCalledTimes(1);
    expect(getRenderedTitles(setlistSection)).toEqual(["2曲目", "1曲目", "3曲目"]);

    rerender(
      <SetlistTable
        currentTheme="light"
        eventId={eventId}
        items={[...items]}
        reorderItemsAction={reorderItemsAction}
      />,
    );

    expect(getRenderedTitles(setlistSection)).toEqual(["2曲目", "1曲目", "3曲目"]);
    expect(screen.getByText("並び順を更新中...")).toBeInTheDocument();

    await act(async () => {
      pendingReorder.resolve();
      await pendingReorder.promise;
    });

    expect(getRenderedTitles(setlistSection)).toEqual(["2曲目", "1曲目", "3曲目"]);
    expect(screen.queryByText("並び順を更新中...")).not.toBeInTheDocument();

    rerender(
      <SetlistTable
        currentTheme="light"
        eventId={eventId}
        items={[...items]}
        reorderItemsAction={reorderItemsAction}
      />,
    );

    expect(getRenderedTitles(setlistSection)).toEqual(["2曲目", "1曲目", "3曲目"]);

    const canonicalItems = [
      createItem("item-3", "3曲目"),
      createItem("item-2", "2曲目"),
      createItem("item-1", "1曲目"),
    ];

    rerender(
      <SetlistTable
        currentTheme="light"
        eventId={eventId}
        items={canonicalItems}
        reorderItemsAction={reorderItemsAction}
      />,
    );

    expect(getRenderedTitles(setlistSection)).toEqual(["3曲目", "2曲目", "1曲目"]);
  });

  it("marks the dragged source row and hovered target row with dedicated motion hooks", async () => {
    const pendingReorder = deferredPromise<void>();
    const reorderItemsAction = vi.fn().mockReturnValue(pendingReorder.promise);
    const items = [
      createItem("item-1", "1曲目"),
      createItem("item-2", "2曲目"),
      createItem("item-3", "3曲目"),
    ];

    render(
      <SetlistTable
        currentTheme="light"
        eventId={eventId}
        items={items}
        reorderItemsAction={reorderItemsAction}
      />,
    );

    const setlistSection = screen.getByRole("heading", { name: "セットリスト" }).closest("section");
    expect(setlistSection).toBeTruthy();
    if (!setlistSection) {
      throw new Error("expected setlist section");
    }

    const songRows = setlistSection.querySelectorAll('article[data-row-variant="song"]');
    const sourceRow = songRows[0] as HTMLElement;
    const targetRow = songRows[2] as HTMLElement;
    const sourceHandle = within(sourceRow).getByLabelText("1曲目 をドラッグして並び替え");

    fireEvent.dragStart(sourceHandle, {
      dataTransfer: {
        effectAllowed: "move",
        setData: vi.fn(),
      },
    });
    fireEvent.dragOver(targetRow, {
      dataTransfer: {
        dropEffect: "move",
      },
    });

    expect(sourceRow).toHaveAttribute("data-row-dragging", "true");
    expect(targetRow).toHaveAttribute("data-row-drop-target", "true");
    expect(targetRow.querySelector('[data-row-drop-indicator="true"]')).toBeTruthy();
    expect(sourceRow.querySelector('[data-row-drop-indicator="true"]')).toBeNull();
    expect(sourceRow.className).toContain("opacity-95");

    fireEvent.drop(targetRow, {
      dataTransfer: {
        dropEffect: "move",
      },
    });

    await act(async () => {
      pendingReorder.resolve();
      await pendingReorder.promise;
    });
  });

  it("clears the hovered drop indicator when the pointer leaves the target row", () => {
    vi.useFakeTimers();
    try {
      const reorderItemsAction = vi.fn().mockResolvedValue(undefined);
      const items = [
        createItem("item-1", "1曲目"),
        createItem("item-2", "2曲目"),
        createItem("item-3", "3曲目"),
      ];

      render(
        <SetlistTable
          currentTheme="light"
          eventId={eventId}
          items={items}
          reorderItemsAction={reorderItemsAction}
        />,
      );

      const setlistSection = screen.getByRole("heading", { name: "セットリスト" }).closest("section");
      expect(setlistSection).toBeTruthy();
      if (!setlistSection) {
        throw new Error("expected setlist section");
      }

      const songRows = setlistSection.querySelectorAll('article[data-row-variant="song"]');
      const sourceRow = songRows[0] as HTMLElement;
      const targetRow = songRows[2] as HTMLElement;
      const sourceHandle = within(sourceRow).getByLabelText("1曲目 をドラッグして並び替え");

      fireEvent.dragStart(sourceHandle, {
        dataTransfer: {
          effectAllowed: "move",
          setData: vi.fn(),
        },
      });
      fireEvent.dragOver(targetRow, {
        dataTransfer: {
          dropEffect: "move",
        },
      });

      expect(targetRow).toHaveAttribute("data-row-drop-target", "true");
      expect(targetRow.querySelector('[data-row-drop-indicator="true"]')).toBeTruthy();

      fireEvent.dragLeave(targetRow);
      act(() => {
        vi.advanceTimersByTime(60);
      });

      expect(targetRow).toHaveAttribute("data-row-drop-target", "false");
      expect(targetRow.querySelector('[data-row-drop-indicator="true"]')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps the valid drop target when dragleave is followed by a re-entry dragover on the same row", () => {
    vi.useFakeTimers();
    try {
      const reorderItemsAction = vi.fn().mockResolvedValue(undefined);
      const items = [
        createItem("item-1", "1曲目"),
        createItem("item-2", "2曲目"),
        createItem("item-3", "3曲目"),
      ];

      render(
        <SetlistTable
          currentTheme="light"
          eventId={eventId}
          items={items}
          reorderItemsAction={reorderItemsAction}
        />,
      );

      const setlistSection = screen.getByRole("heading", { name: "セットリスト" }).closest("section");
      expect(setlistSection).toBeTruthy();
      if (!setlistSection) {
        throw new Error("expected setlist section");
      }

      const songRows = setlistSection.querySelectorAll('article[data-row-variant="song"]');
      const sourceRow = songRows[0] as HTMLElement;
      const targetRow = songRows[2] as HTMLElement;
      const sourceHandle = within(sourceRow).getByLabelText("1曲目 をドラッグして並び替え");

      fireEvent.dragStart(sourceHandle, {
        dataTransfer: {
          effectAllowed: "move",
          setData: vi.fn(),
        },
      });
      fireEvent.dragOver(targetRow, {
        dataTransfer: {
          dropEffect: "move",
        },
      });
      fireEvent.dragLeave(targetRow);
      fireEvent.dragOver(targetRow, {
        dataTransfer: {
          dropEffect: "move",
        },
      });
      act(() => {
        vi.advanceTimersByTime(60);
      });

      expect(targetRow).toHaveAttribute("data-row-drop-target", "true");
      expect(targetRow.querySelector('[data-row-drop-indicator="true"]')).toBeTruthy();

      fireEvent.drop(targetRow, {
        dataTransfer: {
          dropEffect: "move",
        },
      });

      expect(reorderItemsAction).toHaveBeenCalledWith({
        eventId,
        orderedItemIds: ["item-2", "item-1", "item-3"],
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not reorder when a drop lands after the valid target has been cleared", () => {
    vi.useFakeTimers();
    try {
      const reorderItemsAction = vi.fn().mockResolvedValue(undefined);
      const items = [
        createItem("item-1", "1曲目"),
        createItem("item-2", "2曲目"),
        createItem("item-3", "3曲目"),
      ];

      render(
        <SetlistTable
          currentTheme="light"
          eventId={eventId}
          items={items}
          reorderItemsAction={reorderItemsAction}
        />,
      );

      const setlistSection = screen.getByRole("heading", { name: "セットリスト" }).closest("section");
      expect(setlistSection).toBeTruthy();
      if (!setlistSection) {
        throw new Error("expected setlist section");
      }

      const songRows = setlistSection.querySelectorAll('article[data-row-variant="song"]');
      const sourceRow = songRows[0] as HTMLElement;
      const clearedTargetRow = songRows[2] as HTMLElement;
      const invalidDropRow = songRows[1] as HTMLElement;
      const sourceHandle = within(sourceRow).getByLabelText("1曲目 をドラッグして並び替え");

      fireEvent.dragStart(sourceHandle, {
        dataTransfer: {
          effectAllowed: "move",
          setData: vi.fn(),
        },
      });
      fireEvent.dragOver(clearedTargetRow, {
        dataTransfer: {
          dropEffect: "move",
        },
      });
      fireEvent.dragLeave(clearedTargetRow);
      act(() => {
        vi.advanceTimersByTime(60);
      });

      fireEvent.drop(invalidDropRow, {
        dataTransfer: {
          dropEffect: "move",
        },
      });

      expect(reorderItemsAction).not.toHaveBeenCalled();
      expect(screen.queryByText("並び順を更新中...")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("uses dark-theme motion colors and opacity when a row is dragged", async () => {
    const pendingReorder = deferredPromise<void>();
    const reorderItemsAction = vi.fn().mockReturnValue(pendingReorder.promise);
    const items = [
      createItem("item-1", "1曲目"),
      createItem("item-2", "2曲目"),
      createItem("item-3", "3曲目"),
    ];

    render(
      <SetlistTable
        currentTheme="dark"
        eventId={eventId}
        items={items}
        reorderItemsAction={reorderItemsAction}
      />,
    );

    const setlistSection = screen.getByRole("heading", { name: "セットリスト" }).closest("section");
    expect(setlistSection).toBeTruthy();
    if (!setlistSection) {
      throw new Error("expected setlist section");
    }

    const songRows = setlistSection.querySelectorAll('article[data-row-variant="song"]');
    const sourceRow = songRows[0] as HTMLElement;
    const targetRow = songRows[2] as HTMLElement;
    const sourceHandle = within(sourceRow).getByLabelText("1曲目 をドラッグして並び替え");

    fireEvent.dragStart(sourceHandle, {
      dataTransfer: {
        effectAllowed: "move",
        setData: vi.fn(),
      },
    });
    fireEvent.dragOver(targetRow, {
      dataTransfer: {
        dropEffect: "move",
      },
    });

    expect(sourceRow).toHaveAttribute("data-row-dragging", "true");
    expect(sourceRow.className).toContain("opacity-90");
    expect(sourceRow.className).toContain("bg-[#282116]");
    const indicator = targetRow.querySelector('[data-row-drop-indicator="true"]') as HTMLElement | null;
    expect(indicator).toBeTruthy();
    expect(indicator?.className).toContain("bg-[#f6c453]/85");

    fireEvent.drop(targetRow, {
      dataTransfer: {
        dropEffect: "move",
      },
    });

    await act(async () => {
      pendingReorder.resolve();
      await pendingReorder.promise;
    });
  });

  it("exposes reduced-motion-friendly hooks while a row is being dragged", () => {
    const reorderItemsAction = vi.fn().mockResolvedValue(undefined);
    const items = [
      createItem("item-1", "1曲目"),
      createItem("item-2", "2曲目"),
      createItem("item-3", "3曲目"),
    ];

    render(
      <SetlistTable
        currentTheme="light"
        eventId={eventId}
        items={items}
        reorderItemsAction={reorderItemsAction}
      />,
    );

    const setlistSection = screen.getByRole("heading", { name: "セットリスト" }).closest("section");
    expect(setlistSection).toBeTruthy();
    if (!setlistSection) {
      throw new Error("expected setlist section");
    }

    const songRows = setlistSection.querySelectorAll('article[data-row-variant="song"]');
    const sourceRow = songRows[0] as HTMLElement;
    const targetRow = songRows[2] as HTMLElement;
    const sourceHandle = within(sourceRow).getByLabelText("1曲目 をドラッグして並び替え");

    fireEvent.dragStart(sourceHandle, {
      dataTransfer: {
        effectAllowed: "move",
        setData: vi.fn(),
      },
    });
    fireEvent.dragOver(targetRow, {
      dataTransfer: {
        dropEffect: "move",
      },
    });

    expect(sourceRow).toHaveAttribute("data-row-motion-state", "dragging");
    expect(targetRow).toHaveAttribute("data-row-motion-state", "drop-target");
    expect(sourceRow.className).toContain("motion-safe:");
    expect(sourceRow.className).toContain("motion-reduce:");
    expect(targetRow.className).toContain("motion-safe:");
    expect(targetRow.className).toContain("motion-reduce:");
  });

  it("keeps rows compact and removes drag affordances when reorder is unavailable", () => {
    const items = [
      createItem("item-1", "1曲目"),
      createItem("item-2", "2曲目"),
    ];

    render(<SetlistTable currentTheme="light" eventId={eventId} items={items} />);

    const setlistSection = screen.getByRole("heading", { name: "セットリスト" }).closest("section");
    expect(setlistSection).toBeTruthy();
    if (!setlistSection) {
      throw new Error("expected setlist section");
    }

    const firstRow = setlistSection.querySelector('article[data-row-variant="song"]') as HTMLElement | null;
    expect(firstRow).toBeTruthy();
    if (!firstRow) {
      throw new Error("expected song row");
    }

    expect(firstRow).toHaveAttribute("data-row-reorder-ready", "false");
    expect(within(firstRow).queryByLabelText("1曲目 をドラッグして並び替え")).toBeNull();
    expect(screen.getByText("編集・削除は各行から操作します。")).toBeInTheDocument();
    expect(firstRow.querySelector('[data-row-content="primary"]')).toBeTruthy();
    expect(within(firstRow).getByRole("button", { name: "編集" })).toBeInTheDocument();
    expect(within(firstRow).getByRole("link", { name: "1曲目 を削除" })).toBeInTheDocument();
  });

  it("keeps heading rows compact and free of drag affordances when reorder is unavailable", () => {
    const items = [
      createItem("item-1", "1曲目"),
      createItem("item-heading", "EN", "heading"),
      createItem("item-2", "2曲目"),
    ];

    render(<SetlistTable currentTheme="light" eventId={eventId} items={items} />);

    const setlistSection = screen.getByRole("heading", { name: "セットリスト" }).closest("section");
    expect(setlistSection).toBeTruthy();
    if (!setlistSection) {
      throw new Error("expected setlist section");
    }

    const headingRow = setlistSection.querySelector('article[data-row-variant="heading"]') as HTMLElement | null;
    expect(headingRow).toBeTruthy();
    if (!headingRow) {
      throw new Error("expected heading row");
    }

    expect(headingRow).toHaveAttribute("data-row-reorder-ready", "false");
    expect(headingRow).toHaveAttribute("data-row-motion-state", "idle");
    expect(within(headingRow).queryByLabelText("EN をドラッグして並び替え")).toBeNull();
    expect(headingRow.querySelector('[data-row-cue="heading"]')).toBeTruthy();
    expect(within(headingRow).getByRole("button", { name: "編集" })).toBeInTheDocument();
    expect(within(headingRow).getByRole("link", { name: "EN を削除" })).toBeInTheDocument();
  });

  it("applies the same optimistic reorder contract to heading rows", async () => {
    const pendingReorder = deferredPromise<void>();
    const reorderItemsAction = vi.fn().mockReturnValue(pendingReorder.promise);
    const items = [
      createItem("item-1", "1曲目"),
      createItem("item-heading", "EN", "heading"),
      createItem("item-2", "2曲目"),
    ];

    render(
      <SetlistTable
        currentTheme="light"
        eventId={eventId}
        items={items}
        reorderItemsAction={reorderItemsAction}
      />,
    );

    const setlistSection = screen.getByRole("heading", { name: "セットリスト" }).closest("section");
    expect(setlistSection).toBeTruthy();
    if (!setlistSection) {
      throw new Error("expected setlist section");
    }

    const headingRow = setlistSection.querySelector('article[data-row-variant="heading"]');
    expect(headingRow).toBeTruthy();
    if (!headingRow) {
      throw new Error("expected heading row");
    }

    const headingHandle = within(headingRow as HTMLElement).getByLabelText("EN をドラッグして並び替え");
    const firstSongRow = setlistSection.querySelector('article[data-row-variant="song"]');
    expect(firstSongRow).toBeTruthy();
    if (!firstSongRow) {
      throw new Error("expected first song row");
    }

    fireEvent.dragStart(headingHandle, {
      dataTransfer: {
        effectAllowed: "move",
        setData: vi.fn(),
      },
    });
    fireEvent.dragOver(firstSongRow, {
      dataTransfer: {
        dropEffect: "move",
      },
    });
    fireEvent.drop(firstSongRow, {
      dataTransfer: {
        dropEffect: "move",
      },
    });

    expect(getRenderedTitles(setlistSection)).toEqual(["EN", "1曲目", "2曲目"]);
    expect(screen.getByText("並び順を更新中...")).toBeInTheDocument();
    expect(reorderItemsAction).toHaveBeenCalledWith({
      eventId,
      orderedItemIds: ["item-heading", "item-1", "item-2"],
    });

    await act(async () => {
      pendingReorder.resolve();
      await pendingReorder.promise;
    });
  });

  it("handles a rejected reorder action without surfacing an unhandled error", async () => {
    const reorderItemsAction = vi.fn().mockRejectedValueOnce(new Error("reorder failed"));
    const items = [
      createItem("item-1", "1曲目"),
      createItem("item-2", "2曲目"),
      createItem("item-3", "3曲目"),
    ];

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <SetlistTable
        currentTheme="light"
        eventId={eventId}
        items={items}
        reorderItemsAction={reorderItemsAction}
      />,
    );

    const setlistSection = screen.getByRole("heading", { name: "セットリスト" }).closest("section");
    expect(setlistSection).toBeTruthy();
    if (!setlistSection) {
      throw new Error("expected setlist section");
    }

    const songRows = setlistSection.querySelectorAll('article[data-row-variant="song"]');
    const firstRow = songRows[0] as HTMLElement;
    const thirdRow = songRows[2] as HTMLElement;
    const firstHandle = within(firstRow).getByLabelText("1曲目 をドラッグして並び替え");

    fireEvent.dragStart(firstHandle, {
      dataTransfer: {
        effectAllowed: "move",
        setData: vi.fn(),
      },
    });
    fireEvent.dragOver(thirdRow, {
      dataTransfer: {
        dropEffect: "move",
      },
    });
    fireEvent.drop(thirdRow, {
      dataTransfer: {
        dropEffect: "move",
      },
    });

    expect(getRenderedTitles(setlistSection)).toEqual(["2曲目", "1曲目", "3曲目"]);
    expect(screen.getByText("並び順を更新中...")).toBeInTheDocument();

    await waitFor(() =>
      expect(getRenderedTitles(setlistSection)).toEqual(["1曲目", "2曲目", "3曲目"]),
    );
    expect(screen.queryByText("並び順を更新中...")).not.toBeInTheDocument();
    expect(firstHandle.className).toContain("cursor-grab");
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
