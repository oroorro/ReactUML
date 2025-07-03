import { useState } from 'react';

export interface CreateNodeDto {
  uid: string;
  name: string;
  isStartingNode: boolean;
  parentId?: string;
  userId: number;
}

export interface EditNodeDto {
  uid: string;
  name?: string;
  isStartingNode?: boolean;
  color?: string;
  numberOfPropsIn?: number;
  childDirection?: string;
  positionX?: number;
  positionY?: number;
  state?: string;
  parentId?: string;
  userId?: number;
}

export interface CreateAttributeDto {
  uid: string;
  name: string;
  totalNumber?: number;
  mute?: boolean;
  node: {
    uid: string;
  };
}

export interface CreatePipeDto {
  uid: string;
  name?: string;
  color?: string;
  mute?: boolean;
  sourceNode: {uid: string};
  targetNode: { uid: string } | null; 
}

interface BatchRequestPayload {
  created: {
    nodes: CreateNodeDto[];
    pipes: CreatePipeDto[];
    attributes: CreateAttributeDto[];
    attributeContents: any[];
  };
  updated: {
    nodes?: EditNodeDto[];
    pipes?: any[];
    attributes?: any[];
    attributeContents?: any[];
  } | null;
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


  const createPipe = async (pipe: CreatePipeDto): Promise<BatchResponse | null> => {
    setLoading(true);
    setError(null);

    const payload: BatchRequestPayload = {
      created: {
        nodes: [],
        pipes: [pipe],
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
        console.log("Hook: Response object: ", response);
      }

      const result: BatchResponse = await response.json();
      console.log("Hook: Response body: ", result);
      return result;
    } catch (err: any) {
      setError(err);
      console.error('Hook: Create pipe error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createAttribute = async (attribute: CreateAttributeDto): Promise<BatchResponse | null> => {
    setLoading(true);
    setError(null);

    const payload: BatchRequestPayload = {
      created: {
        nodes: [],
        pipes: [],
        attributes: [attribute],
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
      console.error('Create attribute error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const editNode = async (node: EditNodeDto): Promise<BatchResponse | null> => {
    setLoading(true);
    setError(null);

    const payload: BatchRequestPayload = {
      created: {
        nodes: [],
        pipes: [],
        attributes: [],
        attributeContents: [],
      },
      updated: {
        nodes: [node],
        pipes: [],
        attributes: [],
        attributeContents: [],
      },
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
      console.error('Edit node error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createNode, createAttribute, createPipe, editNode, loading, error };
}
