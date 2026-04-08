"use client";

// Przycisk usuwania kontekstu z modalem potwierdzenia/bledu.

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteContext } from "./actions";

export function DeleteContextButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    setError(null);
    setConfirmed(false);
    setOpen(true);
  };

  const doDelete = () => {
    startTransition(async () => {
      const res = await deleteContext(id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="p-1.5 rounded-md hover:bg-red-50 text-red-600"
        aria-label="Usun kontekst"
        title="Usun"
      >
        <Trash2 size={16} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Usun kontekst</DialogTitle>
          </DialogHeader>

          <div className="py-2">
            {error ? (
              <div className="text-sm text-red-700 bg-red-50 border-2 border-red-300 rounded-md p-3">
                {error}
              </div>
            ) : (
              <p>
                Czy na pewno chcesz usunac kontekst{" "}
                <strong>{name}</strong>?
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Zamknij
            </Button>
            {!error && (
              <Button
                onClick={doDelete}
                disabled={pending}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {pending ? "Usuwanie..." : "Usun"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
