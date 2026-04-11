const apiUrl = import.meta.env.PUBLIC_API_URL; // Esto hay que cambiarlo porque se puede ver cual es la URL de back
// Cuando integremos Nginx se solucionara

export async function enable2FA() {
    const res = await fetch(`${apiUrl}/2fa/enable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al activar 2FA");
    }

    return res.json();
}

export async function verify2FA(code: string) {
    const res = await fetch(`${apiUrl}/2fa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        credentials: "include",
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al verificar 2FA");
    }

    return res.json();
}

export async function disable2FA(code: string) {
    const res = await fetch(`${apiUrl}/2fa/disable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        credentials: "include",
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al desactivar 2FA");
    }

    return res.json();
}