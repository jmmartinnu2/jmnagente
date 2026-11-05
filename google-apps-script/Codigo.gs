/**
 * Receptor de formularios de la web JMN Agente.
 * Se instala en la cuenta jmnagente@gmail.com (ver LEEME.md).
 *
 * Por cada solicitud:
 *  1. Envía un email a jmnagente@gmail.com con todos los datos (respondiendo, contestas al cliente).
 *  2. Envía al cliente un email de confirmación en su idioma.
 *  3. Guarda la solicitud en la hoja de cálculo «Solicitudes web JMN Agente» de tu Google Drive.
 */
var DESTINO = 'jmnagente@gmail.com';
var NOMBRE_HOJA = 'Solicitudes web JMN Agente';

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var data = JSON.parse(e.postData.contents);
    if (data._honey) return json_({ ok: true });

    var asunto = String(data._subject || 'Nueva solicitud desde la web').slice(0, 200);
    var auto = data._autoresponse;
    ['_subject', '_autoresponse', '_honey', '_template', '_captcha'].forEach(function (k) { delete data[k]; });

    var emailCliente = String(data.email || '').trim();
    var emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailCliente);

    // 1. Aviso para José Mª
    var filas = Object.keys(data).map(function (k) {
      return '<tr><td style="padding:9px 14px;background:#F4F6F7;font-weight:bold;border:1px solid #E8EBED;vertical-align:top;white-space:nowrap">' +
        esc_(k === 'email' ? 'Email' : k) + '</td><td style="padding:9px 14px;border:1px solid #E8EBED">' + esc_(data[k]) + '</td></tr>';
    }).join('');
    var fecha = Utilities.formatDate(new Date(), 'Europe/Madrid', "dd/MM/yyyy 'a las' HH:mm");
    var html = '<div style="font-family:Arial,sans-serif;color:#2D373D;max-width:680px">' +
      '<div style="border-top:4px solid #DF0027;padding-top:12px"><h2 style="margin:0 0 6px;color:#DF0027">' + esc_(asunto) + '</h2>' +
      '<p style="margin:0 0 16px;color:#526570">Recibido el ' + fecha + ' desde jmmartinnu2.github.io/jmnagente</p></div>' +
      '<table style="border-collapse:collapse;width:100%;font-size:14px">' + filas + '</table>' +
      (emailValido ? '<p style="margin-top:16px;color:#526570">Pulsa «Responder» para contestar directamente al cliente.</p>' : '') +
      (data['Teléfono'] && data['Teléfono'] !== '—' ? '<p><a href="https://wa.me/' + String(data['Teléfono']).replace(/\D/g, '').replace(/^(?!34)(\d{9})$/, '34$1') +
        '" style="background:#25D366;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:bold">Abrir WhatsApp con el cliente</a></p>' : '') +
      '</div>';
    var opciones = { htmlBody: html, name: 'Web JMN Agente' };
    if (emailValido) opciones.replyTo = emailCliente;
    MailApp.sendEmail(DESTINO, asunto, 'Nueva solicitud web. Abre este email en un cliente con HTML.', opciones);

    // 2. Confirmación al cliente
    if (emailValido && auto && auto.subject && auto.html) {
      MailApp.sendEmail(emailCliente, String(auto.subject).slice(0, 200), '', {
        htmlBody: '<div style="font-family:Arial,sans-serif;color:#2D373D;font-size:15px;line-height:1.6;max-width:600px">' +
          '<div style="font-size:24px;font-weight:800;color:#DF0027;margin-bottom:16px">JMN<span style="color:#2D373D;font-weight:500">AGENTE</span></div>' +
          String(auto.html) + '</div>',
        name: 'José Mª Martín Núñez · JMN Agente',
        replyTo: DESTINO
      });
    }

    // 3. Registro en hoja de cálculo
    guardar_(asunto, data);

    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

function doGet() {
  return ContentService.createTextOutput('Formulario JMN Agente activo.');
}

function guardar_(asunto, data) {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID'), ss;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss) {
    ss = SpreadsheetApp.create(NOMBRE_HOJA);
    props.setProperty('SHEET_ID', ss.getId());
    ss.getSheets()[0].appendRow(['Fecha', 'Tipo', 'Nombre', 'Teléfono', 'Email', 'Idioma', 'Asunto', 'Detalle']);
    ss.getSheets()[0].setFrozenRows(1);
  }
  var detalle = Object.keys(data).map(function (k) { return k + ': ' + data[k]; }).join('\n');
  ss.getSheets()[0].appendRow([new Date(), data['Tipo'] || '', data['Nombre'] || '', data['Teléfono'] || '', data.email || '', data['Idioma del cliente'] || '', asunto, detalle]);
}

function esc_(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/** Ejecuta esta función UNA vez desde el editor para dar permisos y comprobar que llega el email. */
function probar() {
  doPost({ postData: { contents: JSON.stringify({
    _subject: 'Prueba del formulario web JMN Agente',
    'Tipo': 'Prueba', 'Nombre': 'Prueba técnica', 'Teléfono': '—', email: DESTINO, 'Idioma del cliente': 'ES',
    _autoresponse: { subject: 'Prueba de confirmación al cliente', html: 'Si lees esto, la confirmación automática funciona.' }
  }) } });
}
