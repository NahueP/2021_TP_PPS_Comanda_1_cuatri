import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';
import { Usuario } from '../clases/Usuario/usuario';
import { AuthService } from '../servicios/auth/auth.service';
import { UsuarioService } from '../servicios/usuario/usuario.service';
import { Eperfil } from '../enumerados/Eperfil/eperfil';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import {take} from 'rxjs/operators'

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public unUsuario: any = {};
  public userValid: boolean = true;
  notfound: number = 0;
  userForm: FormGroup;
  private isEmail = /\S+@\S+\.\S+/;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authServicie: AuthService,
    private servicioUsuario: UsuarioService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController

  ) {
    //this.unUsuario = new Usuario();
  }
  ngOnInit(): void {
    this.initForm();
  }
  async onLogin() {
    this.unUsuario = new Usuario();
    this.unUsuario.correo = this.userForm.value.email;
    this.unUsuario.clave = this.userForm.value.password;
    console.log('estoy en login');

    let loading = this.presentLoading()

    this.authServicie.Login(this.unUsuario.correo, this.unUsuario.clave).then((response:any) => {

      this.servicioUsuario.TraerUno(this.unUsuario.correo).valueChanges().pipe(take(1)).subscribe((data)=> {

        let datosUsuario: any = data;
        let usuarioLogin: any = {};

        if(data.length != 0)
        {
          usuarioLogin.correo = this.unUsuario.correo;
          usuarioLogin.clave = this.unUsuario.clave;
          usuarioLogin.perfil = datosUsuario[0].perfil;
          usuarioLogin.nombre = datosUsuario[0].nombre;
          usuarioLogin.habilitado = datosUsuario[0].habilitado;
        }
        else
        {
          response.user.delete();
          this.Toast('danger','Su solicitud fue rechazada por un supervisor',2000);
        }
        
        

        localStorage.setItem('usuarioLogeado', JSON.stringify(usuarioLogin));
        console.log(usuarioLogin);
        

        switch (usuarioLogin.perfil) {
          case Eperfil.Dueño:
            this.router.navigateByUrl('/habilitar-cliente');
            console.log(usuarioLogin.perfil);
            this.Reproducir('assets/mp3/correcto.mp3');
            break;
          case Eperfil.Supervisor:
            this.router.navigateByUrl('/habilitar-cliente');
            console.log(usuarioLogin.perfil);
            this.Reproducir('assets/mp3/correcto.mp3');
            break;
          case Eperfil.Anonimo:
            this.router.navigateByUrl('/home-anonimo');
            console.log(usuarioLogin.perfil);
            this.Reproducir('assets/mp3/correcto.mp3');
            break;
          case Eperfil.Metre:
            this.router.navigateByUrl('/home-metre');
            console.log(usuarioLogin.perfil);
            this.Reproducir('assets/mp3/correcto.mp3');
            break;
          case Eperfil.Cliente:
            if(usuarioLogin.habilitado)
            {
              this.router.navigateByUrl('/home-cliente');
              this.Reproducir('assets/mp3/correcto.mp3');
            }
            else
            {
              this.Toast('warning','Aún no fue habilitado por un supervisor',2000);
            }
            
            console.log(usuarioLogin.perfil);
            break;
          case Eperfil.Cocinero:
            this.router.navigateByUrl('/pedidos-cocinero');
            console.log(usuarioLogin.perfil);
            this.Reproducir('assets/mp3/correcto.mp3');
            break;
          case Eperfil.BarTender:
            this.router.navigateByUrl('/pedidos-bartender');
            this.Reproducir('assets/mp3/correcto.mp3');
            break;
          case Eperfil.Mozo:
            this.router.navigateByUrl('home-mesero');
            this.Reproducir('assets/mp3/correcto.mp3');
            console.log(usuarioLogin.perfil);
            break;
          
          

        }

        
      });
    }).catch(async () => {
      (await loading).onDidDismiss().then(() => {
        this.presentAlert('Usuario y/o contraseña incorrecta');///
      })
    });

  }

  public Reproducir (pathSonido:string) {
    
    
    let audio = new Audio();
    console.log(pathSonido);
    audio.src = pathSonido;
    
    audio.load();
    audio.play();
    
  }

  public Login(_correo, _password) {
    this.userForm.setValue({ email: _correo, password: _password });
  }

  irRegistro() {
    this.router.navigateByUrl("alta-cliente");
  }



  isValidField(field: string): string {
    const validateField = this.userForm.get(field);
    return !validateField.valid && validateField.touched
      ? 'is-invalid'
      : validateField.touched
        ? 'is-valid'
        : '';
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.isEmail)]],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });
  }


  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'loading',
      message: 'Espere un momento',
      duration: 2000
    });
    await loading.present();

    return loading;
  }

  async presentAlert(mensaje: string) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Error',
      message: mensaje,
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();


  }

  async Toast(color: string, mensaje: string, duration: number = 2000) {
		const toast = await this.toastController.create({
			message: mensaje,
			duration: duration,
			color: color,
			position: 'top'

		});
		toast.present();
	}

}
