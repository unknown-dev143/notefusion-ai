import { Button, ButtonProps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  children,
  ...props
}) => {
  return (
    <Button
      {...props}
      icon={loading ? <LoadingOutlined /> : props.icon}
      disabled={loading || props.disabled}
    >
      {loading ? 'Processing...' : children}
    </Button>
  );
};

export default LoadingButton;
