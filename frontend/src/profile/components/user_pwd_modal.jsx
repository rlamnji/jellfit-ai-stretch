import React from 'react';

function PasswordAlertModal({ message, onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-md p-6 w-[300px] text-center">
                <div className="text-[#684E4E] text-[16px] mb-4">{message}</div>
                <button
                    className="px-4 py-2 bg-[#7A7668] text-white rounded-xl"
                    onClick={onClose}
                >
                    확인
                </button>
            </div>
        </div>
    );
}

export default PasswordAlertModal;