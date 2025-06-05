/**
 * Food Facility Permits VS Code Extension
 * 
 * Architecture:
 * 1. Backend (FastAPI):
 *    - Runs as a separate process on port 8000
 *    - Uses in-memory SQLite database initialized from CSV
 *    - Endpoints:
 *      - /permits - Get all permits or filter by applicant/status
 *      - /permits/address - Search by address (partial matches)
 *      - /permits/nearby - Find permits near coordinates
 * 
 * 2. Frontend (React):
 *    - Runs in VS Code webview
 *    - Communicates with backend via HTTP
 *    - Sends messages to extension which proxies requests to backend
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';

let backendProcess: cp.ChildProcess | undefined;
let webviewPanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('Food Facility Permits extension is now active!');

    // Register the command to open the search UI
    let disposable = vscode.commands.registerCommand('permits.openSearchUI', async () => {
        console.log('Opening Food Permits Search UI...');

        // Use absolute path to backend
        const backendPath = '/Users/arckex/source/radai/backend';
        console.log('Using backend path:', backendPath);

        if (!fs.existsSync(backendPath)) {
            vscode.window.showErrorMessage(`Backend directory not found at ${backendPath}`);
            return;
        }

        // Start the backend if it's not running
        if (!backendProcess) {
            try {
                await startBackend(backendPath);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to start backend: ${error instanceof Error ? error.message : 'Unknown error'}`);
                return;
            }
        }

        if (webviewPanel) {
            webviewPanel.reveal(vscode.ViewColumn.One);
            return;
        }

        // Create and show panel
        webviewPanel = vscode.window.createWebviewPanel(
            'permitsSearch',
            'Food Facility Permits',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(context.extensionPath, 'webview', 'dist'))
                ],
                enableFindWidget: true,
                enableCommandUris: true
            }
        );

        // Set webview options
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(context.extensionPath, 'webview', 'dist'))
            ]
        };

        // Load the React app
        try {
            const htmlContent = getWebviewContent(webviewPanel, context.extensionUri);
            webviewPanel.webview.html = htmlContent;
            console.log('Webview HTML content set successfully');
        } catch (error) {
            console.error('Failed to set webview HTML:', error);
            vscode.window.showErrorMessage(`Failed to load webview: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return;
        }

        // Handle messages from the webview
        webviewPanel.webview.onDidReceiveMessage(
            async message => {
                try {
                    if (!message.endpoint) {
                        throw new Error('No endpoint specified in message');
                    }

                    const url = new URL(`http://127.0.0.1:8000${message.endpoint}`);
                    if (message.params) {
                        Object.entries(message.params).forEach(([key, value]) => {
                            if (value !== undefined && value !== null && value !== '') {
                                url.searchParams.append(key, String(value));
                            }
                        });
                    }

                    console.log('Making request to:', url.toString());
                    const response = await fetch(url.toString(), {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => null);
                        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    console.log('Received response:', data);
                    webviewPanel?.webview.postMessage({ type: 'response', data });
                } catch (error) {
                    console.error('Error handling webview message:', error);
                    webviewPanel?.webview.postMessage({
                        type: 'error',
                        error: error instanceof Error ? error.message : 'Unknown error occurred'
                    });
                }
            },
            undefined,
            context.subscriptions
        );

        // Reset when the panel is disposed
        webviewPanel.onDidDispose(
            () => {
                webviewPanel = undefined;
            },
            null,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

async function startBackend(backendPath: string): Promise<void> {
    const pythonPath = path.join(backendPath, '.venv', 'bin', 'python');
    const appPath = path.join(backendPath, 'main.py');

    console.log('Starting backend with:', {
        backendPath,
        pythonPath,
        appPath
    });

    // Check prerequisites
    if (!fs.existsSync(pythonPath)) {
        throw new Error(`Python not found at ${pythonPath}. Make sure the virtual environment is set up.`);
    }

    if (!fs.existsSync(appPath)) {
        throw new Error(`Backend app not found at ${appPath}`);
    }

    // Start the backend server
    backendProcess = cp.spawn(pythonPath, ['-m', 'uvicorn', 'main:app', '--reload', '--port', '8000'], {
        cwd: backendPath,
        env: { 
            ...process.env, 
            PYTHONPATH: backendPath,
            PATH: `${path.join(backendPath, '.venv', 'bin')}:${process.env.PATH}`
        }
    });

    backendProcess.stdout?.on('data', (data) => {
        console.log(`Backend stdout: ${data}`);
    });

    backendProcess.stderr?.on('data', (data) => {
        console.error(`Backend stderr: ${data}`);
    });

    backendProcess.on('error', (error) => {
        console.error('Failed to start backend:', error);
        throw error;
    });

    backendProcess.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Backend process exited with code ${code}`);
            backendProcess = undefined;
        }
    });

    // Wait for the server to start
    await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Backend server failed to start within 5 seconds'));
        }, 5000);

        backendProcess?.stdout?.on('data', (data) => {
            const message = data.toString();
            console.log('Backend stdout:', message);
            if (message.includes('Application startup complete')) {
                clearTimeout(timeout);
                resolve();
            }
        });

        backendProcess?.stderr?.on('data', (data) => {
            const message = data.toString();
            console.log('Backend stderr:', message);
            if (message.includes('Application startup complete')) {
                clearTimeout(timeout);
                resolve();
            }
        });

        backendProcess?.on('error', (error) => {
            clearTimeout(timeout);
            reject(error);
        });
    });
}

/**
 * Loads the webview HTML content and ensures the bundle.js path is correctly resolved
 * using VS Code's webview URI scheme.
 */
