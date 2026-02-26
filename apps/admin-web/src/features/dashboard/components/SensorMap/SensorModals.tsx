import { lazy, Suspense } from 'react';
import type { SensorSummaryResponse } from '../../../../types/sensor.types';
import type { ActionType } from './constants';

const SensorDetailModal   = lazy(() => import('../../../sensors/components/SensorDetailModal/SensorDetailModal'));
const EditSensorModal     = lazy(() => import('../../../sensors/components/EditSensorModal/EditSensorModal'));
const ChangeStatusModal   = lazy(() => import('../../../sensors/components/ChangeStatusModal/ChangeStatusModal'));
const DeleteSensorModal   = lazy(() => import('../../../sensors/components/DeleteSensorModal/DeleteSensorModal'));
const RestoreConfirmModal = lazy(() => import('../../../sensors/components/RestoreConfirmModal/RestoreConfirmModal'));

export interface ModalState {
  type:   ActionType;
  sensor: SensorSummaryResponse;
}

interface SensorModalsProps {
  modalState:    ModalState | null;
  onClose:       () => void;
  /** Called after a mutating action (edit/status/delete/restore) succeeds */
  onSuccess:     () => void;
}

export default function SensorModals({ modalState, onClose, onSuccess }: SensorModalsProps) {
  if (!modalState) return null;

  const { type, sensor } = modalState;

  return (
    <Suspense fallback={null}>
      {type === 'view' && (
        <SensorDetailModal sensor={sensor} onClose={onClose} hideMap />
      )}
      {type === 'edit' && (
        <EditSensorModal sensor={sensor} onClose={onClose} onSuccess={onSuccess} />
      )}
      {type === 'status' && (
        <ChangeStatusModal sensor={sensor} onClose={onClose} onSuccess={onSuccess} />
      )}
      {type === 'delete' && (
        <DeleteSensorModal sensor={sensor} onClose={onClose} onSuccess={onSuccess} />
      )}
      {type === 'restore' && (
        <RestoreConfirmModal sensor={sensor} onClose={onClose} onSuccess={onSuccess} />
      )}
    </Suspense>
  );
}
