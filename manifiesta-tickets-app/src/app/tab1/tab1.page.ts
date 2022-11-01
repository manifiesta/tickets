import { Component } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  openVivaWallet(amount: number) {
    window.open(
      'vivapayclient://pay/v1' +
      '?merchantKey=515fff06-de96-4079-af96-074dcac538ce' +
      '&appId=2JM5ROm94rB3t64Pp089893tyG3s9G' +
      '&action=sale' +
      `&amount=${amount}` +
      '&tipAmount=0' +
      '&show_receipt=false' +
      '&show_rating=false' +
      '&show_transaction_result=false' +
      '&withInstallments=false' +
      '&preferredInstallments=0' +
      '&callback=mycallbackscheme://result',
      '_system'
    );
  }
}
