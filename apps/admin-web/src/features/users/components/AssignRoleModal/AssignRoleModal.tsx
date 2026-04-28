import { useState } from 'react';
import { X, UserCheck, AlertCircle } from 'lucide-react';
import './AssignRoleModal.css';
import type { UserSummaryResponse } from '../../../../types/user.types';
import { useRoles, useUserRoles } from '../../hooks/useRoles';
import Select from '../../../../components/Select/Select';

interface AssignRoleModalProps {
  user: UserSummaryResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignRoleModal({ user, onClose, onSuccess }: AssignRoleModalProps) {
  const { roles: allRoles, loading: rolesLoading } = useRoles();
  const { 
    userRoles, 
    loading: userRolesLoading, 
    error, 
    assignRole, 
    removeRole 
  } = useUserRoles(user.userId);
  
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const loading = rolesLoading || userRolesLoading;

  // Get assigned role IDs
  const assignedRoleIds = userRoles
    .filter(ur => ur.roleId) 
    .map(ur => ur.roleId);
  const availableRoles = allRoles.filter(role => !assignedRoleIds.includes(role.id));

  // Helper function để lấy description từ allRoles
  const getRoleDescription = (roleId: string): string => {
    const foundRole = allRoles.find(role => role.id === roleId);
    return foundRole?.description || 'No description';
  };

  const handleAssignRole = async () => {
    if (!selectedRoleId) return;

    try {
      setSubmitting(true);
      const success = await assignRole(selectedRoleId);
      if (success) {
        setSelectedRoleId('');
        onSuccess();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    const success = await removeRole(roleId);
    if (success) {
      // Always refresh parent to update the user list
      onSuccess();
    }
  };

  return (
    <div className="assign-role-modal-overlay" onClick={onClose}>
      <div className="assign-role-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="assign-role-modal__header">
          <div className="assign-role-modal__title">
            <UserCheck size={20} />
            <span>Quản lý Role - {user.fullName}</span>
          </div>
          <button className="assign-role-modal__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="assign-role-modal__content">
          {loading ? (
            <div className="assign-role-modal__loading">
              <div className="spinner" />
              <span>Đang tải...</span>
            </div>
          ) : (
            <>
              {/* Current Roles */}
              <div className="assign-role-modal__section">
                <h4>Roles hiện tại</h4>
                {userRoles.length > 0 ? (
                  <>
                    {userRoles.length === 1 && (
                      <div className="assign-role-modal__warning">
                        <AlertCircle size={14} />
                        <span>Người dùng phải có ít nhất 1 role</span>
                      </div>
                    )}
                    <div className="assign-role-modal__current-roles">
                      {userRoles.map((userRole) => {
                        const roleDescription = getRoleDescription(userRole.roleId);
                        const isLastRole = userRoles.length === 1;
                        
                        return (
                          <div key={userRole.id} className="role-item">
                            <div className="role-item__info">
                              <span className="role-item__name">{userRole.roleName}</span>
                              <span className="role-item__desc">{roleDescription}</span>
                            </div>
                            <button
                              className="role-item__remove"
                              onClick={() => void handleRemoveRole(userRole.roleId)}
                              disabled={isLastRole}
                              title={isLastRole ? 'Không thể xóa role cuối cùng' : 'Xóa role'}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="assign-role-modal__empty">Chưa có role nào được gán</p>
                )}
              </div>

              {/* Assign New Role */}
              {availableRoles.length > 0 && (
                <div className="assign-role-modal__section">
                  <h4>Gán role mới</h4>
                  <div className="assign-role-modal__assign">
                    <Select
                      value={selectedRoleId}
                      onChange={setSelectedRoleId}
                      options={[
                        { value: '', label: 'Chọn role...' },
                        ...availableRoles.map(role => ({
                          value: role.id,
                          label: `${role.name} - ${role.description}`,
                        })),
                      ]}
                    />
                    <button
                      className="assign-role-modal__assign-btn"
                      onClick={() => void handleAssignRole()}
                      disabled={!selectedRoleId || submitting}
                    >
                      {submitting ? 'Đang gán...' : 'Gán Role'}
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="assign-role-modal__error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="assign-role-modal__footer">
          <button className="assign-role-modal__cancel" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
