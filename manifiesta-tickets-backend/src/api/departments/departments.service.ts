import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { departments } from '../shared/data/departments.list';
import { Department } from './department.entity';

@Injectable()
export class DepartmentsService {

  constructor(
    @InjectRepository(Department)
    private readonly sellerRepository: Repository<Department>,
  ) { }

  // TODO must see if hardcode or with db
  findAll(): Promise<Department[]> {
    // in code, O for other specific shop, nothing when we want the base 
    return new Promise((resolve) => {
      resolve(departments)
    });
    return this.sellerRepository.find();
  }

}
