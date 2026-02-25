import { gql } from '@apollo/client';

// GraphQL Fragments
export const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    username
    email
    fullName
    role
    avatarUrl
    bio
    expertise
    isVerified
    isActive
    createdAt
  }
`;

// GraphQL Mutations
export const LOGIN_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      refreshToken
      user {
        ...UserFields
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      refreshToken
      user {
        ...UserFields
      }
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      token
      refreshToken
      user {
        ...UserFields
      }
    }
  }
`;

// GraphQL Queries
export const ME_QUERY = gql`
  ${USER_FRAGMENT}
  query Me {
    me {
      ...UserFields
    }
  }
`;

export const USER_QUERY = gql`
  ${USER_FRAGMENT}
  query User($id: ID!) {
    user(id: $id) {
      ...UserFields
    }
  }
`;
