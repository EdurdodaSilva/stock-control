import { Injectable } from '@angular/core';
import { BehaviorSubject, map, take } from 'rxjs';
import { GetAllProducts } from 'src/app/models/interfaces/products/response/GetAllProducts';

@Injectable({
  providedIn: 'root'
})
export class ProductsDataService {
  public productDataEmitters$ = new BehaviorSubject<Array<GetAllProducts> | null>(null);
  public productData: Array<GetAllProducts> = [];

  setProductData(products: Array<GetAllProducts>): void {
    if (products) {
      this.productDataEmitters$.next(products);
      this.getProductsData();
    }
  }
  getProductsData() {
    this.productDataEmitters$.pipe(
      take(1),
      map((data) => data?.filter((product) => product.amount > 0))
    )
    .subscribe({
      next: (response) => {
        if (response) {
          this.productData = response;
        }
      }
    });
    return this.productData;
  }
}
