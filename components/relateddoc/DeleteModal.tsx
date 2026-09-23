"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/FormElements";
import { Trash2 } from "lucide-react";
import apiClient from "@/lib/axiosInstance";
import { RelatedDoc } from "@/schemas/relatedDoc";
import { toast } from "react-toastify";

interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDoc: RelatedDoc | null;
}

export function DeleteModal({ open, onClose, onSuccess, selectedDoc }: DeleteModalProps) {
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setSaving(false);
  }, [open]);

  const handleDelete = async () => {
    if (!selectedDoc) return;
    setSaving(true);
    try {
      await apiClient.delete(`/api/relateddocs/${selectedDoc.id}`);
      toast.success("ລົບເອກະສານສຳເລັດ");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("[DeleteModal] DELETE /api/relateddocs failed:", err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "ລົບເອກະສານບໍ່ສຳເລັດ";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="ລົບເອກະສານ" size="sm">
      <div className="space-y-5">
        {/* Doc info */}
        <div
          className="flex items-start gap-4 p-4 rounded-xl"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: "rgba(239,68,68,0.12)" }}
          >
            <Trash2 className="w-5 h-5" style={{ color: "rgb(var(--danger))" }} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold line-clamp-2" style={{ color: "rgb(var(--text-primary))" }}>
              {selectedDoc?.title}
            </div>
            {selectedDoc?.department && (
              <div className="text-xs mt-0.5" style={{ color: "rgb(var(--text-secondary))" }}>
                {selectedDoc.department.department_name} ({selectedDoc.department.department_code})
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            ຍົກເລີກ
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={saving} className="flex-1">
            ລົບ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
