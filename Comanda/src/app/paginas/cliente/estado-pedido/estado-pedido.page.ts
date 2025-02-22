import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Pedido } from 'src/app/clases/pedido/pedido';
import { EestadoPedido } from 'src/app/enumerados/EestadoPedido/eestado-pedido';
import { Eperfil } from 'src/app/enumerados/Eperfil/eperfil';
import { PedidosService } from 'src/app/servicios/pedidos/pedidos.service';
import { ModalEstadoPedidoComponent } from '../modal-estado-pedido/modal-estado-pedido.component';

@Component({
  selector: 'app-estado-pedido',
  templateUrl: './estado-pedido.page.html',
  styleUrls: ['./estado-pedido.page.scss'],
})
export class EstadoPedidoPage implements OnInit {

  public listaPedidos:Pedido[]=[];
  public estadoPedido=EestadoPedido;
  public usuarioLogeado;

  public perfil=Eperfil;


  constructor(  
    private servicioPedido:PedidosService,
    private modalController:ModalController
) { }

  ngOnInit() {
    this.usuarioLogeado=JSON.parse(localStorage.getItem('usuarioLogeado'));
    this.CargarPedidos();
  }

  private CargarPedidos()
  {
    this.servicioPedido.TraerPedidosDeUnCliente(this.usuarioLogeado.correo).valueChanges().subscribe((data:Pedido[])=>{
        this.listaPedidos=data.filter((value,index,array)=>{
          return value.estadoPedido!=EestadoPedido.ConfirmarRecibido;
        });
    });
  }


  public async SeleccionarPedido(unPedido:Pedido)
  {
    
    const modal = await this.modalController.create({
      component: ModalEstadoPedidoComponent,
      componentProps: {
        'pedidoSeleccionado': unPedido,
      }
    });
    await modal.present();
  }

  

}
