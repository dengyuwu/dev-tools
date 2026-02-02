import { Typography, Row, Col } from 'antd';
import { HeartOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function About() {
  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            margin: '0 auto 24px',
            boxShadow: '0 0 40px rgba(99, 102, 241, 0.4)',
          }}
        >
          🛠️
        </div>
        <Title level={2} style={{ color: '#fff', margin: 0 }}>
          DevTool Manager
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 16 }}>
          开发者工具管理应用
        </Text>
      </div>

      {/* Info Cards */}
      <Row gutter={[24, 24]} justify="center">
        <Col xs={24} md={20} lg={16}>
          <div className="glass" style={{ padding: 32 }}>
            <Title level={4} style={{ color: '#fff', marginBottom: 24 }}>
              📋 关于
            </Title>
            <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 2 }}>
              DevTool Manager 是一款专为开发者设计的工具管理应用，帮助你轻松管理通过各种包管理器安装的开发工具。
            </Paragraph>
            <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 2 }}>
              支持 npm、Cargo、Pip 等主流包管理器，提供工具扫描、更新、卸载以及配置文件编辑等功能。
            </Paragraph>

            <div style={{ marginTop: 32 }}>
              <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>
                🚀 技术栈
              </Title>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Tauri 2', 'React 19', 'TypeScript', 'Rust', 'Ant Design 5'].map((tech) => (
                  <span
                    key={tech}
                    style={{
                      padding: '4px 12px',
                      background: 'rgba(99, 102, 241, 0.2)',
                      borderRadius: 4,
                      color: '#a5b4fc',
                      fontSize: 13,
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 32 }}>
              <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>
                ✨ 功能特性
              </Title>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 2.2, paddingLeft: 20 }}>
                <li>智能扫描 npm、Cargo、Pip 安装的工具</li>
                <li>一键更新和卸载工具</li>
                <li>可视化编辑配置文件 (JSON/TOML/YAML)</li>
                <li>异步操作，界面流畅不卡顿</li>
                <li>跨平台支持 (Windows/macOS/Linux)</li>
                <li>科技感暗色主题界面</li>
              </ul>
            </div>

            <div style={{
              marginTop: 32,
              paddingTop: 24,
              borderTop: '1px solid rgba(99, 102, 241, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}>
              <div>
                <Text style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  版本 v0.1.0
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  Made with
                </Text>
                <HeartOutlined style={{ color: '#ec4899' }} />
                <Text style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  by Developer
                </Text>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
