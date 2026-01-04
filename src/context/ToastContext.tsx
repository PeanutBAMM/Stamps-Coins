import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Toast, ToastType } from '../components/Toast';

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<ToastType>('info');
    const [duration, setDuration] = useState(4000);

    const showToast = useCallback((msg: string, toastType: ToastType = 'info', toastDuration: number = 4000) => {
        setMessage(msg);
        setType(toastType);
        setDuration(toastDuration);
        setVisible(true);
    }, []);

    const hideToast = useCallback(() => {
        setVisible(false);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            {visible && ( // Render toast conditionally or keep mounted controlled by visible prop inside
                <Toast
                    message={message}
                    type={type}
                    visible={visible}
                    onHide={hideToast}
                    duration={duration}
                />
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
