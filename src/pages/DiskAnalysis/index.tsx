import { useState, useEffect } from 'react';
import {
  Typography, Button, Table, Progress, Space, Card, Statistic, Row, Col, message, Breadcrumb
} from 'antd';
import {
  ReloadOutlined, FolderOutlined, HomeOutlined, PieChartOutlined
} from '@ant-design/icons';
import { invoke } from '@tauri-apps/api/core';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface DiskUsage {
  category: string;
  path: string;
  size_bytes: number;
  item_count: number;
}

// 格式化文件大小
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

// 获取颜色
function getColor(index: number): string {
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6'
  ];
  return colors[index % colors.length];
}

export default function DiskAnalysis() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DiskUsage[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<{ name: string; path: string }[]>([]);
  const [_currentPath, setCurrentPath] = useState<string | null>(null);

  useEffect(() => {
    loadDiskUsage();
  }, []);

  async function loadDiskUsage() {
    setLoading(true);
    setBreadcrumb([]);
    setCurrentPath(null);
    try {
      const result = await invoke<DiskUsage[]>('scan_disk_usage');
      setData(result);
    } catch (e) {
      message.error(String(e));
    }
    setLoading(false);
  }

  async function loadDirDetails(path: string, name: string) {
    setLoading(true);
    try {
      const result = await invoke<DiskUsage[]>('get_dir_details', { path });
      setData(result);
      setCurrentPath(path);
      setBreadcrumb(prev => [...prev, { name, path }]);
    } catch (e) {
      message.error(String(e));
    }
    setLoading(false);
  }

  function navigateTo(index: number) {
    if (index === -1) {
      loadDiskUsage();
    } else {
      const target = breadcrumb[index];
      setBreadcrumb(breadcrumb.slice(0, index + 1));
      loadDirDetails(target.path, target.name);
    }
  }

  // 计算总大小
  const totalSize = data.reduce((sum, item) => sum + item.size_bytes, 0);
  const maxSize = Math.max(...data.map(d => d.size_bytes), 1);

  const columns: ColumnsType<DiskUsage> = [
    {
      title: '名称',
      dataIndex: 'category',
      key: 'category',
      render: (name, record, index) => (
        <Space>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: getColor(index),
            }}
          />
          <Button
            type="link"
            style={{ padding: 0, color: '#fff' }}
            onClick={() => loadDirDetails(record.path, name)}
          >
            <FolderOutlined style={{ marginRight: 8 }} />
            {name}
          </Button>
        </Space>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size_bytes',
      key: 'size_bytes',
      width: 120,
      sorter: (a, b) => a.size_bytes - b.size_bytes,
      render: (size) => (
        <Text style={{ color: '#fff', fontFamily: 'monospace' }}>
          {formatSize(size)}
        </Text>
      ),
    },
    {
      title: '占比',
      key: 'percent',
      width: 200,
      render: (_, record, index) => {
        const percent = totalSize > 0 ? (record.size_bytes / totalSize) * 100 : 0;
        return (
          <Progress
            percent={percent}
            showInfo={false}
            strokeColor={getColor(index)}
            trailColor="rgba(255,255,255,0.1)"
            size="small"
          />
        );
      },
    },
    {
      title: '百分比',
      key: 'percentText',
      width: 80,
      render: (_, record) => {
        const percent = totalSize > 0 ? (record.size_bytes / totalSize) * 100 : 0;
        return (
          <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
            {percent.toFixed(1)}%
          </Text>
        );
      },
    },
    {
      title: '项目数',
      dataIndex: 'item_count',
      key: 'item_count',
      width: 100,
      render: (count) => (
        <Text style={{ color: 'rgba(255,255,255,0.6)' }}>
          {count} 项
        </Text>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: '#fff' }}>
          <PieChartOutlined style={{ marginRight: 12 }} />
          磁盘分析
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          分析开发工具占用的磁盘空间，帮助您了解存储使用情况
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card className="glass" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.6)' }}>总占用空间</span>}
              value={formatSize(totalSize)}
              valueStyle={{ color: '#6366f1', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="glass" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.6)' }}>分类数量</span>}
              value={data.length}
              suffix="个"
              valueStyle={{ color: '#8b5cf6', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="glass" style={{ background: 'rgba(236, 72, 153, 0.1)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.6)' }}>最大项目</span>}
              value={data.length > 0 ? formatSize(maxSize) : '-'}
              valueStyle={{ color: '#ec4899', fontSize: 28 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Breadcrumb & Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <Breadcrumb
          items={[
            {
              title: (
                <a onClick={() => navigateTo(-1)} style={{ color: '#6366f1' }}>
                  <HomeOutlined /> 概览
                </a>
              ),
            },
            ...breadcrumb.map((item, index) => ({
              title: (
                <a
                  onClick={() => navigateTo(index)}
                  style={{ color: index === breadcrumb.length - 1 ? '#fff' : '#6366f1' }}
                >
                  {item.name}
                </a>
              ),
            })),
          ]}
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={loadDiskUsage}
          loading={loading}
        >
          刷新
        </Button>
      </div>

      {/* Visual Chart */}
      {data.length > 0 && (
        <div className="glass" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 4, height: 32, borderRadius: 8, overflow: 'hidden' }}>
            {data.map((item, index) => {
              const percent = totalSize > 0 ? (item.size_bytes / totalSize) * 100 : 0;
              if (percent < 0.5) return null;
              return (
                <div
                  key={item.path}
                  style={{
                    width: `${percent}%`,
                    background: getColor(index),
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  title={`${item.category}: ${formatSize(item.size_bytes)} (${percent.toFixed(1)}%)`}
                  onClick={() => loadDirDetails(item.path, item.category)}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12 }}>
            {data.slice(0, 10).map((item, index) => (
              <div key={item.path} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: getColor(index),
                  }}
                />
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                  {item.category}
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass" style={{ overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="path"
          loading={loading}
          pagination={false}
          size="middle"
        />
      </div>
    </div>
  );
}