function getWebviewContent(panel: vscode.WebviewPanel, extensionUri: vscode.Uri): string {
    try {
        // Log the extension path and webview paths
        console.log('Extension URI:', extensionUri.fsPath);
        const webviewDistPath = path.join(extensionUri.fsPath, 'webview', 'dist');
        console.log('Webview dist path:', webviewDistPath);
        
        // Check if the dist directory exists
        if (!fs.existsSync(webviewDistPath)) {
            console.error('Webview dist directory not found at:', webviewDistPath);
            return '<html><body><h1>Error: Webview dist directory not found</h1></body></html>';
        }

        // Check for index.html
        const htmlPath = path.join(webviewDistPath, 'index.html');
        console.log('Looking for index.html at:', htmlPath);
        if (!fs.existsSync(htmlPath)) {
            console.error('index.html not found at:', htmlPath);
            return '<html><body><h1>Error: index.html not found</h1></body></html>';
        }

        // Read and log the HTML content
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        console.log('Found index.html, content length:', htmlContent.length);
        
        // Get the URI for bundle.js
        const bundlePath = path.join(webviewDistPath, 'bundle.js');
        console.log('Looking for bundle.js at:', bundlePath);
        if (!fs.existsSync(bundlePath)) {
            console.error('bundle.js not found at:', bundlePath);
            return '<html><body><h1>Error: bundle.js not found</h1></body></html>';
        }

        const bundleUri = panel.webview.asWebviewUri(
            vscode.Uri.file(bundlePath)
        );
        console.log('Bundle URI:', bundleUri.toString());
        
        // Replace the script src with the webview URI
        htmlContent = htmlContent.replace(
            'src="bundle.js"',
            `src="${bundleUri}"`
        );
        
        console.log('Final HTML content:', htmlContent);
        return htmlContent;
    } catch (error) {
        console.error('Error loading webview HTML:', error);
        return `<html><body><h1>Error loading webview content: ${error instanceof Error ? error.message : 'Unknown error'}</h1></body></html>`;
    }
}

export function deactivate() {
    if (backendProcess) {
        backendProcess.kill();
        backendProcess = undefined;
    }
} 