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

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

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

  @Delete(':id')
  deleteRoom(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.roomsService.deleteRoom(id);
  }
}
