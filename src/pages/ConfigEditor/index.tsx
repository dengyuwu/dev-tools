import { useState, useEffect } from 'react';
import { Row, Col, Tree, Card, Typography, Button, message, Empty, Input, Form, Switch, InputNumber, Spin } from 'antd';
import { FolderOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import { invoke } from '@tauri-apps/api/core';
import { DotFolder } from '../../types';
import type { DataNode } from 'antd/es/tree';

const { Title } = Typography;

export default function ConfigEditor() {
  const [folders, setFolders] = useState<DotFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [jsonData, setJsonData] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadFolders();
  }, []);

  async function loadFolders() {
    setLoading(true);
    try {
      const result = await invoke<DotFolder[]>('scan_dotfiles');
      setFolders(result);
    } catch (e) {
      console.error(e);
      message.error('扫描失败');
    }
    setLoading(false);
  }

  async function loadFile(path: string) {
    try {
      const content = await invoke<string>('read_config_file', { path });
      setFileContent(content);
      setSelectedFile(path);

      // 尝试解析 JSON
      try {
        const parsed = JSON.parse(content);
        setJsonData(parsed);
        form.setFieldsValue(flattenObject(parsed));
      } catch {
        setJsonData(null);
      }
    } catch (e) {
      message.error(String(e));
    }
  }

  async function handleSave() {
    if (!selectedFile) return;

    setSaving(true);
    try {
      let contentToSave = fileContent;

      if (jsonData) {
        const values = form.getFieldsValue();
        const newData = unflattenObject(values);
        contentToSave = JSON.stringify(newData, null, 2);
      }

      await invoke<string>('write_config_file', {
        path: selectedFile,
        content: contentToSave,
      });
      message.success('保存成功');
    } catch (e) {
      message.error(String(e));
    }
    setSaving(false);
  }

  // 将嵌套对象扁平化
  function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
      } else {
        result[newKey] = value;
      }
    }

    return result;
  }

  // 将扁平化对象还原
  function unflattenObject(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const keys = key.split('.');
      let current = result;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
          current[keys[i]] = {};
        }
        current = current[keys[i]] as Record<string, unknown>;
      }

      current[keys[keys.length - 1]] = value;
    }

    return result;
  }

  // 生成树形数据
  const treeData: DataNode[] = folders.map((folder) => ({
    key: folder.path,
    title: folder.name,
    icon: <FolderOutlined />,
    children: [], // 可以后续加载子文件
  }));

  // 渲染表单字段
  function renderFormField(key: string, value: unknown) {
    if (typeof value === 'boolean') {
      return (
        <Form.Item key={key} name={key} label={key} valuePropName="checked">
          <Switch />
        </Form.Item>
      );
    }

    if (typeof value === 'number') {
      return (
        <Form.Item key={key} name={key} label={key}>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
      );
    }

    if (Array.isArray(value)) {
      return (
        <Form.Item key={key} name={key} label={key}>
          <Input.TextArea rows={2} placeholder={JSON.stringify(value)} />
        </Form.Item>
      );
    }

    return (
      <Form.Item key={key} name={key} label={key}>
        <Input />
      </Form.Item>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>📁 配置文件</Title>
        <Button icon={<ReloadOutlined />} onClick={loadFolders} loading={loading}>
          刷新
        </Button>
      </div>

      <Row gutter={16}>
        {/* 左侧树形导航 */}
        <Col span={8}>
          <Card title="配置文件夹" size="small" style={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}>
            {loading ? (
              <Spin />
            ) : folders.length === 0 ? (
              <Empty description="暂无配置文件夹" />
            ) : (
              <Tree
                showIcon
                treeData={treeData}
                onSelect={async (_, info) => {
                  const folder = folders.find((f) => f.path === info.node.key);
                  if (folder) {
                    // 加载文件夹下的配置文件
                    try {
                      const files = await invoke<string[]>('list_json_files', { dirPath: folder.path });
                      if (files.length > 0) {
                        loadFile(files[0]);
                      } else {
                        message.info('该文件夹下没有配置文件');
                        setSelectedFile(null);
                        setJsonData(null);
                      }
                    } catch (e) {
                      message.error(String(e));
                    }
                  }
                }}
              />
            )}
          </Card>
        </Col>

        {/* 右侧编辑区 */}
        <Col span={16}>
          <Card
            title={selectedFile ? `编辑: ${selectedFile.split(/[/\\]/).pop()}` : '选择一个配置文件'}
            size="small"
            style={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}
            extra={
              selectedFile && (
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
                  保存
                </Button>
              )
            }
          >
            {!selectedFile ? (
              <Empty description="请从左侧选择一个配置文件夹" />
            ) : jsonData ? (
              <Form form={form} layout="vertical" size="small">
                {Object.entries(flattenObject(jsonData)).map(([key, value]) =>
                  renderFormField(key, value)
                )}
              </Form>
            ) : (
              <Input.TextArea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                rows={20}
                style={{ fontFamily: 'monospace' }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
