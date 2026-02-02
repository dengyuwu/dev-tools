import { useState, useEffect } from 'react';
import {
  Typography, Button, Table, Tag, Card, Statistic, Row, Col, message, Modal
} from 'antd';
import {
  ReloadOutlined, DeleteOutlined, ExclamationCircleOutlined, BugOutlined
} from '@ant-design/icons';
import { invoke } from '@tauri-apps/api/core';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface OrphanDependency {
  name: string;
  version: string;
  source: string;
  reason: string;
  size_bytes: number;
}

export default function OrphanDeps() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OrphanDependency[]>([]);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    loadOrphans();
  }, []);

  async function loadOrphans() {
    setLoading(true);
    try {
      const result = await invoke<OrphanDependency[]>('scan_orphan_dependencies');
      setData(result);
    } catch (e) {
      message.error(String(e));
    }
    setLoading(false);
  }

  function confirmRemove(item: OrphanDependency) {
    Modal.confirm({
      title: '确认卸载',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: `确定要卸载 ${item.name} 吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => removeOrphan(item),
    });
  }

  async function removeOrphan(item: OrphanDependency) {
    setRemoving(true);
    try {
      await invoke<string>('uninstall_tool', {
        source: item.source,
        name: item.name,
      });
      message.success(`已卸载 ${item.name}`);
      loadOrphans();
    } catch (e) {
      message.error(String(e));
    }
    setRemoving(false);
  }

  const sourceColors: Record<string, string> = {
    npm: 'green',
    cargo: 'orange',
    pip: 'blue',
  };

  const columns: ColumnsType<OrphanDependency> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text style={{ color: '#fff' }}>{name}</Text>,
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 100,
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 80,
      render: (s) => <Tag color={sourceColors[s]}>{s}</Tag>,
    },
    {
      title: '原因',
      dataIndex: 'reason',
      key: 'reason',
      render: (r) => <Text style={{ color: 'rgba(255,255,255,0.6)' }}>{r}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => confirmRemove(record)}
          loading={removing}
        >
          卸载
        </Button>
      ),
    },
  ];

  const npmCount = data.filter(d => d.source === 'npm').length;
  const pipCount = data.filter(d => d.source === 'pip').length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: '#fff' }}>
          <BugOutlined style={{ marginRight: 12 }} />
          孤儿依赖
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          检测可能不需要的全局依赖包
        </Text>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card className="glass" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.6)' }}>检测到的孤儿依赖</span>}
              value={data.length}
              suffix="个"
              valueStyle={{ color: '#6366f1', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="glass" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.6)' }}>npm 包</span>}
              value={npmCount}
              suffix="个"
              valueStyle={{ color: '#22c55e', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="glass" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.6)' }}>pip 包</span>}
              value={pipCount}
              suffix="个"
              valueStyle={{ color: '#3b82f6', fontSize: 28 }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button icon={<ReloadOutlined />} onClick={loadOrphans} loading={loading}>
          重新扫描
        </Button>
      </div>

      <div className="glass" style={{ overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey={(r) => `${r.source}-${r.name}`}
          loading={loading}
          pagination={{ pageSize: 15 }}
          size="middle"
        />
      </div>
    </div>
  );
}
