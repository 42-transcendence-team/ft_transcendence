import { Modal } from '@components/Modal';
import { useLayoutEffect, useState } from 'react';

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmingLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

type DisplayedConfirmation = {
  title: string;
  message: string;
  confirmLabel: string;
  confirmingLabel: string;
  cancelLabel: string;
  isConfirming: boolean;
};

// ConfirmModal solo gestiona la interfaz de confirmación.
// El componente padre sigue siendo responsable de la operación destructiva.
export const ConfirmModal = ({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  confirmingLabel = 'Eliminando...',
  cancelLabel = 'Cancelar',
  isConfirming = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) => {
  const [displayedConfirmation, setDisplayedConfirmation] =
    useState<DisplayedConfirmation>(() => ({
      title,
      message,
      confirmLabel,
      confirmingLabel,
      cancelLabel,
      isConfirming,
    }));

  /*
   * Modal sigue renderizándose durante la animación de cierre.
   * Actualizar el contenido solo mientras está abierta evita que aparezca
   * otro mensaje de confirmación durante esos últimos milisegundos.
   */
  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    setDisplayedConfirmation({
      title,
      message,
      confirmLabel,
      confirmingLabel,
      cancelLabel,
      isConfirming,
    });
  }, [
    open,
    title,
    message,
    confirmLabel,
    confirmingLabel,
    cancelLabel,
    isConfirming,
  ]);

  const handleClose = () => {
    if (open && !isConfirming) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!open || isConfirming) {
      return;
    }

    void onConfirm();
  };

  const controlsDisabled = !open || displayedConfirmation.isConfirming;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={displayedConfirmation.title}
      overlayClassName="confirm-modal-overlay"
      modalClassName="confirm-modal"
      contentClassName="confirm-modal__content"
    >
      <p className="confirm-modal__message">{displayedConfirmation.message}</p>

      <div className="modal__footer">
        <button
          className="modal__button modal__button--cancel"
          type="button"
          onClick={handleClose}
          disabled={controlsDisabled}
          autoFocus
        >
          {displayedConfirmation.cancelLabel}
        </button>

        <button
          className="modal__button modal__button--disable"
          type="button"
          onClick={handleConfirm}
          disabled={controlsDisabled}
        >
          {displayedConfirmation.isConfirming
            ? displayedConfirmation.confirmingLabel
            : displayedConfirmation.confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
