import { v4 as uuidv4 } from 'uuid';
import { IContext } from '@server/types';
import { ApiKey } from '@server/repositories';
import { generateApiKey } from '@server/utils/apiKeyUtils';
import { getLogger } from '@server/utils';

const logger = getLogger('ApiKeyResolver');
logger.level = 'debug';

export class ApiKeyResolver {
  constructor() {
    this.getApiKeys = this.getApiKeys.bind(this);
    this.createApiKey = this.createApiKey.bind(this);
    this.updateApiKey = this.updateApiKey.bind(this);
    this.deleteApiKey = this.deleteApiKey.bind(this);
  }

  public async getApiKeys(
    _root: any,
    _args: any,
    ctx: IContext,
  ): Promise<ApiKey[]> {
    try {
      const project = await ctx.projectService.getCurrentProject();
      return await ctx.apiKeyRepository.findAllBy({ projectId: project.id });
    } catch (error) {
      logger.error(`Error getting API keys: ${error}`);
      throw error;
    }
  }

  public async createApiKey(
    _root: any,
    args: {
      data: {
        name: string;
        allowedTables: string[];
      };
    },
    ctx: IContext,
  ): Promise<{ apiKey: ApiKey; rawKey: string }> {
    try {
      const { name, allowedTables } = args.data;
      const project = await ctx.projectService.getCurrentProject();
      const { rawKey, keyHash, keyPrefix } = generateApiKey();

      const newApiKeyData: Partial<ApiKey> = {
        id: uuidv4(),
        projectId: project.id,
        name,
        keyHash,
        keyPrefix,
        allowedTables: allowedTables || [],
        isActive: true,
      };

      const apiKey = await ctx.apiKeyRepository.createOne(newApiKeyData);
      return {
        apiKey,
        rawKey,
      };
    } catch (error) {
      logger.error(`Error creating API key: ${error}`);
      throw error;
    }
  }

  public async updateApiKey(
    _root: any,
    args: {
      id: string;
      data: {
        name?: string;
        allowedTables?: string[];
        isActive?: boolean;
      };
    },
    ctx: IContext,
  ): Promise<ApiKey> {
    try {
      const { id, data } = args;
      const project = await ctx.projectService.getCurrentProject();

      const existingKey = await ctx.apiKeyRepository.findOneBy({ id, projectId: project.id });
      if (!existingKey) {
        throw new Error('API Key not found');
      }

      const updateData: Partial<ApiKey> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.allowedTables !== undefined) updateData.allowedTables = data.allowedTables;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      return await ctx.apiKeyRepository.updateOne(id, updateData);
    } catch (error) {
      logger.error(`Error updating API key: ${error}`);
      throw error;
    }
  }

  public async deleteApiKey(
    _root: any,
    args: { id: string },
    ctx: IContext,
  ): Promise<boolean> {
    try {
      const { id } = args;
      const project = await ctx.projectService.getCurrentProject();
      await ctx.apiKeyRepository.deleteAllBy({ id, projectId: project.id });
      return true;
    } catch (error) {
      logger.error(`Error deleting API key: ${error}`);
      throw error;
    }
  }
}
