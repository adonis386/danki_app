# 🔧 Configurar URLs de Producción en Supabase

## ❌ Problema
Los emails de confirmación redirigen a `localhost` en lugar de tu URL de producción.

---

## ✅ Solución: Configurar Site URL en Supabase

### **Paso 1: Ir a Configuración de Authentication**

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Haz clic en **Authentication** (icono de usuario en el menú izquierdo)
3. Haz clic en **URL Configuration**

---

### **Paso 2: Configurar Site URL**

Busca la sección **Site URL** y configura:

```
https://tu-dominio-en-vercel.vercel.app
```

Por ejemplo:
```
https://danki.vercel.app
```

O si tienes dominio personalizado:
```
https://www.danki.com
```

---

### **Paso 3: Configurar Redirect URLs**

En la sección **Redirect URLs**, agrega:

```
https://tu-dominio-en-vercel.vercel.app/**
https://tu-dominio-en-vercel.vercel.app/auth/callback
```

**Ejemplo:**
```
https://danki.vercel.app/**
https://danki.vercel.app/auth/callback
```

**OPCIONAL**: También puedes agregar localhost para desarrollo:
```
http://localhost:3000/**
http://localhost:3000/auth/callback
```

---

### **Paso 4: Guardar Cambios**

1. Haz clic en **Save** al final de la página
2. Espera unos segundos para que se apliquen los cambios

---

## 🔧 Configuración Completa Recomendada

### **Site URL**
```
https://danki.vercel.app
```

### **Redirect URLs** (una por línea)
```
https://danki.vercel.app/**
https://danki.vercel.app/auth/callback
http://localhost:3000/**
http://localhost:3000/auth/callback
```

### **Additional Redirect URLs** (opcional)
Si tienes múltiples dominios:
```
https://www.danki.com/**
https://app.danki.com/**
```

---

## 📧 Configurar Email Templates (Opcional)

### **Paso 1: Ir a Email Templates**

1. En Supabase Dashboard → **Authentication**
2. Haz clic en **Email Templates**

---

### **Paso 2: Personalizar Plantilla de Confirmación**

Encuentra el template **Confirm signup** y verifica que contenga:

```html
<h2>Confirma tu email</h2>
<p>Sigue este enlace para confirmar tu cuenta:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar mi cuenta</a></p>
```

La variable `{{ .ConfirmationURL }}` automáticamente usará tu **Site URL** configurado.

---

### **Paso 3: Personalizar con tu marca (Opcional)**

Puedes personalizar el email con tu branding:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
    .logo { color: white; font-size: 32px; font-weight: bold; }
    .button { 
      display: inline-block; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; 
      padding: 15px 40px; 
      text-decoration: none; 
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🚀 Danki</div>
    </div>
    
    <div style="padding: 40px 20px; text-align: center;">
      <h2 style="color: #333;">¡Bienvenido a Danki! 🎉</h2>
      <p style="color: #666; font-size: 16px;">
        Gracias por registrarte. Por favor confirma tu correo electrónico para comenzar.
      </p>
      
      <a href="{{ .ConfirmationURL }}" class="button">
        Confirmar mi cuenta
      </a>
      
      <p style="color: #999; font-size: 14px; margin-top: 30px;">
        Si no creaste esta cuenta, puedes ignorar este email.
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 🧪 Prueba Después de Configurar

### **1. Crear un usuario de prueba:**
- Email: `prueba@tuemail.com`
- Password: `Test1234`

### **2. Verificar el email:**
- Revisa tu bandeja de entrada
- El enlace debe apuntar a: `https://danki.vercel.app/...`
- **NO** debe apuntar a `localhost`

### **3. Hacer clic en el enlace:**
- Debe redirigirte a tu sitio en producción
- Debe confirmarse la cuenta correctamente

---

## 🔍 Solución de Problemas

### **El email sigue apuntando a localhost:**

**Causa**: La configuración no se aplicó correctamente

**Solución**:
1. Verifica que guardaste los cambios en Supabase
2. Espera 1-2 minutos para que se propaguen
3. Prueba con un nuevo usuario (no uno anterior)
4. Limpia la caché del navegador

---

### **El enlace da 404:**

**Causa**: Falta la ruta de callback

**Solución**: Crea una ruta de callback en tu app:

**Archivo**: `src/app/auth/callback/route.ts`
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirigir al home después de confirmar
  return NextResponse.redirect(new URL('/', request.url))
}
```

---

### **No recibo el email:**

**Posibles causas**:
1. **Email en spam** - Revisa la carpeta de spam
2. **Email provider bloqueando** - Supabase usa SendGrid
3. **Email rate limit** - Espera 1 minuto entre intentos

**Solución temporal**: Confirmar usuarios manualmente en Supabase
1. Dashboard → Authentication → Users
2. Encuentra el usuario
3. Click en el menú (...)
4. "Confirm user"

---

## 📝 Checklist de Configuración

- [ ] Site URL configurada con tu dominio de Vercel
- [ ] Redirect URLs incluyen `/**` y `/auth/callback`
- [ ] Guardaste los cambios en Supabase
- [ ] Esperaste 1-2 minutos para que se apliquen
- [ ] Probaste con un usuario NUEVO (no uno anterior)
- [ ] El email llega correctamente
- [ ] El enlace apunta a tu dominio de producción
- [ ] El enlace funciona y confirma la cuenta

---

## 🎯 Configuración Recomendada Final

**En Supabase → Authentication → URL Configuration:**

| Campo | Valor |
|-------|-------|
| **Site URL** | `https://danki.vercel.app` |
| **Redirect URLs** | `https://danki.vercel.app/**` |
|  | `https://danki.vercel.app/auth/callback` |
|  | `http://localhost:3000/**` (opcional, para dev) |

---

## 💡 Alternativa: Deshabilitar Confirmación de Email

Si quieres que los usuarios puedan usar la app inmediatamente sin confirmar email:

**En Supabase → Authentication → Providers → Email:**

1. Desactiva **"Enable email confirmations"**
2. Guarda los cambios

**⚠️ Advertencia**: Esto reduce la seguridad, solo recomendado para desarrollo o MVP.

---

## 🚀 Después de Configurar

1. ✅ Los nuevos usuarios recibirán emails con links correctos
2. ✅ Las confirmaciones redirigirán a tu app en producción
3. ✅ Todo funcionará correctamente en producción

---

<div align="center">

**🎉 ¡Tu sistema de autenticación estará 100% funcional en producción! 🎉**

</div>

