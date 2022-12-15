/**
 * Some string with query
 * It's to assemble them into some scenario
 */

import { DataSource } from "typeorm";
import { Department } from "./api/departments/department.entity";
import { Seller } from "./api/sellers/seller.entity";
import { appDataSourceConfig } from "./data-source";

export async function mockingData() {
  const repo = await new DataSource(appDataSourceConfig()).initialize();
  await repo.dropDatabase();
  repo.initialize();
  // we need to recall it to have again the table after the clean up
  await new DataSource(appDataSourceConfig()).initialize();
  const departments = await mockDepartments(repo);
  const sellers = await mockSellers(repo, departments);
}

async function mockDepartments(repo) {
  const departmentRepo = repo.getRepository(Department);
  return [
    await departmentRepo.save(departmentRepo.create({ label: 'BBW', code: 'BBW' })),
    await departmentRepo.save(departmentRepo.create({ label: 'Antwerpen', code: 'Antwerpen' })),
    await departmentRepo.save(departmentRepo.create({ label: 'IT - Communication', code: 'IT' })),
  ];
}

async function mockSellers(repo, departments: Department[]) {
  const sellerRepo = await repo.getRepository(Seller);
  return [
    await sellerRepo.save(sellerRepo.create({ email: 'samy@manifiesta.com', firstName: 'Samy', lastName: 'Gnu', sellTickets: 60, sellTicketsGoal: 90, department: departments[0] })),
    await sellerRepo.save(sellerRepo.create({ email: 'raoul@manifiesta.com', firstName: 'Raoul', lastName: 'Mertens', sellTickets: 1, sellTicketsGoal: 50, department: departments[1] })),
    await sellerRepo.save(sellerRepo.create({ email: 'samy@manifiesta.com', firstName: 'Samy', lastName: 'Gnu', sellTickets: 17, sellTicketsGoal: 42, department: departments[2] })),
  ];
}