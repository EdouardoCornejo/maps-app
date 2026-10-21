import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ErrorModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

export const ErrorModal = ({ title, message, onClose }: ErrorModalProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Portal to <body> so the modal is not trapped in the search box stacking context
  return createPortal(
    <>
      <div
        className="modal d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="error-modal-title"
        onClick={onClose}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="error-modal-title">
                {title}
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                onClick={onClose}
              />
            </div>
            <div className="modal-body">
              <p className="m-0">{message}</p>
            </div>
            <div className="modal-footer">
              <button
                ref={closeButtonRef}
                type="button"
                className="btn btn-primary"
                onClick={onClose}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>,
    document.body
  );
};
