import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
<<<<<<< HEAD
import { ActionSheetController, ModalController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/servicios/auth/auth.service';
import { MesaService } from 'src/app/servicios/mesa/mesa.service';
import { MsgConsultaService } from 'src/app/servicios/msgConsulta/msg-consulta.service';
import { ChatMeseroPage } from '../chat-mesero/chat-mesero.page';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';


=======
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Pedido } from 'src/app/clases/pedido/pedido';
import { EestadoPedido } from 'src/app/enumerados/EestadoPedido/eestado-pedido';
import { AuthService } from 'src/app/servicios/auth/auth.service';
import { MesaService } from 'src/app/servicios/mesa/mesa.service';
import { PedidosService } from 'src/app/servicios/pedidos/pedidos.service';
import { ChatMeseroPage } from '../chat-mesero/chat-mesero.page';
import { ModalDetallesPedidosComponent } from '../modal-detalles-pedidos/modal-detalles-pedidos.component';
>>>>>>> 2c2884b74f3debf0c2179be6247589de65523a16

@Component({
  selector: 'app-home-mesero',
  templateUrl: './home-mesero.page.html',
  styleUrls: ['./home-mesero.page.scss'],
})
export class HomeMeseroPage implements OnInit {
  info = "Mostrar";

  //Mesas
  listadoMesasOrdenada : any;

<<<<<<< HEAD
  //MSG CHAT
  listadoChat : any;
  cantMsg = 0;
=======


>>>>>>> 2c2884b74f3debf0c2179be6247589de65523a16

  constructor(
    private actionSheetController : ActionSheetController,
    private mesaSvc : MesaService,
    private modalCtrl: ModalController,
    private auth : AuthService,
    private router : Router,
<<<<<<< HEAD
    private msgSvc : MsgConsultaService,
    private localNotifications: LocalNotifications,
    private toastController: ToastController
=======
  
>>>>>>> 2c2884b74f3debf0c2179be6247589de65523a16
  ) { }

  ngOnInit() {
    this.mesaSvc.TraerOrdenado().valueChanges().subscribe(mesa => {
      this.listadoMesasOrdenada = mesa;
    });

<<<<<<< HEAD
    this.msgSvc.TraerChat().valueChanges().subscribe( msg =>{
      this.listadoChat = msg;
      this.VerMensajesNuevos();
    });
=======
    
>>>>>>> 2c2884b74f3debf0c2179be6247589de65523a16
  }

  CerrarSesion(){
    localStorage.removeItem('usuarioLogeado');
    this.auth.LogOutCurrentUser();
    this.router.navigateByUrl('/login');
  }

 

  async ElegirMesa() {
    
    let mesas = this.GenerarMesas();

    const actionSheet = await this.actionSheetController.create(mesas);
    await actionSheet.present();

    const { role } = await actionSheet.onDidDismiss();
  }

  public GenerarMesas()
  {
    let menu:any={};

    menu.header='Mesas';
    menu.cssClass='menuMesas';
    
    let listaBotones:any[]=[];
    
    this.listadoMesasOrdenada.forEach(element => {
      
        let unBoton:any={};
        unBoton.text='Mesa '+ element.numero;
        unBoton.handler=()=>{
          this.modalChat(element.numero);
        };
        
        listaBotones.push(unBoton);
      });
      
      let botonCancelar:any={};
      
      botonCancelar.text='Cancelar';
      botonCancelar.role='cancel';
      botonCancelar.icon='close';
      botonCancelar.handler=()=>{
        console.log('Cancel clicked');
      }
      listaBotones.push(botonCancelar);
      menu.buttons=listaBotones;
      return menu;
  }

  async modalChat(numMesa:any) {
    const modal = await this.modalCtrl.create({
      component: ChatMeseroPage,
      cssClass: 'my-custom-class',
      componentProps: {
        'numMesa': numMesa
      }
    });
    modal.onDidDismiss().then((data) => {
      const info = data['data'];
      console.log(info);
    })

    return await modal.present();
  }

<<<<<<< HEAD
  VerMensajesNuevos(){
    this.cantMsg = 0;
    this.listadoChat.forEach(element => {
      if(element.estado == "EnviadoCliente"){
        this.cantMsg ++;
        //Lanzar notication
        this.LanzarNotificacion(element.mesa);
        //this.Toast("success","Aca se mandaria una notificacion!");
      }
    });
  }

  LanzarNotificacion(numMesa){
    this.localNotifications.schedule([{
      id: numMesa,
      title: 'El Mazacote',
      text: 'Le llego un mensaje de la mesa: ' + numMesa,
      sound: true ? 'file://sound.mp3': 'file://beep.caf',
      icon: '../../../assets/splash/center.png'
     }]);
  }

  async Toast(color: string, mensaje: string, duration: number = 2000) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duration,
      color: color,
      position: 'bottom'

    });
    toast.present();
  }
=======
  
>>>>>>> 2c2884b74f3debf0c2179be6247589de65523a16
}
