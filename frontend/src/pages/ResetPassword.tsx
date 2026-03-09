import { useParams } from "react-router-dom";

export const ResetPassword = () => {
  const { token } = useParams();

  return (
    <>
      <h2>Restablecer contraseña</h2>
      <p>Token: {token}</p>
      <p>Aquí iría el formulario de nueva contraseña.</p>
    </>
  );
};
