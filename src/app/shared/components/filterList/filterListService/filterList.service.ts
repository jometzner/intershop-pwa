import { Injectable } from '@angular/core';
import { InstanceService } from '../../../services/instance.service';
import { CategoryMockService, CategoryApiService } from './index';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../../../environments/environment.prod';
import { data } from '../filterList.mock';
import { FilterListData } from '../filterEntries';

@Injectable()
export class CategoryService {
  categoryListService: ICategoryService;

  /**
   * decides the service to be used as per environment variable
   * @param  {InstanceService} privateinstanceService
   */
  constructor(private instanceService: InstanceService) {
    this.categoryListService = this.instanceService.getInstance((environment.needMock) ?
      CategoryMockService : CategoryApiService);
  }

  /**
   * @returns List of categories as an Observable
   */
  getSideFilters(): Observable<FilterListData> {
    return Observable.of(data);
  }
}


export interface ICategoryService {
  getSideFilters(): Observable<any>;
}