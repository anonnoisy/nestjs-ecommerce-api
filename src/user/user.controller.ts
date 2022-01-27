import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@prisma/client';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    if (createUserDto.username !== null) {
      const isUsernameExists = await this.userService.findOne({
        username: createUserDto.username.toString(),
      });

      if (isUsernameExists) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Username already exists' });
      }
    }

    const created = await this.userService.create({
      name: createUserDto.name,
      username: createUserDto.username,
      password: createUserDto.password,
    });

    return res.status(HttpStatus.CREATED).json(created);
  }

  @Get()
  findAll(
    @Query('skip') skip: number,
    @Query('take') take: number,
    @Query('role') role: string,
    @Query('orderBy') orderBy: string,
    @Query('order') order: string,
  ) {
    let userRole: UserRole;
    if (role !== null && role !== undefined) {
      const roleToArray = Object.values(UserRole);
      const isRoleExists = roleToArray.find(
        (userRole) => userRole === role.toUpperCase(),
      );
      if (isRoleExists) {
        userRole = isRoleExists;
      }
    }

    let ordering: { [key: string]: string } = {};
    if (orderBy !== null && order !== null) {
      ordering[orderBy] = order;
    }

    return this.userService.findAll({
      skip: skip == undefined ? undefined : +skip,
      take: take == undefined ? undefined : +take,
      where: { role: userRole },
      orderBy: ordering,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const user = await this.userService.findOne({ id });
    if (user === null) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'User not found' });
    }

    return res.status(HttpStatus.OK).json(user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
  ) {
    if (updateUserDto.username !== null) {
      const isUsernameExists = await this.userService.findOne({
        username: updateUserDto.username.toString(),
      });

      if (isUsernameExists && isUsernameExists.id !== id) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Username already exists' });
      }
    }

    const updated = await this.userService.update({
      where: { id },
      data: {
        name: updateUserDto.name,
        username: updateUserDto.username,
      },
    });

    return res.status(HttpStatus.OK).json(updated);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove({ id });
  }
}
