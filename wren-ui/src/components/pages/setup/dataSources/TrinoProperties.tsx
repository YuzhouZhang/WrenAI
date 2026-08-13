import { Form, Input, Select, Switch } from 'antd';
import { ERROR_TEXTS } from '@/utils/error';
import { FORM_MODE } from '@/utils/enum';
import { hostValidator } from '@/utils/validator';

interface Props {
  mode?: FORM_MODE;
}

export default function TrinoProperties({ mode }: Props) {
  const isEditMode = mode === FORM_MODE.EDIT;
  return (
    <>
      <Form.Item
        label="Display name"
        name="displayName"
        required
        rules={[
          {
            required: true,
            message: ERROR_TEXTS.CONNECTION.DISPLAY_NAME.REQUIRED,
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Host"
        name="host"
        required
        rules={[
          {
            required: true,
            validator: hostValidator,
          },
        ]}
      >
        <Input placeholder="10.1.1.1" disabled={isEditMode} />
      </Form.Item>
      <Form.Item
        label="Port"
        name="port"
        required
        rules={[
          {
            required: true,
            message: ERROR_TEXTS.CONNECTION.PORT.REQUIRED,
          },
        ]}
      >
        <Input disabled={isEditMode} />
      </Form.Item>
      <Form.Item
        label="Schemas"
        name="schemas"
        required
        rules={[
          {
            required: true,
            message: ERROR_TEXTS.CONNECTION.SCHEMAS.REQUIRED,
          },
        ]}
        getValueProps={(value) => {
          if (Array.isArray(value)) return { value };
          if (typeof value === 'string' && value) {
            return {
              value: value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            };
          }
          return { value: [] };
        }}
        normalize={(val) => {
          if (Array.isArray(val)) {
            return val
              .map((s) => s.trim())
              .filter(Boolean)
              .join(', ');
          }
          return val;
        }}
      >
        <Select
          mode="tags"
          tokenSeparators={[',', ' ']}
          placeholder="Input catalog.schema and press Enter"
          open={false}
          style={{ width: '100%' }}
        />
      </Form.Item>
      <Form.Item
        label="Username"
        name="username"
        required
        rules={[
          {
            required: true,
            message: ERROR_TEXTS.CONNECTION.USERNAME.REQUIRED,
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Password"
        name="password"
        required
        rules={[
          {
            required: false,
            message: ERROR_TEXTS.CONNECTION.PASSWORD.REQUIRED,
          },
        ]}
      >
        <Input.Password placeholder="Input password" />
      </Form.Item>
      <Form.Item label="Use SSL" name="ssl" valuePropName="checked">
        <Switch />
      </Form.Item>
    </>
  );
}
