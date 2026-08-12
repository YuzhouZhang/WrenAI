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
import CopyOutlined from '@ant-design/icons/CopyOutlined';
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
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const KeyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const KeyCard = styled.div`
  background: #ffffff;
  border: 1px solid var(--gray-4, #e5e7eb);
  border-radius: 8px;
  padding: 14px 16px;
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &:hover {
    border-color: #1890ff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
`;

const CardTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CardBottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px dashed var(--gray-4, #f0f0f0);
`;

const MetaText = styled.span`
  font-size: 12px;
  color: var(--gray-7, #8c8c8c);
`;

const InputGroupWrapper = styled.div`
  display: flex;
  margin-top: 16px;
  width: 100%;
  .ant-input {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .ant-btn {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
`;

const TableSelectorContainer = styled.div`
  border: 1px solid var(--gray-4, #f0f0f0);
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
  background: var(--gray-1, #fafafa);
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
    border: 1px solid var(--gray-4, #e8e8e8);
    border-radius: 6px;
    display: flex;
    align-items: center;
    word-break: break-all;
    transition: all 0.2s ease-in-out;

    &:hover {
      border-color: #1890ff;
    }

    &.selected {
      background: #f0f7ff;
      border-color: #91d5ff;
    }
  }
`;

const PrefixTag = styled(Tag)`
  font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 12px;
  background: #f4f5f7;
  border: 1px solid #e2e4e8;
  color: #4b5563;
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

        message.success('API Key permissions updated successfully');
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
      message.success('API Key status updated');
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
      message.success('API Key deleted');
      refetch();
    } catch (err: any) {
      message.error('Failed to delete API key');
    }
  };

  const renderAllowedTables = (tables: string[]) => {
    if (!tables || tables.includes('*')) {
      return (
        <Tag color="geekblue" style={{ margin: 0, borderRadius: 4 }}>
          All Tables (*)
        </Tag>
      );
    }

    if (tables.length <= 2) {
      return (
        <Space wrap size={[4, 4]}>
          {tables.map((t) => (
            <Tag key={t} style={{ margin: 0, borderRadius: 4 }}>
              {t}
            </Tag>
          ))}
        </Space>
      );
    }

    const firstTwo = tables.slice(0, 2);
    const hiddenCount = tables.length - 2;
    const allList = tables.join('\n');

    return (
      <Space wrap size={[4, 4]}>
        {firstTwo.map((t) => (
          <Tag key={t} style={{ margin: 0, borderRadius: 4 }}>
            {t}
          </Tag>
        ))}
        <Tooltip title={<pre style={{ margin: 0, fontSize: 11 }}>{allList}</pre>}>
          <Tag color="default" style={{ margin: 0, cursor: 'pointer', borderRadius: 4 }}>
            +{hiddenCount} more
          </Tag>
        </Tooltip>
      </Space>
    );
  };

  const apiKeysList = keysData?.apiKeys || [];

  return (
    <Container>
      <Header>
        <div>
          <div className="gray-9 text-bold text-lg" style={{ fontSize: 16, lineHeight: '24px' }}>
            API Key Management
          </div>
          <div className="gray-7 mt-1" style={{ fontSize: 13 }}>
            Manage API keys and table access permissions for external clients.
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          Create API Key
        </Button>
      </Header>

      {keysLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin />
        </div>
      ) : apiKeysList.length === 0 ? (
        <Empty description="No API Keys created yet" style={{ margin: '40px 0' }} />
      ) : (
        <KeyList>
          {apiKeysList.map((item: any) => (
            <KeyCard key={item.id}>
              <CardTopRow>
                <CardTitleGroup>
                  <PrefixTag>{item.keyPrefix}</PrefixTag>
                  <span className="gray-9 text-bold" style={{ fontSize: 14 }}>
                    {item.name}
                  </span>
                </CardTitleGroup>

                <Space size={10}>
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
                    title="Are you sure you want to delete this API Key?"
                    onConfirm={() => handleDelete(item.id)}
                    okText="Yes"
                    cancelText="No"
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MetaText>Permissions:</MetaText>
                  {renderAllowedTables(item.allowedTables)}
                </div>

                <MetaText>
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
        title="Create New API Key"
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
            label="Key Name / Purpose"
            rules={[{ required: true, message: 'Please enter key name' }]}
          >
            <Input placeholder="e.g. Sales Department Integration" />
          </Form.Item>

          <Form.Item label="Authorized Data Tables">
            <Checkbox
              checked={allTablesSelected}
              onChange={(e) => setAllTablesSelected(e.target.checked)}
            >
              Allow access to all tables (*)
            </Checkbox>

            {!allTablesSelected && (
              <div style={{ marginTop: 12 }}>
                <Typography.Text className="d-block gray-7 mb-2">
                  Select specific tables allowed for this API Key:
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
        title="Edit API Key Permissions"
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
            label="Key Name / Purpose"
            rules={[{ required: true, message: 'Please enter key name' }]}
          >
            <Input placeholder="e.g. Sales Department Integration" />
          </Form.Item>

          <Form.Item label="Authorized Data Tables">
            <Checkbox
              checked={editAllTablesSelected}
              onChange={(e) => setEditAllTablesSelected(e.target.checked)}
            >
              Allow access to all tables (*)
            </Checkbox>

            {!editAllTablesSelected && (
              <div style={{ marginTop: 12 }}>
                <Typography.Text className="d-block gray-7 mb-2">
                  Select specific tables allowed for this API Key:
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
        title="API Key Created Successfully"
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
          Please copy your API Key now. For security reasons, it will <strong>not be shown again</strong>.
        </Typography.Paragraph>

        <InputGroupWrapper>
          <Input
            style={{ width: 'calc(100% - 80px)' }}
            value={createdRawKey}
            readOnly
          />
          <Button
            type="default"
            icon={<CopyOutlined />}
            onClick={() => {
              const copyToClipboard = (text: string) => {
                if (navigator.clipboard && window.isSecureContext) {
                  navigator.clipboard
                    .writeText(text)
                    .then(() => message.success('API Key copied to clipboard'))
                    .catch(() => fallbackCopy(text));
                } else {
                  fallbackCopy(text);
                }
              };

              const fallbackCopy = (text: string) => {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                  const successful = document.execCommand('copy');
                  if (successful) {
                    message.success('API Key copied to clipboard');
                  } else {
                    message.error('Copy failed, please select and copy manually');
                  }
                } catch (err) {
                  message.error('Copy failed, please select and copy manually');
                }
                document.body.removeChild(textArea);
              };

              copyToClipboard(createdRawKey);
            }}
          >
            Copy
          </Button>
        </InputGroupWrapper>
      </Modal>
    </Container>
  );
}
