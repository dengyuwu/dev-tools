import { useEffect } from 'react';
import { Typography, Button, Table, Tag, Progress, message } from 'antd';
import { ReloadOutlined, DashboardOutlined } from '@ant-design/icons';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../../store';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface ProcessInfo {
  pid: number;
  name: string;
  cpu_usage: number;
  memory_mb: number;
  status: string;
}

export default function ProcessMonitor() {
  // 使用全局状态缓存
  const {
    processes, setProcesses,
    processesLoading: loading, setProcessesLoading: setLoading,
    processesLastFetch, isCacheValid
  } = useAppStore();

  useEffect(() => {
    if (!isCacheValid(processesLastFetch)) {
      loadProcesses();
    }
  }, []);

  async function loadProcesses() {
    setLoading(true);
    try {
      const result = await invoke<ProcessInfo[]>('scan_dev_processes');
      setProcesses(result.sort((a, b) => b.cpu_usage - a.cpu_usage));
    } catch (e) {
      message.error(String(e));
    }
    setLoading(false);
  }

  const totalCpu = processes.reduce((sum, p) => sum + p.cpu_usage, 0);
  const totalMem = processes.reduce((sum, p) => sum + p.memory_mb, 0);

  const columns: ColumnsType<ProcessInfo> = [
    {
      title: 'PID',
      dataIndex: 'pid',
      key: 'pid',
      width: 80,
      render: (pid) => <Tag>{pid}</Tag>,
    },
    {
      title: '进程名',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text style={{ color: '#fff' }}>{name}</Text>,
    },
    {
      title: 'CPU',
      dataIndex: 'cpu_usage',
      key: 'cpu_usage',
      width: 150,
      sorter: (a, b) => a.cpu_usage - b.cpu_usage,
      render: (cpu) => (
        <Progress
          percent={Math.min(cpu, 100)}
          size="small"
          strokeColor={cpu > 50 ? '#f43f5e' : '#6366f1'}
          format={() => `${cpu.toFixed(1)}%`}
        />
      ),
    },
    {
      title: '内存',
      dataIndex: 'memory_mb',
      key: 'memory_mb',
      width: 120,
      sorter: (a, b) => a.memory_mb - b.memory_mb,
      render: (mem) => <Text style={{ color: 'rgba(255,255,255,0.7)' }}>{mem.toFixed(1)} MB</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s) => <Tag color={s === 'Run' ? 'green' : 'default'}>{s}</Tag>,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: '#fff' }}>
          <DashboardOutlined style={{ marginRight: 12 }} />
          进程监控
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          监控开发相关进程的资源占用
        </Text>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 24 }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
            进程数: <span style={{ color: '#6366f1' }}>{processes.length}</span>
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
            总 CPU: <span style={{ color: '#6366f1' }}>{totalCpu.toFixed(1)}%</span>
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
            总内存: <span style={{ color: '#6366f1' }}>{totalMem.toFixed(1)} MB</span>
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadProcesses} loading={loading}>
          刷新
        </Button>
      </div>

      <div className="glass" style={{ overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={processes}
          rowKey="pid"
          loading={loading}
          pagination={{ pageSize: 15 }}
          size="middle"
        />
      </div>
    </div>
  );
}
