import crypto from 'crypto';
import { NextApiRequest } from 'next';
import { ApiKey, IApiKeyRepository } from '@server/repositories';
import { ApiError } from './apiUtils';
import { Manifest } from '@server/mdl/type';

export interface GeneratedApiKey {
  rawKey: string;
  keyHash: string;
  keyPrefix: string;
}

/**
 * Generate a new random API key, its SHA-256 hash, and visual prefix
 */
export const generateApiKey = (): GeneratedApiKey => {
  const randomHex = crypto.randomBytes(24).toString('hex');
  const rawKey = `wren_sk_${randomHex}`;
  const keyHash = hashApiKey(rawKey);
  const keyPrefix = `wren_sk_${randomHex.substring(0, 6)}...`;

  return {
    rawKey,
    keyHash,
    keyPrefix,
  };
};

/**
 * Hash an API key using SHA-256
 */
export const hashApiKey = (key: string): string => {
  return crypto.createHash('sha256').update(key.trim()).digest('hex');
};

/**
 * Authenticate incoming request via API Key.
 * Returns ApiKey if valid header present.
 * Returns null if no API Key header is present (allowing fallback to web UI session).
 * Throws ApiError 401 if invalid API Key is provided.
 */
export const authenticateApiKey = async (
  req: NextApiRequest,
  apiKeyRepository: IApiKeyRepository,
): Promise<ApiKey | null> => {
  let authHeader =
    (req.headers['authorization'] as string) ||
    (req.headers['x-api-key'] as string);

  if (!authHeader) {
    return null; // Optional auth fallback
  }

  authHeader = authHeader.trim();
  let rawKey = authHeader;
  if (rawKey.toLowerCase().startsWith('bearer ')) {
    rawKey = rawKey.substring(7).trim();
  }

  if (!rawKey) {
    throw new ApiError('Invalid or inactive API Key', 401);
  }

  const keyHash = hashApiKey(rawKey);
  const apiKey = await apiKeyRepository.findByHash(keyHash);

  if (!apiKey || !apiKey.isActive) {
    throw new ApiError('Invalid or inactive API Key', 401);
  }

  return apiKey;
};

/**
 * Calculate effective allowed tables intersection based on request and API key scoping
 */
export const calculateEffectiveTables = (
  reqTables?: string[],
  allowedTables: string[] = [],
): string[] => {
  if (allowedTables.includes('*')) {
    return reqTables || [];
  }

  if (!reqTables || reqTables.length === 0) {
    return allowedTables;
  }

  const allowedSet = new Set(allowedTables);
  const intersection = reqTables.filter((table) => allowedSet.has(table));

  if (intersection.length === 0) {
    throw new ApiError(
      'Requested tables are not authorized for this API Key',
      403,
    );
  }

  return intersection;
};

/**
 * Filter Manifest to only contain models, relationships, and views allowed by effective tables
 */
export const filterManifestByAllowedTables = (
  manifest: Manifest,
  allowedTables: string[],
): Manifest => {
  if (!allowedTables || allowedTables.includes('*') || !manifest) {
    return manifest;
  }

  const allowedSet = new Set(allowedTables);

  // Filter models
  const filteredModels = (manifest.models || []).filter(
    (m) => m.name && allowedSet.has(m.name),
  );
  const validModelNames = new Set(filteredModels.map((m) => m.name!));

  // Filter relationships (both ends must be allowed models)
  const filteredRelationships = (manifest.relationships || []).filter(
    (rel) =>
      rel.models &&
      rel.models.length === 2 &&
      rel.models.every((mName) => validModelNames.has(mName)),
  );

  // Filter views (keep views that do not reference deleted models in statement)
  const filteredViews = (manifest.views || []).filter((view) => {
    if (!view.statement) return true;
    // Basic check: if view statement references any deleted model name, filter out
    const missingModels = (manifest.models || [])
      .filter((m) => m.name && !validModelNames.has(m.name))
      .map((m) => m.name!);
    return !missingModels.some((mName) => view.statement!.includes(mName));
  });

  return {
    ...manifest,
    models: filteredModels,
    relationships: filteredRelationships,
    views: filteredViews,
  };
};
