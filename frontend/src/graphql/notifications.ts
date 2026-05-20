import { gql } from '@apollo/client';

export const NOTIFICATION_SUBSCRIPTION = gql`
  subscription NotificationAdded {
    notification {
      id
      title
      body
      createdAt
      link
      meta
    }
  }
`;
