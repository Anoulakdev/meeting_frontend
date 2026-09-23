"use client";

import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Button } from "@/components/ui/FormElements";
import { Upload, X, FileText } from "lucide-react";
import apiClient from "@/lib/axiosInstance";
import { RelatedDoc, Department } from "@/schemas/relatedDoc";
import { toast } from "react-toastify";
import { RelatedDocForm, emptyRelatedDocForm } from "./AddModal";

interface EditModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDoc: RelatedDoc | null;
}

export function EditModal({ open, onClose, onSuccess, selectedDoc }: EditModalProps) {
  const [form, setForm] = useState<RelatedDocForm>(emptyRelatedDocForm);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<RelatedDocForm & { file: string }>>({});
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // Fetch departments for dropdown
      const fetchDepts = async () => {
        setLoadingDepts(true);
        try {
          const res = await apiClient.get<Department[]>("/api/departments/select");
          if (Array.isArray(res.data)) {
            setDepartments(res.data);
          }
        } catch (err) {
          console.error("Failed to load departments:", err);
        } finally {
          setLoadingDepts(false);
        }
      };

      fetchDepts();
    }

    if (open && selectedDoc) {
      setForm({
        title: selectedDoc.title,
        description: selectedDoc.description || "",
        departmentId: selectedDoc.departmentId ? String(selectedDoc.departmentId) : "",
      });
      setFile(null);
      setSaving(false);
      setErrors({});
    }
  }, [open, selectedDoc]);

  const validate = (): boolean => {
    const newErrors: Partial<RelatedDocForm & { file: string }> = {};
    if (!form.title.trim()) newErrors.title = "ກະລຸນາໃສ່ຫົວຂໍ້";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!selectedDoc || !validate()) return;
    setSaving(true);
    try {
      const data = new FormData();
      data.append("title", form.title.trim());
      data.append("description", form.description.trim());
      if (form.departmentId) {
        data.append("departmentId", form.departmentId);
      }
      if (file) {
        data.append("docfile", file);
      }

      await apiClient.put(`/api/relateddocs/${selectedDoc.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("ແກ້ໄຂເອກະສານສຳເລັດ");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("[EditModal] PUT /api/relateddocs failed:", err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "ແກ້ໄຂເອກະສານບໍ່ສຳເລັດ";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const set = (field: keyof RelatedDocForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== "application/pdf") {
        setErrors((prev) => ({ ...prev, file: "ກະລຸນາເລືອກໄຟລ໌ PDF ເທົ່ານັ້ນ" }));
        return;
      }
      setFile(selected);
      setErrors((prev) => ({ ...prev, file: "" }));
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="ແກ້ໄຂເອກະສານທີ່ຕິດພັນ" size="lg">
      <div className="space-y-5">
        {/* Title */}
        <Input
          label="ຫົວຂໍ້ເອກະສານ *"
          placeholder="ໃສ່ຫົວຂໍ້ເອກະສານ..."
          value={form.title}
          onChange={set("title")}
          error={errors.title}
        />

        {/* Department Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold" style={{ color: "rgb(var(--text-secondary))" }}>
            ຝ່າຍ (ເອກະສານມາຈາກຝ່າຍ)
          </label>
          <select
            value={form.departmentId}
            onChange={set("departmentId")}
            disabled={loadingDepts}
            className="w-full h-11 px-3.5 rounded-xl text-sm font-medium transition-all outline-none"
            style={{
              background: "rgb(var(--bg))",
              border: "1px solid rgb(var(--border))",
              color: "rgb(var(--text-primary))",
            }}
          >
            <option value="">ເລືອກຝ່າຍ (ບໍ່ບັງຄັບ)</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.department_name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold" style={{ color: "rgb(var(--text-secondary))" }}>
            ລາຍລະອຽດ
          </label>
          <textarea
            value={form.description}
            onChange={set("description")}
            rows={3}
            placeholder="ໃສ່ລາຍລະອຽດເພີ່ມເຕີມ..."
            className="w-full p-3 rounded-xl text-sm font-medium transition-all outline-none resize-none"
            style={{
              background: "rgb(var(--bg))",
              border: "1px solid rgb(var(--border))",
              color: "rgb(var(--text-primary))",
            }}
          />
        </div>

        {/* File Upload (Optional on Edit) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold" style={{ color: "rgb(var(--text-secondary))" }}>
            ໄຟລ໌ PDF (ເລືອກໃໝ່ຫາກຕ້ອງການປ່ຽນ)
          </label>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {!file ? (
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all hover:opacity-80"
              style={{
                borderColor: errors.file ? "rgb(var(--danger))" : "rgb(var(--border))",
                background: "rgb(var(--bg))",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5"
                style={{ background: "rgb(var(--brand) / 0.1)" }}
              >
                <Upload className="w-5 h-5" style={{ color: "rgb(var(--brand))" }} />
              </div>
              <p className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                {selectedDoc?.docfile
                  ? `ໄຟລ໌ປັດຈຸບັນ: ${selectedDoc.docfile} (ກົດເພື່ອປ່ຽນ)`
                  : "ກົດເພື່ອເລືອກໄຟລ໌ PDF ໃໝ່"}
              </p>
            </div>
          ) : (
            <div
              className="flex items-center justify-between p-3.5 rounded-xl border"
              style={{
                background: "rgb(var(--bg))",
                borderColor: "rgb(var(--border))",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(239, 68, 68, 0.1)" }}
                >
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "rgb(var(--text-primary))" }}>
                    {file.name}
                  </p>
                  <p className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                style={{ color: "rgb(var(--text-secondary))" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {errors.file && (
            <p className="text-xs" style={{ color: "rgb(var(--danger))" }}>
              {errors.file}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-3">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            ຍົກເລີກ
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={saving}>
            ບັນທຶກ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
