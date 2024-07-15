// Zona Horaria
export const timeZone = "America/Cancun";
// Default Hora Prevista
export const defaultHoraPrevista = "18:00";
// Roles validaos
export const allowedRoles = [
  {
    value: "admin",
    label: "Administrador",
  },
  // {
  //   value: "gerente",
  //   label: "Gerente",
  // },
  {
    value: "coord",
    label: "Coordinador",
  },
  // {
  //   value: "pers",
  //   label: "Personal",
  // },
];

// Factura
export const showFactura = true;
// Mostrar Cuantos Puntos tiene el Cliente
export const showPuntosOnTicket = true;
// Tipo de Moneda
export const tipoMoneda = "MXN";
// Formato de la moneda (separacion de miles - decimales) segun la configuracion regional
export const confMoneda = "es-MX";
export const simboloMoneda = "$";
export const nameMoneda = "Pesos";
export const ingresoDigital = ["TRANSFERENCIA"];

export const politicaAbandono = {
  mResaltado: "El plazo máximo para retirar las prendas es de 20 días ",
  mGeneral: `después de entregada a la lavandería; vencido el plazo, se donará a instituciones de caridad. 
  No hay lugar al reclamo una vez retirada la prenda. No nos responsabilizamos por prendas que se destiñan, 
  por malos tintes, botones o adornos que no resistan al lavado o planchado, por las prendas que se deterioren 
  por estar demasiado usadas, tejidos y confecciones defectuosas.`,
};

export const documento = "INE"; // DNI

export const nameImpuesto = "IVA"; // IGV

export const codigoPhonePais = "52";

export const MONTOS_BASE = [
  { monto: 1000, cantidad: "", total: 0 },
  { monto: 500, cantidad: "", total: 0 },
  { monto: 200, cantidad: "", total: 0 },
  { monto: 100, cantidad: "", total: 0 },
  { monto: 50, cantidad: "", total: 0 },
  { monto: 20, cantidad: "", total: 0 },
  { monto: 10, cantidad: "", total: 0 },
  { monto: 5, cantidad: "", total: 0 },
  { monto: 2, cantidad: "", total: 0 },
  { monto: 1, cantidad: "", total: 0 },
  { monto: 0.5, cantidad: "", total: 0 },
  { monto: 0.2, cantidad: "", total: 0 },
  { monto: 0.1, cantidad: "", total: 0 },
];
