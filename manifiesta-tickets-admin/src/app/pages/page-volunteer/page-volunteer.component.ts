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

  tinyMceConfig = {
    base_url: '/tinymce',
    suffix: '.min'
  };

  volunteersBenefits = 'volunteers-benefits';

  constructor(private longtextService: LongtextService) { }

  ngOnInit(): void {
    forkJoin([
      this.longtextService.getOneLongtext(this.volunteersBenefits, 'fr'),
      this.longtextService.getOneLongtext(this.volunteersBenefits, 'nl'),
    ]).subscribe(([vbFr, vbNl]) => {
      this.volunteerFr = vbFr.text;
      this.volunteerNl = vbNl.text;
    });
  }

  saveVbFr() {
    this.saveGlobal(this.volunteersBenefits, 'fr', this.volunteerFr);
  }

  saveVbNl() {
    this.saveGlobal(this.volunteersBenefits, 'nl', this.volunteerNl);
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

