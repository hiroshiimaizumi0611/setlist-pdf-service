import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
    expect(reorderItemsAction).toHaveBeenCalledWith({
      eventId,
      orderedItemIds: ["item-2", "item-1", "item-3"],
    });

    pendingReorder.resolve();
    await pendingReorder.promise;
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

    const headingHandle = within(headingRow).getByLabelText("EN をドラッグして並び替え");
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

    pendingReorder.resolve();
    await pendingReorder.promise;
  });
});
