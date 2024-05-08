/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import styled from "styled-components";
import { ingresoDigital } from "../../../../../services/global";
import { DateFormat24h } from "../../../../../utils/functions";
import { Text } from "@mantine/core";
import { ReactComponent as Eliminar } from "../../../../../utils/img/OrdenServicio/eliminar.svg";
import "./listPagos.scss";
import { modals } from "@mantine/modals";
import { useDispatch, useSelector } from "react-redux";
import { DeleteGasto } from "../../../../../redux/actions/aGasto";
import { useState } from "react";

const InfoExtra = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "showDelete",
})`
  display: flex;
  justify-content: space-between;

  .mode-anulado {
    border-top: none;
    background: #ffd0d0;
    td {
      border: none !important;
      &:first-child {
        border-left: 2px solid #ea5b5b !important;
      }
      &:last-child {
        border-right: 2px solid #ea5b5b !important;
      }
    }
  }

  table {
    display: block;
    border-collapse: collapse;
    margin: 10px;

    &::-webkit-scrollbar {
      width: 0;
    }

    tr {
      position: relative;
      display: grid;
    }

    thead {
      tr {
        th {
          background: #5b81ea;
          color: #fff;
          font-weight: bold;
          padding: 10px;
          text-align: center;
          font-size: 18px;
        }
      }
    }

    tbody {
      tr {
        td {
          position: relative;
          padding: 10px 5px;
          text-align: center;
          font-size: 18px;
          vertical-align: top;
          display: flex;
          justify-content: center;
          align-items: center;
          border-right: none !important;
          //border-top: none !important;
        }
      }
    }
  }

  .tb-info {
    display: grid;
    grid-template-rows: 50px auto;
    span {
      margin: auto;
      font-weight: 800;
      font-size: 18px;
      color: #5161ce;
      letter-spacing: 3px;
      border: solid 1px #5161ce;
      padding: 10px;
      padding-bottom: 7px;
    }
  }
  .paid-orders-tarj {
    table {
      tr {
        grid-template-columns: 80px 140px 280px 150px;
      }
      thead {
        tr {
          th {
            background: #007bff;
            color: #fff;
          }
        }
      }
      tbody {
        tr {
          td {
            border: 1px solid #007bff;
            &:last-child {
              border-right: 2px solid #007bff !important;
            }
            &:first-child {
              border-left: 2px solid #007bff !important;
            }
          }
          &:last-child {
            border-bottom: 2px solid #007bff !important;
          }
        }
      }
    }
  }

  .paid-orders-tranf {
    table {
      tr {
        grid-template-columns: 80px 140px 280px 150px;
      }
      thead {
        tr {
          th {
            background: #7a43c9;
            color: #fff;
          }
        }
      }
      tbody {
        tr {
          td {
            border: 1px solid #7a43c9;
            &:last-child {
              border-right: 2px solid #7a43c9 !important;
            }
            &:first-child {
              border-left: 2px solid #7a43c9 !important;
            }
          }
          &:last-child {
            border-bottom: 2px solid #7a43c9 !important;
          }
        }
      }
    }
  }
  .paid-orders-efectivo {
    table {
      tr {
        grid-template-columns: 80px 140px 250px 150px;
      }
      thead {
        tr {
          th {
            background: #3faf84;
            color: #fff;
          }
        }
      }
      tbody {
        tr {
          td {
            border: 1px solid #3faf84;
            &:last-child {
              border-right: 2px solid #3faf84 !important;
            }
            &:first-child {
              border-left: 2px solid #3faf84 !important;
            }
          }
          &:last-child {
            border-bottom: 2px solid #3faf84 !important;
          }
        }
      }
    }
  }
  .daily-expenses {
    table {
      tr {
        grid-template-columns: ${({ showDelete }) =>
          showDelete === "y"
            ? "200px 300px 80px 100px 50px"
            : "200px 300px 80px 100px"};
      }
      thead {
        tr {
          th {
            background: #ea5b5b;
          }
        }
      }

      tbody {
        tr {
          td {
            border: 1px solid #ea5b5b;
            &:last-child {
              border-right: 2px solid #ea5b5b !important;
            }
          }
          &:last-child {
            border-bottom: 2px solid #ea5b5b !important;
          }
        }
      }
    }
  }
`;

