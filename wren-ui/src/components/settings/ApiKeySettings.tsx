import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Button,
  Switch,
  Modal,
  Form,
  Input,
  Checkbox,
  Tag,
  Space,
  Typography,
  message,
  Popconfirm,
  Pagination,
  Tooltip,
  Empty,
  Spin,
} from '@/import/antd';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import styled from 'styled-components';
import {
  LIST_API_KEYS,
  CREATE_API_KEY,
  UPDATE_API_KEY,
  DELETE_API_KEY,
} from '@/apollo/client/graphql/apiKeys';
import { LIST_MODELS } from '@/apollo/client/graphql/model';

const Container = styled.div`
  padding: 16px 24px;
  max-width: 100%;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
`;

const KeyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const KeyCard = styled.div`
  background: #ffffff;
  border: 1px solid var(--gray-4);
  border-radius: 8px;
  padding: 12px 16px;
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 86px;
  box-sizing: border-box;

  &:hover {
    border-color: var(--geekblue-6);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
`;

const CardTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 24px;
`;

const CardTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  min-width: 0;
`;

const CardBottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px dashed var(--gray-4);
  height: 30px;
  box-sizing: border-box;
`;

const MetaText = styled.span`
  font-size: 12px;
  color: var(--gray-7);
`;

const KeyDisplayBox = styled.div`
  background: var(--gray-2);
  border: 1px solid var(--gray-4);
  border-radius: 6px;
  padding: 12px 16px;
  margin-top: 16px;
`;

const TableSelectorContainer = styled.div`
  border: 1px solid var(--gray-4);
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
  background: var(--gray-1);
`;

const SingleColumnList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  margin-bottom: 8px;
  max-height: 220px;
  overflow-y: auto;

  .table-item {
    padding: 8px 12px;
    background: #ffffff;
    border: 1px solid var(--gray-4);
    border-radius: 6px;
    display: flex;
    align-items: center;
    word-break: break-all;
    transition: all 0.2s ease-in-out;

    &:hover {
      border-color: var(--geekblue-6);
    }

    &.selected {
      background: var(--geekblue-1, #f0f7ff);
      border-color: var(--geekblue-4, #91d5ff);
    }
  }
`;

const PrefixTag = styled(Tag)`
  font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 12px;
  background: var(--gray-3);
  border: 1px solid var(--gray-4);
  color: var(--gray-8);
  border-radius: 4px;
  padding: 1px 6px;
  margin: 0;
`;

function PagedTableSelector({ availableModels, value = [], onChange }: any) {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filtered = availableModels.filter((m: string) =>
    m.toLowerCase().includes(searchText.toLowerCase())
  );

  const paginatedModels = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleCheckboxChange = (checkedValues: any[]) => {
    const currentPageModelSet = new Set(paginatedModels);
    const otherSelected = value.filter((v: string) => !currentPageModelSet.has(v));
    const newSelected = Array.from(new Set([...otherSelected, ...checkedValues]));
    onChange(newSelected);
  };

  const currentPageSelected = value.filter((v: string) => paginatedModels.includes(v));

  return (
    <TableSelectorContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Input
          placeholder="Search table name..."
          size="small"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setCurrentPage(1);
          }}
          style={{ borderRadius: 4, width: 'calc(100% - 110px)' }}
        />
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Selected: {value.length} / {availableModels.length}
        </Typography.Text>
      </div>

      <Checkbox.Group
        style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
        value={currentPageSelected}
        onChange={handleCheckboxChange}
      >
        <SingleColumnList>
          {paginatedModels.map((modelName: string) => {
            const isChecked = value.includes(modelName);
            return (
              <div key={modelName} className={`table-item ${isChecked ? 'selected' : ''}`}>
                <Checkbox value={modelName} style={{ width: '100%' }}>
                  {modelName}
                </Checkbox>
              </div>
            );
          })}
          {paginatedModels.length === 0 && (
            <Typography.Text type="secondary" style={{ padding: '12px 0', textAlign: 'center' }}>
              No matching tables found
            </Typography.Text>
          )}
        </SingleColumnList>
      </Checkbox.Group>

      {filtered.length > pageSize && (
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
          <Pagination
            size="small"
            current={currentPage}
            pageSize={pageSize}
            total={filtered.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      )}
    </TableSelectorContainer>
  );
}

