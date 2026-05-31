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
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { SearchRoomsDto } from './dto/search-rooms.dto';
import { AccessRoomDto } from './dto/access-room.dto';
import { GetRoomsDto } from './dto/get-rooms.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  getRooms(@Query() getRoomsDto: GetRoomsDto) {
    return this.roomsService.getRooms(getRoomsDto);
  }

  @Get('search')
  searchRooms(@Query() searchRoomsDto: SearchRoomsDto) {
    return this.roomsService.searchRooms(searchRoomsDto);
  }

  @Get(':id')
  getRoom(@Param('id', new ParseUUIDPipe()) roomId: string) {
    return this.roomsService.getRoom(roomId);
  }

  @Post()
  createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.createRoom(createRoomDto);
  }

  @Post(':id/access')
  accessRoom(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() accessRoomDto: AccessRoomDto,
  ) {
    return this.roomsService.accessRoom(id, accessRoomDto);
  }

  @Delete(':id')
  deleteRoom(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.roomsService.deleteRoom(id);
  }
}
