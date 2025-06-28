import { useState } from 'react';

export interface CreateNodeDto {
  uid: string;
  name: string;
  isStartingNode: boolean;
}

interface BatchRequestPayload {
  created: {
    nodes: CreateNodeDto[];
    pipes: any[]; 
    attributes: any[];
    attributeContents: any[];
  };
  updated: any | null;
  deleted: any | null;
}

interface BatchResponse {
  message?: string;
  [key: string]: any;
}

export function useBatchController() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createNode = async (node: CreateNodeDto): Promise<BatchResponse | null> => {
    setLoading(true);
    setError(null);

    const payload: BatchRequestPayload = {
      created: {
        nodes: [node],
        pipes: [],
        attributes: [],
        attributeContents: [],
      },
      updated: null,
      deleted: null,
    };

    try {
      const response = await fetch(
        `${'http://localhost:8080'}/batch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', 
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(`HTTP ${response.status}: ${message}`);
      } else {
        console.log("Response object: ", response);
      }

      const result: BatchResponse = await response.json();
      console.log("Response body: ", result);
      return result;
    } catch (err: any) {
      setError(err);
      console.error('Create node error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createNode, loading, error };
}
