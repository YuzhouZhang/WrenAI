import { Knex } from 'knex';
import { BaseRepository, IBasicRepository } from './baseRepository';
import {
  camelCase,
  isPlainObject,
  mapKeys,
  mapValues,
  snakeCase,
} from 'lodash';

export interface ApiKey {
  id: string;
  projectId: number;
  name: string;
  keyHash: string;
  keyPrefix: string;
  allowedTables: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IApiKeyRepository extends IBasicRepository<ApiKey> {
  findByHash(keyHash: string): Promise<ApiKey | null>;
}

export class ApiKeyRepository
  extends BaseRepository<ApiKey>
  implements IApiKeyRepository
{
  private readonly jsonbColumns = ['allowedTables'];

  constructor(knexPg: Knex) {
    super({ knexPg, tableName: 'api_keys' });
  }

  public async findByHash(keyHash: string): Promise<ApiKey | null> {
    return this.findOneBy({ keyHash });
  }

  protected override transformFromDBData = (data: any) => {
    if (!isPlainObject(data)) {
      throw new Error('Unexpected dbdata');
    }
    const camelCaseData = mapKeys(data, (_value, key) => camelCase(key));
    const transformData = mapValues(camelCaseData, (value, key) => {
      if (this.jsonbColumns.includes(key)) {
        if (typeof value === 'string') {
          return value ? JSON.parse(value) : [];
        } else {
          return value;
        }
      }
      // Handle boolean conversion if SQLite returns 1/0
      if (key === 'isActive' && typeof value === 'number') {
        return value === 1;
      }
      return value;
    });
    return transformData as ApiKey;
  };

  protected override transformToDBData = (data: any) => {
    if (!isPlainObject(data)) {
      throw new Error('Unexpected dbdata');
    }
    const transformedData = mapValues(data, (value, key) => {
      if (this.jsonbColumns.includes(key)) {
        return JSON.stringify(value);
      } else {
        return value;
      }
    });
    return mapKeys(transformedData, (_value, key) => snakeCase(key));
  };
}
