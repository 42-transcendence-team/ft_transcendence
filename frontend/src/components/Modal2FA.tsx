import { useState } from "react";

import "@styles/_modal2FA.scss";

type Props = {
	checked: boolean;
	onChange: (checked: boolean) => void;
};

export function Modal2FA(props: Props) {
  return (
    <>
        {props.checked ? (
			<div className="modal-2fa-overlay" onClick={() => props.onChange(false)}>
				<div className="modal-2fa" onClick={(e) => e.stopPropagation()}>
					<h2 className="modal-2fa__title">Autenticación de dos factores (2FA)</h2>
					<p className="modal-2fa__content">Para activar la autenticación de dos factores, escanea el siguiente código QR con tu aplicación de autenticación (como Google Authenticator o Authy) y luego ingresa el código generado por la aplicación para verificar tu identidad.</p>
					<div className="modal-2fa__qr-code">
						IMAGEN 100% real que envia backend
					</div>
					<input type="text" placeholder="Ingresa el código de tu aplicación de autenticación" className="modal-2fa__input" />
					<button className="modal-2fa__button--enable">Verificar</button>
					<button className="modal-2fa__button--disable" onClick={() => props.onChange(false)}>
						Cancelar
					</button>
				</div>
			</div>
        ) : null}
    </>
  );
}