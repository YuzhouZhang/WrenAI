import { gql } from '@apollo/client';

const API_KEY_FRAGMENT = gql`
  fragment ApiKeyFields on ApiKey {
    id
    projectId
    name
    keyPrefix
    allowedTables
    isActive
    createdAt
    updatedAt
  }
`;

export const LIST_API_KEYS = gql`
  query ApiKeys {
    apiKeys {
      ...ApiKeyFields
    }
  }

  ${API_KEY_FRAGMENT}
`;

export const CREATE_API_KEY = gql`
  mutation CreateApiKey($data: CreateApiKeyInput!) {
    createApiKey(data: $data) {
      apiKey {
        ...ApiKeyFields
      }
      rawKey
    }
  }

  ${API_KEY_FRAGMENT}
`;

export const UPDATE_API_KEY = gql`
  mutation UpdateApiKey($id: ID!, $data: UpdateApiKeyInput!) {
    updateApiKey(id: $id, data: $data) {
      ...ApiKeyFields
    }
  }

  ${API_KEY_FRAGMENT}
`;

export const DELETE_API_KEY = gql`
  mutation DeleteApiKey($id: ID!) {
    deleteApiKey(id: $id)
  }
`;
