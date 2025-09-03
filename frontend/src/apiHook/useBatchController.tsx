import { useState } from 'react';

export interface CreateNodeDto {
  uid: string;
  name: string;
  isStartingNode: boolean;
  parentId?: string;
  positionX?: number;
  positionY?: number;
  type?: string;
  //userId: number;
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

export interface CreateAttributeContentDto {
  uid: string;
  name: string;
  holdingValue?: string;
  attribute?: {
    uid: string | null;
  };
  pipe?: {
    uid: string;
  };
  belongingNode: {
    uid: string;
  };
}

export interface CreatePipeDto {
  uid: string;
  name?: string;
  color?: string;
  mute?: boolean;
  sourceNode: { uid: string };
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
    console.log(`Creating NODE with UID: ${node.uid}`);
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
        `/batch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );
      // const raw = await response.text();
      // console.error(`❌ Error :`, raw);

      // if (!response.ok) {
      //   //const message = await response.text();
      //   throw new Error(`HTTP ${response.status}: ${message}`);
      // } else {
      //   console.log("Response object: ", response);
      // }

      // const result: BatchResponse = await response.json();
      // console.log("Response body: ", result);
      // return result;

      const text = await response.text(); // consume once

      console.log("HTTP plain: ", text);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      let result: BatchResponse;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        throw new Error("Invalid JSON in response");
      }
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
    console.log(`Creating PIPE with UID: ${pipe.uid}`);
    //log entire pipe object
    console.log("Pipe object:", pipe);

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
        `/batch`,
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
    console.log(`Creating ATTRIBUTE with UID: ${attribute.uid}`);
    console.log("attribute object:", attribute);
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
        `/batch`,
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

  const createContentAttribute = async (attributeContent: CreateAttributeContentDto): Promise<BatchResponse | null> => {
    //console.log(`Creating ATTRIBUTE CONTENT with UID: `,attributeContent.belongingNode.uid, attributeContent.pipe?.uid, attributeContent.uid);
    //log entire attributeContent object
    console.log("AttributeContent object:", attributeContent);
    setLoading(true);
    setError(null);

    const payload: BatchRequestPayload = {
      created: {
        nodes: [],
        pipes: [],
        attributes: [],
        attributeContents: [attributeContent],
      },
      updated: null,
      deleted: null,
    };

    try {
      const response = await fetch(
        `/batch`,
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
      console.error('Create attribute content error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteContentAttribute = async (uid: string): Promise<BatchResponse | null> => {
    console.log(`Deleting ATTRIBUTE CONTENT with UID: ${uid}`);
    setLoading(true);
    setError(null);

    const payload: BatchRequestPayload = {
      created: {
        nodes: [],
        pipes: [],
        attributes: [],
        attributeContents: [],
      },
      updated: null,
      deleted: {
        attributeContentUids: [uid],
      },
    };

    try {
      const response = await fetch(
        `/batch`,
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
      console.error('Delete attribute content error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const editNode = async (node: EditNodeDto[]): Promise<BatchResponse | null> => {
    // console.log(`Editing NODE with UID: ${node.map(node => node.uid).join(', ')}`);
    console.log('Full EditNodeDto structure:', JSON.stringify(node, null, 2));
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
        nodes: node,
        pipes: [],
        attributes: [],
        attributeContents: [],
      },
      deleted: null,
    };

    try {
      const response = await fetch(
        `/batch`,
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
      return result;
    } catch (err: any) {
      setError(err);
      console.error('Edit node error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // New flexible batch function
  const createBatch = async (entities: {
    nodes?: CreateNodeDto[];
    pipes?: CreatePipeDto[];
    attributes?: CreateAttributeDto[];
    attributeContents?: CreateAttributeContentDto[];
  }): Promise<BatchResponse | null> => {
    console.log('Creating BATCH with entities:', entities);
    setLoading(true);
    setError(null);

    const payload: BatchRequestPayload = {
      created: {
        nodes: entities.nodes || [],
        pipes: entities.pipes || [],
        attributes: entities.attributes || [],
        attributeContents: entities.attributeContents || [],
      },
      updated: null,
      deleted: null,
    };

    try {
      const response = await fetch(
        `/batch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();
      console.log('Batch response:', text);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      let result: BatchResponse;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        throw new Error("Invalid JSON in response");
      }
      
      console.log('Batch result:', result);
      return result;
    } catch (err: any) {
      setError(err);
      console.error('Create batch error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createNode, createAttribute, createPipe, createContentAttribute, deleteContentAttribute, editNode, createBatch, loading, error };
}
