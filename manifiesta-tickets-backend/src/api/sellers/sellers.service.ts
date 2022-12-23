import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom, from, map, mergeMap, of } from 'rxjs';
import { Repository } from 'typeorm';
import { ConnectSellerDto } from './dto/connect-seller.dto';
import { CreateSellerDto } from './dto/create-seller.dto';
import { TicketSaleDto } from './dto/ticket-sale.dto';
import { Seller } from './seller.entity';
import * as XLSX from 'xlsx';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class SellersService {

  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
    private httpService: HttpService
  ) { }

  findAll(): Promise<Seller[]> {
    return this.sellerRepository.find({
      relations: ['department']
    });
  }

  // TODO we will have something better than an ID later to find
  findOne(id: string): Promise<Seller> {
    return this.sellerRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['department']
    });
  }

  createOne(createSeller: CreateSellerDto) {
    return this.sellerRepository.save(this.sellerRepository.create(createSeller));
  }

  async connectBeeple(connectSeller: ConnectSellerDto) {
    const beepleUser = (await firstValueFrom(this.httpService.post<any>(
      'https://volunteers.manifiesta.be/api/v1/authenticate',
      {
        session: {
          email: connectSeller.email,
          password: connectSeller.password,
          display: 'Example API',
        }
      }
    ).pipe(
      map(d => { return d.data }),
    )));

    if (!beepleUser.result) {
      // Beeple API say that the user dont exist
      throw new HttpException({ message: ['error user not existing or bad password'], code: 'auth-bad-combination' }, HttpStatus.NOT_FOUND);
    }

    const path = 'http://data.gerardweb.eu/manifiestapp/plop_light.xls';
    // const data = await (await fetch(path)).arrayBuffer();
    const data = await firstValueFrom(this.httpService.get<any>(path, { responseType: "arraybuffer" })
      .pipe(
        map(d => { return d.data }),
      ));
    const readFile = XLSX.read(data);
    const volunteers = XLSX.utils.sheet_to_json(readFile.Sheets['COLLABORATORS']);

    const user = volunteers.find(x => x['e-mail'] === connectSeller.email);

    if (!user) {
      throw new HttpException({ message: ['error not yet in our database, contact admin'], code: 'auth-bad-not-in-file' }, HttpStatus.NOT_FOUND);
    } else {
      try {
        user['id'] = parseInt(user['Code Beeple']) - 1100;
      } catch {
        throw new HttpException({ message: ['error to transform user in good format'] }, HttpStatus.NOT_FOUND);
      }
    }

    return { email: user['e-mail'], id: user['id'], name: beepleUser.name };
  }

  // TODO Manage error
  // Also say if maybe simple error from the user (good mail but not good department)
  connect(connectSeller: ConnectSellerDto): Promise<Seller> {
    return this.sellerRepository.findOne({
      relations: ['department'],
      where: { email: connectSeller.email, department: connectSeller.department }
    });
  }

  // TODO for demo purpose
  addTicket(ticketSale: TicketSaleDto) {
    return from(this.sellerRepository.findOne({
      where: { id: parseInt(ticketSale.userId) }, relations: ['department'],
    })).pipe(
      mergeMap(seller => {
        seller.sellTickets++;
        return this.sellerRepository.save(seller);
      }),
    );
  }

}
