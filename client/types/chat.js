/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} [id]
 * @property {string} name
 * @property {string} username
 * @property {string} email
 * @property {string} [avatar]
 * @property {'online' | 'offline'} [status]
 * @property {string | null} [lastSeen]
 */

/**
 * @typedef {Object} Attachment
 * @property {string} url
 * @property {string} [publicId]
 * @property {string} fileName
 * @property {string} mimeType
 * @property {number} size
 * @property {'image' | 'video' | 'audio' | 'document'} type
 */

/**
 * @typedef {Object} Reaction
 * @property {User | string} user
 * @property {string} emoji
 */

/**
 * @typedef {Object} Message
 * @property {string} _id
 * @property {string} [tempId]
 * @property {string | Conversation} conversation
 * @property {User} sender
 * @property {string} content
 * @property {'text' | 'image' | 'video' | 'audio' | 'document'} type
 * @property {Attachment[]} [attachments]
 * @property {Reaction[]} [reactions]
 * @property {Message | null} [replyTo]
 * @property {(string | User)[]} [readBy]
 * @property {(string | User)[]} [deliveredTo]
 * @property {string} createdAt
 * @property {string} [updatedAt]
 * @property {boolean} [isOptimistic]
 */

/**
 * @typedef {Object} Conversation
 * @property {string} _id
 * @property {'direct' | 'group'} type
 * @property {string} [name]
 * @property {string} [avatar]
 * @property {User[]} members
 * @property {User[]} [admins]
 * @property {User | string} createdBy
 * @property {Message | null} [lastMessage]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export {};
