import type { NextApiRequest, NextApiResponse } from 'next';
import { components } from '@/common';
import { authenticateApiKey } from '@/apollo/server/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { wrenAIAdaptor, apiKeyRepository } = components;
  try {
    await authenticateApiKey(req, apiKeyRepository);
  } catch (error: any) {
    res.status(error.statusCode || 401).json({ error: error.message });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const { queryId } = req.query;
  if (!queryId) {
    res.status(400).json({ error: 'queryId is required' });
    return;
  }

  try {
    const stream = await wrenAIAdaptor.getAskStreamingResult(queryId as string);

    stream.on('data', (chunk) => {
      res.write(chunk);
    });

    stream.on('end', () => {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    });

    req.on('close', () => {
      stream.destroy();
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
