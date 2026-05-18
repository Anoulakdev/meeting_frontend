import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Button } from "@/components/ui/FormElements";
import { User } from "./UserManagement";
import { userSchema } from "@/schemas/user";

export const emptyForm = {
  name: "",
  department: "",
  email: "",
  role: "Viewer",
  status: "Active",
};

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (form: typeof emptyForm) => Promise<void>;
}

export function AddUserModal({ open, onClose, onAdd }: AddUserModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setSaving(false);
      setErrors({});
    }
  }, [open]);

  const handleAdd = async () => {
    // Validate with Zod
    const result = userSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    await onAdd(form);
    setSaving(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New User">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Full Name *"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => {
              setForm((f) => ({ ...f, name: e.target.value }));
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            error={errors.name}
          />
          <Input
            label="Department"
            placeholder="Engineering"
            value={form.department}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            error={errors.department}
          />
        </div>
        <Input
          label="Email Address *"
          type="email"
          placeholder="john@company.com"
          value={form.email}
          onChange={(e) => {
            setForm((f) => ({ ...f, email: e.target.value }));
            if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
          }}
          error={errors.email}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as User["role"] }))}
            options={[
              { value: "Admin", label: "Admin" },
              { value: "Manager", label: "Manager" },
              { value: "Editor", label: "Editor" },
              { value: "Viewer", label: "Viewer" },
            ]}
            error={errors.role}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as User["status"] }))}
            options={[
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
              { value: "Pending", label: "Pending" },
            ]}
            error={errors.status}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAdd}
            loading={saving}
            className="flex-1"
          >
            Add User
          </Button>
        </div>
      </div>
    </Modal>
  );
}
