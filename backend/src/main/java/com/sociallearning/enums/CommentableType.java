package com.sociallearning.enums;

/**
 * Target type for comments - defines what entity type a comment belongs to
 */
public enum CommentableType {
    COURSE,      // Comment on a course
    LESSON,      // Comment on a lesson
    COMMENT      // Reply to another comment (nested comments)
}
