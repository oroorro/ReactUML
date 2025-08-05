import { useCallback, useState } from 'react';
import { Node } from '../types';

export function useNodeApiAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllNodesForUser = useCallback(async (): Promise<Node[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/node/get', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for session authentication
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch nodes: ${res.status} - ${errorText}`);
      }
      
      return await res.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createNode = useCallback(async (nodeData: Omit<Node, 'id'>): Promise<Node> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/node/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for session authentication
        body: JSON.stringify(nodeData),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create node: ${res.status} - ${errorText}`);
      }
      
      return await res.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteNode = useCallback(async (nodeId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/node/delete/${nodeId}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for session authentication
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to delete node: ${res.status} - ${errorText}`);
      }
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
      const res = await fetch(`/node/edit/${nodeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for session authentication
        body: JSON.stringify(updateData),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to edit node: ${res.status} - ${errorText}`);
      }
      
      return await res.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getAllNodesForUser,
    createNode,
    deleteNode,
    editNode,
    loading,
    error,
  };
} 