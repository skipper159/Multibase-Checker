import { Card, Table, Flex, Grid, Badge, Text, Code, Callout, Progress, Box } from '@radix-ui/themes';
import { 
  CheckCircle2, 
  XCircle, 
  Database, 
  HardDrive, 
  Zap, 
  Radio, 
  Cpu, 
  Terminal, 
  List, 
  FileText, 
  Check, 
  Link2, 
  Trash2, 
  Play, 
  Clock, 
  Activity, 
  FileCode,
  AlertTriangle
} from 'lucide-react';

interface TestResultRendererProps {
  stepId: string;
  result: any;
}

function formatBytes(bytes: number) {
  if (bytes === 0 || !bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function TestResultRenderer({ stepId, result }: TestResultRendererProps) {
  // If the test failed
  if (!result || result.success === false) {
    const errorMsg = result?.error 
      ? (typeof result.error === 'object' ? JSON.stringify(result.error) : result.error)
      : 'Unbekannter Fehler';
    return (
      <Callout.Root color="red" size="1" style={{ marginTop: 8 }}>
        <Callout.Icon>
          <AlertTriangle size={16} />
        </Callout.Icon>
        <Callout.Text>
          <Text style={{ fontWeight: "bold" }}>Test fehlgeschlagen:</Text> {errorMsg}
        </Callout.Text>
      </Callout.Root>
    );
  }

  const data = result.data;

  // Render based on stepId
  switch (stepId) {
    // ==========================================
    // MCP Connection Tests
    // ==========================================
    case 'info': // MCP Server Info
      return (
        <Card size="1" style={{ marginTop: 8, padding: 12 }}>
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <Cpu size={16} style={{ color: 'var(--cyan-9)' }} />
              <Text size="2" style={{ fontWeight: "bold" }}>MCP Server Metadata</Text>
            </Flex>
            <Grid columns="2" gap="2">
              <Box>
                <Text size="1" color="gray">Name:</Text>
                <Text size="2" weight="medium" as="div">{data?.server?.name || 'N/A'}</Text>
              </Box>
              <Box>
                <Text size="1" color="gray">Version:</Text>
                <Text size="2" weight="medium" as="div">{data?.server?.version || 'N/A'}</Text>
              </Box>
              <Box>
                <Text size="1" color="gray">Protocol Version:</Text>
                <Text size="2" weight="medium" as="div">{data?.protocolVersion || 'N/A'}</Text>
              </Box>
              <Box>
                <Text size="1" color="gray">Capabilities:</Text>
                <Flex gap="1" wrap="wrap" style={{ marginTop: 2 }}>
                  {data?.capabilities && Object.keys(data.capabilities).map((cap) => (
                    <Badge key={cap} color="cyan" size="1">{cap}</Badge>
                  ))}
                  {!data?.capabilities && <Text size="2">None</Text>}
                </Flex>
              </Box>
            </Grid>
          </Flex>
        </Card>
      );

    case 'list-tools': // List MCP Tools
      return (
        <Card size="1" style={{ marginTop: 8, padding: 12 }}>
          <Flex direction="column" gap="2">
            <Flex align="center" justify="between">
              <Flex align="center" gap="2">
                <List size={16} />
                <Text size="2" style={{ fontWeight: "bold" }}>Available MCP Tools</Text>
              </Flex>
              <Badge color="cyan">{data?.toolCount || 0} Tools</Badge>
            </Flex>
            <Flex gap="1" wrap="wrap" style={{ marginTop: 4 }}>
              {data?.tools?.map((toolName: string) => (
                <Code key={toolName} color="cyan" variant="soft" style={{ fontSize: 11 }}>
                  {toolName}
                </Code>
              ))}
            </Flex>
          </Flex>
        </Card>
      );

    case 'call-tool': // Call Tool (list_instances)
      return (
        <Card size="1" style={{ marginTop: 8, padding: 12 }}>
          <Flex direction="column" gap="2">
            <Text size="2" style={{ fontWeight: "bold" ,  marginBottom: 4 }}>Registered Instances</Text>
            {data?.content?.[0]?.text ? (
              (() => {
                try {
                  const instances = JSON.parse(data.content[0].text);
                  return (
                    <Table.Root size="1" variant="ghost">
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Port</Table.ColumnHeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {Array.isArray(instances) && instances.map((inst: any) => (
                          <Table.Row key={inst.id}>
                            <Table.Cell><Code style={{ fontSize: 10 }}>{inst.id?.slice(0, 8)}...</Code></Table.Cell>
                            <Table.Cell >{inst.name}</Table.Cell>
                            <Table.Cell>
                              <Badge color={inst.status === 'running' ? 'green' : 'red'} size="1">
                                {inst.status}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>{inst.basePort}</Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  );
                } catch {
                  return <Code>{data.content[0].text}</Code>;
                }
              })()
            ) : (
              <Text size="2" color="gray">No content returned</Text>
            )}
          </Flex>
        </Card>
      );

    case 'get-instance': // Get Instance Details
      return (
        <Card size="1" style={{ marginTop: 8, padding: 12 }}>
          <Flex direction="column" gap="2">
            {data?.content?.[0]?.text ? (
              (() => {
                try {
                  const inst = JSON.parse(data.content[0].text);
                  return (
                    <Flex direction="column" gap="2">
                      <Flex align="center" justify="between">
                        <Text size="2" style={{ fontWeight: "bold" }}>{inst.name}</Text>
                        <Badge color={inst.status === 'running' ? 'green' : 'red'}>{inst.status}</Badge>
                      </Flex>
                      <Grid columns="2" gap="2">
                        <Box>
                          <Text size="1" color="gray">Base Port:</Text>
                          <Text size="2" weight="medium" as="div">{inst.basePort}</Text>
                        </Box>
                        <Box>
                          <Text size="1" color="gray">Gateway URL:</Text>
                          <Text size="2" weight="medium" as="div" style={{ wordBreak: 'break-all' }}>
                            {inst.supabaseUrl}
                          </Text>
                        </Box>
                        <Box>
                          <Text size="1" color="gray">Org ID:</Text>
                          <Text size="2" weight="medium" as="div">{inst.orgId || 'N/A'}</Text>
                        </Box>
                        <Box>
                          <Text size="1" color="gray">Environment:</Text>
                          <Text size="2" weight="medium" as="div">{inst.environment || 'N/A'}</Text>
                        </Box>
                      </Grid>
                    </Flex>
                  );
                } catch {
                  return <Code>{data.content[0].text}</Code>;
                }
              })()
            ) : (
              <Text size="2" color="gray">No details returned</Text>
            )}
          </Flex>
        </Card>
      );

    case 'system-overview': // System Overview
      return (
        <Card size="1" style={{ marginTop: 8, padding: 12 }}>
          <Flex direction="column" gap="3">
            {data?.content?.[0]?.text ? (
              (() => {
                try {
                  const sys = JSON.parse(data.content[0].text);
                  return (
                    <Flex direction="column" gap="2">
                      <Text size="2" style={{ fontWeight: "bold" }}>Host System Overview</Text>
                      
                      <Box>
                        <Flex justify="between" style={{ marginBottom: 4 }}>
                          <Text size="1" color="gray">System CPU Usage</Text>
                          <Text size="1" weight="medium">{sys.metrics?.totalCpu?.toFixed(1) || 0}%</Text>
                        </Flex>
                        <Progress value={sys.metrics?.totalCpu || 0} color="cyan" size="1" />
                      </Box>

                      <Box>
                        <Flex justify="between" style={{ marginBottom: 4 }}>
                          <Text size="1" color="gray">System RAM Usage</Text>
                          <Text size="1" weight="medium">{sys.metrics?.totalMemory?.toFixed(1) || 0}%</Text>
                        </Flex>
                        <Progress value={sys.metrics?.totalMemory || 0} color="cyan" size="1" />
                      </Box>

                      <Grid columns="2" gap="2" style={{ marginTop: 4 }}>
                        <Card variant="surface" size="1">
                          <Text size="1" color="gray" as="div">Instances</Text>
                          <Text size="3" style={{ fontWeight: "bold" }} color="cyan">{sys.metrics?.instanceCount || 0}</Text>
                        </Card>
                        <Card variant="surface" size="1">
                          <Text size="1" color="gray" as="div">Docker Containers</Text>
                          <Text size="3" style={{ fontWeight: "bold" }} color="cyan">{sys.dockerStats?.totalContainers || 0}</Text>
                        </Card>
                      </Grid>
                    </Flex>
                  );
                } catch {
                  return <Code>{data.content[0].text}</Code>;
                }
              })()
            ) : (
              <Text size="2" color="gray">No system overview returned</Text>
            )}
          </Flex>
        </Card>
      );

    // ==========================================
    // Database (CRUD) Tests
    // ==========================================
    case 'create-table': // Create Test Table
      return (
        <Card size="1" style={{ marginTop: 8, padding: 12 }}>
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <Database size={16} style={{ color: 'var(--green-9)' }} />
              <Text size="2" style={{ fontWeight: "bold" }}>Database Schema Created</Text>
            </Flex>
            <Box style={{ background: 'var(--gray-3)', borderRadius: 6, padding: 10 }}>
              <Text size="2" weight="medium" as="div" style={{ fontFamily: 'monospace', fontSize: 11 }}>
                Table: <span style={{ color: 'var(--green-9)' }}>_test_items</span>
              </Text>
              <Table.Root size="1" style={{ marginTop: 6 }} variant="ghost">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Column</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Details</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell><Code>id</Code></Table.Cell>
                    <Table.Cell><Text size="1">SERIAL</Text></Table.Cell>
                    <Table.Cell><Badge color="green">Primary Key</Badge></Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell><Code>name</Code></Table.Cell>
                    <Table.Cell><Text size="1">TEXT</Text></Table.Cell>
                    <Table.Cell><Text size="1">NOT NULL</Text></Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell><Code>value</Code></Table.Cell>
                    <Table.Cell><Text size="1">TEXT</Text></Table.Cell>
                    <Table.Cell><Text size="1">NULL</Text></Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell><Code>created_at</Code></Table.Cell>
                    <Table.Cell><Text size="1">TIMESTAMPTZ</Text></Table.Cell>
                    <Table.Cell><Text size="1">DEFAULT NOW()</Text></Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table.Root>
            </Box>
          </Flex>
        </Card>
      );

    case 'insert': // Insert Data
    case 'read': // Read Data
    case 'update': // Update Row
    case 'delete': // Delete Row
      return (
        <Card size="1" style={{ marginTop: 8, padding: 12 }}>
          <Flex direction="column" gap="2">
            <Flex align="center" justify="between">
              <Text size="2" style={{ fontWeight: "bold" }}>
                {stepId === 'insert' ? 'Inserted Rows' : stepId === 'read' ? 'Fetched Rows' : stepId === 'update' ? 'Row Updated' : 'After Delete'}
              </Text>
              <Badge color="green">
                {stepId === 'insert' ? `${data?.insertedRows || 0} rows` : `${data?.rows?.length || data?.data?.length || 0} rows`}
              </Badge>
            </Flex>
            
            <Table.Root size="1" variant="surface">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Created At</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {(() => {
                  const rows = data?.rows || data?.data || (data?.updatedRow ? [data.updatedRow] : []);
                  return rows.map((row: any) => {
                    const isUpdated = stepId === 'update' && row.name === 'Test Item 1';
                    return (
                      <Table.Row 
                        key={row.id} 
                        style={isUpdated ? { 
                          background: 'rgba(0, 255, 100, 0.08)'
                        } : {}}
                      >
                        <Table.Cell><Code>{row.id}</Code></Table.Cell>
                        <Table.Cell >
                          {row.name}
                          {isUpdated && <Badge color="green" style={{ marginLeft: 6 }}>Updated</Badge>}
                        </Table.Cell>
                        <Table.Cell style={{ color: 'var(--gray-11)', fontSize: 11 }}>{row.value}</Table.Cell>
                        <Table.Cell style={{ color: 'var(--gray-9)', fontSize: 10 }}>
                          {row.created_at ? new Date(row.created_at).toLocaleTimeString() : 'N/A'}
                        </Table.Cell>
                      </Table.Row>
                    );
                  });
                })()}
              </Table.Body>
            </Table.Root>
            {stepId === 'delete' && data?.deletedId && (
              <Callout.Root color="gray" size="1" style={{ marginTop: 4 }}>
                <Callout.Icon><Trash2 size={14} /></Callout.Icon>
                <Callout.Text>Row with ID <Code>{data.deletedId}</Code> was deleted successfully.</Callout.Text>
              </Callout.Root>
            )}
          </Flex>
        </Card>
      );

    case 'db-cleanup': // Database Cleanup (Drop Table)
      return (
        <Card size="1" style={{ marginTop: 8, padding: 12 }}>
          <Flex align="center" gap="3">
            <div style={{ background: 'rgba(255, 50, 50, 0.15)', borderRadius: '50%', padding: 8 }}>
              <Trash2 size={20} color="var(--red-9)" />
            </div>
            <Box>
              <Text size="2" style={{ fontWeight: "bold" }}>Database Cleaned</Text>
              <Text size="1" color="gray" as="div">Table <Code>_test_items</Code> was dropped, storage and database schemas are clean.</Text>
            </Box>
          </Flex>
        </Card>
      );

    // ==========================================
    // Storage Tests
    // ==========================================
    case 'create-bucket':
      return (
        <Card size="1" style={{ marginTop: 8, padding: 12 }}>
          <Flex align="center" gap="3">
            <div style={{ background: 'rgba(255, 140, 0, 0.15)', borderRadius: '50%', padding: 8 }}>
              <HardDrive size={20} color="var(--orange-9)" />
            </div>
            <Box>
              <Text size="2" style={{ fontWeight: "bold" }}>Storage Bucket Ready</Text>
              <Text size="1" color="gray" as="div">Bucket: <Code>test-bucket</Code></Text>
              <Badge color="orange" size="1" style={{ marginTop: 4 }}>Public Access Enabled</Badge>
            </Box>
          </Flex>
        </Card>
      );

    case 'upload':
      return (
        <Card size="1" style={{ marginTop: 8, padding: 12 }}>
          <Flex direction="column" gap="2">
            <Text size="2" style={{ fontWeight: "bold" }}>File Upload Completed</Text>
            <Box style={{ background: 'var(--gray-3)', borderRadius: 6, padding: 10 }}>
              <Grid columns="2" gap="2">
                <Box>
                  <Text size="1" color="gray">Remote Path:</Text>
                  <Text size="2" weight="medium" as="div"><Code>{data?.path}</Code></Text>
                </Box>
                <Box>
                  <Text size="1" color="gray">Full Path:</Text>
                  <Text size="2" weight="medium" as="div" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {data?.fullPath}
                  </Text>
                </Box>
              </Grid>
              <Box style={{ marginTop: 8 }}>
                <Flex justify="between" style={{ marginBottom: 2 }}>
                  <Text size="1" color="green">Upload Status</Text>
                  <Text size="1" weight="medium" color="green">100% (Verifiziert)</Text>
                </Flex>
                <Progress value={100} color="orange" size="1" />
              </Box>
            </Box>
          </Flex>
        </Card>
      );

    case 'storage-list':
      return (
        <Card size="1" style={{ marginTop: 8, padding: 12 }}>
          <Flex direction="column" gap="2">
            <Flex align="center" justify="between">
              <Text size="2" style={{ fontWeight: "bold" }}>Files In Bucket</Text>
              <Badge color="orange">{data?.fileCount || 0} Files</Badge>
            </Flex>
            <Table.Root size="1" variant="ghost">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>File Name</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Size</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Mime Type</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {data?.files?.map((file: any) => (
                  <Table.Row key={file.name}>
                    <Table.Cell><Flex align="center" gap="1"><FileText size={12} /> <Text size="1">{file.name}</Text></Flex></Table.Cell>
                    <Table.Cell><Text size="1">{formatBytes(file.size)}</Text></Table.Cell>
                    <Table.Cell><Code style={{ fontSize: 10 }}>{file.mimetype || 'text/plain'}</Code></Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Flex>
        </Card>
      );

    case 'download':
      return (
        <Card size="1" style={{ marginTop: 8, padding: 12 }}>
          <Flex direction="column" gap="2">
            <Flex align="center" justify="between">
              <Text size="2" style={{ fontWeight: "bold" }}>Download Verification</Text>
              <Badge color="green"><Check size={12} /> Verified Matches</Badge>
            </Flex>
            <Box style={{ background: 'var(--gray-3)', borderRadius: 6, padding: 10 }}>
              <Text size="1" color="gray" as="div" style={{ marginBottom: 4 }}>Downloaded File Content:</Text>
              <Code style={{ fontSize: 11, background: 'var(--gray-2)' }}>{data?.downloadedContent}</Code>
            </Box>
          </Flex>
        </Card>
      );

    case 'public-url':
      return (
        <Card size="1" style={{ marginTop: 8, padding: 12 }}>
          <Flex direction="column" gap="2">
            <Text size="2" style={{ fontWeight: "bold" }}>Public URL Generated</Text>
            <Flex gap="2" align="center">
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Code style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: 11 }}>
                  {data?.publicUrl}
                </Code>
              </Box>
              <a href={data?.publicUrl} target="_blank" rel="noreferrer">
                <Badge color="orange" style={{ cursor: 'pointer' }}>
                  <Link2 size={12} style={{ marginRight: 3 }} /> Open URL
                </Badge>
              </a>
            </Flex>
          </Flex>
        </Card>
      );

    case 'storage-cleanup':
      return (
        <Card size="1" style={{ marginTop: 8, padding: 12 }}>
          <Flex align="center" gap="3">
            <div style={{ background: 'rgba(255, 50, 50, 0.15)', borderRadius: '50%', padding: 8 }}>
              <Trash2 size={20} color="var(--red-9)" />
            </div>
            <Box>
              <Text size="2" style={{ fontWeight: "bold" }}>Storage Cleaned</Text>
              <Text size="1" color="gray" as="div">Test bucket <Code>test-bucket</Code> and all test files deleted successfully.</Text>
            </Box>
          </Flex>
        </Card>
      );

    // ==========================================
    // Edge Functions Tests
    // ==========================================
    case 'edge-list': // We must map this correctly
      return (
        <Card size="1" style={{ marginTop: 8, padding: 12 }}>
          <Flex direction="column" gap="2">
            <Flex align="center" justify="between">
              <Text size="2" style={{ fontWeight: "bold" }}>Active Edge Functions</Text>
              <Badge color="yellow">Functions Online</Badge>
            </Flex>
            {Array.isArray(data) && data.length > 0 ? (
              <Table.Root size="1" variant="ghost">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Deploy Date</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.map((fn: any) => (
                    <Table.Row key={fn.id || fn.name}>
                      <Table.Cell><Flex align="center" gap="1"><Zap size={12} color="var(--yellow-9)" /> <Text size="1" weight="medium">{fn.name}</Text></Flex></Table.Cell>
                      <Table.Cell><Badge color={fn.status === 'ACTIVE' ? 'green' : 'yellow'}>{fn.status}</Badge></Table.Cell>
                      <Table.Cell style={{ color: 'var(--gray-9)', fontSize: 10 }}>
                        {fn.updated_at ? new Date(fn.updated_at).toLocaleDateString() : 'N/A'}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            ) : (
              <Box style={{ background: 'var(--gray-3)', borderRadius: 6, padding: 12, textAlign: 'center' }}>
                <Text size="2" color="gray">No Edge Functions deployed. Defaulting main.</Text>
              </Box>
            )}
          </Flex>
        </Card>
      );

    case 'invoke': // Invoke Function
      return (
        <Card size="1" style={{ marginTop: 8, padding: 12 }}>
          <Flex direction="column" gap="2">
            <Flex align="center" justify="between">
              <Text size="2" style={{ fontWeight: "bold" }}>Invocation Status</Text>
              <Flex gap="1">
                <Badge color="green">200 OK</Badge>
                {data?.executionTimeMs && <Badge color="gray">{data.executionTimeMs}ms</Badge>}
              </Flex>
            </Flex>
            <Box style={{ background: 'var(--gray-3)', borderRadius: 6, padding: 10 }}>
              <Text size="1" color="gray" as="div" style={{ marginBottom: 4 }}>Response JSON:</Text>
              <Code style={{ fontSize: 11, background: 'var(--gray-2)' }}>
                {JSON.stringify(data?.response || data, null, 2)}
              </Code>
            </Box>
          </Flex>
        </Card>
      );

    case 'logs': // Function Logs
      return (
        <Card size="1" style={{ marginTop: 8, padding: 0, overflow: 'hidden' }}>
          <Flex direction="column">
            <Flex align="center" justify="between" style={{ padding: '8px 12px', background: 'var(--gray-4)', borderBottom: '1px solid var(--gray-6)' }}>
              <Flex align="center" gap="2">
                <Terminal size={14} />
                <Text size="1" style={{ fontWeight: "bold" ,  fontFamily: 'monospace' }}>terminal - logs:main</Text>
              </Flex>
              <Badge color="yellow" size="1">Streaming Logs</Badge>
            </Flex>
            <Box style={{ 
              background: '#090d16', 
              padding: 12, 
              maxHeight: 180, 
              overflowY: 'auto', 
              fontFamily: 'var(--code-font-family)', 
              fontSize: 11,
              color: '#a0aec0'
            }}>
              {Array.isArray(data) && data.length > 0 ? (
                data.map((log: any, idx: number) => {
                  const isErr = log.level === 'error' || log.level === 'stderr';
                  return (
                    <div key={idx} style={{ marginBottom: 4, display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--gray-9)' }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '00:00:00'}
                      </span>
                      <span style={{ color: isErr ? 'var(--red-9)' : 'var(--yellow-9)' }}>
                        [{log.level?.toUpperCase() || 'INFO'}]
                      </span>
                      <span style={{ color: isErr ? '#fc8181' : '#e2e8f0', flex: 1, wordBreak: 'break-all' }}>
                        {log.message}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: 'var(--gray-9)', textAlign: 'center' }}>No log entries found. Execution completed.</div>
              )}
            </Box>
          </Flex>
        </Card>
      );

    // ==========================================
    // Realtime Tests
    // ==========================================
    case 'config':
      return (
        <Card size="1" style={{ marginTop: 8, padding: 12 }}>
          <Flex direction="column" gap="2">
            <Text size="2" style={{ fontWeight: "bold" }}>Realtime Configuration</Text>
            <Grid columns="2" gap="2">
              <Box>
                <Text size="1" color="gray">Realtime URL:</Text>
                <Text size="2" weight="medium" as="div"><Code>{data?.realtimeUrl || data?.url || 'N/A'}</Code></Text>
              </Box>
              <Box>
                <Text size="1" color="gray">Gateway Port:</Text>
                <Text size="2" weight="medium" as="div">{data?.gatewayPort || 4645}</Text>
              </Box>
              <Box>
                <Text size="1" color="gray">Channel:</Text>
                <Text size="2" weight="medium" as="div"><Code>realtime-test-channel</Code></Text>
              </Box>
              <Box>
                <Text size="1" color="gray">Subscribed Event:</Text>
                <Text size="2" weight="medium" as="div"><Code>test-event</Code></Text>
              </Box>
            </Grid>
          </Flex>
        </Card>
      );

    case 'stats':
      return (
        <Card size="1" style={{ marginTop: 8, padding: 12 }}>
          <Flex direction="column" gap="2">
            <Text size="2" style={{ fontWeight: "bold" }}>Realtime Node Stats</Text>
            <Grid columns="3" gap="2" style={{ marginTop: 2 }}>
              <Card variant="surface" size="1">
                <Text size="1" color="gray" as="div">Connected Clients</Text>
                <Text size="3" style={{ fontWeight: "bold" }} color="purple">{data?.connectedClients ?? 0}</Text>
              </Card>
              <Card variant="surface" size="1">
                <Text size="1" color="gray" as="div">Active Channels</Text>
                <Text size="3" style={{ fontWeight: "bold" }} color="purple">{data?.activeChannels ?? 0}</Text>
              </Card>
              <Card variant="surface" size="1">
                <Text size="1" color="gray" as="div">Messages Broadcasted</Text>
                <Text size="3" style={{ fontWeight: "bold" }} color="purple">{data?.messagesBroadcasted ?? 0}</Text>
              </Card>
            </Grid>
          </Flex>
        </Card>
      );

    case 'subscribe':
      return (
        <Card size="1" style={{ marginTop: 8, padding: 12 }}>
          <Flex direction="column" gap="2">
            <Flex align="center" justify="between">
              <Text size="2" style={{ fontWeight: "bold" }}>Broadcast Feed</Text>
              <Badge color="purple"><Radio size={12} style={{ marginRight: 3 }} /> Active Channel</Badge>
            </Flex>
            <Flex direction="column" gap="1" style={{ background: '#0e0b16', borderRadius: 6, padding: 10, minHeight: 80 }}>
              <Flex align="center" gap="2">
                <Badge color="green" size="1">Pub</Badge>
                <Text size="1" color="gray">Broadcasted Message:</Text>
                <Code style={{ fontSize: 10 }}>{data?.sentPayload?.message || 'Hello'}</Code>
              </Flex>
              <Flex align="center" gap="2" style={{ marginTop: 4 }}>
                <Badge color="purple" size="1">Sub</Badge>
                <Text size="1" color="gray">Received Message:</Text>
                <Code style={{ fontSize: 10 }} color="purple">{data?.receivedPayload?.message || 'Hello (Verified)'}</Code>
              </Flex>
              <Flex justify="between" style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 6 }}>
                <Text size="1" color="gray">Latency:</Text>
                <Text size="1" weight="medium" color="green">{data?.latencyMs || 0}ms</Text>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      );

    case 'connection-info':
      return (
        <Card size="1" style={{ marginTop: 8, padding: 12 }}>
          <Flex align="center" gap="3">
            <div style={{ background: 'rgba(128, 0, 128, 0.15)', borderRadius: '50%', padding: 8 }}>
              <Activity size={20} color="var(--purple-9)" />
            </div>
            <Box style={{ flex: 1 }}>
              <Flex align="center" justify="between">
                <Text size="2" style={{ fontWeight: "bold" }}>WebSocket Info</Text>
                <Badge color="green">CONNECTED</Badge>
              </Flex>
              <Text size="1" color="gray" as="div">Protocol: <Code style={{ fontSize: 10 }}>WSS / JSON</Code></Text>
            </Box>
          </Flex>
        </Card>
      );

    default:
      // Fallback: render clean JSON
      return (
        <Box style={{ marginTop: 8 }}>
          <Code style={{ maxHeight: 200, overflowY: 'auto', fontSize: 11 }}>
            {JSON.stringify(data || result, null, 2)}
          </Code>
        </Box>
      );
  }
}
