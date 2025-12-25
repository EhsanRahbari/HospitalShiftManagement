import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create and send a message to users by department and section
   */
  async create(createMessageDto: CreateMessageDto, senderId: string) {
    const { title, content, targetDepartments, targetSections } =
      createMessageDto;

    // Find all users matching the department and section criteria
    const where: any = {
      isActive: true,
      role: { not: 'ADMIN' }, // Don't send to admins
    };

    // If departments specified, filter by departments
    if (targetDepartments && targetDepartments.length > 0) {
      where.department = { in: targetDepartments };
    }

    // If sections specified, filter by sections
    if (targetSections && targetSections.length > 0) {
      where.section = { in: targetSections };
    }

    // Get target users
    const targetUsers = await this.prisma.user.findMany({
      where,
      select: { id: true },
    });

    if (targetUsers.length === 0) {
      throw new BadRequestException(
        'No users found matching the specified criteria',
      );
    }

    // Create message and recipients in a transaction
    const message = await this.prisma.$transaction(async (tx) => {
      // Create the message
      const newMessage = await tx.message.create({
        data: {
          title,
          content,
          senderId,
          targetDepartments: targetDepartments || [],
          targetSections: targetSections || [],
        },
      });

      // Create message recipients
      await tx.messageRecipient.createMany({
        data: targetUsers.map((user) => ({
          messageId: newMessage.id,
          userId: user.id,
        })),
      });

      // Return message with sender and recipients
      return tx.message.findUnique({
        where: { id: newMessage.id },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              // ✅ REMOVED firstName - doesn't exist in schema
            },
          },
          recipients: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  department: true,
                  section: true,
                  // ✅ REMOVED firstName
                },
              },
            },
          },
        },
      });
    });

    return message;
  }

  /**
   * Get all sent messages for admin (with statistics)
   */
  async findAllSent(senderId: string) {
    const messages = await this.prisma.message.findMany({
      where: { senderId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            // ✅ REMOVED firstName
          },
        },
        recipients: {
          // ✅ ADD recipients relation
          select: {
            id: true,
            readAt: true,
            receivedAt: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Add statistics to each message
    return messages.map((message) => ({
      ...message,
      recipientCount: message.recipients.length, // ✅ Now recipients exists
      readCount: message.recipients.filter((r) => r.readAt !== null).length,
      unreadCount: message.recipients.filter((r) => r.readAt === null).length,
    }));
  }

  /**
   * Get received messages for a user
   */
  async findAllReceived(userId: string) {
    const messageRecipients = await this.prisma.messageRecipient.findMany({
      where: { userId },
      include: {
        message: {
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                // ✅ REMOVED firstName
              },
            },
          },
        },
      },
      orderBy: { receivedAt: 'desc' },
    });

    return messageRecipients.map((recipient) => ({
      id: recipient.id,
      messageId: recipient.message.id,
      title: recipient.message.title,
      content: recipient.message.content,
      sender: recipient.message.sender,
      targetDepartments: recipient.message.targetDepartments,
      targetSections: recipient.message.targetSections,
      readAt: recipient.readAt,
      receivedAt: recipient.receivedAt,
      createdAt: recipient.message.createdAt,
    }));
  }

  /**
   * Get a specific sent message (admin only)
   */
  async findOneSent(id: string, senderId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            // ✅ REMOVED firstName
          },
        },
        recipients: {
          // ✅ ADD recipients relation
          include: {
            user: {
              select: {
                id: true,
                username: true,
                department: true,
                section: true,
                // ✅ REMOVED firstName
              },
            },
          },
          orderBy: { receivedAt: 'desc' },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Verify sender
    if (message.senderId !== senderId) {
      throw new ForbiddenException('You can only view messages you have sent');
    }

    return {
      ...message,
      recipientCount: message.recipients.length, // ✅ Now recipients exists
      readCount: message.recipients.filter((r) => r.readAt !== null).length,
      unreadCount: message.recipients.filter((r) => r.readAt === null).length,
    };
  }

  /**
   * Get a specific received message (for user)
   */
  async findOneReceived(id: string, userId: string) {
    const messageRecipient = await this.prisma.messageRecipient.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        message: {
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                // ✅ REMOVED firstName
              },
            },
          },
        },
      },
    });

    if (!messageRecipient) {
      throw new NotFoundException('Message not found');
    }

    return {
      id: messageRecipient.id,
      messageId: messageRecipient.message.id,
      title: messageRecipient.message.title,
      content: messageRecipient.message.content,
      sender: messageRecipient.message.sender,
      targetDepartments: messageRecipient.message.targetDepartments,
      targetSections: messageRecipient.message.targetSections,
      readAt: messageRecipient.readAt,
      receivedAt: messageRecipient.receivedAt,
      createdAt: messageRecipient.message.createdAt,
    };
  }

  /**
   * Mark a message as read
   */
  async markAsRead(recipientId: string, userId: string) {
    // Find the message recipient
    const recipient = await this.prisma.messageRecipient.findFirst({
      where: {
        id: recipientId,
        userId,
      },
      include: {
        message: true, // ✅ ADD message relation
      },
    });

    if (!recipient) {
      throw new NotFoundException('Message not found');
    }

    // Check if user is the recipient
    const isRecipient = recipient.userId === userId; // ✅ FIX: Check userId directly

    if (!isRecipient) {
      throw new ForbiddenException('You are not a recipient of this message');
    }

    // Update read status
    return this.prisma.messageRecipient.update({
      where: { id: recipientId },
      data: { readAt: new Date() },
    });
  }

  /**
   * Delete a sent message (admin only)
   */
  async remove(id: string, senderId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Verify sender
    if (message.senderId !== senderId) {
      throw new ForbiddenException(
        'You can only delete messages you have sent',
      );
    }

    // Delete message (cascade will delete recipients)
    await this.prisma.message.delete({
      where: { id },
    });

    return { message: 'Message deleted successfully' };
  }

  /**
   * Get message statistics for admin
   */
  async getStats(senderId: string) {
    const [totalSent, totalRecipients, totalRead] = await Promise.all([
      // Total messages sent by this admin
      this.prisma.message.count({
        where: { senderId },
      }),

      // Total recipients of all messages sent by this admin
      this.prisma.messageRecipient.count({
        where: {
          message: {
            senderId,
          },
        },
      }),

      // Total read messages
      this.prisma.messageRecipient.count({
        where: {
          message: {
            senderId,
          },
          readAt: { not: null },
        },
      }),
    ]);

    return {
      totalSent,
      totalRecipients,
      totalRead,
      totalUnread: totalRecipients - totalRead,
      readRate:
        totalRecipients > 0
          ? ((totalRead / totalRecipients) * 100).toFixed(2)
          : '0.00',
    };
  }

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.messageRecipient.count({
      where: {
        userId,
        readAt: null,
      },
    });
  }
}
