
import React, { ReactNode, useState } from 'react';
import { X, Loader } from 'lucide-react';

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string | ReactNode;
  subtitle?: string;
  isInteractive?: boolean;
  onInteraction?: () => void;
  modalContent?: ReactNode;
  modalTitle?: string;
  onSave?: () => Promise<void>;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  isInteractive = false,
  onInteraction,
  modalContent,
  modalTitle,
  onSave
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleClick = () => {
    if (isInteractive && onInteraction) {
      onInteraction();
    }
    if (isInteractive && modalContent) {
      setIsModalOpen(true);
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    try {
      setSaving(true);
      await onSave();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div 
        className={`bg-gray-700 p-4 rounded ${
          isInteractive ? 'cursor-pointer hover:bg-gray-600 transition-colors' : ''
        }`}
        onClick={handleClick}
      >
        <div className="mx-auto mb-2">{icon}</div>
        <p>{title}</p>
        <div className="font-bold">
          {typeof value === 'string' ? <p>{value}</p> : value}
        </div>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>

      {/* Modal */}
      {isModalOpen && modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{modalTitle || title}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              {modalContent}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              {onSave && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StatCard;
