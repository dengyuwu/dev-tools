import { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Modal, Input, Form, message, Tag } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import { invoke } from '@tauri-apps/api/core';

const { Title, Text } = Typography;

interface ProjectTemplate {
  name: string;
  description: string;
  command: string;
  category: string;
}

export default function ProjectTemplates() {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const result = await invoke<ProjectTemplate[]>('get_project_templates');
      setTemplates(result);
    } catch (e) {
      message.error(String(e));
    }
  }

  function openCreateModal(template: ProjectTemplate) {
    setSelectedTemplate(template);
    setModalOpen(true);
    form.resetFields();
  }

  async function handleCreate() {
    if (!selectedTemplate) return;
    try {
      const values = await form.validateFields();
      setCreating(true);
      await invoke<string>('create_project', {
        templateCommand: selectedTemplate.command,
        name: values.name,
        path: values.path || '.',
      });
      message.success(`项目 ${values.name} 创建成功！`);
      setModalOpen(false);
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return;
      message.error(String(e));
    }
    setCreating(false);
  }

  const categoryColors: Record<string, string> = {
    React: 'cyan',
    Vue: 'green',
    Desktop: 'purple',
    'Node.js': 'orange',
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: '#fff' }}>
          <RocketOutlined style={{ marginRight: 12 }} />
          项目模板
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          快速创建项目脚手架
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        {templates.map((t) => (
          <Col key={t.name} xs={24} sm={12} lg={8}>
            <Card
              className="glass"
              hoverable
              style={{ height: '100%' }}
              onClick={() => openCreateModal(t)}
            >
              <Tag color={categoryColors[t.category]}>{t.category}</Tag>
              <Title level={5} style={{ color: '#fff', marginTop: 8 }}>{t.name}</Title>
              <Text style={{ color: 'rgba(255,255,255,0.6)' }}>{t.description}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={`创建 ${selectedTemplate?.name} 项目`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleCreate}
        confirmLoading={creating}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="my-project" />
          </Form.Item>
          <Form.Item name="path" label="创建路径">
            <Input placeholder="留空则在当前目录创建" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
