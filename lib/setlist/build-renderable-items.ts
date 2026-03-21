import type { SetlistItemType } from "../services/events-service";

type RenderableInput = {
  id: string;
  itemType: SetlistItemType;
  position: number;
  title: string;
};

export function buildRenderableItems<T extends RenderableInput>(items: T[]) {
  let counter = 1;

  return items.map((item) => {
    if (item.itemType !== "song") {
      return {
        ...item,
        label: null,
      };
    }

    const label = `M${String(counter).padStart(2, "0")}`;
    counter += 1;

    return {
      ...item,
      label,
    };
  });
}
