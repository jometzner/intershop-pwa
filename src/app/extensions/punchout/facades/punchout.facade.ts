import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';

import { selectRouteParam } from 'ish-core/store/core/router';
import { whenTruthy } from 'ish-core/utils/operators';

import { PunchoutType, PunchoutUser } from '../models/punchout-user/punchout-user.model';
import { transferPunchoutBasket } from '../store/punchout-functions';
import { getPunchoutTypes, getPunchoutTypesError, getPunchoutTypesLoading } from '../store/punchout-types';
import {
  addPunchoutUser,
  deletePunchoutUser,
  getPunchoutError,
  getPunchoutLoading,
  getPunchoutUsers,
  getSelectedPunchoutUser,
  updatePunchoutUser,
} from '../store/punchout-users';

// tslint:disable:member-ordering
@Injectable({ providedIn: 'root' })
export class PunchoutFacade {
  constructor(private store: Store) {}

  punchoutLoading$ = combineLatest([
    this.store.pipe(select(getPunchoutLoading)),
    this.store.pipe(select(getPunchoutTypesLoading)),
  ]).pipe(map(([loading, typesLoading]) => loading || typesLoading));

  punchoutError$ = this.store.pipe(select(getPunchoutError));
  punchoutTypesError$ = this.store.pipe(select(getPunchoutTypesError));

  supportedPunchoutTypes$ = this.store.pipe(select(getPunchoutTypes));

  selectedPunchoutType$ = combineLatest([
    this.store.pipe(select(selectRouteParam('format'))),
    this.store.pipe(select(getPunchoutTypes)),
  ]).pipe(
    filter(([format, types]) => !!format || types?.length > 0),
    map(([format, types]) => (format as PunchoutType) || types[0]),
    distinctUntilChanged()
  );

  punchoutUsersByRoute$() {
    return this.selectedPunchoutType$.pipe(
      whenTruthy(),
      switchMap(type => this.store.pipe(select(getPunchoutUsers(type))))
    );
  }

  selectedPunchoutUser$ = this.store.pipe(select(getSelectedPunchoutUser));

  addPunchoutUser(user: PunchoutUser) {
    this.store.dispatch(addPunchoutUser({ user }));
  }

  updatePunchoutUser(user: PunchoutUser) {
    this.store.dispatch(updatePunchoutUser({ user }));
  }

  deletePunchoutUser(user: PunchoutUser) {
    this.store.dispatch(deletePunchoutUser({ user }));
  }

  transferBasket() {
    this.store.dispatch(transferPunchoutBasket());
  }
}
