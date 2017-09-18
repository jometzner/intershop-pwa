import { Component, OnInit } from '@angular/core';
import { WishListModel, WishListItem } from '../../services/wishlists/wishlists.model';
import { GlobalState } from '../../services';

@Component({
  templateUrl: './wishlists-page.component.html'
})

export class WishListPageComponent implements OnInit {

  wishList: WishListItem[] = [];
  /**
   * Constructor
   */
  constructor(private globalState: GlobalState) { }

  private updateWishList = (wishListData: WishListModel) => {
    this.wishList = (wishListData) ? wishListData.items : [];
  }

  ngOnInit() {
    this.globalState.subscribe('wishListStatus', this.updateWishList);
    this.globalState.subscribeCachedData('wishListStatus', this.updateWishList);
  }
}