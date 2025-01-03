import { GetAllProducts } from './../../../../models/interfaces/products/response/GetAllProducts';
import { CategoriesService } from './../../../../services/categories/categories.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

import { Subject, takeUntil } from 'rxjs';
import { ProductEvent } from 'src/app/models/enums/products/ProductEvent';
import { GetCategoriesResponse } from 'src/app/models/interfaces/categories/response/GetCategoriesResponse';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
import { CreateProductsRequest } from 'src/app/models/interfaces/products/request/createProductsRequest';
import { EditProductRequest } from 'src/app/models/interfaces/products/request/editProductRequest';
import { ProductsService } from 'src/app/services/products/products.service';
import { ProductsDataService } from 'src/app/shared/services/products/products-data.service';

@Component({
  selector: 'app-products-form',
  templateUrl: './products-form.component.html',
  styleUrls: []
})
export class ProductsFormComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  public categoriesData: Array<GetCategoriesResponse> = [];

  public selectedCategory: Array<{name: string, code: string}> = [];

  public productAction!: {
    event: EventAction,
    productsData: Array<GetAllProducts>}

  public productSelectedData!: GetAllProducts;

  public productsDatas: Array<GetAllProducts> = [];

  public addProductForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: ['', Validators.required],
    category_id: ['', Validators.required],
    amount: [0, Validators.required],
  })

  public editProductForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: ['', Validators.required],
    amount: [0, Validators.required],
  })

  public addProductAction = ProductEvent.ADD_PRODUCT_EVENT;
  public editProductAction = ProductEvent.EDIT_PRODUCT_EVENT;
  public saleProductAction = ProductEvent.SALE_PRODUCT_EVENT;

  constructor(
    private categoriesService: CategoriesService,
    private productsService: ProductsService,
    private productDtService: ProductsDataService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private ref: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.productAction = this.ref.data;
    if (this.productAction?.event.action === this.editProductAction &&
       this.productAction?.productsData) {
      this.getProductSelectedData(this.productAction?.event?.id as string);
    }
    this.productAction?.event.action === this.saleProductAction && this.getAllCategories();
  }

  getAllCategories(): void {
    this.categoriesService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.categoriesData = response;
          }
        }
      })
  }

  handleSubmitAddProduct(): void {
    if (this.addProductForm?.value && this.addProductForm?.valid) {
      const requestCreateProduct: CreateProductsRequest = {
        name: this.addProductForm?.value.name as string,
        amount: Number(this.addProductForm?.value.amount),
        price: this.addProductForm?.value.price as string,
        category_id: this.addProductForm?.value.category_id as string,
        description: this.addProductForm?.value.description as string,
      }
      this.productsService.createProduct(requestCreateProduct)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              this.messageService.add({
                severity:'success',
                summary: 'Success',
                detail: 'Produto criado com sucesso!',
                life: 3000
              });
              this.router.navigate(['/products']);
            }
          }, error: (error) => {
            console.log(error);
            this.messageService.add({
              severity:'error',
              summary: 'Error',
              detail: 'Erro ao criar produto!',
              life: 3000
            });
          }
        })
      }
      this.addProductForm.reset();

  }

  handleSubmitEditProduct(): void {
    if (this.editProductForm.value && this.editProductForm.valid && this.productAction.event.id) {
      const requestEditProduct: EditProductRequest = {
        name: this.editProductForm.value.name as string,
        amount: Number(this.editProductForm.value.amount),
        price: this.editProductForm.value.price as string,
        description: this.editProductForm.value.description as string,
        product_id: this.productAction.event.id as string
      }
      this.productsService.editProduct(requestEditProduct)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity:'success',
              summary: 'Success',
              detail: 'Produto editado com sucesso!',
              life: 3000
            });
            this.editProductForm.reset();
          }, error: (error) => {
            console.log(error);
            this.messageService.add({
              severity:'error',
              summary: 'Error',
              detail: 'Erro ao editar produto!',
              life: 3000
            });
            this.editProductForm.reset();
          }
        })
    }
  }

  getProductSelectedData(productId: string): void {
    const AllProducts = this.productAction?.productsData;
    if (AllProducts.length > 0) {
      const productFiltered = AllProducts.filter((element) => element?.id === productId);
      if (productFiltered) {
        this.productSelectedData = productFiltered[0];
        this.editProductForm.setValue({
          name: this.productSelectedData?.name,
          description: this.productSelectedData?.description,
          price: this.productSelectedData?.price,
          amount: this.productSelectedData?.amount
        })
      }
    }
  }

  getProductDatas(): void {
    this.productsService
      .getAllProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.productsDatas = response;
            this.productsDatas && this.productDtService.setProductData(this.productsDatas);
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
