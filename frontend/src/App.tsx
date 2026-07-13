import { useState, useCallback, useRef, useEffect } from 'react';
import { Heading, Text, Button, Badge, Separator, Card, Grid, Flex, Box, Code, Callout } from '@radix-ui/themes';
import { 
  Play, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  LayoutGrid, 
  Cpu, 
  Database, 
  HardDrive, 
  Zap, 
  Radio, 
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import McpTests, { TestSuiteRef } from './components/McpTests';
import DatabaseTests from './components/DatabaseTests';
import StorageTests from './components/StorageTests';
import EdgeFunctionTests from './components/EdgeFunctionTests';
import RealtimeTests from './components/RealtimeTests';
import RoomChat from './components/RoomChat';
import api from './lib/api';
import type { TestStep } from './types';
import { MessageSquare } from 'lucide-react';

type TabType = 'overview' | 'mcp' | 'db' | 'storage' | 'functions' | 'realtime' | 'chat';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [backendInfo, setBackendInfo] = useState<any>(null);

  // States to keep track of suite progress for sidebar and overview
  const [mcpSteps, setMcpSteps] = useState<TestStep[]>([]);
  const [dbSteps, setDbSteps] = useState<TestStep[]>([]);
  const [storageSteps, setStorageSteps] = useState<TestStep[]>([]);
  const [edgeSteps, setEdgeSteps] = useState<TestStep[]>([]);
  const [realtimeSteps, setRealtimeSteps] = useState<TestStep[]>([]);

  const [mcpRunning, setMcpRunning] = useState(false);
  const [dbRunning, setDbRunning] = useState(false);
  const [storageRunning, setStorageRunning] = useState(false);
  const [edgeRunning, setEdgeRunning] = useState(false);
  const [realtimeRunning, setRealtimeRunning] = useState(false);

  const [isGlobalRunning, setIsGlobalRunning] = useState(false);

  // Refs to call runAll/reset on each panel
  const mcpRef = useRef<TestSuiteRef>(null);
  const dbRef = useRef<TestSuiteRef>(null);
  const storageRef = useRef<TestSuiteRef>(null);
  const edgeFnRef = useRef<TestSuiteRef>(null);
  const realtimeRef = useRef<TestSuiteRef>(null);

  const checkBackend = useCallback(async () => {
    setBackendStatus('checking');
    try {
      const res = await api.get('/health');
      setBackendStatus('online');
      setBackendInfo(res.data);
    } catch {
      setBackendStatus('offline');
      setBackendInfo(null);
    }
  }, []);

  useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  // Expose helper to calculate status details
  const getSuiteInfo = (steps: TestStep[], isRunning: boolean) => {
    const passed = steps.filter((s) => s.status === 'pass').length;
    const failed = steps.filter((s) => s.status === 'fail').length;
    const total = steps.length;

    if (isRunning) return { label: 'Running', color: 'yellow' as const, passed, total };
    if (failed > 0) return { label: 'Failed', color: 'red' as const, passed, total };
    if (passed === total && total > 0) return { label: 'Passed', color: 'green' as const, passed, total };
    return { label: 'Ready', color: 'gray' as const, passed, total };
  };

  const mcpInfo = getSuiteInfo(mcpSteps, mcpRunning);
  const dbInfo = getSuiteInfo(dbSteps, dbRunning);
  const storageInfo = getSuiteInfo(storageSteps, storageRunning);
  const edgeInfo = getSuiteInfo(edgeSteps, edgeRunning);
  const realtimeInfo = getSuiteInfo(realtimeSteps, realtimeRunning);

  const runAllSuites = async () => {
    if (isGlobalRunning) return;
    setIsGlobalRunning(true);

    try {
      setActiveTab('mcp');
      await mcpRef.current?.runAll();
      
      setActiveTab('db');
      await dbRef.current?.runAll();
      
      setActiveTab('storage');
      await storageRef.current?.runAll();
      
      setActiveTab('functions');
      await edgeFnRef.current?.runAll();
      
      setActiveTab('realtime');
      await realtimeRef.current?.runAll();
      
      setActiveTab('overview');
    } catch (e) {
      console.error('Global execution failed', e);
    } finally {
      setIsGlobalRunning(false);
    }
  };

  const resetAllSuites = () => {
    mcpRef.current?.reset();
    dbRef.current?.reset();
    storageRef.current?.reset();
    edgeFnRef.current?.reset();
    realtimeRef.current?.reset();
  };

  return (
    <div className='app-container'>
      {/* Sidebar Navigation */}
      <div className='sidebar'>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <div className='sidebar-logo'>
            <Activity size={22} style={{ color: '#3ecf8e' }} />
            <Heading size='3' style={{ color: '#ffffff', letterSpacing: '-0.3px' }}>Multibase Checker</Heading>
          </div>

          <div className='sidebar-menu'>
            <div 
              className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <div className='sidebar-item-content'>
                <LayoutGrid size={16} />
                <Text>Overview</Text>
              </div>
            </div>

            <div 
              className={`sidebar-item ${activeTab === 'mcp' ? 'active' : ''}`}
              onClick={() => setActiveTab('mcp')}
            >
              <div className='sidebar-item-content'>
                <Cpu size={16} />
                <Text>MCP Connection</Text>
              </div>
              {mcpInfo.total > 0 && (
                <Badge color={mcpInfo.color} size="1">
                  {mcpInfo.passed}/{mcpInfo.total}
                </Badge>
              )}
            </div>

            <div 
              className={`sidebar-item ${activeTab === 'db' ? 'active' : ''}`}
              onClick={() => setActiveTab('db')}
            >
              <div className='sidebar-item-content'>
                <Database size={16} />
                <Text>Database (CRUD)</Text>
              </div>
              {dbInfo.total > 0 && (
                <Badge color={dbInfo.color} size="1">
                  {dbInfo.passed}/{dbInfo.total}
                </Badge>
              )}
            </div>

            <div 
              className={`sidebar-item ${activeTab === 'storage' ? 'active' : ''}`}
              onClick={() => setActiveTab('storage')}
            >
              <div className='sidebar-item-content'>
                <HardDrive size={16} />
                <Text>Storage</Text>
              </div>
              {storageInfo.total > 0 && (
                <Badge color={storageInfo.color} size="1">
                  {storageInfo.passed}/{storageInfo.total}
                </Badge>
              )}
            </div>

            <div 
              className={`sidebar-item ${activeTab === 'functions' ? 'active' : ''}`}
              onClick={() => setActiveTab('functions')}
            >
              <div className='sidebar-item-content'>
                <Zap size={16} />
                <Text>Edge Functions</Text>
              </div>
              {edgeInfo.total > 0 && (
                <Badge color={edgeInfo.color} size="1">
                  {edgeInfo.passed}/{edgeInfo.total}
                </Badge>
              )}
            </div>

            <div 
              className={`sidebar-item ${activeTab === 'realtime' ? 'active' : ''}`}
              onClick={() => setActiveTab('realtime')}
            >
              <div className='sidebar-item-content'>
                <Radio size={16} />
                <Text>Realtime</Text>
              </div>
              {realtimeInfo.total > 0 && (
                <Badge color={realtimeInfo.color} size="1">
                  {realtimeInfo.passed}/{realtimeInfo.total}
                </Badge>
              )}
            </div>

            <div 
              className={`sidebar-item ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <div className='sidebar-item-content'>
                <MessageSquare size={16} />
                <Text>Realtime Chat</Text>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className='sidebar-footer'>
          <Flex align='center' justify='between'>
            <Text size='1' color='gray'>Backend State</Text>
            <Badge size='1' color={backendStatus === 'online' ? 'green' : backendStatus === 'offline' ? 'red' : 'yellow'}>
              {backendStatus === 'online' ? 'Online' : backendStatus === 'offline' ? 'Offline' : 'Checking...'}
            </Badge>
          </Flex>
          <Flex gap='2'>
            <Button size='1' variant='soft' color='gray' style={{ flex: 1 }} onClick={checkBackend}>
              <RefreshCw size={12} /> Sync
            </Button>
            <Button size='1' variant='ghost' color='gray' onClick={resetAllSuites}>
              <RotateCcw size={12} /> Reset
            </Button>
          </Flex>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='main-content'>
        {/* Connection Failure Alert */}
        {backendStatus === 'offline' && (
          <Callout.Root color="red" style={{ marginBottom: 24 }}>
            <Callout.Icon><AlertTriangle size={16} /></Callout.Icon>
            <Callout.Text>
              Backend-Server ist offline. Starte ihn mit: <code>cd Testprojekt/backend && npm run dev</code>
            </Callout.Text>
          </Callout.Root>
        )}

        {/* Tab 1: Overview Dashboard */}
        {activeTab === 'overview' && (
          <div>
            <Flex justify="between" align="center" style={{ marginBottom: 24 }}>
              <div>
                <Heading size="6" style={{ color: '#ffffff', letterSpacing: '-0.5px' }}>System Checker Overview</Heading>
                <Text size="2" color="gray">Verify all integrations, databases, gateways, and storage nodes at once.</Text>
              </div>
              <Button size="2" onClick={runAllSuites} disabled={isGlobalRunning || backendStatus !== 'online'}>
                <Play size={14} /> {isGlobalRunning ? 'Running System Tests...' : 'Run All System Tests'}
              </Button>
            </Flex>

            {/* Environment Summary */}
            {backendInfo && (
              <Card style={{ padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Text size="1" color="gray" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>Active Target Environment</Text>
                <Grid columns="3" gap="4" style={{ marginTop: 12 }}>
                  <Box>
                    <Text size="1" color="gray">Multibase API Gateway</Text>
                    <Text size="2" weight="medium" as="div"><Code>{backendInfo.config?.multibaseApi}</Code></Text>
                  </Box>
                  <Box>
                    <Text size="1" color="gray">Selected Instance</Text>
                    <Text size="2" weight="medium" as="div" color="jade"><Code>{backendInfo.config?.instanceName}</Code></Text>
                  </Box>
                  <Box>
                    <Text size="1" color="gray">Supabase Host URL</Text>
                    <Text size="2" weight="medium" as="div" style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      <Code>{backendInfo.config?.supabaseUrl}</Code>
                    </Text>
                  </Box>
                </Grid>
              </Card>
            )}

            {/* Overview Stats Cards Grid */}
            <div className="overview-grid">
              <Card className="overview-card" onClick={() => setActiveTab('mcp')}>
                <Flex justify="between" align="start">
                  <Box>
                    <Cpu size={24} style={{ color: 'var(--cyan-9)' }} />
                    <Text size="3" weight="bold" as="div" style={{ marginTop: 8 }}>MCP Connection</Text>
                    <Text size="1" color="gray">Info, tools listing, calls, overview</Text>
                  </Box>
                  <Badge color={mcpInfo.color}>{mcpInfo.label}</Badge>
                </Flex>
                <Text size="1" color="gray">{mcpInfo.passed} / {mcpInfo.total || 5} tests passed</Text>
              </Card>

              <Card className="overview-card" onClick={() => setActiveTab('db')}>
                <Flex justify="between" align="start">
                  <Box>
                    <Database size={24} style={{ color: 'var(--green-9)' }} />
                    <Text size="3" weight="bold" as="div" style={{ marginTop: 8 }}>Database (CRUD)</Text>
                    <Text size="1" color="gray">Create table, CRUD operations, cleanup</Text>
                  </Box>
                  <Badge color={dbInfo.color}>{dbInfo.label}</Badge>
                </Flex>
                <Text size="1" color="gray">{dbInfo.passed} / {dbInfo.total || 6} tests passed</Text>
              </Card>

              <Card className="overview-card" onClick={() => setActiveTab('storage')}>
                <Flex justify="between" align="start">
                  <Box>
                    <HardDrive size={24} style={{ color: 'var(--orange-9)' }} />
                    <Text size="3" weight="bold" as="div" style={{ marginTop: 8 }}>Storage</Text>
                    <Text size="1" color="gray">Bucket, Upload, Download, Public URL</Text>
                  </Box>
                  <Badge color={storageInfo.color}>{storageInfo.label}</Badge>
                </Flex>
                <Text size="1" color="gray">{storageInfo.passed} / {storageInfo.total || 6} tests passed</Text>
              </Card>

              <Card className="overview-card" onClick={() => setActiveTab('functions')}>
                <Flex justify="between" align="start">
                  <Box>
                    <Zap size={24} style={{ color: 'var(--yellow-9)' }} />
                    <Text size="3" weight="bold" as="div" style={{ marginTop: 8 }}>Edge Functions</Text>
                    <Text size="1" color="gray">Listing, invoking, logs verification</Text>
                  </Box>
                  <Badge color={edgeInfo.color}>{edgeInfo.label}</Badge>
                </Flex>
                <Text size="1" color="gray">{edgeInfo.passed} / {edgeInfo.total || 3} tests passed</Text>
              </Card>

              <Card className="overview-card" onClick={() => setActiveTab('realtime')}>
                <Flex justify="between" align="start">
                  <Box>
                    <Radio size={24} style={{ color: 'var(--purple-9)' }} />
                    <Text size="3" weight="bold" as="div" style={{ marginTop: 8 }}>Realtime</Text>
                    <Text size="1" color="gray">Channels, broadcast subscribe checks</Text>
                  </Box>
                  <Badge color={realtimeInfo.color}>{realtimeInfo.label}</Badge>
                </Flex>
                <Text size="1" color="gray">{realtimeInfo.passed} / {realtimeInfo.total || 4} tests passed</Text>
              </Card>

              <Card className="overview-card" onClick={() => setActiveTab('chat')}>
                <Flex justify="between" align="start">
                  <Box>
                    <MessageSquare size={24} style={{ color: 'var(--blue-9)' }} />
                    <Text size="3" weight="bold" as="div" style={{ marginTop: 8 }}>Realtime Chat</Text>
                    <Text size="1" color="gray">Interactive Supabase Realtime client</Text>
                  </Box>
                  <Badge color="blue">Interactive</Badge>
                </Flex>
                <Text size="1" color="gray">Test live broadcast messages</Text>
              </Card>
            </div>
          </div>
        )}

        {/* Hidden but mounted panel components to preserve test results state */}
        <div style={{ display: activeTab === 'mcp' ? 'block' : 'none' }}>
          <McpTests ref={mcpRef} onStepsChange={(steps, isRunning) => {
            setMcpSteps(steps);
            setMcpRunning(isRunning);
          }} />
        </div>

        <div style={{ display: activeTab === 'db' ? 'block' : 'none' }}>
          <DatabaseTests ref={dbRef} onStepsChange={(steps, isRunning) => {
            setDbSteps(steps);
            setDbRunning(isRunning);
          }} />
        </div>

        <div style={{ display: activeTab === 'storage' ? 'block' : 'none' }}>
          <StorageTests ref={storageRef} onStepsChange={(steps, isRunning) => {
            setStorageSteps(steps);
            setStorageRunning(isRunning);
          }} />
        </div>

        <div style={{ display: activeTab === 'functions' ? 'block' : 'none' }}>
          <EdgeFunctionTests ref={edgeFnRef} onStepsChange={(steps, isRunning) => {
            setEdgeSteps(steps);
            setEdgeRunning(isRunning);
          }} />
        </div>

        <div style={{ display: activeTab === 'realtime' ? 'block' : 'none' }}>
          <RealtimeTests ref={realtimeRef} onStepsChange={(steps, isRunning) => {
            setRealtimeSteps(steps);
            setRealtimeRunning(isRunning);
          }} />
        </div>

        <div style={{ display: activeTab === 'chat' ? 'block' : 'none' }}>
          <RoomChat />
        </div>
      </div>
    </div>
  );
}
