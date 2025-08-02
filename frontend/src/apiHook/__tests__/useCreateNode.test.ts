// /frontend/src/apiHook/__tests__/useBatchController.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBatchController } from '../useBatchController';
import { act } from 'react-dom/test-utils';

describe('useBatchController', () => {
  it('should call fetch with correct data and return response', async () => {
    const mockResponse = { success: true };

    //  global fetch
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)
    ));

    const { result } = renderHook(() => useBatchController());

    const data = {
      uid: 'node-1',
      name: 'Start',
      isStartingNode: true,
    };

    let response;

    await act(async () => {
     response = await result.current.createNode(data);
    });
    
    expect(response).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8080/batch',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: expect.stringContaining('"uid":"node-1"'),
      })
    );
  });

  it('should handle 400 Bad Request on invalid input', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid input: uid is required' }),
      })
    ));
  
    const { result } = renderHook(() => useBatchController());
  
    const badData = {
        // missing uid
        name: 'Broken',
        isStartingNode: true,
      } as any;
    
      let error: any;
      
  let response;
      await act(async () => {
        try {
            response = await result.current.createNode(badData);
        } catch (e) {
          error = e;
        }
      });

      console.log('🪵 Error:', error);
      console.log('🪵 Response:', response);
    //   expect(error).toBeDefined();
    //   expect(error?.message).toContain('HTTP 200');
  });
  
});
