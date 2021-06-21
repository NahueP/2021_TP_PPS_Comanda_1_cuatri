import { EestadoPedido } from "src/app/enumerados/EestadoPedido/eestado-pedido";
import { Cliente } from "../Cliente/cliente";
import { Productos } from "../Productos/productos";

export class Pedido {
    public id:string;
    public listaProductos:Productos[];
    public cliente:Cliente;
    public estadoPedido:EestadoPedido;

}
