import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { SearchRoomsDto } from './dto/search-rooms.dto';
import { AccessRoomDto } from './dto/access-room.dto';
import { GetRoomsDto } from './dto/get-rooms.dto';
import { UploadFilesDto } from './dto/upload-url.dto';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get rooms by IDs',
    description:
      'Fetch multiple rooms by their UUIDs. Returns room data including whether each room is private.',
  })
  @ApiResponse({ status: 200, description: 'List of rooms' })
  getRooms(@Query() getRoomsDto: GetRoomsDto) {
    return this.roomsService.getRooms(getRoomsDto);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search public rooms',
    description:
      'Search public rooms by name with case-insensitive matching. Results are paginated (20 per page).',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated search results with metadata',
  })
  searchRooms(@Query() searchRoomsDto: SearchRoomsDto) {
    return this.roomsService.searchRooms(searchRoomsDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single room',
    description:
      'Fetch a room by its UUID. Returns room data including whether it is private.',
  })
  @ApiParam({ name: 'id', description: 'Room UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Room found' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  getRoom(@Param('id', new ParseUUIDPipe()) roomId: string) {
    return this.roomsService.getRoom(roomId);
  }

  @Get(':id/messages')
  @ApiOperation({
    summary: 'Get room messages',
    description:
      'Fetch all messages for a room. For private rooms, a valid JWT access token must be provided as a query parameter.',
  })
  @ApiParam({ name: 'id', description: 'Room UUID', format: 'uuid' })
  @ApiQuery({
    name: 'token',
    description: 'JWT access token (required for private rooms)',
    required: false,
  })
  @ApiResponse({ status: 200, description: 'List of messages' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid token for private room',
  })
  @ApiResponse({ status: 404, description: 'Room not found' })
  getMessages(
    @Param('id', new ParseUUIDPipe()) roomId: string,
    @Query('token') accessToken?: string,
  ) {
    return this.roomsService.findMessagesByRoom(roomId, accessToken);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a room',
    description:
      'Create a new public or private chat room. Private rooms require a 6-character password.',
  })
  @ApiResponse({ status: 201, description: 'Room created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.createRoom(createRoomDto);
  }

  @Post(':id/access')
  @ApiOperation({
    summary: 'Access a private room',
    description:
      'Exchange the 6-character password for a JWT access token that grants entry to a private room. The token expires in 2 hours.',
  })
  @ApiParam({ name: 'id', description: 'Room UUID', format: 'uuid' })
  @ApiResponse({
    status: 201,
    description: 'Access granted — returns JWT token',
  })
  @ApiResponse({ status: 401, description: 'Invalid password' })
  @ApiResponse({ status: 404, description: 'Room not found or not private' })
  accessRoom(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() accessRoomDto: AccessRoomDto,
  ) {
    return this.roomsService.accessRoom(id, accessRoomDto);
  }

  @Post(':id/upload-urls')
  @ApiOperation({
    summary: 'Get signed S3 POST upload URLs for multiple files',
    description:
      'Returns a pre-signed POST URL and form fields for each file to upload directly to S3 (0-5 MB limit per file). Max 10 files per request. For private rooms, a valid JWT access token must be provided.',
  })
  @ApiParam({ name: 'id', description: 'Room UUID', format: 'uuid' })
  @ApiQuery({
    name: 'token',
    description: 'JWT access token (required for private rooms)',
    required: false,
  })
  @ApiResponse({
    status: 201,
    description: 'Signed POST URLs generated — returns { files: [{ key, url, fields }] }',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid token for private room',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  getUploadUrls(
    @Param('id', new ParseUUIDPipe()) roomId: string,
    @Body() dto: UploadFilesDto,
    @Query('token') accessToken?: string,
  ) {
    console.log('id', roomId);
    return this.roomsService.getUploadUrls(roomId, dto, accessToken);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a room',
    description: 'Delete a chat room and all its associated data.',
  })
  @ApiParam({ name: 'id', description: 'Room UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  deleteRoom(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.roomsService.deleteRoom(id);
  }
}
