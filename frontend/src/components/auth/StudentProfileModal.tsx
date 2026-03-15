"use client";

import StudentForm from "./StudentForm";

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StudentProfileModal({
  isOpen,
  onClose,
  onSuccess,
}: StudentProfileModalProps) {
  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Complete Your Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <StudentForm
            onSuccess={handleSuccess}
            onCancel={onClose}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
}
