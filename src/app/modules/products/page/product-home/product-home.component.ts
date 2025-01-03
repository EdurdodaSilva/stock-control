import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
import { GetAllProducts } from 'src/app/models/interfaces/products/response/GetAllProducts';
import { ProductsService } from 'src/app/services/products/products.service';
import { ProductsDataService } from 'src/app/shared/services/products/products-data.service';
import { ProductsFormComponent } from '../../components/products-form/products-form.component';


@Component({
  selector: 'app-product-home',
  templateUrl: './product-home.component.html',
  styleUrls: [],

})
export class ProductHomeComponent implements OnInit, OnDestroy{
  private readonly destroy$ = new Subject<void>();
  private ref!: DynamicDialogRef;
  public productsData: Array<GetAllProducts> = [];

  constructor(
    private productsService: ProductsService,
    private productsDtService: ProductsDataService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private dialogSevice: DialogService

  ) { }

  ngOnInit(): void {
    this.getProductsServiceData();
  }

  getProductsServiceData() {
    const productsLoaded = this.productsDtService.getProductsData();
    if (productsLoaded.length > 0) {
      this.productsData = productsLoaded;
    } else this.getAPIProductsData()

    console.log('Products Data', this.productsData);

  }

  hangleProductAction(event: EventAction): void {
    if (event) {
      this.ref = this.dialogSevice.open(ProductsFormComponent, {
        header: event?.action,
        width: '70%',
        contentStyle: {"overflow": "auto"},
        baseZIndex: 10000,
        maximizable: true,
        data: {
          event: event,
          productsData: this.productsData
        }
      });
      this.ref.onClose.pipe(takeUntil(this.destroy$)).subscribe({
        next: () => this.getAPIProductsData(),
      })
    }
  }

  getAPIProductsData() {
    this.productsService.getAllProducts().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response.length > 0) {
          this.productsData = response;
        }
      }, error: (error) => {
        console.log('Error getting products', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Erro ao carregar o produto',
          life: 3000
        });
        this.router.navigate(['/dashboard']);
      }
    })
  }

  handleProductAction(event: EventAction): void {}

  handleDeleteProductAction(event: {
    product_id: string;
    productName: string;
  }): void {
    if (event) {
      this.confirmationService.confirm({
        message: `Tem certeza que deseja excluir o produto ${event.productName}?`,
        header: 'Confirmação de Exclusão',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sim',
        rejectLabel: 'Não',
        accept: () => this.deleteProduct(event.product_id),
      })
    }
  }
  deleteProduct(product_id: string) {
    if (product_id) {
      this.productsService.deleteProduct(product_id).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          if (response) {
            this.getAPIProductsData();
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Produto excluído com sucesso',
              life: 3000
            });
          }
        }, error: (error) => {
          console.log('Error deleting product', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Erro ao excluir o produto',
            life: 3000
          });
        }
      })
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
