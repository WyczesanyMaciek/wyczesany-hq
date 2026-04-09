"use client";

// DndProvider — opakowanie <DndContext> z ustawionymi sensorami i collision detection.
// Reusable: dashboard kontekstu, strona projektu (Etap 6).
//
// UWAGA (fix regresji po refaktorze commit 0161694):
// Ten plik nie jest aktualnie uzywany przez `linear-dashboard.tsx`. Dodatkowa
// warstwa komponentu DndProvider + custom hook useDndHandlers powodowala
// regresje — DndContext w osobnym komponencie widzial niestabilne props
// (nowe sensors array per render parent), co resetowalo wewnetrzny state
// TaskRow/ProjectCard (useTransition pending, useSortable transform), przez co:
//   a) klik checkboxa nie dawal wizualnej reakcji (pending state znikal),
//   b) drop taska po DnD "wracal" bo useSortable traci optimistic transform.
// Orchestrator uzywa teraz DndContext bezposrednio (inline sensors i handleDragEnd).
// Ten plik + use-dnd-handlers.ts zostaja jako kandydaty do posprzatania
// w Etapie 7 (polishing) po ustaleniu jak przekazac DnD do strony projektu.

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";

export function DndProvider({
  onDragEnd,
  children,
}: {
  onDragEnd: (event: DragEndEvent) => void;
  children: React.ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={onDragEnd}
    >
      {children}
    </DndContext>
  );
}
