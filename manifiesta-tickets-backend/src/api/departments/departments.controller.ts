import { Controller, Get } from '@nestjs/common';
import { DepartmentsService } from './departments.service';

@Controller('api/departments')
export class DepartmentsController {

  constructor(private readonly departmentsService: DepartmentsService) { }
  
  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

}
