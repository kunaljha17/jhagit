import "./AvatarPickerModal.css";
import {AVATAR_OPTIONS ,DEFAULT_AVATAR} from "../constants/avatars"

function AvatarPickerModal({ currentAvatar, onSelect, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="avatar-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Choose your avatar</h3>
        <div className="avatar-grid">
          {AVATAR_OPTIONS.map((avatar) => (
            <img
              key={avatar.id}
              src={avatar.url}
              alt={avatar.id}
              className={`avatar-option ${avatar.url === currentAvatar ? "selected" : ""}`}
              onClick={() => onSelect(avatar.url)}
            />
          ))}
        </div>
        <button className="modal-close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default AvatarPickerModal;