const ListPagos = ({
  type,
  iGastos,
  iClienteEfectivo,
  iClienteTarjeta,
  iClienteTransferencia,
  savedActivated,
}) => {
  const dispatch = useDispatch();
  const InfoUsuario = useSelector((state) => state.user.infoUsuario);
  const [showDelete, setShowDelete] = useState("n");

  const handleNoPagar = (id) => {
    modals.openConfirmModal({
      title: "Elimiancion de Gasto",
      centered: true,
      children: <Text size="sm">¿Estás seguro de Eliminar este Gasto?</Text>,
      labels: { confirm: "Si", cancel: "No" },
      confirmProps: { color: "red" },
      onCancel: () => console.log("eliminacion de Gasto cancelado"),
      onConfirm: () => {
        dispatch(DeleteGasto({ id, rol: InfoUsuario.rol }));
      },
    });
  };

  useEffect(() => {
    setShowDelete(!savedActivated && type !== "view" ? "y" : "n");
  }, [savedActivated, type]);

  return (
    <InfoExtra showDelete={showDelete}>
      <div className="efectivo tb-info">
        <span>EFECTIVO</span>
        {iClienteEfectivo ? (
          <div className="paid-orders-efectivo">
            <table>
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Modalidad</th>
                  <th>Nombre</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {iClienteEfectivo
                  .sort((a, b) => parseInt(a.orden) - parseInt(b.orden))
                  .map((cliente, index) => (
                    <tr key={index}>
                      <td>{cliente.orden}</td>
                      <td>{cliente.Modalidad}</td>
                      <td>{cliente.nombre}</td>
                      <td>{cliente.total}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
      <div>
        <div className="gastos tb-info">
          <span>GASTOS</span>
          {iGastos ? (
            <div className="daily-expenses">
              <table>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Motivo</th>
                    <th>Hora</th>
                    <th>Monto</th>
                    {savedActivated === false && type !== "view" ? (
                      <th></th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {iGastos.map((gasto, index) => (
                    <tr className="fila" key={index}>
                      <td>{gasto.tipo}</td>
                      <td>{gasto.motivo}</td>
                      <td>{DateFormat24h(gasto.date.hora)}</td>
                      <td>{gasto.monto}</td>

                      {savedActivated === false && type !== "view" ? (
                        <td
                          className="delete-row"
                          onClick={() => {
                            handleNoPagar(gasto._id);
                          }}
                        >
                          <Eliminar className="ic-d" />
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
        <div className="transferencia tb-info">
          <span>{ingresoDigital}</span>
          {iClienteTransferencia ? (
            <div className="paid-orders-tranf">
              <table>
                <thead>
                  <tr>
                    <th>Codigo</th>
                    <th>Modalidad</th>
                    <th>Nombre</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {iClienteTransferencia
                    .sort((a, b) => parseInt(a.orden) - parseInt(b.orden))
                    .map((cliente, index) => (
                      <tr key={index}>
                        <td>{cliente.orden}</td>
                        <td>{cliente.Modalidad}</td>
                        <td>{cliente.nombre}</td>
                        <td>{cliente.total}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
        <div className="tarjeta tb-info">
          <span>TARJETA</span>
          {iClienteTarjeta ? (
            <div className="paid-orders-tarj">
              <table>
                <thead>
                  <tr>
                    <th>Codigo</th>
                    <th>Modalidad</th>
                    <th>Nombre</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {iClienteTarjeta
                    .sort((a, b) => parseInt(a.orden) - parseInt(b.orden))
                    .map((cliente, index) => (
                      <tr
                        key={index}
                        className={`${
                          cliente.estadoPrenda === "anulado"
                            ? "mode-anulado"
                            : null
                        }`}
                      >
                        <td>{cliente.orden}</td>
                        <td>{cliente.Modalidad}</td>
                        <td>{cliente.nombre}</td>
                        <td>{cliente.total}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </InfoExtra>
  );
};

export default ListPagos;
