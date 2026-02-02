import { useState, useEffect } from 'react';
import {
  Typography, Table, Button, Tag,
  message, Modal, Input
} from 'antd';
import {
  ReloadOutlined, StopOutlined,
  ExclamationCircleOutlined, SearchOutlined
} from '@ant-design/icons';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../../store';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface PortInfo {
  port: number;
  protocol: string;
  pid: number | null;
  process_name: string | null;
  state: string;
}

export default function PortManager() {
  // 使用全局状态缓存
  const {
    ports, setPorts,
    portsLoading: loading, setPortsLoading: setLoading,
    portsLastFetch, isCacheValid
  } = useAppStore();

  const [searchText, setSearchText] = useState('');
  const [killing, setKilling] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isCacheValid(portsLastFetch)) {
      loadPorts();
    }
  }, []);

  async function loadPorts() {
    setLoading(true);
    try {
      const data = await invoke<PortInfo[]>('scan_ports');
      setPorts(data);
    } catch (e) {
      message.error(String(e));
    }
    setLoading(false);
  }

  function confirmKill(port: PortInfo) {
    if (!port.pid) return;

    Modal.confirm({
      title: '确认终止进程',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <p>确定要终止进程 <strong style={{ color: '#ff4d4f' }}>
            {port.process_name || port.pid}
          </strong> 吗？</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
            PID: {port.pid} | 端口: {port.port}
          </p>
        </div>
      ),
      okText: '确认终止',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => handleKill(port.pid!),
    });
  }

  async function handleKill(pid: number) {
    setKilling(prev => new Set(prev).add(pid));
    try {
      const result = await invoke<string>('kill_process', { pid });
      message.success(result);
      loadPorts();
    } catch (e) {
      message.error(String(e));
    }
    setKilling(prev => {
      const next = new Set(prev);
      next.delete(pid);
      return next;
    });
  }

  // 过滤端口
  const filteredPorts = ports.filter((p) => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      p.port.toString().includes(search) ||
      p.process_name?.toLowerCase().includes(search) ||
      p.pid?.toString().includes(search)
    );
  });

  // 表格列定义
  const columns: ColumnsType<PortInfo> = [
    {
      title: '端口',
      dataIndex: 'port',
      key: 'port',
      width: 100,
      sorter: (a, b) => a.port - b.port,
      render: (port) => (
        <Text strong style={{ color: '#6366f1' }}>{port}</Text>
      ),
    },
    {
      title: '协议',
      dataIndex: 'protocol',
      key: 'protocol',
      width: 80,
      render: (protocol) => (
        <Tag color={protocol === 'TCP' ? 'blue' : 'green'}>{protocol}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (state) => {
        const color = state === 'LISTENING' ? 'green' :
                      state === 'ESTABLISHED' ? 'blue' : 'default';
        return <Tag color={color}>{state}</Tag>;
      },
    },
    {
      title: 'PID',
      dataIndex: 'pid',
      key: 'pid',
      width: 80,
      render: (pid) => pid || '-',
    },
    {
      title: '进程名',
      dataIndex: 'process_name',
      key: 'process_name',
      render: (name) => name || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => {
        const isKilling = record.pid ? killing.has(record.pid) : false;
        return (
          <Button
            type="link"
            danger
            size="small"
            icon={<StopOutlined />}
            disabled={!record.pid || isKilling}
            loading={isKilling}
            onClick={() => confirmKill(record)}
          >
            终止
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: '#fff' }}>
          端口管理
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          查看端口占用情况，快速终止进程
        </Text>
      </div>

      {/* 工具栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Input
          placeholder="搜索端口、进程名或 PID..."
          prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.4)' }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        <Button icon={<ReloadOutlined />} onClick={loadPorts} loading={loading}>
          刷新
        </Button>
      </div>

      {/* 端口列表 */}
      <div className="glass" style={{ overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={filteredPorts}
          rowKey={(r) => `${r.protocol}-${r.port}-${r.pid}`}
          loading={loading}
          pagination={{ pageSize: 15 }}
          size="middle"
        />
      </div>
    </div>
  );
}
