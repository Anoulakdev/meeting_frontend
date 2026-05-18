import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Select, Button } from "@/components/ui/FormElements";
import { User } from "./UserManagement";
import apiClient from "@/lib/axiosInstance";
import { toast } from "react-toastify";

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  onEdit: () => Promise<void>;
  selectedUser: User | null;
}

export function EditUserModal({ open, onClose, onEdit, selectedUser }: EditUserModalProps) {
  const [roleId, setRoleId] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<{ id: number, name: string }[]>([]);

  useEffect(() => {
    if (open) {
      apiClient.get<{ id: number, name: string }[]>("/api/roles/selectrole")
        .then(res => setRoles(res.data))
        .catch(console.error);
    }
  }, [open]);

  useEffect(() => {
    if (open && selectedUser) {
      setRoleId((selectedUser.raw as any).roleId || (selectedUser.raw as any).role?.id || "");
      setSaving(false);
    }
  }, [open, selectedUser]);

  const handleSave = async () => {
    if (!selectedUser || !roleId) return;

    setSaving(true);
    try {
      await apiClient.put(`/api/users/${selectedUser.id}`, { roleId: Number(roleId) });
      toast.success("ອັບເດດສິດຜູ້ໃຊ້ສຳເລັດ!");
      await onEdit();
    } catch (error) {
      console.error(error);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການອັບເດດສິດຜູ້ໃຊ້");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="ແກ້ໄຂສິດຜູ້ໃຊ້">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-xl mb-2" style={{ background: "rgb(var(--bg))" }}>
          {selectedUser && (
            <>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden"
                style={{ background: selectedUser.empimg ? "transparent" : `rgb(${selectedUser.avatarColor})` }}
              >
                {selectedUser.empimg ? (
                  <img src={selectedUser.empimg} alt="profile" className="w-full h-full object-cover object-top" />
                ) : (
                  selectedUser.avatar
                )}
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                  {selectedUser.name}
                </div>
                <div className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
                  {selectedUser.email}
                </div>
              </div>
            </>
          )}
        </div>

        <div>
          <Select
            label="ສິດຜູ້ໃຊ້ (Role) *"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value ? Number(e.target.value) : "")}
            options={[
              { value: "", label: "ເລືອກສິດ..." },
              ...roles.map(r => ({ value: String(r.id), label: r.name }))
            ]}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            ຍົກເລີກ
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            disabled={!roleId || roleId === ((selectedUser?.raw as any)?.roleId || (selectedUser?.raw as any)?.role?.id)}
            className="flex-1"
          >
            ບັນທຶກ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
