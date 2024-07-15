/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { Button, Select, Table, TextInput } from "@mantine/core";
import * as Yup from "yup";
import { Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import "./usuarios.scss";
import { ReactComponent as Eliminar } from "../../../../../utils/img/OrdenServicio/eliminar.svg";
import { useDispatch, useSelector } from "react-redux";
import { resetUser } from "../../../../../redux/states/user";
import LoaderSpiner from "../../../../../components/LoaderSpinner/LoaderSpiner";
import { socket } from "../../../../../utils/socket/connect";
import { Roles } from "../../../../../models";
import axios from "axios";
import { Notify } from "../../../../../utils/notify/Notify";
import { allowedRoles } from "../../../../../services/global";

const baseState = {
  _id: "",
  name: "",
  phone: "",
  email: "",
  rol: "",
  usuario: "",
  password: "",
};

const Usuarios = () => {
  const dispatch = useDispatch();
  const InfoUsuario = useSelector((store) => store.user.infoUsuario);
  const [onEdit, setOnEdit] = useState(false);
  const [onLoading, setOnLoading] = useState(false);
  const [ListUsuarios, setListUsuarios] = useState([]);
  const [warningDuplicated, setWarningDuplicated] = useState([]);
  const [initialValues, setInitialValues] = useState(baseState);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Campo obligatorio"),
    phone: Yup.string().required("Campo obligatorio"),
    email: Yup.string()
      .required("Campo obligatorio")
      .email("Debe ser un correo electrónico válido"),
    rol: Yup.string().required("Campo obligatorio"),
    usuario: Yup.string().required("Campo obligatorio"),
    password: onEdit
      ? ""
      : Yup.string()
          .required("Campo obligatorio")
          .matches(
            /^[a-zA-Z0-9]{5,}$/,
            "Debe contener al menos 5 caracteres (solo letras y números)"
          ),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      validProcess(values);
    },
  });

  // Valid Editar o Registrar
  const validProcess = (data) => {
    let confirmationEnabled = true;

    modals.openConfirmModal({
      title: `${onEdit ? "Actualizacion de Usuario" : "Registro de Usuario"}`,
      centered: true,
      children: (
        <Text size="sm">
          {onEdit
            ? "¿ Estas seguro de EDITAR este USUARIO ?"
            : "¿ Estas seguro de AGREGAR este nuevo USUARIO ?"}
        </Text>
      ),
      labels: { confirm: "Si", cancel: "No" },
      confirmProps: { color: "green" },
      onCancel: () => console.log("Cancelado"),
      onConfirm: () => {
        if (confirmationEnabled) {
          confirmationEnabled = false;
          setOnLoading(true);
          if (onEdit === true) {
            handleEditUser({ ...data, estado: "update" });
          } else {
            handleRegisterUser({ ...data, estado: "new" });
          }
        }
      },
    });
  };

  const validDeleteUsuario = (id) => {
    let confirmationEnabled = true;

    modals.openConfirmModal({
      title: "Eliminar Usuario",
      centered: true,
      children: (
        <Text size="sm">¿ Estas seguro de eliminar este usuario ?</Text>
      ),
      labels: { confirm: "Si", cancel: "No" },
      confirmProps: { color: "red" },
      onCancel: () => console.log("Cancelado"),
      onConfirm: async () => {
        if (confirmationEnabled) {
          confirmationEnabled = false;
          const userIdDeleted = await handleDeleteUser(id);
          const newInfo = ListUsuarios.filter(
            (user) => user._id !== userIdDeleted
          );
          setListUsuarios(newInfo);
        }
      },
    });
  };

  const validIco = (mensaje) => {
    return (
      <div className="ico-req">
        <i className="fa-solid fa-circle-exclamation ">
          <div className="info-req" style={{ pointerEvents: "none" }}>
            <span>{mensaje}</span>
          </div>
        </i>
      </div>
    );
  };

  const validEnabledAccion = (user, action) => {
    let estado;
    if (action === "update") {
      if (InfoUsuario.rol === "admin" && user._id === InfoUsuario._id) {
        estado = true;
      } else if (user._id !== InfoUsuario._id && user.rol === "admin") {
        estado = false;
      } else {
        estado = true;
      }
    } else {
      if (InfoUsuario.rol === "admin") {
        if (InfoUsuario.rol === "admin" && user._id === InfoUsuario._id) {
          estado = false;
        } else if (user._id !== InfoUsuario._id && user.rol === "admin") {
          estado = false;
        } else {
          estado = true;
        }
      } else {
        estado = false;
      }
    }

    return estado;
  };

  const isRoleDisabled = (role) => {
    let estado;
    if (role === "admin") {
      estado = true;
    }
    if (role === "gerente") {
      estado = InfoUsuario.rol === Roles.ADMIN ? false : true;
    }
    if (role === "coord") {
      estado =
        InfoUsuario.rol === Roles.ADMIN || InfoUsuario.rol === Roles.GERENTE
          ? false
          : true;
    }
    if (role === "pers") {
      estado = false;
    }
  };

  const handleGetListUser = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-list-users`
      );

      setListUsuarios(response.data);
    } catch (error) {
      console.log(error.response.data.mensaje);
      Notify("Error", "No se pudieron obtener los datos del usuario", "fail");
    }
  };

  const handleEditUser = async (data) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/edit-user/${data._id}`,
        data
      );

      socket.emit("client:onChangeUser", response.data._id);
      socket.emit("client:onUpdateUser", response.data);

      setOnEdit(false);
      setInitialValues(baseState);
      formik.resetForm();
      setOnLoading(false);

      setListUsuarios((prevList) => {
        const newInfo = prevList.map((user) =>
          user._id === response.data._id ? response.data : user
        );
        return newInfo;
      });

      Notify("Actualizacion", "Usuario Actualizado correctamente", "success");
    } catch (error) {
      const { data, status } = error.response;
      console.log(data.mensaje);
      setOnLoading(false);
      if (status === 401) {
        setWarningDuplicated(data.duplicados);
        Notify("Error", "No se puedo editar por informacion Duplicada", "fail");
      } else {
        Notify("Error", "No se pudo editar los datos del usuario", "fail");
      }
    }
  };

  const handleRegisterUser = async (data) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/register`,
        data
      );

      socket.emit("client:onNewUser", response.data);

      setInitialValues(baseState);
      formik.resetForm();
      setOnLoading(false);

      setListUsuarios((prevList) => [...prevList, response.data]);

      Notify(
        "Usuario Agregado Exitosamente",
        "Inicia Session para activar su cuenta, con el codigo enviado al correo",
        "success"
      );

      return response.data;
    } catch (error) {
      const { data, status } = error.response;
      setOnLoading(false);
      if (status === 401) {
        setWarningDuplicated(data.duplicados);
        Notify("Error", "informacion Duplicada", "fail");
      } else {
        Notify("Error", "No se pudo registrar usuario", "fail");
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/delete-user/${userId}`
      );
      if (response.status === 200) {
        socket.emit("client:onDeleteUser", response.data);
        socket.emit("client:onDeleteAccount", response.data);
        Notify("Usuario Eliminado", "", "success");
        return response.data;
      }
    } catch (error) {
      Notify("Error", "No se pudo Eliminar Usuario", "fail");
      console.log(error.response.data.mensaje);
    }
  };

  useEffect(() => {
    handleGetListUser();
  }, []);

  useEffect(() => {
    // Nuevo Usuario Agregado
    socket.on("server:onNewUser", (newUser) => {
      setListUsuarios((prevList) => [...prevList, newUser]);
    });

    // Usuario Eliminado
    socket.on("server:onDeleteUser", (userIdDeleted) => {
      setListUsuarios((prevList) => {
        const newInfo = prevList.filter((user) => user._id !== userIdDeleted);
        return newInfo;
      });

      if (InfoUsuario._id === userIdDeleted) {
        alert("Comunicado del Administrador: Su cuenta Fue Eliminada");
        dispatch(resetUser());
      }
    });

    // Usuario Actualizado
    socket.on("server:onUpdateUser", (updatedUser) => {
      setListUsuarios((prevList) => {
        const newInfo = prevList.map((user) =>
          user._id === updatedUser._id ? updatedUser : user
        );
        return newInfo;
      });
    });

    return () => {
      // Remove the event listener when the component unmounts
      socket.off("server:onNewUser");
      socket.off("server:onDeleteUser");
      socket.off("server:onUpdateUser");
    };
  }, []);

  return (
    <div className="content-users">
      <div className="form-users">
        <form onSubmit={formik.handleSubmit} className="container">
          {onLoading === true ? (
            <LoaderSpiner />
          ) : (
            <>
              <div className="h-title">
                <h1>{onEdit ? "Editar Usuario" : "Registrar Usuario"}</h1>
                {onEdit ? (
                  <button
                    className="btn"
                    type="button"
                    onClick={() => {
                      setOnEdit(false);
                      setWarningDuplicated([]);
                      setInitialValues(baseState);
                    }}
                  >
                    <Eliminar className="cancel-edit" />
                  </button>
                ) : null}
              </div>
              <div className="input-item">
                <TextInput
                  name="name"
                  label="Nombre :"
                  value={formik.values.name}
                  placeholder="Ingrese nombre"
                  autoComplete="off"
                  required
                  // disabled={validEnabledAccion(initialValues)}
                  onChange={formik.handleChange}
                />
                {formik.errors.name &&
                  formik.touched.name &&
                  validIco(formik.errors.name)}
              </div>
              <div className="input-item">
                <TextInput
                  name="phone"
                  label="Numero Telefonico :"
                  value={formik.values.phone}
                  placeholder="Ingrese numero"
                  autoComplete="off"
                  required
                  // disabled={validEnabledAccion(initialValues)}
                  onChange={formik.handleChange}
                />
                {formik.errors.phone &&
                  formik.touched.phone &&
                  validIco(formik.errors.phone)}
              </div>
              <div className="input-item">
                <TextInput
                  name="email"
                  label="Correo Electronico :"
                  error={
                    warningDuplicated.includes("correo")
                      ? "correo ya esta siendo usado"
                      : false
                  }
                  value={formik.values.email}
                  placeholder="Ingrese correo"
                  autoComplete="off"
                  required
                  // disabled={validEnabledAccion(initialValues)}
                  onChange={(e) => {
                    formik.setFieldValue("email", e.target.value);
                    // dispatch(clearDuplicated("correo"));
                  }}
                />
                {formik.errors.email &&
                  formik.touched.email &&
                  validIco(formik.errors.email)}
              </div>
              <div className="input-item">
                <Select
                  name="rol"
                  label="Rol"
                  value={formik.values.rol}
                  onChange={(e) => {
                    formik.setFieldValue("rol", e);
                  }}
                  placeholder="Escoge el rol"
                  clearable={
                    initialValues.rol === Roles.ADMIN ||
                    initialValues.rol === Roles.GERENTE
                      ? false
                      : true
                  }
                  searchable
                  // disabled={validEnabledAccion(initialValues)}
                  readOnly={
                    InfoUsuario.rol === Roles.GERENTE ||
                    initialValues.rol === Roles.ADMIN
                  }
                  data={allowedRoles.map((item) => ({
                    ...item,
                    disabled: isRoleDisabled(item.value),
                  }))}
                />
                {formik.errors.rol &&
                  formik.touched.rol &&
                  validIco(formik.errors.rol)}
              </div>
              <div className="account">
                <div className="input-item">
                  <TextInput
                    name="usuario"
                    label="Usuario :"
                    value={formik.values.usuario}
                    error={
                      warningDuplicated.includes("usuario")
                        ? "usuario ya existe"
                        : false
                    }
                    // disabled={validEnabledAccion(initialValues)}
                    placeholder="Ingrese usuario"
                    autoComplete="off"
                    required
                    onChange={(e) => {
                      formik.setFieldValue("usuario", e.target.value);
                      // dispatch(clearDuplicated("usuario"));
                    }}
                  />
                  {formik.errors.usuario &&
                    formik.touched.usuario &&
                    validIco(formik.errors.usuario)}
                </div>
                <div className="input-item">
                  <TextInput
                    name="password"
                    label="Contraseña :"
                    description={
                      onEdit
                        ? "el campo vacio, mantiene la contraseña anterior"
                        : true
                    }
                    value={formik.values.password}
                    placeholder="Ingrese contraseña"
                    autoComplete="off"
                    required={onEdit ? false : true}
                    // disabled={validEnabledAccion(initialValues)}
                    onChange={formik.handleChange}
                  />

                  {onEdit
                    ? null
                    : formik.errors.password &&
                      formik.touched.password &&
                      validIco(formik.errors.password)}
                </div>
              </div>
              <Button
                type="submit"
                variant="gradient"
                gradient={
                  onEdit
                    ? { from: "rgba(255, 178, 46, 1)", to: "red", deg: 90 }
                    : { from: "indigo", to: "cyan" }
                }
              >
                {onEdit ? "Editar Usuario" : "Registrar Usuario"}
              </Button>
            </>
          )}
        </form>
      </div>
      <div className="list-users">
        {ListUsuarios?.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Numero</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Usuario</th>
                <th>Activado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ListUsuarios.filter((user) => user.state !== "eliminado").map(
                (p, index) => (
                  <tr key={index}>
                    <td>{p.name}</td>
                    <td>{p.phone}</td>
                    <td>{p.email}</td>
                    <td>{p.rol}</td>
                    <td>{p.usuario}</td>
                    <td>{p.state}</td>
                    <td>
                      <div className="actions">
                        {validEnabledAccion(p, "update") ? (
                          <button
                            type="button"
                            className="btn-edit"
                            onClick={() => {
                              setWarningDuplicated([]);
                              setInitialValues({
                                _id: p?._id,
                                name: p?.name,
                                phone: p?.phone,
                                email: p?.email,
                                rol: p?.rol,
                                usuario: p?.usuario,
                                password: "",
                              });
                              setOnEdit(true);
                            }}
                          >
                            <i className="fas fa-user-edit" />
                          </button>
                        ) : null}

                        {validEnabledAccion(p, "delete") ? (
                          <button
                            className="btn-delete"
                            type="button"
                            onClick={() => {
                              validDeleteUsuario(p._id);
                            }}
                          >
                            <i className="fas fa-user-times" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        ) : null}
      </div>
    </div>
  );
};

export default Usuarios;
