import { Injectable } from '@nestjs/common';
import { Customer, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomerService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(data.password, salt);
    data.password = hash;

    return await this.prismaService.customer.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.CustomerWhereInput;
    orderBy?: Prisma.CustomerOrderByWithRelationInput;
  }): Promise<Customer[]> {
    return await this.prismaService.customer.findMany({ ...params });
  }

  async findOne(
    customerWhereUniqeInput: Prisma.CustomerWhereUniqueInput,
  ): Promise<Customer | null> {
    return await this.prismaService.customer.findUnique({
      where: customerWhereUniqeInput,
    });
  }

  async update(
    customerWhereUniqeInput: Prisma.CustomerWhereUniqueInput,
    data: Prisma.CustomerUpdateInput,
  ): Promise<Customer> {
    return await this.prismaService.customer.update({
      where: customerWhereUniqeInput,
      data: data,
    });
  }

  async remove(id: string): Promise<Customer> {
    return this.prismaService.customer.delete({ where: { id } });
  }
}
