import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { departments, provinces } from '../shared/data/departments.list';
import { Department } from './department.entity';

@Injectable()
export class DepartmentsService {

  constructor(
    @InjectRepository(Department)
    private readonly sellerRepository: Repository<Department>,
  ) { }

  findAll(lang: string = 'nl'): Promise<Department[]> {
    return new Promise((resolve) => {
      resolve(departments.map(d => {
        return {
          ...d,
          label: lang === 'fr' ? d.labelFr : d.labelNl
        }
      }))
    });
  }

  getAllProvince(): Promise<any[]> {
    return new Promise((resolve) => {
      resolve(provinces)
    });
  }

}
