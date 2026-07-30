import toast, { Toaster } from 'react-hot-toast';

export const useToast = () => {
  return {
    toast: (props: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => {
      const { title, description, variant } = props;
      const message = title ? `${title}${description ? '\n' + description : ''}` : description;
      
      if (!message) return;

      if (variant === 'destructive') {
        toast.error(message, {
          style: {
            background: 'hsl(var(--destructive))',
            color: 'hsl(var(--destructive-foreground))',
          }
        });
      } else {
        toast.success(message);
      }
    },
    dismiss: toast.dismiss,
  };
};

export { Toaster };
