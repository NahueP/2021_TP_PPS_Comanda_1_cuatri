import { Component, OnInit} from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Encuesta } from 'src/app/clases/Encuesta/encuesta';
import { Usuario } from 'src/app/clases/Usuario/usuario';
import { EncuestaService } from 'src/app/servicios/encuesta/encuesta.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { take } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import firebase from 'firebase/app';
import { Router } from '@angular/router';

@Component({
  selector: 'app-encuesta-cliente',
  templateUrl: './encuesta-cliente.page.html',
  styleUrls: ['./encuesta-cliente.page.scss'],
})
export class EncuestaClientePage implements OnInit {


  resenia : string = "";
  fecha : Date = new Date();
  encuesta : Encuesta = new Encuesta();
  usuario : Usuario = new Usuario();
 
  fotos : any[];

  public form: FormGroup = this.formBuilder.group({
		rango: [null, Validators.required],
		radio: [null, Validators.required],
    select: [null, Validators.required],
    checkComidas: [false],
    checkPostres: [false],
    checkTragos: [false],
    resenia: [''],
    fotos: [null],
		
		});

	

  

  constructor(private formBuilder: FormBuilder, private toastController: ToastController,private storage: AngularFireStorage ,private encuestSvc : EncuestaService, private router:Router) { }

  ngOnInit() {
    
    let user = JSON.parse(localStorage.getItem('usuarioLogeado'));
    
    this.usuario.nombre = user.nombre;
    this.usuario.correo = user.correo;

  }

  onUpload($e)
  {
    this.fotos = [];
    if($e.target.files.length < 4)
    {
      for(let i = 0; i < $e.target.files.length; i++)
      {
        this.fotos[i] = $e.target.files[i];
      }
    }
    else
    {
      
      setTimeout(() => {
        this.form.controls.fotos.reset();
      }, 50); 
 
      this.Toast('warning','No se pueden cargar más de 3 imagenes!', 2000 , "bottom");
    }
      
  }

  

 

  enviarEncuesta()
  {
    
    const check = {
      comidas: this.form.get('checkComidas').value,
      postres: this.form.get('checkPostres').value,
      tragos:  this.form.get('checkTragos').value,
    };

      this.encuesta.nombre = this.usuario.nombre;
      this.encuesta.email = this.usuario.correo;
      this.encuesta.pregunta1 = this.form.get('rango').value;
      this.encuesta.pregunta2 = this.form.get('select').value;
      this.encuesta.pregunta3 = this.form.get('radio').value;
      this.encuesta.pregunta4 = check; 
      this.encuesta.resenia = this.form.get('resenia').value;
      this.encuesta.fecha = this.fecha.toLocaleDateString();

      

    if(this.encuesta.pregunta1 != null && this.encuesta.pregunta2 != null && this.encuesta.pregunta3!=null)
    {

      let existe : boolean = false;

      this.encuestSvc.TraerTodos().snapshotChanges().pipe(take(1)).subscribe(list=>{
        list.forEach(response=>{

          let element = response.payload.doc.data();
          element.id = response.payload.doc.id;

          if(element.email == this.usuario.correo && element.fecha == this.encuesta.fecha)
          {
            existe = true;
            this.Toast('warning','Su encuesta ya fue cargada (1 por dia)');
          }
        })
        if(!existe)
        {
           if(this.fotos)
           {
             for(let i = 0; i < this.fotos.length ; i++)
             {
              let date : Date = new Date();
              let dia = date.getDate();
              let mes = date.getMonth()+1;
              let anio = date.getFullYear();
              let fecha = dia + "-" + mes + "-" + anio;

              const filePath = `/encuestas/${this.encuesta.email}/${fecha}/foto${i+1}`;
              const ref = this.storage.ref(filePath);
              const taks = this.storage.upload(filePath, this.fotos[i]).then(()=>{
  
                let storages = firebase.storage();
                let storageRef = storages.ref();
                let spaceRef = storageRef.child(filePath);

                spaceRef.getDownloadURL().then(url=>{
             
                  this.encuesta.fotos.push(url);
                  
                    if(this.encuesta.fotos.length == this.fotos.length)
                    {
                    
                        this.encuestSvc.AgregarEncuesta(JSON.parse(JSON.stringify(this.encuesta)));
                        
                        this.Toast('success','Gracias por enviar su encuesta!');
                        this.form.reset();
                        this.router.navigateByUrl('menu-espera-cliente');
                    }
                
                });

              });
              
              this.encuesta.fotos.splice(0,this.encuesta.fotos.length);
             }
           }
           else
           {
              this.encuestSvc.AgregarEncuesta(JSON.parse(JSON.stringify(this.encuesta)));
                        
              this.Toast('success','Gracias por enviar su encuesta!');
              this.form.reset();
              this.router.navigateByUrl('menu-espera-cliente');
              
           }

        }
      })

    }
    else
    {
      this.Toast('warning', 'Debe completar la encuesta para poder enviarla!');
    }
  }


  async Toast(color: string, mensaje: string, duration: number = 2000, position:any = "top") {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duration,
      color: color,
      position: position

    });
    toast.present();
  }

}

