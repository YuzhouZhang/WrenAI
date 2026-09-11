import { Knex } from 'knex';
import { BaseRepository, IBasicRepository } from './baseRepository';
import {
  camelCase,
  isPlainObject,
  mapKeys,
  mapValues,
  snakeCase,
} from 'lodash';
import { CompactTable } from '../services/metadataService';

export interface DataSourceMetadataCache {
  id?: number;
  projectId: number;
  tables: CompactTable[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IDataSourceMetadataCacheRepository
  extends IBasicRepository<DataSourceMetadataCache> {
  getByProjectId(projectId: number): Promise<DataSourceMetadataCache | null>;
  upsertByProjectId(
    projectId: number,
    tables: CompactTable[],
  ): Promise<void>;
}

export class DataSourceMetadataCacheRepository
  extends BaseRepository<DataSourceMetadataCache>
  implements IDataSourceMetadataCacheRepository
{
  private readonly jsonColumns = ['tables'];

  constructor(knexPg: Knex) {
    super({ knexPg, tableName: 'data_source_metadata_cache' });
  }

  public async getByProjectId(
    projectId: number,
  ): Promise<DataSourceMetadataCache | null> {
    return this.findOneBy({ projectId });
  }

  public async upsertByProjectId(
    projectId: number,
    tables: CompactTable[],
  ): Promise<void> {
    const existing = await this.getByProjectId(projectId);
    if (existing && existing.id) {
      await this.updateOne(existing.id, {
        tables,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await this.createOne({
        projectId,
        tables,
      });
    }
  }

  protected override transformFromDBData = (data: any) => {
    if (!isPlainObject(data)) {
      throw new Error('Unexpected dbdata');
    }
    const camelCaseData = mapKeys(data, (_value, key) => camelCase(key));
    const transformData = mapValues(camelCaseData, (value, key) => {
      if (this.jsonColumns.includes(key)) {
        if (typeof value === 'string') {
          return value ? JSON.parse(value) : [];
        } else {
          return value;
        }
      }
      return value;
    });
    return transformData as DataSourceMetadataCache;
  };

  protected override transformToDBData = (data: any) => {
    if (!isPlainObject(data)) {
      throw new Error('Unexpected dbdata');
    }
    const transformedData = mapValues(data, (value, key) => {
      if (this.jsonColumns.includes(key)) {
        return typeof value === 'string' ? value : JSON.stringify(value);
      } else {
        return value;
      }
    });
    return mapKeys(transformedData, (_value, key) => snakeCase(key));
  };
}
