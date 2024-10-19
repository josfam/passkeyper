import { useEffect, useState } from "react";
import axios from "axios";
import PasswordChangeModal from "./PasswordChangeModal.tsx";
import { FaTrash, FaUser, FaEnvelope, FaKey } from "react-icons/fa";

const Settings = () => {
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // State for edit modal
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/user", {
          withCredentials: true,
        });
        setUserData({ name: response.data.name, email: response.data.email });
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "An error occurred while fetching user data"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleDeleteAccount = () => {
    alert("Account deleted successfully!");
    setShowDeleteConfirmation(false);
  };

  const handleEditUserData = async () => {
    try {
      // Send request to update user data
      await axios.patch(
        "http://127.0.0.1:5000/user",
        { name: newName, email: newEmail },
        { withCredentials: true }
      );
      setUserData({ name: newName, email: newEmail });
      setShowEditModal(false);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while updating user data"
      );
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="flex flex-col h-screen max-w-lg">
      <h1 className="text-4xl font-bold mb-6">My Account</h1>

      {/* NAME */}
      <div className="mb-2 flex items-center">
        <FaUser className="mr-2" />
        <div>
          <p className="text-sm font-medium text-gray-500">Name</p>
          <p className="text-xl rounded-lg bg-gray-50 font-semibold">
            {userData.name}
          </p>
          <button
            className="text-blue-600 underline mt-1"
            onClick={() => {
              setNewName(userData.name);
              setShowEditModal(true);
            }}
          >
            Edit
          </button>
        </div>
      </div>

      {/* EMAIL */}
      <div className="mb-4 flex items-center">
        <FaEnvelope className="mr-2" />
        <div>
          <p className="text-sm font-medium text-gray-500">Email</p>
          <p className="text-xl rounded-lg bg-gray-50 font-semibold">
            {userData.email}
          </p>
          <button
            className="text-blue-600 underline mt-1"
            onClick={() => {
              setNewEmail(userData.email);
              setShowEditModal(true);
            }}
          >
            Edit
          </button>
        </div>
      </div>

      {/* Change Password Section */}
      <div
        className="text-blue-600 cursor-pointer mt-4 flex items-center"
        onClick={() => setShowModal(true)}
      >
        <FaKey className="mr-2" />
        <span>Change Password</span>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      {/* Delete Account Section */}
      <div className="flex items-center mt-6">
        <FaTrash
          className="text-red-600 h-5 w-5 mr-2 cursor-pointer"
          onClick={() => setShowDeleteConfirmation(true)}
        />
        <span
          className="text-red-600 cursor-pointer"
          onClick={() => setShowDeleteConfirmation(true)}
        >
          Delete Account
        </span>
      </div>

      {/* Confirmation Modal for Deletion */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h2 className="text-lg font-bold mb-4">Confirm Account Deletion</h2>
            <p className="mb-4">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="flex justify-between">
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 text-white rounded-lg py-2 px-4 hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="text-blue-600 underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Data Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h2 className="text-lg font-bold mb-4">Edit User Data</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleEditUserData}
                className="bg-blue-600 text-white rounded-lg py-2 px-4 hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-blue-600 underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
