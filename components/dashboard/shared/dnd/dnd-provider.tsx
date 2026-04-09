"use client";

// DndProvider — opakowanie <DndContext> z ustawionymi sensorami i collision detection.
// Reusable: dashboard kontekstu, strona projektu (Etap 6).
//
// Sensors: Pointer z activationConstraint distance 8 (zeby klik nie kolidowal z drag)
// + Keyboard dla accessibility.
// Collision detection: closestCorners — najlepszy dla cross-container DnD.

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
