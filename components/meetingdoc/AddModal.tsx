"use client";

import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Button } from "@/components/ui/FormElements";
import { Upload, X, FileText } from "lucide-react";
import apiClient from "@/lib/axiosInstance";
import { toast } from "react-toastify";

export interface MeetingDocForm {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
}

export const emptyDocForm: MeetingDocForm = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  location: "",
};

interface AddModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddModal({ open, onClose, onSuccess }: AddModalProps) {
  const [form, setForm] = useState<MeetingDocForm>(emptyDocForm);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<MeetingDocForm & { file: string }>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(emptyDocForm);
      setFile(null);
      setSaving(false);
      setErrors({});
    }
  }, [open]);

  const validate = (): boolean => {
    const newErrors: Partial<MeetingDocForm & { file: string }> = {};
    if (!form.title.trim()) newErrors.title = "ກະລຸນາໃສ່ຫົວຂໍ້";
    if (!form.startDate) newErrors.startDate = "ກະລຸນາເລືອກວັນທີເລີ່ມ";
    if (!form.endDate) newErrors.endDate = "ກະລຸນາເລືອກວັນທີສິ້ນສຸດ";
    if (!form.startTime) newErrors.startTime = "ກະລຸນາໃສ່ເວລາເລີ່ມ";
    if (!form.endTime) newErrors.endTime = "ກະລຸນາໃສ່ເວລາສິ້ນສຸດ";
    if (!form.location.trim()) newErrors.location = "ກະລຸນາໃສ່ສະຖານທີ່";
    if (!file) newErrors.file = "ກະລຸນາເລືອກໄຟລ໌ PDF";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, val]) => data.append(key, val));
      if (file) data.append("docfile", file);

      // Debug: แสดงข้อมูลที่จะส่งไป backend
      console.log("[AddModal] FormData entries:");
      for (const [key, val] of data.entries()) {
        console.log(` ${key}:`, val);
      }

      await apiClient.post("/api/meetingdocs", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("ເພີ່ມເອກະສານສຳເລັດ");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("[AddModal] POST /api/meetingdocs failed:", err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "ເພີ່ມເອກະສານບໍ່ສຳເລັດ";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const set = (field: keyof MeetingDocForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <Modal open={open} onClose={onClose} title="ເພີ່ມເອກະສານ">
      <div className="space-y-4">
        {/* Title */}
        <Input
          label="ຫົວຂໍ້ *"
          placeholder="ກະລຸນາໃສ່ຫົວຂໍ້ເອກະສານ"
          value={form.title}
          onChange={set("title")}
          error={errors.title}
        />

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
            ລາຍລະອຽດ
          </label>
          <textarea
            placeholder="ລາຍລະອຽດເພີ່ມເຕີມ..."
            value={form.description}
            onChange={set("description")}
            rows={3}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all resize-none"
            style={{
              background: "rgb(var(--bg))",
              border: "1px solid rgb(var(--border))",
              color: "rgb(var(--text-primary))",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgb(var(--brand))")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgb(var(--border))")}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="ວັນທີເລີ່ມ *"
            type="date"
            value={form.startDate}
            onChange={set("startDate")}
            error={errors.startDate}
          />
          <Input
            label="ວັນທີສິ້ນສຸດ *"
            type="date"
            value={form.endDate}
            onChange={set("endDate")}
            error={errors.endDate}
          />
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="ເວລາເລີ່ມ *"
            type="time"
            value={form.startTime}
            onChange={set("startTime")}
            error={errors.startTime}
          />
          <Input
            label="ເວລາສິ້ນສຸດ *"
            type="time"
            value={form.endTime}
            onChange={set("endTime")}
            error={errors.endTime}
          />
        </div>

        {/* Location */}
        <Input
          label="ສະຖານທີ່ *"
          placeholder="ເຊັ່ນ: ຫ້ອງ 307, ຕຶກສະຖາບັນ"
          value={form.location}
          onChange={set("location")}
          error={errors.location}
        />

        {/* File Upload */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
            ໄຟລ໌ເອກະສານ (PDF) *
          </label>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              if (e.target.files?.[0]) setErrors((prev) => ({ ...prev, file: "" }));
            }}
          />
          {file ? (
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: "rgb(var(--brand) / 0.08)", border: "1px solid rgb(var(--brand) / 0.3)" }}
            >
              <FileText className="w-4 h-4 shrink-0" style={{ color: "rgb(var(--brand))" }} />
              <span className="text-sm flex-1 truncate" style={{ color: "rgb(var(--text-primary))" }}>
                {file.name}
              </span>
              <button onClick={() => setFile(null)}>
                <X className="w-4 h-4" style={{ color: "rgb(var(--text-secondary))" }} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all hover:opacity-80"
              style={{
                background: "rgb(var(--bg))",
                border: errors.file
                  ? "1px dashed rgb(var(--danger))"
                  : "1px dashed rgb(var(--border))",
                color: errors.file ? "rgb(var(--danger))" : "rgb(var(--text-secondary))",
              }}
            >
              <Upload className="w-4 h-4" />
              ເລືອກໄຟລ໌ PDF...
            </button>
          )}
          {errors.file && (
            <p className="text-xs mt-0.5" style={{ color: "rgb(var(--danger))" }}>
              {errors.file}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            ຍົກເລີກ
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={saving} className="flex-1">
            ບັນທຶກ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
