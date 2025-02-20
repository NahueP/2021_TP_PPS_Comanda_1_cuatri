import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { ActionSheetController, AlertController, ModalController, ToastController } from '@ionic/angular';
import { Pedido } from 'src/app/clases/pedido/pedido';
import { EestadoPedido } from 'src/app/enumerados/EestadoPedido/eestado-pedido';
import { MesaService } from 'src/app/servicios/mesa/mesa.service';
import { PedidosService } from 'src/app/servicios/pedidos/pedidos.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-pide-cuenta',
  templateUrl: './pide-cuenta.page.html',
  styleUrls: ['./pide-cuenta.page.scss'],
})
export class PideCuentaPage implements OnInit {

  listaMesas: any;
  listaPedidos: any;
  listadoProductos: any;
  usuarioLogeado: any;
  listaProductosFiltrados = [];
  mesaEncontrada: any;
  precioTotal = 0;
  propina = 0;
  satisfaccion = "";
  porcentaje = 0;
  constructor(
    private pedidoSvc: PedidosService,
    private modalController: ModalController,
    private alertController: AlertController,
    private mesaSvc: MesaService,
    private actionSheetController: ActionSheetController,
    private scanner: BarcodeScanner,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.usuarioLogeado = JSON.parse(localStorage.getItem('usuarioLogeado'));

    this.mesaSvc.TraerTodos().valueChanges().subscribe(mesas => {
      this.listaMesas = mesas;
      this.BuscarMesa();
    });
    this.pedidoSvc.TraerPedidosDeUnCliente(this.usuarioLogeado.correo).valueChanges().subscribe((data: Pedido[]) => {
      this.listaPedidos = data.filter((value) => {
        return value.estadoPedido == EestadoPedido.ConfirmarRecibido;
      });

      this.CrearListadoProductos();
    });
  }

  public ngOnDestroy() {
    
  }

