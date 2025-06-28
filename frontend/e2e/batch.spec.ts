import { test, expect } from '@playwright/test';

test.describe('Batch API E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Go to login page
    await page.goto('http://localhost:8080/login');

    // Fill out login form
    await page.fill('input[name="username"]', 'ap');
    await page.fill('input[name="password"]', '123');
    await page.click('button[type="submit"]');

    // Should be redirected to frontend after login
    await page.waitForURL('http://localhost:8080/');
  });

  test('✅ Should create node with valid input', async ({ page }) => {

    await page.waitForSelector('.Flow'); 
    await page.waitForTimeout(2000); 
    // Simulate context menu trigger
    //await page.click('.Flow',{ button: 'right' }); 
    // 3. Wait for context menu to appear (adjust selector to match your HTML)
    // Get bounding box of the node you want to avoid
  const nodeBox = await page.locator('.react-flow__node.react-flow__node-ReactNode').boundingBox();
  const flowBox = await page.locator('.Flow').boundingBox();

  if (nodeBox && flowBox) {
    // Choose a point inside .Flow but outside the node box
    let clickX = flowBox.x + nodeBox.width;
    let clickY = flowBox.y + 20;

    // Make sure it doesn’t overlap the node
    if (
      clickX > nodeBox.x &&
      clickX < nodeBox.x + nodeBox.width &&
      clickY > nodeBox.y &&
      clickY < nodeBox.y + nodeBox.height
    ) {
      // Move to an area just below the node
      clickY = nodeBox.y + nodeBox.height ;
    }

    await page.mouse.click(clickX, clickY, { button: 'right' });

  }
    await page.waitForSelector('.create_button', { timeout: 2000 });
    await page.click('.create_button'); // Assuming it appears

    await page.waitForSelector('.create_node_button', { timeout: 2000 });
    await page.click('.create_node_button'); // Assuming it appears

    page.on('request', req => console.log('➡️', req.method(), req.url()));

    // Wait for response and assert
    const response = await page.waitForResponse(resp =>
        resp.url() === 'http://localhost:8080/batch' && resp.request().method() === 'POST',
      { timeout: 5000 }
    );

    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.success).toBeTruthy();
  });

  test('❌ Should show error for invalid node creation (missing uid)', async ({ page }) => {
    await page.waitForSelector('.Flow'); 
    await page.waitForTimeout(2000); 

    // Manually fire invalid request to simulate user sending bad data
    const response = await page.request.post('http://localhost:8080/batch', {
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        created: {
          nodes: [
            {
              name: 'No UID Node',
              isStartingNode: true
            }
          ],
          pipes: [],
          attributes: [],
          attributeContents: []
        },
        updated: null,
        deleted: null
      }
    });

    expect(response.status()).toBe(500);
    const json = await response.json();
    expect(json.error).toContain('uid must not be null');
  });
});
