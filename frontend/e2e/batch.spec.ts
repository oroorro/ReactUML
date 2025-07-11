import { test, expect } from '@playwright/test';
import { generateUniqueId } from '../util/util';

test.describe('Batch API E2E Tests', () => {


    /**
     * Logs the status, ok, and JSON body of a Playwright APIResponse.
     * @param {APIResponse} response - The Playwright APIResponse object.
     */
    async function logApiResponse(response) {
        if (!response) {
            console.error('❌ No response object provided to logApiResponse');
            return;
        }
        try {
            console.log('🧾 Response status:', response.status());
            console.log('✅ OK:', response.ok());
            const jsonr = await response.json();
            console.log('📦 JSON response body:', jsonr);
        } catch (e) {
            console.error('❌ Failed to parse JSON or log response:', e);
        }
    }

    test.beforeEach(async ({ page }) => {
        // Go to login page
        await page.goto('http://localhost:8080/login');

        // Fill out login form
        await page.fill('input[name="username"]', 'test7');
        await page.fill('input[name="password"]', '123');
        await page.click('button[type="submit"]');

    });

    test('✅ Should create node with valid input', async ({ page }) => {

        // Should be redirected to frontend after login
        await page.waitForURL('http://localhost:8080/');

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
                clickY = nodeBox.y + nodeBox.height;
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

        // Should be redirected to frontend after login
        await page.waitForURL('http://localhost:8080/');

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

    //test 
    test('create child Node', async ({ page }) => {

        // Should be redirected to frontend after login
        await page.waitForURL('http://localhost:8080/');

        const nodeId = generateUniqueId();
        // 3. Wait for 2 seconds
        await page.waitForTimeout(2000);

        // 4. Wait for Flow to appear
        await page.waitForSelector('.Flow');

        // 5. Click on a node (ReactNode) from pre-existing Node with data-id='1qlx7vx-jj26d3'
        const node = await page.waitForSelector('[data-id="1qlx7vx-jj26d3"]');
        const box = await node.boundingBox();
        if (!box) throw new Error('Node bounding box not found');
        await page.mouse.click(box.x + 3, box.y + 3, { button: 'right' });

        // 6. Wait for create button
        await page.waitForSelector('.create_button');
        await page.click('.create_button');

        // 7. Wait for and click on "create node" button
        await page.waitForSelector('.create_node_button');
        await page.click('.create_node_button');


        // 9. Send POST request to /batch with child node payload
        const response = await page.request.post('http://localhost:8080/batch', {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                created: {
                    nodes: [
                        {
                            uid: nodeId,
                            name: 'Child Node',
                            isStartingNode: false,
                            parentId: '1qlx7vx-jj26d3',
                        },
                    ],
                    pipes: [],
                    attributes: [],
                    attributeContents: [],
                },
            },
        });

        // 10. Assert success



        expect(response.ok()).toBeTruthy();
        const json = await response.json();
        expect(json.success).toBeTruthy();
        const parent = await page.waitForSelector('[data-id="1qlx7vx-jj26d3"]');
        // Search inside the parent for the exact child node by data-id
        const child = await parent.$(`[data-id=${nodeId}]`);

        // Assert the child exists under the parent
        expect(child).not.toBeNull();


    });


    test('✅ 2. Add attribute to existing node', async ({ page }) => {

        // Should be redirected to frontend after login
        await page.waitForURL('http://localhost:8080/');

        await page.waitForTimeout(2000);
        await page.waitForSelector('.Flow');

        // 2. Click on the node with data-id="1qlx7vx-99k6j3"
        const node = await page.waitForSelector('[data-id="1qlx7vx-99k6j3"]');
        const box = await node.boundingBox();
        if (!box) throw new Error('Node bounding box not found');
        await page.mouse.click(box.x + 3, box.y + 3, { button: 'right' });


        // 11. Get node ID from context menu
        const contextMenu = await page.waitForSelector('div.NodeContextMenu[datatype="contextMenu"]');
        const nodeId = await contextMenu.getAttribute('id');
        console.log("nodeId: ", nodeId)
        expect(nodeId).toBeTruthy();

        // 3–4. Wait for context menu to appear
        await page.waitForSelector('.create_button');
        await page.click('.create_button');

        // 5–6. Create attribute menu
        await page.waitForSelector('.create_attribute_button');
        await page.click('.create_attribute_button');

        // 7–8. Select attribute type
        await page.waitForSelector('.attribute_button_sub_select_type');
        await page.click('.attribute_button_sub_select_type');

        // 9–10. Select 3rd level type: import
        await page.waitForSelector('button.attribute_button_sub_3rd_select_type.import');
        await page.click('button.attribute_button_sub_3rd_select_type.import');

        // 12. Send CreateAttributeDto request
        const response = await page.request.post('http://localhost:8080/batch', {
            headers: { 'Content-Type': 'application/json' },
            data: {
                created: {
                    nodes: [],
                    pipes: [],
                    attributes: [
                        {
                            uid: generateUniqueId(),
                            name: 'import',
                            node: {
                                uid: nodeId,
                            },
                        },
                    ],
                    attributeContents: [],
                },
                updated: null,
                deleted: null,
            },
        });
        logApiResponse(response);

        expect(response.ok()).toBeTruthy();
        const json = await response.json();
        expect(json.success).toBeTruthy();

        await page.mouse.click(box.x + 3, box.y + 3, { button: 'right' });

        // 4. Wait and click "create_button"
        await page.waitForSelector('.create_button');
        await page.click('.create_button');

        // 5. Wait and click "create_pipe_button"
        await page.waitForSelector('.create_pipe_button');
        await page.click('.create_pipe_button');

        // 6. Prepare CreatePipeDto
        const pipeData = {
            uid: generateUniqueId(),
            name: 'Auto Pipe',
            sourceNode: { uid: nodeId },
            targetNode: null, // Optional if not set yet
        };

        // 7. Send to /batch
        const responsepipe = await page.request.post('http://localhost:8080/batch', {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                created: {
                    nodes: [],
                    pipes: [pipeData],
                    attributes: [],
                    attributeContents: [],
                },
                updated: null,
                deleted: null,
            },
        });

        // 8. Validate response
        logApiResponse(responsepipe);
        expect(responsepipe.ok()).toBeTruthy();
        const jsonPipe = await responsepipe.json();
        console.log('Response JSON:', jsonPipe);
        expect(jsonPipe.success).toBeTruthy();
    });


    test('creating Node in the backgroun', async ({ page }) => {
        await page.goto('http://localhost:8080/test-e2e');
        // Should be redirected to frontend after login
        await page.waitForURL('http://localhost:8080/test-e2e');
        await page.waitForTimeout(2000);
        await page.waitForSelector('.Flow');
        //start on background
        //create a node by right clicking 
        await page.mouse.click(500, 300, { button: 'right' });

        const contextMenu = await page.waitForSelector('div.NodeContextMenu[datatype="contextMenu"]');

        //node should be created on right clicked position 
        // Wait for context menu to appear
        await page.waitForSelector('.create_button');
        await page.click('.create_button');

        //create a Node 
        await page.waitForSelector('.create_node_button');
        await page.click('.create_node_button');

        //check for created Node in UI 
        const node = page.locator('.react-flow__node.react-flow__node-ReactNode.nopan.selectable');
        await expect(node).toBeVisible();
        const nodeId = await node.getAttribute('data-id');
        expect(nodeId).not.toBeNull();

        //check for created Node in DB
        const response = await page.request.get(`http://localhost:8080/test-debug/node/${nodeId}`);
        console.log("response", response);
        expect(response.ok()).toBeTruthy();
        const nodeData = await response.json();
        expect(nodeData.uid).toBe(nodeId);

        //right click on created Node 
        const createdNode = await page.waitForSelector(`[data-id="${nodeId}"]`);
        const createdNodebox = await createdNode.boundingBox();
        if (!createdNodebox) throw new Error('Node bounding box not found');
        await page.mouse.click(createdNodebox.x + 3, createdNodebox.y + 3, { button: 'right' });

        //make an attribute
        // 3–4. Wait for context menu to appear
        await page.waitForSelector('.create_button');
        await page.click('.create_button');

        // 5–6. Create attribute menu
        await page.waitForSelector('.create_attribute_button');
        await page.click('.create_attribute_button');

        // 7–8. Select attribute type
        await page.waitForSelector('.attribute_button_sub_select_type');
        await page.click('.attribute_button_sub_select_type');

        // 9–10. Select 3rd level type: import
        await page.waitForSelector('button.attribute_button_sub_3rd_select_type.import');
        await page.click('button.attribute_button_sub_3rd_select_type.import');

        const responseAttribute = await page.request.post('http://localhost:8080/batch', {
            headers: { 'Content-Type': 'application/json' },
            data: {
                created: {
                    nodes: [],
                    pipes: [],
                    attributes: [
                        {
                            uid: generateUniqueId(),
                            name: 'import',
                            node: {
                                uid: nodeId,
                            },
                        },
                    ],
                    attributeContents: [],
                },
                updated: null,
                deleted: null,
            },
        });

        expect(responseAttribute.ok()).toBeTruthy();
        const json = await responseAttribute.json();
        expect(json.success).toBeTruthy();

        //check if create Attribute's div exist under Node (UI test)
        const wrapper = page.locator(`[data-id="${nodeId}"]`)
            .locator('> div')            // 1st level
            .locator('> div')            // 2nd level
            .locator('> div')            // 3rd level
            .locator('> .attributeIconWrapper'); // 4th level

        await expect(wrapper).toBeVisible();

        //check if created attribute got persisted 
        // Fetch node data from backend and check if attribute exists
        const nodeDataAfterAttr = await (await page.request.get(`http://localhost:8080/test-debug/node/${nodeId}`)).json();

        console.log('nodeDataAfterPipe:', JSON.stringify(nodeDataAfterAttr, null, 2));
        expect(nodeDataAfterAttr.uid).toBe(nodeId);
        // Check if attributes array contains the 'import' attribute
        const hasImportAttr = nodeDataAfterAttr.attributes && nodeDataAfterAttr.attributes.some(attr => attr.name === 'import');
        expect(hasImportAttr).toBeTruthy();

        //re-right click on created Node 
        await page.mouse.click(createdNodebox.x + 3, createdNodebox.y + 3, { button: 'right' });

        //create a pipe 
        await page.waitForSelector('.create_button');
        await page.click('.create_button');
        await page.waitForSelector('.create_pipe_button');
        await page.click('.create_pipe_button');
        // Prepare pipe data
        const pipeUid = generateUniqueId();
        const pipeData = {
            uid: pipeUid,
            name: 'Auto Pipe',
            sourceNode: { uid: nodeId },
            targetNode: null,
        };
        // Send pipe creation request
        const responsePipe = await page.request.post('http://localhost:8080/batch', {
            headers: { 'Content-Type': 'application/json' },
            data: {
                created: {
                    nodes: [],
                    pipes: [pipeData],
                    attributes: [],
                    attributeContents: [],
                },
                updated: null,
                deleted: null,
            },
        });
        expect(responsePipe.ok()).toBeTruthy();
        const jsonPipe = await responsePipe.json();
        expect(jsonPipe.success).toBeTruthy();

        // Check if created pipe got persisted
        const nodeDataAfterPipe = await (await page.request.get(`http://localhost:8080/test-debug/node/${nodeId}`)).json();
        // The node should now have at least one outgoing pipe with the correct uid
  


        //re-right click on created Node 


        //create a child Node 


        //check if created child node got persisted 


        //right click on pipe 


        //create an attributecontent 


        //check if created attributecontent got persisted 





    });


});
