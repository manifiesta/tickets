import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom, from, of } from 'rxjs';
import { Repository } from 'typeorm';
import { Department } from './department.entity';

@Injectable()
export class DepartmentsService {

  constructor(
    @InjectRepository(Department)
    private readonly sellerRepository: Repository<Department>,
  ) { }

  // TODO must see if hardcode or with db
  findAll(): Promise<Department[]> {
    // in code, P for provincies, O for other
    return new Promise((resolve) => {
      resolve([
        { label: 'Antwerpen', code: 'P/A', id: 1 },
        { label: 'Bruxelles & Brabant-Wallon', code: 'P/BBW', id: 2 },
        { label: 'Comac', code: 'O/Comac', id: 3 },
        { label: 'Nationale', code: 'O/N', id: 4 },
      ])
    });
    return this.sellerRepository.find();
  }

}
