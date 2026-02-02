import { create } from 'zustand';

// 工具来源类型
type ToolSource = 'npm' | 'cargo' | 'pip' | 'go' | 'script' | 'manual' | 'unknown';

// 工具信息类型（与 types/index.ts 保持一致）
interface ToolInfo {
  name: string;
  scope: string | null;
  full_name: string;
  version: string | null;
  source: ToolSource;
  install_path: string;
  size_bytes: number;
  description: string | null;
}

// 端口信息类型
interface PortInfo {
  port: number;
  protocol: string;
  pid: number | null;
  process_name: string | null;
  state: string;
}

// 进程信息类型
interface ProcessInfo {
  pid: number;
  name: string;
  cpu_usage: number;
  memory_mb: number;
  status: string;
}

// 缓存信息类型
interface CacheInfo {
  name: string;
  path: string;
  size_bytes: number;
  exists: boolean;
}

// 全局状态类型
interface AppState {
  // 侧边栏折叠状态
  siderCollapsed: boolean;
  setSiderCollapsed: (collapsed: boolean) => void;

  // 工具列表缓存
  tools: ToolInfo[];
  toolsLoading: boolean;
  toolsLastFetch: number | null;
  setTools: (tools: ToolInfo[]) => void;
  setToolsLoading: (loading: boolean) => void;

  // 端口列表缓存
  ports: PortInfo[];
  portsLoading: boolean;
  portsLastFetch: number | null;
  setPorts: (ports: PortInfo[]) => void;
  setPortsLoading: (loading: boolean) => void;

  // 进程列表缓存
  processes: ProcessInfo[];
  processesLoading: boolean;
  processesLastFetch: number | null;
  setProcesses: (processes: ProcessInfo[]) => void;
  setProcessesLoading: (loading: boolean) => void;

  // 缓存信息
  caches: CacheInfo[];
  cachesLoading: boolean;
  cachesLastFetch: number | null;
  setCaches: (caches: CacheInfo[]) => void;
  setCachesLoading: (loading: boolean) => void;

  // 检查缓存是否过期 (5分钟)
  isCacheValid: (lastFetch: number | null) => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

export const useAppStore = create<AppState>((set, _get) => ({
  // 侧边栏状态
  siderCollapsed: false,
  setSiderCollapsed: (collapsed) => set({ siderCollapsed: collapsed }),

  // 工具列表
  tools: [],
  toolsLoading: false,
  toolsLastFetch: null,
  setTools: (tools) => set({ tools, toolsLastFetch: Date.now() }),
  setToolsLoading: (loading) => set({ toolsLoading: loading }),

  // 端口列表
  ports: [],
  portsLoading: false,
  portsLastFetch: null,
  setPorts: (ports) => set({ ports, portsLastFetch: Date.now() }),
  setPortsLoading: (loading) => set({ portsLoading: loading }),

  // 进程列表
  processes: [],
  processesLoading: false,
  processesLastFetch: null,
  setProcesses: (processes) => set({ processes, processesLastFetch: Date.now() }),
  setProcessesLoading: (loading) => set({ processesLoading: loading }),

  // 缓存信息
  caches: [],
  cachesLoading: false,
  cachesLastFetch: null,
  setCaches: (caches) => set({ caches, cachesLastFetch: Date.now() }),
  setCachesLoading: (loading) => set({ cachesLoading: loading }),

  // 缓存有效性检查
  isCacheValid: (lastFetch) => {
    if (!lastFetch) return false;
    return Date.now() - lastFetch < CACHE_DURATION;
  },
}));
