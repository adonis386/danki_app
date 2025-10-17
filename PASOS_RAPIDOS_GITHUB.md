# ⚡ Guía Rápida: 5 Minutos para Subir a GitHub

## 🎯 Objetivo
Subir tu proyecto Danki a GitHub en 5 pasos simples.

---

## ✅ Pre-requisitos
- [x] Git instalado
- [x] Cuenta en GitHub
- [x] Terminal abierta en `C:\Users\Usuario\Desktop\my-app`

---

## 🚀 5 Pasos Esenciales

### **1️⃣ Crear Repositorio en GitHub** (2 min)

1. Ve a: https://github.com/new
2. Rellena:
   - **Repository name**: `danki`
   - **Description**: `Plataforma de delivery con Next.js y Supabase`
   - **Visibilidad**: Public ✅
3. **NO** marques ninguna casilla
4. Click **Create repository**
5. **COPIA LA URL** que aparece: `https://github.com/TU-USUARIO/danki.git`

---

### **2️⃣ Hacer el Primer Commit** (1 min)

```bash
# En tu terminal:
git commit -m "Initial commit: Danki delivery platform v1.0"
```

**Resultado esperado**: 
```
[master (root-commit) a1b2c3d] Initial commit: Danki delivery platform v1.0
 97 files changed, 12345 insertions(+)
```

---

### **3️⃣ Conectar con GitHub** (1 min)

```bash
# Reemplaza TU-USUARIO con tu usuario de GitHub
git remote add origin https://github.com/TU-USUARIO/danki.git

# Verificar
git remote -v
```

**Resultado esperado**:
```
origin  https://github.com/TU-USUARIO/danki.git (fetch)
origin  https://github.com/TU-USUARIO/danki.git (push)
```

---

### **4️⃣ Renombrar Rama a 'main'** (10 seg)

```bash
git branch -M main
```

---

### **5️⃣ Subir a GitHub** (1 min)

```bash
git push -u origin main
```

**Si pide autenticación**:
- **Username**: Tu usuario de GitHub
- **Password**: [Personal Access Token](https://github.com/settings/tokens) (NO tu contraseña)

**Resultado esperado**:
```
Enumerating objects: 100, done.
Counting objects: 100% (100/100), done.
Writing objects: 100% (100/100), 45.67 KiB | 4.56 MiB/s, done.
To https://github.com/TU-USUARIO/danki.git
 * [new branch]      main -> main
```

---

## 🎉 ¡Listo!

Tu proyecto ya está en GitHub:
```
https://github.com/TU-USUARIO/danki
```

---

## 🔒 Verificación Final

Ve a tu repositorio en GitHub y verifica:

- ✅ Archivos están ahí
- ✅ README se ve correctamente
- ❌ **NO** hay archivo `.env`
- ❌ **NO** hay carpeta `node_modules`

---

## 🚨 Si Algo Sale Mal

### Error: "Permission denied"
**Solución**: Necesitas un Personal Access Token

1. Ve a: https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Marca: `repo` 
4. Click **Generate token**
5. **COPIA EL TOKEN** (no podrás verlo de nuevo)
6. Úsalo como password cuando hagas `git push`

---

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/TU-USUARIO/danki.git
```

---

### Error: "failed to push"
```bash
git pull origin main --rebase
git push
```

---

## 📱 Comandos para el Futuro

### Cuando hagas cambios:
```bash
# 1. Ver qué cambió
git status

# 2. Agregar cambios
git add .

# 3. Hacer commit
git commit -m "Descripción del cambio"

# 4. Subir
git push
```

---

## 🎯 Próximo Paso

### Deploy en Vercel (5 minutos)

1. Ve a: https://vercel.com/new
2. Importa tu repositorio de GitHub
3. Agrega variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

**Tu app estará en**: `https://danki.vercel.app`

---

## 📚 Documentación Completa

Para más detalles, consulta:

- **`GIT_SETUP.md`** - Guía detallada paso a paso
- **`CHECKLIST_ANTES_DE_SUBIR.md`** - Verificación de seguridad
- **`RESUMEN_PREPARACION_GITHUB.md`** - Estado actual del proyecto
- **`README_GITHUB.md`** - README profesional para GitHub

---

<div align="center">

**⚡ ¡Tu proyecto en GitHub en 5 minutos! ⚡**

🚀 Ahora puedes compartirlo en tu portfolio 🚀

</div>

