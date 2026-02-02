import { useState, useEffect } from 'react';
import { Typography, Button, Table, Input, message, Card } from 'antd';
import { ReloadOutlined, SaveOutlined, GlobalOutlined } from '@ant-design/icons';
import { invoke } from '@tauri-apps/api/core';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface ProxyConfig {
  tool: string;
  proxy: string | null;
  registry: string | null;
}

export default function ProxySettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [data, setData] = useState<ProxyConfig[]>([]);
  const [editValues, setEditValues] = useState<Record<string, { proxy: string; registry: string }>>({});

  useEffect(() => {
    loadConfigs();
  }, []);

  async function loadConfigs() {
    setLoading(true);
    try {
      const result = await invoke<ProxyConfig[]>('get_proxy_configs');
      setData(result);
      const values: Record<string, { proxy: string; registry: string }> = {};
      result.forEach((c) => {
        values[c.tool] = {
          proxy: c.proxy || '',
          registry: c.registry || '',
        };
      });
      setEditValues(values);
    } catch (e) {
      message.error(String(e));
    }
    setLoading(false);
  }

  async function handleSave(tool: string) {
    const values = editValues[tool];
    if (!values) return;

    setSaving(tool);
    try {
      await invoke<string>('set_proxy_config', {
        tool,
        proxy: values.proxy || null,
        registry: values.registry || null,
      });
      message.success(`${tool} 配置已保存`);
      loadConfigs();
    } catch (e) {
      message.error(String(e));
    }
    setSaving(null);
  }

  function updateValue(tool: string, field: 'proxy' | 'registry', value: string) {
    setEditValues((prev) => ({
      ...prev,
      [tool]: { ...prev[tool], [field]: value },
    }));
  }

  const columns: ColumnsType<ProxyConfig> = [
    {
      title: '工具',
      dataIndex: 'tool',
      key: 'tool',
      width: 100,
      render: (t) => <Text style={{ color: '#fff', fontWeight: 500 }}>{t}</Text>,
    },
    {
      title: '代理地址',
      key: 'proxy',
      render: (_, record) => (
        <Input
          placeholder="http://127.0.0.1:7890"
          value={editValues[record.tool]?.proxy || ''}
          onChange={(e) => updateValue(record.tool, 'proxy', e.target.value)}
          style={{ maxWidth: 300 }}
        />
      ),
    },
    {
      title: '镜像源',
      key: 'registry',
      render: (_, record) => (
        <Input
          placeholder="https://registry.npmmirror.com"
          value={editValues[record.tool]?.registry || ''}
          onChange={(e) => updateValue(record.tool, 'registry', e.target.value)}
          style={{ maxWidth: 350 }}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<SaveOutlined />}
          onClick={() => handleSave(record.tool)}
          loading={saving === record.tool}
        >
          保存
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: '#fff' }}>
          <GlobalOutlined style={{ marginRight: 12 }} />
          代理设置
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          统一配置各包管理器的代理和镜像源
        </Text>
      </div>

      <Card className="glass" style={{ marginBottom: 16 }}>
        <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
          常用镜像源：npmmirror (https://registry.npmmirror.com)
        </Text>
      </Card>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button icon={<ReloadOutlined />} onClick={loadConfigs} loading={loading}>
          刷新
        </Button>
      </div>

      <div className="glass" style={{ overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="tool"
          loading={loading}
          pagination={false}
          size="middle"
        />
      </div>
    </div>
  );
}
