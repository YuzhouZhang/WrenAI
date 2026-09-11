/** 
    This class is responsible for handling the retrieval of metadata from the data source.
    For DuckDB, we control the access logic and directly query the WrenEngine.
    For PostgreSQL and BigQuery, we will use the Ibis server API.
 */

import { IIbisAdaptor } from '../adaptors/ibisAdaptor';
import { IWrenEngineAdaptor } from '../adaptors/wrenEngineAdaptor';
import { IDataSourceMetadataCacheRepository, Project } from '../repositories';
import { DataSourceName } from '../types';
import { getLogger } from '@server/utils';

const logger = getLogger('MetadataService');
logger.level = 'debug';

export interface CompactColumn {
  name: string;
  type: string;
  notNull: boolean;
  description?: string;
  properties?: Record<string, any>;
  nestedColumns?: CompactColumn[];
}

export enum ConstraintType {
  PRIMARY_KEY = 'PRIMARY KEY',
  FOREIGN_KEY = 'FOREIGN KEY',
  UNIQUE = 'UNIQUE',
}

export interface CompactTable {
  name: string;
  columns: CompactColumn[];
  description?: string;
  properties?: Record<string, any>;
  primaryKey?: string;
}

export interface RecommendConstraint {
  constraintName: string;
  constraintType: ConstraintType;
  constraintTable: string;
  constraintColumn: string;
  constraintedTable: string;
  constraintedColumn: string;
}

export interface IDataSourceMetadataService {
  listTables(project: Project, refresh?: boolean): Promise<CompactTable[]>;
  getTable(project: Project, tableName: string): Promise<CompactTable | null>;
  listConstraints(project: Project): Promise<RecommendConstraint[]>;
  getVersion(project: Project): Promise<string>;
}

export class DataSourceMetadataService implements IDataSourceMetadataService {
  private readonly ibisAdaptor: IIbisAdaptor;
  private readonly wrenEngineAdaptor: IWrenEngineAdaptor;
  private readonly dataSourceMetadataCacheRepository?: IDataSourceMetadataCacheRepository;

  constructor({
    ibisAdaptor,
    wrenEngineAdaptor,
    dataSourceMetadataCacheRepository,
  }: {
    ibisAdaptor: IIbisAdaptor;
    wrenEngineAdaptor: IWrenEngineAdaptor;
    dataSourceMetadataCacheRepository?: IDataSourceMetadataCacheRepository;
  }) {
    this.ibisAdaptor = ibisAdaptor;
    this.wrenEngineAdaptor = wrenEngineAdaptor;
    this.dataSourceMetadataCacheRepository = dataSourceMetadataCacheRepository;
  }

  public async listTables(
    project: Project,
    refresh?: boolean,
  ): Promise<CompactTable[]> {
    if (!refresh && this.dataSourceMetadataCacheRepository && project?.id) {
      try {
        const cache =
          await this.dataSourceMetadataCacheRepository.getByProjectId(
            project.id,
          );
        if (cache && cache.tables && cache.tables.length > 0) {
          logger.debug(
            `Hit metadata cache for project ${project.id} with ${cache.tables.length} tables`,
          );
          return cache.tables;
        }
      } catch (err) {
        logger.warn(
          `Failed to read metadata cache for project ${project.id}:`,
          err,
        );
      }
    }

    const { type: dataSource, connectionInfo } = project;
    let tables: CompactTable[];
    if (dataSource === DataSourceName.DUCKDB) {
      tables = await this.wrenEngineAdaptor.listTables();
    } else {
      tables = await this.ibisAdaptor.getTables(dataSource, connectionInfo);
    }

    if (this.dataSourceMetadataCacheRepository && project?.id && tables) {
      try {
        await this.dataSourceMetadataCacheRepository.upsertByProjectId(
          project.id,
          tables,
        );
        logger.debug(
          `Cached ${tables.length} metadata tables for project ${project.id}`,
        );
      } catch (err) {
        logger.error(
          `Failed to cache metadata for project ${project.id}:`,
          err,
        );
      }
    }

    return tables;
  }

  public async getTable(
    project: Project,
    tableName: string,
  ): Promise<CompactTable | null> {
    if (this.dataSourceMetadataCacheRepository && project?.id) {
      try {
        const cache =
          await this.dataSourceMetadataCacheRepository.getByProjectId(
            project.id,
          );
        if (cache && cache.tables && cache.tables.length > 0) {
          const found = cache.tables.find((t) => t.name === tableName);
          if (found) {
            return found;
          }
        }
      } catch (err) {
        logger.warn(
          `Failed to read metadata cache for project ${project.id} in getTable:`,
          err,
        );
      }
    }

    const tables = await this.listTables(project);
    return tables.find((t) => t.name === tableName) || null;
  }

  public async listConstraints(
    project: Project,
  ): Promise<RecommendConstraint[]> {
    const { type: dataSource, connectionInfo } = project;
    if (dataSource === DataSourceName.DUCKDB) {
      return [];
    }
    return await this.ibisAdaptor.getConstraints(dataSource, connectionInfo);
  }

  public async getVersion(project: Project): Promise<string> {
    const { type: dataSource, connectionInfo } = project;
    return await this.ibisAdaptor.getVersion(dataSource, connectionInfo);
  }
}

