import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Patch,
  Query,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * POST /messages
   * Create and send a message (Admin only)
   */
  @Post()
  @Roles('ADMIN')
  create(@Body() createMessageDto: CreateMessageDto, @Req() req: any) {
    return this.messagesService.create(createMessageDto, req.user.userId);
  }

  /**
   * GET /messages/sent
   * Get all sent messages (Admin only)
   */
  @Get('sent')
  @Roles('ADMIN')
  getSentMessages(@Req() req: any) {
    return this.messagesService.findAllSent(req.user.userId); // ✅ CHANGED
  }

  /**
   * GET /messages/received
   * Get all received messages (for logged-in user)
   */
  @Get('received')
  @Roles('DOCTOR', 'NURSE')
  getReceivedMessages(@Req() req: any) {
    return this.messagesService.findAllReceived(req.user.userId); // ✅ CHANGED
  }

  /**
   * GET /messages/stats
   * Get message statistics (Admin only)
   */
  @Get('stats')
  @Roles('ADMIN')
  getStats(@Req() req: any) {
    return this.messagesService.getStats(req.user.userId);
  }

  /**
   * GET /messages/unread-count
   * Get unread message count (for logged-in user)
   */
  @Get('unread-count')
  @Roles('DOCTOR', 'NURSE')
  async getUnreadCount(@Req() req: any) {
    const count = await this.messagesService.getUnreadCount(req.user.userId);
    return { count };
  }

  /**
   * GET /messages/sent/:id
   * Get a specific sent message (Admin only)
   */
  @Get('sent/:id')
  @Roles('ADMIN')
  getSentMessage(@Param('id') id: string, @Req() req: any) {
    return this.messagesService.findOneSent(id, req.user.userId); // ✅ CHANGED
  }

  /**
   * GET /messages/received/:id
   * Get a specific received message (for logged-in user)
   */
  @Get('received/:id')
  @Roles('DOCTOR', 'NURSE')
  getReceivedMessage(@Param('id') id: string, @Req() req: any) {
    return this.messagesService.findOneReceived(id, req.user.userId); // ✅ CHANGED
  }

  /**
   * PATCH /messages/:id/read
   * Mark a message as read
   */
  @Patch(':id/read')
  @Roles('DOCTOR', 'NURSE')
  markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.messagesService.markAsRead(id, req.user.userId);
  }

  /**
   * DELETE /messages/:id
   * Delete a sent message (Admin only)
   */
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.messagesService.remove(id, req.user.userId);
  }
}
