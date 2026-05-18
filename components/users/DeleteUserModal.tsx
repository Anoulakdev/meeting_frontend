import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/FormElements";
import { Trash2 } from "lucide-react";
import { User } from "./UserManagement";

interface DeleteUserModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  selectedUser: User | null;
}

export function DeleteUserModal({ open, onClose, onDelete, selectedUser }: DeleteUserModalProps) {
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSaving(false);
    }
  }, [open]);

  const handleDelete = async () => {
    setSaving(true);
    await onDelete();
    setSaving(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="Delete User" size="sm">
      <div className="space-y-5">
        <div
          className="flex items-center gap-4 p-4 rounded-xl"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(239,68,68,0.12)" }}
          >
            <Trash2 className="w-5 h-5" style={{ color: "rgb(var(--danger))" }} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
              {selectedUser?.name}
            </div>
            <div className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
              {selectedUser?.email}
            </div>
          </div>
        </div>
        <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
          This action cannot be undone. The user&apos;s data, settings, and access will be permanently removed.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={saving} className="flex-1">
            Delete User
          </Button>
        </div>
      </div>
    </Modal>
  );
}