  dismiss() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }

  CrearListadoProductos() {
    let flag = true;
    this.listaPedidos.forEach(pedido => {
      pedido.listaProductos.forEach(producto => {
        if (!this.BuscarEnLista(producto)) {
          this.listaProductosFiltrados.push(producto);
        }
      });
      if (flag) {
        this.listaProductosFiltrados = pedido.listaProductos;
        flag = false;
      }
    });
    this.CalcularPrecioTotal();
  }

  BuscarEnLista(producto) {
    let retorno = false;
    this.listaProductosFiltrados.forEach(prod => {
      if (prod.nombre == producto.nombre) {
        retorno = true;
        prod.cantidad += producto.cantidad;
      }
    });
    return retorno;
  }

  CalcularPrecioTotal() {
    this.precioTotal = 0;
    this.listaProductosFiltrados.forEach(prod => {
      this.precioTotal += prod.cantidad * prod.precio;
    });
    ///Restar los descuentos aca!
    //Ejemplo
    this.CalcularDescuentos();
  }

  AgregarPropina() {
    this.CalcularPrecioTotal();
    console.log(this.propina);
    this.precioTotal += parseInt(this.propina.toString());
  }

  Pagar() {
    let numMesa: any;
    this.listaPedidos.forEach(pedido => {
      pedido.estadoPedido = EestadoPedido.ClientePaga;
      numMesa = pedido.numMesa;
      this.pedidoSvc.ModificarUno(pedido);
    });
    this.ModificarMesa(numMesa);
    this.Confirmar("Pedido Pagado!", "Su pago fue enviado al Mozo, espere la confirmacion. Gracias!");
    // setTimeout(() => {
    //   localStorage.setItem('cerrarSesion', 'si');
    //   this.router.navigateByUrl('home-cliente');
    //   this.dismiss();
    //   this.ngOnDestroy();
    // }, 2000);
  }

  ModificarMesa(num: any) {
    this.listaMesas.forEach(mesa => {
      if (mesa.numero == num) {
        mesa.listaProductos = this.listaProductosFiltrados;
        mesa.pagado = true;
        mesa.precioPagado = this.precioTotal;
        mesa.propina = this.propina;
        ///Agregar descuento
        this.mesaSvc.ModificarUno(mesa);
      }
    });
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirmacion',
      message: 'Total: ' + this.precioTotal,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Pagar',
          handler: () => {
            this.Pagar();
          }
        }
      ]
    });
    await alert.present();
  }
  ///El mozo confirma el pedido y borra el pedido! Ez

  public async Confirmar(titulo: string, texto: string) {
    const sweetAlert = await Swal.fire({
      title: titulo,
      text: texto,
      icon: 'success'
    });

    if (sweetAlert.isConfirmed) {
      this.dismiss();
    }
  }

  BuscarMesa() {
    this.listaMesas.forEach(mesa => {
      if (mesa.cliente.correo == this.usuarioLogeado.correo) {
        this.mesaEncontrada = mesa;
      }
    });
  }

  CalcularDescuentos() {
    let flagDescuentoBebida = 0;
    let flagDescuentoPostre = 0;
    if (this.mesaEncontrada.gano1) {
      this.precioTotal -= this.precioTotal * 0.10;
    }

    if (this.mesaEncontrada.gano2) {
      this.listaProductosFiltrados.forEach(prod => {
        if (prod.tipo == "bebida" && flagDescuentoBebida == 0) {
          this.precioTotal -= prod.precio;
          flagDescuentoBebida = 1;
        }
      });
    }

    if (this.mesaEncontrada.gano3) {
      this.listaProductosFiltrados.forEach(prod => {
        if (prod.tipo == "postre" && flagDescuentoPostre == 0) {
          this.precioTotal -= prod.precio;
          flagDescuentoPostre = 1;
        }
      });
    }
  }

  async CargarOpciones() {

    const actionSheet = await this.actionSheetController.create({
      header: 'Que le parecio la atencion?',
      cssClass: 'menuMesas',
      buttons: [{
        text: 'Excelente',
        icon: 'caret-forward',
        handler: () => {
          this.CargarPropina('Excelente');
        }
      }, {
        text: 'Muy Bien',
        icon: 'caret-forward',
        handler: () => {
          this.CargarPropina('Muy Bien');
        }
      }, {
        text: 'Bien',
        icon: 'caret-forward',
        handler: () => {
          this.CargarPropina('Bien');
        }
      }, {
        text: 'Regular',
        icon: 'caret-forward',
        handler: () => {
          this.CargarPropina('Regular');
        }
      }, {
        text: 'Malo',
        icon: 'caret-forward',
        handler: () => {
          this.CargarPropina('Malo');
        }
      }]
    });
    await actionSheet.present();

    await actionSheet.onDidDismiss();
  }

  CargarPropina(opc){
    this.CalcularPrecioTotal();
    this.porcentaje = 0;
    this.propina = 0;
    if(opc == 'Excelente'){
      this.propina = this.precioTotal * 0.20;
      this.precioTotal += this.propina;
      this.porcentaje = 20;
    }
    else if(opc == 'Muy Bien'){
      this.propina = this.precioTotal * 0.15;
      this.precioTotal += this.propina;
      this.porcentaje = 15;
    }
    else if(opc == 'Bien'){
      this.propina = this.precioTotal * 0.10;
      this.precioTotal += this.propina;
      this.porcentaje = 10;
    }
    else if(opc == 'Regular'){
      this.propina = this.precioTotal * 0.05;
      this.precioTotal += this.propina;
      this.porcentaje = 5;
    }
    this.satisfaccion = opc;
  }

  ScanQR() {
    this.scanner.scan().then(data => {
      if(data["text"] == "satisfaccion"){
        this.CargarOpciones();
      }
      else{
        this.Toast("danger","QR no valido para esto!");
      }
    });
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

}
