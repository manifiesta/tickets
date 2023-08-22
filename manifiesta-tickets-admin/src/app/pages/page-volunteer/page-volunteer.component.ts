import { Component, Inject, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { LongtextService } from 'src/app/shared/services/api/longtext.service';

@Component({
  selector: 'app-page-volunteer',
  templateUrl: './page-volunteer.component.html',
})
export class PageLongTextComponent implements OnInit {

  volunteerFr: string = '';
  volunteerNl: string = '';
  newInfosFr: string = '';
  newInfosNl: string = '';

  tinyMceConfig = {
    base_url: '/tinymce',
    suffix: '.min'
  };

  volunteersBenefits = 'volunteers-benefits';
  generalNewInfos = 'general-new-infos';

  constructor(private longtextService: LongtextService) { }

  ngOnInit(): void {
    forkJoin([
      this.longtextService.getOneLongtext(this.volunteersBenefits, 'fr'),
      this.longtextService.getOneLongtext(this.volunteersBenefits, 'nl'),
      this.longtextService.getOneLongtext(this.generalNewInfos, 'fr'),
      this.longtextService.getOneLongtext(this.generalNewInfos, 'nl'),
    ]).subscribe(([vbFr, vbNl, niFr, niNl]) => {
      this.volunteerFr = vbFr.text;
      this.volunteerNl = vbNl.text;
      this.newInfosFr = niFr.text;
      this.newInfosNl = niNl.text;
    });
  }

  saveVbFr() {
    this.saveGlobal(this.volunteersBenefits, 'fr', this.volunteerFr);
  }

  saveVbNl() {
    this.saveGlobal(this.volunteersBenefits, 'nl', this.volunteerNl);
  }

  saveNiFr() {
    this.saveGlobal(this.generalNewInfos, 'fr', this.newInfosFr);
  }

  saveNiNl() {
    this.saveGlobal(this.generalNewInfos, 'nl', this.newInfosNl);
  }

  saveGlobal(label: string, lang: string, text: string) {
    this.longtextService.editOneLongText({
      label,
      lang,
      text,
    }).subscribe(() => {
      console.log('good edit')
    });
  }

}

