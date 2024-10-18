import { useState } from 'react';

const PasswordChangeModal = ({ isOpen, onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSave = () => {
    // Handle password change logic here
    alert('Password changed successfully!');
    onClose();
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 w-80">
          <h2 className="text-xl font-bold mb-4">Change Password</h2>

          {/* Old Master Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Old Master Password</label>
            <div className="relative">
              <input
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
                required
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showOldPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* New Master Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">New Master Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showNewPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="w-full mt-2 text-blue-600 underline"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  );
};

export default PasswordChangeModal;
