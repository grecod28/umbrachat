import { Controller, Delete, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  createRoom() {
    return this.roomsService.createRoom();
  }

  @Delete(':id')
  deleteRoom(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.roomsService.deleteRoom(id);
  }
}
