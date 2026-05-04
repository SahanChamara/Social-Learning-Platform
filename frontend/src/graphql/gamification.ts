import { gql } from '@apollo/client';

export const MY_ACHIEVEMENTS_QUERY = gql`
  query MyAchievements {
    myAchievements {
      id
      achievement {
        id
        name
        description
        category
        iconUrl
        badgeColor
        points
      }
      progressPercentage
      progressJson
      isUnlocked
      earnedAt
      notifiedAt
      createdAt
    }
  }
`;

export const LEARNING_STREAK_QUERY = gql`
  query LearningStreak {
    learningStreak {
      id
      currentStreakDays
      longestStreakDays
      totalActiveDays
      lastActivityDate
      streakStartDate
      lastResetAt
      createdAt
    }
  }
`;

export const ACHIEVEMENTS_QUERY = gql`
  query Achievements {
    achievements {
      id
      name
      description
      category
      iconUrl
      badgeColor
      points
      isActive
      isHidden
      isSecret
    }
  }
`;