export default function ApiKeySettings() {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState<any>(null);

  const [rawKeyModalVisible, setRawKeyModalVisible] = useState(false);
  const [createdRawKey, setCreatedRawKey] = useState('');
  const [allTablesSelected, setAllTablesSelected] = useState(true);
  const [editAllTablesSelected, setEditAllTablesSelected] = useState(true);

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // Queries & Mutations
  const { data: keysData, loading: keysLoading, refetch } = useQuery(LIST_API_KEYS);
  const { data: modelsData } = useQuery(LIST_MODELS);

  const [createApiKey, { loading: creating }] = useMutation(CREATE_API_KEY);
  const [updateApiKey, { loading: updating }] = useMutation(UPDATE_API_KEY);
  const [deleteApiKey] = useMutation(DELETE_API_KEY);

  const availableModels: string[] =
    modelsData?.listModels
      ?.map((m: any) => m.displayName || m.referenceName)
      .filter(Boolean) || [];

  const handleCreate = () => {
    form
      .validateFields()
      .then(async (values) => {
        const allowedTables = allTablesSelected ? ['*'] : values.allowedTables || [];

        const res = await createApiKey({
          variables: {
            data: {
              name: values.name,
              allowedTables,
            },
          },
        });

        if (res.data?.createApiKey) {
          setCreatedRawKey(res.data.createApiKey.rawKey);
          setCreateModalVisible(false);
          setRawKeyModalVisible(true);
          form.resetFields();
          setAllTablesSelected(true);
          refetch();
        }
      })
      .catch((err) => {
        console.error('Validation error:', err);
      });
  };

  const handleOpenEdit = (keyItem: any) => {
    setEditingKey(keyItem);
    const isAll = !keyItem.allowedTables || keyItem.allowedTables.includes('*');
    setEditAllTablesSelected(isAll);

    editForm.setFieldsValue({
      name: keyItem.name,
      allowedTables: isAll ? [] : keyItem.allowedTables || [],
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    editForm
      .validateFields()
      .then(async (values) => {
        const allowedTables = editAllTablesSelected ? ['*'] : values.allowedTables || [];

        await updateApiKey({
          variables: {
            id: editingKey.id,
            data: {
              name: values.name,
              allowedTables,
            },
          },
        });

        message.success('API key permissions updated successfully');
        setEditModalVisible(false);
        setEditingKey(null);
        refetch();
      })
      .catch((err) => {
        console.error('Edit validation error:', err);
      });
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateApiKey({
        variables: {
          id,
          data: {
            isActive: !currentStatus,
          },
        },
      });
      message.success('API key status updated');
      refetch();
    } catch (err: any) {
      message.error('Failed to update API key status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApiKey({
        variables: { id },
      });
      message.success('API key deleted');
      refetch();
    } catch (err: any) {
      message.error('Failed to delete API key');
    }
  };

  const renderAllowedTables = (tables: string[]) => {
    if (!tables || tables.length === 0 || tables.includes('*')) {
      return (
        <Tag color="geekblue" style={{ margin: 0, borderRadius: 4 }}>
          All tables (*)
        </Tag>
      );
    }

    const firstTable = tables[0];
    const allList = tables.join('\n');

    if (tables.length === 1) {
      return (
        <Tooltip title={firstTable}>
          <Tag
            style={{
              margin: 0,
              borderRadius: 4,
              maxWidth: 240,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              verticalAlign: 'middle',
            }}
          >
            {firstTable}
          </Tag>
        </Tooltip>
      );
    }

    const hiddenCount = tables.length - 1;
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0, overflow: 'hidden' }}>
        <Tooltip title={firstTable}>
          <Tag
            style={{
              margin: 0,
              borderRadius: 4,
              maxWidth: 180,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              verticalAlign: 'middle',
            }}
          >
            {firstTable}
          </Tag>
        </Tooltip>
        <Tooltip title={<pre style={{ margin: 0, fontSize: 11, maxHeight: 200, overflowY: 'auto' }}>{allList}</pre>}>
          <Tag
            color="default"
            style={{
              margin: 0,
              cursor: 'pointer',
              borderRadius: 4,
              flexShrink: 0,
            }}
          >
            +{hiddenCount} more
          </Tag>
        </Tooltip>
      </div>
    );
  };

  const apiKeysList = keysData?.apiKeys || [];

  return (
    <Container>
      <Header>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          Create API key
        </Button>
      </Header>

      {keysLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin />
        </div>
      ) : apiKeysList.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No API keys created yet"
          style={{ margin: '32px 0' }}
        />
      ) : (
        <KeyList>
          {apiKeysList.map((item: any) => (
            <KeyCard key={item.id}>
              <CardTopRow>
                <CardTitleGroup>
                  <PrefixTag style={{ flexShrink: 0 }}>{item.keyPrefix}</PrefixTag>
                  <span
                    className="gray-9 text-bold"
                    style={{
                      fontSize: 14,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={item.name}
                  >
                    {item.name}
                  </span>
                </CardTitleGroup>

                <Space size={8} style={{ flexShrink: 0, marginLeft: 12 }}>
                  <Switch
                    checked={item.isActive}
                    onChange={() => handleToggleActive(item.id, item.isActive)}
                    size="small"
                  />
                  <Button
                    type="text"
                    icon={<EditOutlined className="gray-7" />}
                    size="small"
                    onClick={() => handleOpenEdit(item)}
                  />
                  <Popconfirm
                    title="Are you sure you want to delete this API key?"
                    onConfirm={() => handleDelete(item.id)}
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                    />
                  </Popconfirm>
                </Space>
              </CardTopRow>

              <CardBottomRow>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                  <MetaText style={{ flexShrink: 0 }}>Permissions:</MetaText>
                  {renderAllowedTables(item.allowedTables)}
                </div>

                <MetaText style={{ flexShrink: 0, whiteSpace: 'nowrap', marginLeft: 16 }}>
                  Created:{' '}
                  {item.createdAt
                    ? new Date(Number(item.createdAt) || item.createdAt).toLocaleDateString()
                    : '-'}
                </MetaText>
              </CardBottomRow>
            </KeyCard>
          ))}
        </KeyList>
      )}

      {/* Create Modal */}
      <Modal
        title="Create new API key"
        visible={createModalVisible}
        onOk={handleCreate}
        confirmLoading={creating}
        okText="Create"
        cancelText="Cancel"
        destroyOnClose
        maskClosable={false}
        onCancel={() => setCreateModalVisible(false)}
      >
        <Form form={form} preserve={false} layout="vertical">
          <Form.Item
            name="name"
            label="Key name / purpose"
            rules={[{ required: true, message: 'Please enter key name' }]}
          >
            <Input placeholder="e.g. Sales Department Integration" />
          </Form.Item>

          <Form.Item label="Authorized data tables">
            <Checkbox
              checked={allTablesSelected}
              onChange={(e) => setAllTablesSelected(e.target.checked)}
            >
              Allow access to all tables (*)
            </Checkbox>

            {!allTablesSelected && (
              <div style={{ marginTop: 12 }}>
                <Typography.Text className="d-block gray-7 mb-2">
                  Select specific tables allowed for this API key:
                </Typography.Text>
                <Form.Item name="allowedTables" noStyle>
                  <PagedTableSelector availableModels={availableModels} />
                </Form.Item>
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Permissions Modal */}
      <Modal
        title="Edit API key permissions"
        visible={editModalVisible}
        onOk={handleSaveEdit}
        confirmLoading={updating}
        okText="Save"
        cancelText="Cancel"
        destroyOnClose
        maskClosable={false}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingKey(null);
        }}
      >
        <Form form={editForm} preserve={false} layout="vertical">
          <Form.Item
            name="name"
            label="Key name / purpose"
            rules={[{ required: true, message: 'Please enter key name' }]}
          >
            <Input placeholder="e.g. Sales Department Integration" />
          </Form.Item>

          <Form.Item label="Authorized data tables">
            <Checkbox
              checked={editAllTablesSelected}
              onChange={(e) => setEditAllTablesSelected(e.target.checked)}
            >
              Allow access to all tables (*)
            </Checkbox>

            {!editAllTablesSelected && (
              <div style={{ marginTop: 12 }}>
                <Typography.Text className="d-block gray-7 mb-2">
                  Select specific tables allowed for this API key:
                </Typography.Text>
                <Form.Item name="allowedTables" noStyle>
                  <PagedTableSelector availableModels={availableModels} />
                </Form.Item>
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* Raw Key Display Modal */}
      <Modal
        title="API key created successfully"
        visible={rawKeyModalVisible}
        onOk={() => setRawKeyModalVisible(false)}
        onCancel={() => setRawKeyModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setRawKeyModalVisible(false)}>
            Done
          </Button>,
        ]}
      >
        <Typography.Paragraph type="warning">
          Please copy your API key now. For security reasons, it will <strong>not be shown again</strong>.
        </Typography.Paragraph>

        <KeyDisplayBox>
          <Typography.Paragraph
            copyable={{ text: createdRawKey }}
            style={{
              margin: 0,
              fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
              fontSize: 13,
              wordBreak: 'break-all',
            }}
          >
            {createdRawKey}
          </Typography.Paragraph>
        </KeyDisplayBox>
      </Modal>
    </Container>
  );
}
