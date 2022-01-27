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
import { Customer } from '@prisma/client';
import { response, Response } from 'express';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
    @Res() response: Response,
  ): Promise<Response> {
    if (createCustomerDto.username !== null) {
      const isUsernameExists = await this.customerService.findFirst({
        OR: [
          { username: createCustomerDto.username.toString() },
          { email: createCustomerDto.email.toString() },
          { phone: createCustomerDto.phone.toString() },
        ],
      });

      if (isUsernameExists) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Username or email address or phone already exists' });
      }
    }

    const created: Customer = await this.customerService.create(
      createCustomerDto,
    );

    return response.status(HttpStatus.CREATED).json(created);
  }

  @Get()
  async findAll(
    @Query('skip') skip: number,
    @Query('take') take: number,
    @Query('orderBy') orderBy: string,
    @Query('order') order: string,
    @Res() response: Response,
  ): Promise<Response> {
    let ordering: { [key: string]: string } = {};
    if (orderBy !== null && order !== null) {
      ordering[orderBy] = order;
    }

    const customers: Customer[] = await this.customerService.findAll({
      skip: skip == undefined ? undefined : +skip,
      take: take == undefined ? undefined : +take,
      orderBy: ordering,
    });

    return response.status(HttpStatus.OK).json(customers);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<Response> {
    const customer: Customer = await this.customerService.findOne({ id });

    return response.status(HttpStatus.OK).json(customer);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Res() response: Response,
  ): Promise<Response> {
    if (updateCustomerDto.username !== null) {
      const isUsernameExists = await this.customerService.findOne({
        username: updateCustomerDto.username.toString(),
      });

      if (isUsernameExists && isUsernameExists.id !== id) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Username already exists' });
      }
    }

    const updated = await this.customerService.update({
      where: { id },
      data: {
        username: updateCustomerDto.username,
        firstName: updateCustomerDto.firstName,
        lastName: updateCustomerDto.lastName,
        email: updateCustomerDto.email,
        phone: updateCustomerDto.phone,
      },
    });

    return response.status(HttpStatus.OK).json(updated);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<Response> {
    const removed = await this.customerService.remove({ id });
    return response.status(HttpStatus.OK).json(removed);
  }
}
