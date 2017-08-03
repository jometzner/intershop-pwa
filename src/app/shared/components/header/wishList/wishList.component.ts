import { Component, OnInit } from '@angular/core';
import { DataEmitterService } from '../../../services/dataEmitter.service';

@Component({
  selector: 'is-wishlist',
  templateUrl: './wishList.component.html'
})
export class WishListComponent implements OnInit {
  wishListItems = [];
  itemCount = 0;

  constructor(private _dataEmitterService: DataEmitterService) {
  }

  ngOnInit() {
    this._dataEmitterService.wishListEmitter.subscribe(data => {
      this.itemCount = 0;
      this.wishListItems.push(data);
      this.wishListItems.forEach(item => {
        this.itemCount = this.itemCount + 1;
      });
    });
  }
};

