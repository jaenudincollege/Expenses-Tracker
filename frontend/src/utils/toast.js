import toast from 'react-hot-toast';

export const notify = {
  success: (message) => {
    toast.success(message);
  },
  error: (message) => {
    toast.error(message || 'An error occurred');
  },
  info: (message) => {
    toast(message);
  },
  loading: (message) => {
    return toast.loading(message || 'Loading...');
  },
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },
  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'An error occurred',
    });
  },
};

export default notify;
