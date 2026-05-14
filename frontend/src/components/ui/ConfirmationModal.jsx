import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuTriangleAlert, LuX } from 'react-icons/lu';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", type = "danger" }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md glass border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden"
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${type === 'danger' ? 'bg-error/20 text-error' : 'bg-warning/20 text-warning'}`}>
              <LuTriangleAlert size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-text mb-1">{title}</h3>
              <p className="text-sm text-text/60 leading-relaxed">{message}</p>
            </div>
            <button onClick={onClose} className="text-text/40 hover:text-text transition-colors">
              <LuX size={20} />
            </button>
          </div>

          <div className="mt-8 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-6 py-2 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 ${
                type === 'danger' 
                ? 'bg-error text-white hover:bg-error/80' 
                : 'bg-primary text-white hover:bg-primary/80'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;
