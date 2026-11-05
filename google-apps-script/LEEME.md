# Cómo activar el envío de formularios a jmnagente@gmail.com

Tiempo: 5 minutos. Solo se hace una vez.

1. Entra en https://script.google.com con la cuenta **jmnagente@gmail.com**.
2. Pulsa **Nuevo proyecto**. Ponle de nombre «Formularios web JMN».
3. Borra lo que aparece y pega todo el contenido de `Codigo.gs`. Guarda (icono del disquete).
4. Arriba, en el desplegable de funciones, elige **probar** y pulsa **Ejecutar**.
   - Google pedirá permisos: «Revisar permisos» → tu cuenta → «Configuración avanzada» → «Ir a Formularios web JMN (no seguro)» → «Permitir».
     (Sale el aviso de «no seguro» porque el script es tuyo y no está verificado por Google; es normal.)
   - Te llegarán dos emails de prueba a jmnagente@gmail.com y se creará la hoja «Solicitudes web JMN Agente» en tu Drive.
5. Pulsa **Implementar → Nueva implementación**.
   - Tipo: **Aplicación web**.
   - Ejecutar como: **Yo (jmnagente@gmail.com)**.
   - Quién tiene acceso: **Cualquier usuario**.
   - Pulsa **Implementar** y copia la **URL de la aplicación web** (termina en `/exec`).
6. Pega esa URL en `index.html`, en `CONFIG.appsScriptUrl` (o pásasela a Claude para que lo haga).

Desde ese momento cada formulario de la web:
- te llega a jmnagente@gmail.com (pulsando «Responder» contestas al cliente),
- envía al cliente una confirmación en su idioma,
- queda guardado en la hoja de cálculo como registro de clientes.

Si algún día cambias el código, usa **Implementar → Gestionar implementaciones → Editar → Nueva versión** para mantener la misma URL.
