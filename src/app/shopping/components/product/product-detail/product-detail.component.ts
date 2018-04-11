import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Product } from '../../../../models/product/product.model';

@Component({
  selector: 'ish-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements OnInit {
  @Input() product: Product;
  @Output() productToCart = new EventEmitter<{ sku: string; quantity: number }>();
  @Output() productToCompare = new EventEmitter<string>();

  productDetailForm: FormGroup;
  readonly quantityControlName = 'quantity';

  ngOnInit() {
    this.productDetailForm = new FormGroup({
      [this.quantityControlName]: new FormControl(this.product.minOrderQuantity),
    });
  }

  addToCart() {
    this.productToCart.emit({
      sku: this.product.sku,
      quantity: this.productDetailForm.get(this.quantityControlName).value,
    });
  }

  addToCompare() {
    this.productToCompare.emit(this.product.sku);
  }
}
