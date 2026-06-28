import React, { createContext, useContext, useState } from 'react';

const DialogContext = createContext(null);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export const DialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
    resolve: null,
  });

  const alert = (title, message) => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        type: 'alert',
        title,
        message,
        resolve,
      });
    });
  };

  const confirm = (title, message) => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        resolve,
      });
    });
  };

  const handleClose = (value) => {
    if (dialog.resolve) {
      dialog.resolve(value);
    }
    setDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const isError = dialog.title?.toLowerCase().includes('error') || 
                  dialog.title?.toLowerCase().includes('failed') || 
                  dialog.message?.toLowerCase().includes('failed') || 
                  dialog.message?.toLowerCase().includes('error') || 
                  dialog.message?.includes('❌');

  return (
    <DialogContext.Provider value={{ alert, confirm }}>
      {children}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 px-4 transition-opacity animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full border border-gray-100 animate-fade-in">
            <div className="text-center mb-6">
              {dialog.type === 'confirm' ? (
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4 animate-scale-in">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              ) : isError ? (
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 animate-scale-in">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              ) : (
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4 animate-scale-in">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              <h3 className="text-lg font-bold text-gray-900 mb-2">{dialog.title}</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">{dialog.message}</p>
            </div>
            
            <div className="flex space-x-3 justify-center">
              {dialog.type === 'confirm' && (
                <button
                  onClick={() => handleClose(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-md transition-colors w-full"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => handleClose(true)}
                className="px-4 py-2 bg-primary hover:bg-secondary text-white font-semibold rounded-md transition-colors w-full"
              >
                {dialog.type === 'confirm' ? 'OK' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};
