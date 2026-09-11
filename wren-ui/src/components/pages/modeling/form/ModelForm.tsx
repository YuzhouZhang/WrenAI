import { useEffect, useMemo, useState } from 'react';
import { Button, Form, FormInstance, message, Select } from 'antd';
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
import { TransferItem } from 'antd/es/transfer';
import { isEmpty } from 'lodash';
import { FORM_MODE } from '@/utils/enum';
import { DiagramModelField } from '@/utils/data';
import { ERROR_TEXTS } from '@/utils/error';
import { DrawerAction } from '@/hooks/useDrawerAction';
import { Loading } from '@/components/PageLoading';
import TableTransfer, {
  defaultColumns,
} from '@/components/table/TableTransfer';
import { useListDataSourceTablesQuery } from '@/apollo/client/graphql/dataSource.generated';
import { useListModelsQuery } from '@/apollo/client/graphql/model.generated';
import { CompactColumn } from '@/apollo/client/graphql/__types__';

const FormFieldKey = {
  SOURCE_TABLE: 'sourceTableName',
  COLUMNS: 'fields',
  PRIMARY_KEY: 'primaryKey',
};

type Props = Pick<DrawerAction, 'defaultValue' | 'formMode'> & {
  form: FormInstance;
};

const primaryKeyValidator =
  (selectedColumns: string[]) => async (_rule: any, value: string) => {
    if (value && !selectedColumns.includes(value)) {
      return Promise.reject(
        ERROR_TEXTS.MODELING_CREATE_MODEL.PRIMARY_KEY.INVALID,
      );
    }

    return Promise.resolve();
  };

export default function ModelForm(props: Props) {
  const { defaultValue, form, formMode } = props;

  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [sourceTableName, setSourceTableName] = useState<string>(undefined);
  const sourceTableFieldValue = Form.useWatch(FormFieldKey.SOURCE_TABLE, form);

  const isUpdateMode = formMode === FORM_MODE.EDIT;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: listModelsQueryResult, loading: listModelsQueryLoading } =
    useListModelsQuery({
      fetchPolicy: 'cache-and-network',
      skip: isUpdateMode,
    });

  const { data, loading: fetching, refetch } = useListDataSourceTablesQuery({
    fetchPolicy: 'cache-and-network',
    onError: (error) => console.error(error),
  });

  const handleRefresh = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsRefreshing(true);
      await refetch({ refresh: true });
      message.success('表元数据已更新至最新');
    } catch (error) {
      console.error(error);
      message.error('刷新表元数据失败，请重试');
    } finally {
      setIsRefreshing(false);
    }
  };

  const dataSourceTables = data?.listDataSourceTables || [];
  const existingModels = listModelsQueryResult?.listModels;
  const inUsedModelList = useMemo(
    () => (existingModels || []).map((model) => model.sourceTableName),
    [existingModels],
  );

  useEffect(() => {
    if (isUpdateMode) return;

    // for create mode, reset selected columns when source table changes
    setSelectedColumns([]);
    form.resetFields([FormFieldKey.PRIMARY_KEY]);
  }, [formMode, sourceTableName]);

  // for create mode
  useEffect(() => {
    if (sourceTableFieldValue) {
      setSourceTableName(sourceTableFieldValue);
    }
  }, [sourceTableFieldValue]);

  const columns: Array<{
    key: string;
    name: string;
    type: string;
  }> = useMemo(() => {
    if (isEmpty(sourceTableName)) return [];

    const table = dataSourceTables.find(
      (table) => table.name === sourceTableName,
    )!;
    if (!table) return [];

    return table.columns.map((column: CompactColumn) => ({
      ...column,
      key: column.name,
    }));
  }, [dataSourceTables, sourceTableName]);

  useEffect(() => {
    if (defaultValue) {
      const fields: string[] = defaultValue.fields
        .map((field: DiagramModelField) => field.referenceName)
        .filter((col) => columns.find((c) => c.name === col));

      const primaryKeyField = defaultValue.fields.find(
        (field: DiagramModelField) => field.isPrimaryKey,
      );

      form.setFieldsValue({
        [FormFieldKey.COLUMNS]: fields,
        [FormFieldKey.PRIMARY_KEY]: primaryKeyField?.referenceName,
      });

      setSourceTableName(defaultValue.sourceTableName);
      setSelectedColumns(fields);
    }
  }, [defaultValue, form, columns]);

  const tableOptions = useMemo(() => {
    const inUsedSet = new Set(inUsedModelList);
    return dataSourceTables.map((table) => ({
      label: table.name,
      value: table.name,
      disabled: inUsedSet.has(table.name),
    }));
  }, [dataSourceTables, inUsedModelList]);

  const primaryKeyOptions = useMemo(() => {
    return selectedColumns.map((column) => ({
      label: column,
      value: column,
    }));
  }, [selectedColumns]);

  const onChangeColumns = (newKeys: string[]) => setSelectedColumns(newKeys);

  const dataSourceTablesLoading =
    fetching || listModelsQueryLoading || isRefreshing;

  return (
    <>
      <Form form={form} layout="vertical">
        {!isUpdateMode && (
          <div>
            <Form.Item
              label={
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <span>Select a table</span>
                  <Button
                    type="link"
                    size="small"
                    loading={isRefreshing}
                    icon={<ReloadOutlined spin={isRefreshing} />}
                    onClick={handleRefresh}
                    style={{
                      padding: 0,
                      height: 'auto',
                      fontSize: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    刷新元数据
                  </Button>
                </div>
              }
              name={FormFieldKey.SOURCE_TABLE}
              required
              rules={[
                {
                  required: true,
                  message: ERROR_TEXTS.MODELING_CREATE_MODEL.TABLE.REQUIRED,
                },
              ]}
            >
              <Select
                getPopupContainer={(trigger) => trigger.parentElement!}
                placeholder="Select a table"
                showSearch
                loading={dataSourceTablesLoading}
                disabled={isUpdateMode}
                options={tableOptions}
                filterOption={(input, option) =>
                  String(option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </div>
        )}
        <Loading spinning={isUpdateMode ? dataSourceTablesLoading : false}>
          <Form.Item
            label="Select columns"
            name={FormFieldKey.COLUMNS}
            rules={[
              {
                required: true,
                message: ERROR_TEXTS.MODELING_CREATE_MODEL.COLUMNS.REQUIRED,
              },
            ]}
          >
            <TableTransfer
              dataSource={columns}
              targetKeys={selectedColumns}
              onChange={onChangeColumns}
              filterOption={(inputValue: string, item: TransferItem) =>
                item.name.toLowerCase().indexOf(inputValue.toLowerCase()) !==
                  -1 ||
                item.type.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
              }
              leftColumns={defaultColumns}
              rightColumns={defaultColumns}
              titles={['Available Columns', 'Target Columns']}
              showSearch
            />
          </Form.Item>
        </Loading>
        <Form.Item
          label="Select primary key"
          name={FormFieldKey.PRIMARY_KEY}
          rules={[
            {
              validator: primaryKeyValidator(selectedColumns),
            },
          ]}
        >
          <Select
            getPopupContainer={(trigger) => trigger.parentElement!}
            placeholder="Select a column"
            showSearch
            allowClear
            options={primaryKeyOptions}
            filterOption={(input, option) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </Form>
    </>
  );
}
