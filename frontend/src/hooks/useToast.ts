import toast from "react-hot-toast";

export function useToast() {
  const showSuccess = (message: string) => {
    toast.success(message);
  };

  const showError = (message: string) => {
    toast.error(message);
  };

  const showLoading = (message: string) => {
    toast.loading(message);
  };

  return { showSuccess, showError, showLoading };
}
