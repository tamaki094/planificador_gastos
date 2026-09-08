# Sincronizar fotos de perfil con Google Cloud Storage

Esta guía explica cómo respaldar las fotos de perfil de Google en un bucket de **Google Cloud Storage** mediante una **Cloud Function HTTP**. La aplicación Angular enviará la URL temporal de Google y recibirá a cambio una URL persistente para guardar en la API .NET y Firestore.

## Flujo de la solución

```text
Angular / Firebase Auth
          |
          | uid + foto_url
          v
Cloud Function: syncProfilePhoto
          |
          | descarga y almacena la imagen
          v
Google Cloud Storage -> URL pública persistente
```

## Requisitos previos

Antes de comenzar, verifica que tienes:

- Un proyecto activo en Google Cloud.
- La CLI de `gcloud` instalada y autenticada.
- Node.js 20 o una versión compatible.
- Permisos para crear buckets, desplegar Cloud Functions y administrar IAM.

> [!IMPORTANT]
> Sustituye los valores de ejemplo, como el nombre del bucket y la URL de la función, por los de tu propio proyecto.

## 1. Crear el bucket

El bucket almacenará una copia permanente de cada foto de perfil.

### Crear el bucket

Ejecuta el comando desde PowerShell o desde Cloud Shell:

```powershell
gcloud storage buckets create gs://finance-flow-user-photos --location=us-central1
```

### Permitir la lectura de las imágenes

La aplicación necesita poder mostrar las fotos mediante su URL. El siguiente comando permite la lectura pública de los objetos del bucket:

```powershell
gcloud storage buckets add-iam-policy-binding gs://finance-flow-user-photos --member=allUsers --role=roles/storage.objectViewer
```

> [!WARNING]
> Esta configuración hace públicas las imágenes almacenadas. Si las fotos deben ser privadas, utiliza URLs firmadas y no concedas acceso a `allUsers`.

## 2. Crear la Cloud Function

Crea una carpeta vacía llamada `gcf-sync-photo` con estos dos archivos:

```text
gcf-sync-photo/
├── package.json
└── index.js
```

### `package.json`

```json
{
  "name": "gcf-sync-photo",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "@google-cloud/functions-framework": "^3.3.0",
    "@google-cloud/storage": "^7.7.0",
    "axios": "^1.6.0"
  }
}
```

### `index.js`

