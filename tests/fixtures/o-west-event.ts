export const oWestEvent = {
  id: "event-o-west",
  ownerUserId: "user-o-west",
  title: "2025.11.26 Spotify O-WEST",
  venue: "Spotify O-WEST",
  eventDate: new Date("2025-11-26T09:00:00.000Z"),
  notes: "Dark-theme reference fixture",
  createdAt: new Date("2025-11-01T00:00:00.000Z"),
  updatedAt: new Date("2025-11-01T00:00:00.000Z"),
  items: Array.from({ length: 42 }, (_, index) => ({
    id: `ow-item-${index + 1}`,
    eventId: "event-o-west",
    position: index + 1,
    itemType:
      index === 0
        ? ("heading" as const)
        : index % 11 === 0
          ? ("mc" as const)
          : index % 17 === 0
            ? ("transition" as const)
            : ("song" as const),
    title:
      index === 0
        ? "OPENING"
        : index % 11 === 0
          ? `MC ${index}`
          : index % 17 === 0
            ? `転換 ${index}`
            : `Song ${index.toString().padStart(2, "0")}`,
    artist: null,
    durationSeconds: null,
    notes: null,
    createdAt: new Date("2025-11-01T00:00:00.000Z"),
    updatedAt: new Date("2025-11-01T00:00:00.000Z"),
  })),
};
