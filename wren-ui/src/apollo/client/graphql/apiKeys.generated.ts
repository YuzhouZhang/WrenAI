import * as Types from './__types__';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ApiKeyFieldsFragment = { __typename?: 'ApiKey', id: string, projectId: number, name: string, keyPrefix: string, allowedTables: Array<string>, isActive: boolean, createdAt: string, updatedAt?: string | null };

export type ApiKeysQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ApiKeysQuery = { __typename?: 'Query', apiKeys: Array<{ __typename?: 'ApiKey', id: string, projectId: number, name: string, keyPrefix: string, allowedTables: Array<string>, isActive: boolean, createdAt: string, updatedAt?: string | null }> };

export type CreateApiKeyMutationVariables = Types.Exact<{
  data: Types.CreateApiKeyInput;
}>;


export type CreateApiKeyMutation = { __typename?: 'Mutation', createApiKey: { __typename?: 'CreateApiKeyPayload', rawKey: string, apiKey: { __typename?: 'ApiKey', id: string, projectId: number, name: string, keyPrefix: string, allowedTables: Array<string>, isActive: boolean, createdAt: string, updatedAt?: string | null } } };

export type UpdateApiKeyMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  data: Types.UpdateApiKeyInput;
}>;


export type UpdateApiKeyMutation = { __typename?: 'Mutation', updateApiKey: { __typename?: 'ApiKey', id: string, projectId: number, name: string, keyPrefix: string, allowedTables: Array<string>, isActive: boolean, createdAt: string, updatedAt?: string | null } };

export type DeleteApiKeyMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type DeleteApiKeyMutation = { __typename?: 'Mutation', deleteApiKey: boolean };

export const ApiKeyFieldsFragmentDoc = gql`
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
export const ApiKeysDocument = gql`
    query ApiKeys {
  apiKeys {
    ...ApiKeyFields
  }
}
    ${ApiKeyFieldsFragmentDoc}`;

/**
 * __useApiKeysQuery__
 *
 * To run a query within a React component, call `useApiKeysQuery` and pass it any options that fit your needs.
 * When your component renders, `useApiKeysQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useApiKeysQuery({
 *   variables: {
 *   },
 * });
 */
export function useApiKeysQuery(baseOptions?: Apollo.QueryHookOptions<ApiKeysQuery, ApiKeysQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ApiKeysQuery, ApiKeysQueryVariables>(ApiKeysDocument, options);
      }
export function useApiKeysLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ApiKeysQuery, ApiKeysQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ApiKeysQuery, ApiKeysQueryVariables>(ApiKeysDocument, options);
        }
export type ApiKeysQueryHookResult = ReturnType<typeof useApiKeysQuery>;
export type ApiKeysLazyQueryHookResult = ReturnType<typeof useApiKeysLazyQuery>;
export type ApiKeysQueryResult = Apollo.QueryResult<ApiKeysQuery, ApiKeysQueryVariables>;
export const CreateApiKeyDocument = gql`
    mutation CreateApiKey($data: CreateApiKeyInput!) {
  createApiKey(data: $data) {
    apiKey {
      ...ApiKeyFields
    }
    rawKey
  }
}
    ${ApiKeyFieldsFragmentDoc}`;
export type CreateApiKeyMutationFn = Apollo.MutationFunction<CreateApiKeyMutation, CreateApiKeyMutationVariables>;

/**
 * __useCreateApiKeyMutation__
 *
 * To run a mutation, you first call `useCreateApiKeyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateApiKeyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createApiKeyMutation, { data, loading, error }] = useCreateApiKeyMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateApiKeyMutation(baseOptions?: Apollo.MutationHookOptions<CreateApiKeyMutation, CreateApiKeyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateApiKeyMutation, CreateApiKeyMutationVariables>(CreateApiKeyDocument, options);
      }
export type CreateApiKeyMutationHookResult = ReturnType<typeof useCreateApiKeyMutation>;
export type CreateApiKeyMutationResult = Apollo.MutationResult<CreateApiKeyMutation>;
export type CreateApiKeyMutationOptions = Apollo.BaseMutationOptions<CreateApiKeyMutation, CreateApiKeyMutationVariables>;
export const UpdateApiKeyDocument = gql`
    mutation UpdateApiKey($id: ID!, $data: UpdateApiKeyInput!) {
  updateApiKey(id: $id, data: $data) {
    ...ApiKeyFields
  }
}
    ${ApiKeyFieldsFragmentDoc}`;
export type UpdateApiKeyMutationFn = Apollo.MutationFunction<UpdateApiKeyMutation, UpdateApiKeyMutationVariables>;

/**
 * __useUpdateApiKeyMutation__
 *
 * To run a mutation, you first call `useUpdateApiKeyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateApiKeyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateApiKeyMutation, { data, loading, error }] = useUpdateApiKeyMutation({
 *   variables: {
 *      id: // value for 'id'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateApiKeyMutation(baseOptions?: Apollo.MutationHookOptions<UpdateApiKeyMutation, UpdateApiKeyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateApiKeyMutation, UpdateApiKeyMutationVariables>(UpdateApiKeyDocument, options);
      }
export type UpdateApiKeyMutationHookResult = ReturnType<typeof useUpdateApiKeyMutation>;
export type UpdateApiKeyMutationResult = Apollo.MutationResult<UpdateApiKeyMutation>;
export type UpdateApiKeyMutationOptions = Apollo.BaseMutationOptions<UpdateApiKeyMutation, UpdateApiKeyMutationVariables>;
export const DeleteApiKeyDocument = gql`
    mutation DeleteApiKey($id: ID!) {
  deleteApiKey(id: $id)
}
    `;
export type DeleteApiKeyMutationFn = Apollo.MutationFunction<DeleteApiKeyMutation, DeleteApiKeyMutationVariables>;

/**
 * __useDeleteApiKeyMutation__
 *
 * To run a mutation, you first call `useDeleteApiKeyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteApiKeyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteApiKeyMutation, { data, loading, error }] = useDeleteApiKeyMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteApiKeyMutation(baseOptions?: Apollo.MutationHookOptions<DeleteApiKeyMutation, DeleteApiKeyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteApiKeyMutation, DeleteApiKeyMutationVariables>(DeleteApiKeyDocument, options);
      }
export type DeleteApiKeyMutationHookResult = ReturnType<typeof useDeleteApiKeyMutation>;
export type DeleteApiKeyMutationResult = Apollo.MutationResult<DeleteApiKeyMutation>;
export type DeleteApiKeyMutationOptions = Apollo.BaseMutationOptions<DeleteApiKeyMutation, DeleteApiKeyMutationVariables>;