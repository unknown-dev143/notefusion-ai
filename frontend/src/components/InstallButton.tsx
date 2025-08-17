import { Button } from 'antd';
import { DownloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function InstallButton() {
  const { install, canInstall, isInstalled } = usePWAInstall();

  if (isInstalled) {
    return (
      <Button 
        type="text"
        icon={<CheckCircleOutlined />}
        disabled
      >
        Installed
      </Button>
    );
  }

  if (!canInstall) {
    return null; // Don't show button if can't install
  }

  return (
    <Button
      type="primary"
      icon={<DownloadOutlined />}
      onClick={install}
    >
      Install App
    </Button>
  );
}

export default InstallButton;
