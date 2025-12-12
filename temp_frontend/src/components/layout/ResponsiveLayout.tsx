import React, { ReactNode } from 'react';
import { Layout, theme } from 'antd';
import { useMediaQuery } from 'react-responsive';
import './ResponsiveLayout.css';

const { Header, Content, Footer, Sider } = Layout;

interface ResponsiveLayoutProps {
  header?: ReactNode;
  sider?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  siderWidth?: number;
  collapsedWidth?: number;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  header,
  sider,
  children,
  footer,
  siderWidth = 200,
  collapsedWidth = 80,
  breakpoint = 'lg',
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [collapsed, setCollapsed] = React.useState(isMobile);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  React.useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  const toggleSider = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout hasSider>
      {sider && (
        <Sider
          width={siderWidth}
          collapsedWidth={collapsedWidth}
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          breakpoint={breakpoint}
          className="sider-container"
        >
          {sider}
        </Sider>
      )}
      <Layout className="layout-container" style={{ marginLeft: !isMobile && !collapsed ? siderWidth : collapsedWidth }}>
        {header && <Header className="header-container">{header}</Header>}
        <Content className={`content-container ${isMobile ? 'mobile' : ''}`}>
          <div className="content-wrapper">
            {children}
          </div>
        </Content>
        {footer && <Footer className="footer-container">{footer}</Footer>}
      </Layout>
    </Layout>
  );
};

export default ResponsiveLayout;
