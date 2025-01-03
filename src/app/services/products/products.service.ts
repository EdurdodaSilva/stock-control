import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { map, Observable } from 'rxjs';
import { CreateProductsRequest } from 'src/app/models/interfaces/products/request/createProductsRequest';
import { EditProductRequest } from 'src/app/models/interfaces/products/request/editProductRequest';
import { CreateProductsResponse } from 'src/app/models/interfaces/products/response/createProductResponse';
import { DeleteProductResponse } from 'src/app/models/interfaces/products/response/DeleteProductResponse';
import { GetAllProducts } from 'src/app/models/interfaces/products/response/GetAllProducts';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private API_URL = environment.API_URL;
  private JWT_TOKEN = this.cookie.get('token');
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.JWT_TOKEN}`
    })
  }

  constructor(
    private http: HttpClient,
    private cookie: CookieService
  ) { }

  getAllProducts(): Observable<Array<GetAllProducts>> {
    return this.http.get<Array<GetAllProducts>>(`${this.API_URL}/products`, this.httpOptions)
    .pipe(map((product) => product.filter((data) => data?.amount > 0)));
  }

  deleteProduct(product_id: string): Observable<DeleteProductResponse> {
    return this.http.delete<DeleteProductResponse>(`${this.API_URL}/product/delete`, {
      ...this.httpOptions, params: {
         product_id: product_id }
    });
  }

  createProduct(requestData: CreateProductsRequest): Observable<CreateProductsResponse> {
    return this.http.post<CreateProductsResponse>(`${this.API_URL}/product`, requestData, this.httpOptions);
  }

  editProduct(requestData: EditProductRequest): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/product/edit`, requestData, this.httpOptions);
  }
}
