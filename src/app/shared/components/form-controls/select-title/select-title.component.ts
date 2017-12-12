import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { FormElement } from '../form-element';
import { SelectOption } from '../select/select.component';

@Component({
  selector: 'is-select-title',
  templateUrl: './select-title.component.html'
})
export class SelectTitleComponent extends FormElement implements OnChanges, OnInit {
  @Input() countryCode: string; // component will only be rendered if set

  titles: SelectOption[];

  constructor(
    protected translate: TranslateService
  ) {
    super(translate);
  }

  ngOnInit() {
    this.setDefaultValues();
    super.init();
  }

  /*
    refresh regions if country input changes
  */
  ngOnChanges(changes: SimpleChanges) {
    this.titles = this.getTitleOptions();
  }

  /*
    set default values for empty input parameters
  */
  private setDefaultValues() {
    this.controlName = this.controlName || 'title';
    this.label = this.label || 'Salutation';      // ToDo: Translation key
    this.errorMessages = this.errorMessages || { 'required': 'Please select a salutation' };  // ToDo: Translation key
  }

  /*
    get salutation for the given country
    returns (SelectOption[]) - salutation options
  */
  private getTitleOptions(): SelectOption[] {
    let options: SelectOption[] = [];
    const titles = this.getSalutations(this.countryCode);

    if (titles) {
      // Map title array to an array of type SelectOption
      options = titles.map(title => {
        return {
          'label': title,
          'value': title
        };
      });
    } else {
      this.form.get('title').clearValidators();
    }
    return options;
  }

  // ToDo: replace this code, return titles from a service
  private getSalutations(countrycode) {
    if (countrycode) {
      return [
        'account.salutation.ms.text',
        'account.salutation.mr.text',
        'account.salutation.mrs.text'
      ];
    }
    return [];
  }
}
