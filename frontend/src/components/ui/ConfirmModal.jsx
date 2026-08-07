import React, { useEffect, useRef } from "react";
import "./ConfirmModal.css";

/**
 * Accessible confirmation modal to replace window.prompt/alert.
 * Usage:
 *   <ConfirmModal
 *     isOpen={showModal}
 *     title="Delete Repository"
 *     message="This action cannot be undone."
 *     confirmLabel="Delete"
 *     confirmVariant="danger"
 *     onConfirm={() => handleDelete()}
 *     onCancel={() => setShowModal(false)}
 *   />
 *
 * For name-confirmation (like repo deletion):
 *   <ConfirmModal
 *     isOpen={showModal}
 *     title="Delete Repository"
 *     message="Type the repository name to confirm:"
 *     confirmLabel="I understand, delete this repository"
 *     confirmVariant="danger"
 *     requireInput="my-repo-name"
 *     onConfirm={() => handleDelete()}
 *     onCancel={() => setShowModal(false)}
 *   />
 */
const ConfirmModal = ({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary", // 'primary' | 'danger'
  requireInput = null, // if set, user must type this exact string to enable confirm
  onConfirm,
  onCancel,
}) => {
  const [inputValue, setInputValue] = React.useState("");
  const overlayRef = useRef(null);
  const firstFocusRef = useRef(null);

  // Reset input when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setInputValue("");
      // Focus the first interactive element
      setTimeout(() => {
        if (firstFocusRef.current) firstFocusRef.current.focus();
      }, 50);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onCancel?.();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isConfirmDisabled = requireInput && inputValue !== requireInput;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onCancel?.();
    }
  };

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        <h3 id="modal-title" className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>

        {requireInput && (
          <div className="modal-input-group">
            <input
              ref={firstFocusRef}
              type="text"
              className="auth-input"
              placeholder={`Type "${requireInput}" to confirm`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              aria-label={`Type ${requireInput} to confirm`}
            />
          </div>
        )}

        <div className="modal-actions">
          <button
            className="modal-btn modal-btn-cancel"
            onClick={onCancel}
            ref={!requireInput ? firstFocusRef : null}
          >
            {cancelLabel}
          </button>
          <button
            className={`modal-btn modal-btn-${confirmVariant}`}
            onClick={onConfirm}
            disabled={isConfirmDisabled}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