```javascript
const functions = require('@google-cloud/functions-framework');
const { Storage } = require('@google-cloud/storage');
const axios = require('axios');

const storage = new Storage();
const BUCKET_NAME = 'finance-flow-user-photos';

functions.http('syncProfilePhoto', async (req, res) => {
  // Permite que Angular consuma la función desde localhost o producción.
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  try {
    const { uid, foto_url } = req.body;

    if (!uid || !foto_url) {
      return res.status(400).json({ error: 'Faltan parámetros: uid o foto_url' });
    }

    console.log(`Descargando foto para el usuario ${uid} desde ${foto_url}...`);

    // Descarga la imagen como stream para evitar cargarla completa en memoria.
    const response = await axios({
      url: foto_url,
      method: 'GET',
      responseType: 'stream'
    });

    const bucket = storage.bucket(BUCKET_NAME);
    const fileName = `profiles/${uid}.jpg`;
    const file = bucket.file(fileName);

    const writeStream = file.createWriteStream({
      metadata: {
        contentType: response.headers['content-type'] || 'image/jpeg'
      }
    });

    await new Promise((resolve, reject) => {
      response.data.pipe(writeStream)
        .on('finish', resolve)
        .on('error', reject);
    });

    const gcsPublicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${fileName}`;

    console.log(`Foto guardada con éxito en GCS: ${gcsPublicUrl}`);

    return res.status(200).json({
      message: 'Foto de perfil sincronizada con éxito en Cloud Storage',
      uid,
      foto_url_gcs: gcsPublicUrl
    });
  } catch (error) {
    console.error('Error procesando foto de perfil:', error.message);
    return res.status(500).json({
      error: 'Error interno en la Cloud Function',
      details: error.message
    });
  }
});
```

## 3. Desplegar la función

Abre una terminal dentro de `gcf-sync-photo` y ejecuta:

```powershell
gcloud functions deploy syncProfilePhoto --gen2 --runtime=nodejs20 --region=us-central1 --source=. --entry-point=syncProfilePhoto --trigger-http --allow-unauthenticated
```

Cuando finalice el despliegue, Google Cloud mostrará una URL similar a esta:

```text
https://syncprofilephoto-xxxxxx-uc.a.run.app
```

Guarda esa URL: la necesitarás en `AuthService.ts`.

### Comprobar el despliegue

La función espera una petición `POST` con este cuerpo:

```json
{
  "uid": "usuario-123",
  "foto_url": "https://example.com/foto.jpg"
}
```

Una respuesta correcta tendrá esta forma:

```json
{
  "message": "Foto de perfil sincronizada con éxito en Cloud Storage",
  "uid": "usuario-123",
  "foto_url_gcs": "https://storage.googleapis.com/finance-flow-user-photos/profiles/usuario-123.jpg"
}
```

## 4. Conectar Angular con la función

Agrega la URL desplegada en tu `environment` o directamente en `AuthService.ts`:

```typescript
private gcfPhotoUrl = 'https://syncprofilephoto-xxxxxx-uc.a.run.app';
```

Después, integra la sincronización dentro de `createOrUpdateUser`:

```typescript
private async createOrUpdateUser(user: User): Promise<void> {
  try {
    const userRef = doc(this.firestore, 'usuarios', user.uid);
    let fotoRespaldada = user.photoURL || '';

    if (user.photoURL) {
      try {
        const gcfResponse: any = await firstValueFrom(
          this.http.post(this.gcfPhotoUrl, {
            uid: user.uid,
            foto_url: user.photoURL
          })
        );

        if (gcfResponse?.foto_url_gcs) {
          fotoRespaldada = gcfResponse.foto_url_gcs;
          console.log('Foto respaldada en Cloud Storage:', fotoRespaldada);
        }
      } catch (gcfError) {
        console.warn(
          'No se pudo respaldar la foto en Cloud Storage. Se usará la URL original:',
          gcfError
        );
      }
    }

    const userData: Usuario = {
      uid: user.uid,
      nombre: user.displayName || 'Usuario',
      correo: user.email || '',
      foto_url: fotoRespaldada,
      telefono: user.phoneNumber || '',
      email_verificado: user.emailVerified,
      proveedor: user.providerData[0]?.providerId || 'google',
      fecha_creacion: user.metadata.creationTime
        ? new Date(user.metadata.creationTime)
        : new Date(),
      ultimo_login: new Date(),
      estatus_activo: true,
      fecha_actualizacion: new Date()
    };

    await firstValueFrom(this.http.post(this.apiUrl + 'Usuario', userData));
    await setDoc(userRef, userData, { merge: true });
    console.log('Usuario creado/actualizado con éxito');
  } catch (error) {
    console.error('Error al crear/actualizar usuario:', error);
  }
}
```

## 5. Validación final

1. Inicia sesión con Google desde Angular.
2. Confirma en los logs de la función que la imagen se descargó correctamente.
3. Revisa en el bucket la ruta `profiles/{uid}.jpg`.
4. Comprueba que `foto_url` contiene la URL de Google Cloud Storage en la API y en Firestore.
5. Cierra sesión, vuelve a entrar y confirma que la foto continúa disponible.

## Ventajas de este enfoque

| Beneficio | Descripción |
| --- | --- |
| **Servidor desacoplado** | La API .NET no descarga ni procesa archivos de imagen pesados. |
| **Persistencia** | La foto permanece disponible aunque la URL original de Google caduque. |
| **Reutilización** | El mismo archivo se actualiza en `profiles/{uid}.jpg` cuando el usuario vuelve a autenticarse. |
| **Coste inicial bajo** | La solución puede mantenerse dentro de las cuotas gratuitas de Google Cloud, según el uso. |

> [!NOTE]
> Revisa siempre las cuotas y precios vigentes de Google Cloud antes de pasar a producción.

Con esto, el flujo de autenticación conserva una copia estable de la foto de perfil sin cargar esa responsabilidad en tu API principal.
