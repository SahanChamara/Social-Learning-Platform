package com.sociallearning.entity;

// Placeholder classes for relationships (will be implemented in later phases)

class Course {
    private Long id;
    private User creator;
}

class Enrollment {
    private Long id;
    private User user;
}

class Comment {
    private Long id;
    private User user;
}

class Like {
    private Long id;
    private User user;
}

class Rating {
    private Long id;
    private User user;
}

class Bookmark {
    private Long id;
    private User user;
}

class Follow {
    private Long id;
    private User follower;
    private User following;
}

class UserAchievement {
    private Long id;
    private User user;
}

class Notification {
    private Long id;
    private User user;
}
