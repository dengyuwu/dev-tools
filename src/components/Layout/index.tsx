import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  InfoCircleOutlined,
  ShopOutlined,
  ClearOutlined,
  ApiOutlined,
  CodeOutlined,
  PieChartOutlined,
  BugOutlined,
  GlobalOutlined,
  SettingOutlined,
  DashboardOutlined,
  RocketOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../../store';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

// 菜单分组配置
const menuItems = [
  {
    key: 'home',
    icon: <HomeOutlined />,
    label: '首页',
    path: '/',
  },
  {
    key: 'tools-group',
    icon: <AppstoreOutlined />,
    label: '工具管理',
    children: [
      { key: '/tools', icon: <AppstoreOutlined />, label: '已安装工具' },
      { key: '/store', icon: <ShopOutlined />, label: '包商店' },
      { key: '/versions', icon: <CodeOutlined />, label: '版本管理' },
    ],
  },
  {
    key: 'system-group',
    icon: <ClearOutlined />,
    label: '系统优化',
    children: [
      { key: '/clean', icon: <ClearOutlined />, label: '缓存清理' },
      { key: '/disk', icon: <PieChartOutlined />, label: '磁盘分析' },
      { key: '/orphan', icon: <BugOutlined />, label: '孤儿依赖' },
    ],
  },
  {
    key: 'env-group',
    icon: <SettingOutlined />,
    label: '环境配置',
    children: [
      { key: '/proxy', icon: <GlobalOutlined />, label: '代理设置' },
      { key: '/env', icon: <SettingOutlined />, label: '环境变量' },
    ],
  },
  {
    key: 'monitor-group',
    icon: <DashboardOutlined />,
    label: '监控工具',
    children: [
      { key: '/ports', icon: <ApiOutlined />, label: '端口管理' },
      { key: '/process', icon: <DashboardOutlined />, label: '进程监控' },
    ],
  },
  {
    key: '/templates',
    icon: <RocketOutlined />,
    label: '项目模板',
  },
  {
    key: '/about',
    icon: <InfoCircleOutlined />,
    label: '关于',
  },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { siderCollapsed, setSiderCollapsed } = useAppStore();

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    if (!key.startsWith('/')) return;
    navigate(key);
  };

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path === '/') return ['home'];
    return [path];
  };

  // 获取展开的子菜单
  const getOpenKeys = () => {
    const path = location.pathname;
    if (['/tools', '/store', '/versions'].includes(path)) return ['tools-group'];
    if (['/clean', '/disk', '/orphan'].includes(path)) return ['system-group'];
    if (['/proxy', '/env'].includes(path)) return ['env-group'];
    if (['/ports', '/process'].includes(path)) return ['monitor-group'];
    return [];
  };

  // 转换菜单项格式
  const transformMenuItems = (items: typeof menuItems): any[] => {
    return items.map((item) => {
      if ('children' in item && item.children) {
        return {
          key: item.key,
          icon: item.icon,
          label: item.label,
          children: item.children.map((child) => ({
            key: child.key,
            icon: child.icon,
            label: child.label,
          })),
        };
      }
      return {
        key: 'path' in item ? item.path || item.key : item.key,
        icon: item.icon,
        label: item.label,
      };
    });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider
        collapsible
        collapsed={siderCollapsed}
        onCollapse={setSiderCollapsed}
        trigger={null}
        width={220}
        collapsedWidth={64}
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
          borderRight: '1px solid rgba(99, 102, 241, 0.2)',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          overflow: 'auto',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: siderCollapsed ? 'center' : 'flex-start',
            padding: siderCollapsed ? 0 : '0 16px',
            borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
              flexShrink: 0,
            }}
          >
            🛠️
          </div>
          {!siderCollapsed && (
            <Title
              level={5}
              style={{
                margin: '0 0 0 12px',
                color: '#fff',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              DevTool
            </Title>
          )}
        </div>

        {/* 菜单 */}
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={siderCollapsed ? [] : getOpenKeys()}
          items={transformMenuItems(menuItems)}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            borderRight: 'none',
          }}
          theme="dark"
        />
      </Sider>

      {/* 主内容区 */}
      <Layout style={{ marginLeft: siderCollapsed ? 64 : 220, transition: 'margin-left 0.2s' }}>
        {/* 顶部栏 */}
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          {/* 折叠按钮 */}
          <div
            onClick={() => setSiderCollapsed(!siderCollapsed)}
            style={{
              fontSize: 18,
              cursor: 'pointer',
              color: '#a5b4fc',
              padding: '8px 12px',
              borderRadius: 6,
              transition: 'all 0.2s',
            }}
          >
            {siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>

          {/* 版本号 */}
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
            v0.1.0
          </div>
        </Header>

        {/* 内容区域 */}
        <Content
          style={{
            padding: 24,
            background: 'linear-gradient(180deg, #0a0e1a 0%, #111827 100%)',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
