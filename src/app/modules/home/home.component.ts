import { UserService } from './../../services/user/user.service';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { SignUpUserRequest } from 'src/app/models/interfaces/User/SignUpUserRequest';
import { AuthRequest } from 'src/app/services/user/auth/AuthRequest';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnDestroy{
  private destroy$ = new Subject<void>();
  loginCard = true;

  loginForm: FormGroup;
  signUpForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
      private UserService: UserService,
      private cookieService: CookieService,
      private messageService: MessageService,
      private router: Router
    ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.signUpForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  };

  onSubmitFormLogin() {
    if (this.loginForm.value && this.loginForm.valid) {
      this.UserService.authUser(this.loginForm.value as AuthRequest)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (response) {
            this.cookieService.set('token', response?.token);
            this.loginForm.reset();
            this.router.navigate(['/dashboard']);

            this.messageService.add({
              severity:'success',
              summary: 'Success',
              detail: `${response?.name} logado com sucesso`,
              life: 3000
            });
          }
        },
        error: (error) => {
          this.messageService.add({
            severity:'error',
            summary: 'Error',
            detail: 'Erro ao fazer login',
            life: 3000
          });
          console.log(error);
        }
      })
    }
  }
  onSubmitFormSignUp() {
    if (this.signUpForm.value && this.signUpForm.valid) {
      this.UserService.signUpUser(this.signUpForm.value as SignUpUserRequest)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (response) {
            this.signUpForm.reset();
            this.loginCard = true;
            this.messageService.add({
              severity:'success',
              summary: 'Success',
              detail: 'Usuário cadastrado com sucesso',
              life: 3000
            });
        }
        },
        error: (error) => {
          this.messageService.add({
            severity:'error',
            summary: 'Error',
            detail: 'Erro ao fazer cadastro',
            life: 3000
          });
          console.log(error);
        }
      })
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
