import { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Database } from 'lucide-react';
import TestPanel from './TestPanel';
import api from '../lib/api';
import type { TestStep } from '../types';

interface DatabaseTestsProps {
  onStepsChange?: (steps: TestStep[], isRunning: boolean) => void;
}

export interface TestSuiteRef {
  runAll: () => Promise<void>;
  reset: () => void;
}

const initialSteps: TestStep[] = [
  { id: 'create-table', name: 'Create Test Table (_test_items)', status: 'idle' },
  { id: 'insert', name: 'Insert Test Data (3 rows)', status: 'idle' },
  { id: 'read', name: 'Read Data', status: 'idle' },
  { id: 'update', name: 'Update Row', status: 'idle' },
  { id: 'delete', name: 'Delete Row', status: 'idle' },
  { id: 'db-cleanup', name: 'Cleanup (Drop Table)', status: 'idle' },
];

export const DatabaseTests = forwardRef<TestSuiteRef, DatabaseTestsProps>(({ onStepsChange }, ref) => {
  const [steps, setSteps] = useState<TestStep[]>(initialSteps);
  const [isRunning, setIsRunning] = useState(false);

  const updateStep = useCallback((id: string, update: Partial<TestStep>) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...update } : s)));
  }, []);

  const runAll = useCallback(async () => {
    setIsRunning(true);
    setSteps(initialSteps.map((s) => ({ ...s, status: 'idle', result: undefined })));

    const tests: { id: string; method: string; url: string }[] = [
      { id: 'create-table', method: 'POST', url: '/tests/db/create-table' },
      { id: 'insert', method: 'POST', url: '/tests/db/insert' },
      { id: 'read', method: 'POST', url: '/tests/db/read' },
      { id: 'update', method: 'POST', url: '/tests/db/update' },
      { id: 'delete', method: 'POST', url: '/tests/db/delete' },
      { id: 'db-cleanup', method: 'POST', url: '/tests/db/cleanup' },
    ];

    for (const test of tests) {
      updateStep(test.id, { status: 'running' });
      try {
        let res;
        switch (test.method) {
          case 'GET':
            res = await api.get(test.url);
            break;
          case 'POST':
            res = await api.post(test.url);
            break;
          case 'PUT':
            res = await api.put(test.url);
            break;
          case 'DELETE':
            res = await api.delete(test.url);
            break;
          default:
            res = await api.get(test.url);
        }
        updateStep(test.id, {
          status: res.data?.success ? 'pass' : 'fail',
          result: res.data,
        });
        // Stop on failure (except cleanup)
        if (!res.data?.success && test.id !== 'db-cleanup') {
          break;
        }
      } catch (error: any) {
        updateStep(test.id, {
          status: 'fail',
          result: { success: false, test: test.id, error: error.message },
        });
        break;
      }
    }

    setIsRunning(false);
  }, [updateStep]);

  const reset = useCallback(() => {
    setSteps(initialSteps.map((s) => ({ ...s, status: 'idle', result: undefined })));
  }, []);

  useImperativeHandle(ref, () => ({
    runAll,
    reset
  }));

  useEffect(() => {
    onStepsChange?.(steps, isRunning);
  }, [steps, isRunning, onStepsChange]);

  return (
    <TestPanel
      title='Database (CRUD)'
      icon={<Database size={20} style={{ color: 'var(--green-9)' }} />}
      steps={steps}
      onRunAll={runAll}
      onReset={reset}
      isRunning={isRunning}
    />
  );
});

export default DatabaseTests;
