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
        { label: 'Antwerpen', code: 'ANT', id: 1 },
        { label: 'Bruxelles & Brabant-Wallon', code: 'BBW', id: 2 },
        { label: 'Hainaut', code: 'HAI', id: 2 },
        { label: 'Liège', code: 'LIE', id: 2 },
        { label: 'Limburg', code: 'LIM', id: 2 },
        { label: 'Namur & Luxembourg', code: 'NLU', id: 2 },
        { label: 'Oost-Vlaanderen', code: 'OOV', id: 2 },
        { label: 'Vlaams-Brabant', code: 'VLB', id: 2 },
        { label: 'West-Vlaanderen', code: 'WEV', id: 2 },
        { label: 'Comac', code: 'O/Comac', id: 3 },
        { label: 'Nationale', code: 'O/N', id: 4 },
        { label: 'Intal', code: 'O/Intal', id: 3 },
      ])
    });
    return this.sellerRepository.find();
  }

}
