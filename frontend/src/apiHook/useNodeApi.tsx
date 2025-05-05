import { useCallback, useState } from 'react';
import { Node } from '../types';

// Type Definitions
// export interface Node {
//   id?: number;
//   userId?: number;
//   name: string;
//   parentId?: number | null;
//   numberOfPropsIn?: number;
//   color?: string;
//   childrenDirection?: string;
//   isStartingNode: boolean;
//   positionX: number;
//   positionY: number;
//   attributes?: any[]; // You can define full types for attributes if needed
// }

export function useNodeApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllNodesForUserId = useCallback(async (userId: number): Promise<Node[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/node/get/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch nodes');
      return await res.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createNode = useCallback(async (userId: number, nodeData: Omit<Node, 'id'>): Promise<Node> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/node/create/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nodeData),
      });
      if (!res.ok) throw new Error('Failed to create node');
      return await res.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteNode = useCallback(async (userId: number, nodeId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/node/delete/${userId}/${nodeId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete node');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const editNode = useCallback(async (nodeId: number, updateData: Partial<Omit<Node, 'id' | 'userId'>>): Promise<Node> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/node/edit/${nodeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error('Failed to edit node');
      return await res.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getAllNodesForUserId,
    createNode,
    deleteNode,
    editNode,
    loading,
    error,
  };
}
