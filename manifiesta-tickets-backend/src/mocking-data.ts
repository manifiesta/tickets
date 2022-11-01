/**
 * Some string with query
 * It's to assemble them into some scenario
 */

import { DataSource } from "typeorm";
import { Seller } from "./api/sellers/seller.entity";
import { appDataSourceConfig } from "./data-source";

export async function mockingData() {
  const sellers = await mockSellers();
}

async function mockSellers() {
  const repo = await (await new DataSource(appDataSourceConfig()).initialize()).getRepository(Seller);
  await repo.delete({});
  await repo.save(repo.create({ email: 'samy@manifiesta.com', firstName: 'Samy', lastName: 'Gnu', sellTickets: 4, sellTicketsGoal: 40 }));
  await repo.save(repo.create({ email: 'raoul@manifiesta.com', firstName: 'Raoul', lastName: 'Mertens', sellTickets: 7, sellTicketsGoal: 50 }));
}