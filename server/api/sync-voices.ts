import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Run the sync script as a child process
    const scriptPath = path.join(process.cwd(), 'server/scripts/syncVoices.ts');
    const child = spawn('npx', ['tsx', scriptPath], {
      env: { ...process.env, ...req.body },
      stdio: 'pipe',
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
      console.log(`sync-voices: ${data}`);
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`sync-voices error: ${data}`);
    });

    return new Promise<void>((resolve) => {
      child.on('close', (code) => {
        if (code === 0) {
          res.status(200).json({ 
            success: true, 
            message: 'Voices synced successfully',
            output: output.trim()
          });
        } else {
          res.status(500).json({
            success: false,
            message: 'Failed to sync voices',
            error: errorOutput || 'Unknown error occurred',
            output: output.trim()
          });
        }
        resolve();
      });
    });
  } catch (error) {
    console.error('Error syncing voices:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to sync voices',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
