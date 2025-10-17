# 🚀 Guía Completa: Subir Proyecto a GitHub

Esta guía te llevará paso a paso para subir tu proyecto Danki a GitHub.

---

## 📋 Requisitos Previos

1. ✅ Tener Git instalado ([Descargar Git](https://git-scm.com/downloads))
2. ✅ Tener una cuenta en [GitHub](https://github.com)
3. ✅ Haber configurado tu identidad en Git (ver abajo)

---

## 🔧 Paso 1: Configurar Git (Primera Vez)

Si es tu primera vez usando Git, configura tu identidad:

```bash
# Configura tu nombre (será visible en los commits)
git config --global user.name "Tu Nombre"

# Configura tu email (debe coincidir con tu email de GitHub)
git config --global user.email "tu-email@example.com"

# Verifica la configuración
git config --global --list
```

---

## 🌐 Paso 2: Crear Repositorio en GitHub

### Opción A: Por Web (Recomendado)

1. Ve a [GitHub.com](https://github.com)
2. Haz clic en el **+** (arriba a la derecha) → **New repository**
3. Configura:
   - **Repository name**: `danki`
   - **Description**: `Plataforma de delivery tipo UberEats`
   - **Visibilidad**: 
     - ✅ **Public** (recomendado para portfolio)
     - ⚠️ **Private** (si quieres mantenerlo privado)
   - **NO** marques "Initialize this repository with a README"
   - **NO** agregues .gitignore ni license (ya los tienes)
4. Haz clic en **Create repository**

### Opción B: Por CLI (GitHub CLI)

```bash
# Instala GitHub CLI si no lo tienes: https://cli.github.com/
gh repo create danki --public --source=. --remote=origin
```

---

## 💻 Paso 3: Inicializar Git en tu Proyecto

Abre tu terminal en la carpeta del proyecto (`C:\Users\Usuario\Desktop\my-app`) y ejecuta:

```bash
# Inicializar repositorio Git
git init

# Verificar que Git está inicializado
git status
```

**Deberías ver**: `On branch master` o `On branch main`

---

## 🔒 Paso 4: IMPORTANTE - Verificar .env

**⚠️ CRÍTICO**: Asegúrate de que tu archivo `.env.local` NO se suba a GitHub:

```bash
# Verifica que .env está en .gitignore
cat .gitignore | findstr /i "env"

# Deberías ver estas líneas:
# .env
# .env.local
# .env*.local
```

Si tu archivo se llama `.env` o `.env.local`, está protegido ✅

---

## 📦 Paso 5: Agregar Archivos al Staging

```bash
# Ver qué archivos se van a subir (debería excluir node_modules, .env, etc.)
git status

# Agregar TODOS los archivos (respetando .gitignore)
git add .

# Verificar qué se agregó
git status
```

**Verificación importante**:
- ✅ Deberías ver archivos en verde
- ❌ **NO** deberías ver `node_modules/`, `.env`, o `.next/`

Si ves archivos que no deberías subir:

```bash
# Remover del staging
git reset

# Actualiza tu .gitignore y vuelve a agregar
git add .
```

---

## 💾 Paso 6: Hacer el Primer Commit

```bash
# Crear el commit inicial
git commit -m "Initial commit: Danki delivery platform"

# Verificar el commit
git log --oneline
```

---

## 🔗 Paso 7: Conectar con GitHub

Copia la URL de tu repositorio de GitHub (la obtuviste en el Paso 2):

```bash
# Conectar con el repositorio remoto
git remote add origin https://github.com/TU-USUARIO/danki.git

# Verificar la conexión
git remote -v
```

**Deberías ver**:
```
origin  https://github.com/TU-USUARIO/danki.git (fetch)
origin  https://github.com/TU-USUARIO/danki.git (push)
```

---

## 🚀 Paso 8: Subir a GitHub

```bash
# Renombrar la rama a 'main' (si está como 'master')
git branch -M main

# Subir todos los archivos
git push -u origin main
```

**Si te pide autenticación**:
- Usuario: Tu nombre de usuario de GitHub
- Password: **NO uses tu contraseña** → Usa un [Personal Access Token](https://github.com/settings/tokens)

### Generar Personal Access Token

1. Ve a: [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click en **Generate new token (classic)**
3. Marca: `repo` (Full control of private repositories)
4. Copia el token y úsalo como password

---

## ✅ Paso 9: Verificar en GitHub

1. Ve a tu repositorio: `https://github.com/TU-USUARIO/danki`
2. Verifica que:
   - ✅ Todos los archivos están ahí
   - ❌ **NO** hay archivo `.env` o `.env.local`
   - ❌ **NO** hay carpeta `node_modules/`
   - ✅ El README se ve correctamente

---

## 📝 Comandos Útiles para el Futuro

### Ver el Estado
```bash
git status
```

### Agregar Cambios
```bash
# Agregar archivos específicos
git add archivo.ts

# Agregar todos los cambios
git add .
```

### Hacer Commit
```bash
git commit -m "Descripción clara del cambio"
```

### Subir Cambios
```bash
git push
```

### Ver Historial
```bash
git log --oneline
```

### Crear una Rama
```bash
git checkout -b feature/nueva-funcionalidad
```

### Cambiar de Rama
```bash
git checkout main
```

### Fusionar Ramas
```bash
git checkout main
git merge feature/nueva-funcionalidad
```

### Descargar Cambios
```bash
git pull origin main
```

---

## 🎯 Workflow Recomendado

Para trabajar de forma organizada:

```bash
# 1. Crear una rama para nueva funcionalidad
git checkout -b feature/sistema-pagos

# 2. Hacer cambios en el código

# 3. Agregar y commitear
git add .
git commit -m "feat: agregar integración con Stripe"

# 4. Subir la rama
git push -u origin feature/sistema-pagos

# 5. En GitHub, crear un Pull Request

# 6. Después de revisar, fusionar con main
git checkout main
git pull origin main
```

---

## 🚨 Problemas Comunes

### "Permission denied"
**Solución**: Usa un Personal Access Token en lugar de tu contraseña.

### "Repository already exists"
**Solución**:
```bash
git remote remove origin
git remote add origin https://github.com/TU-USUARIO/danki.git
```

### "Failed to push some refs"
**Solución**:
```bash
git pull origin main --rebase
git push
```

### "Changes not staged for commit"
**Solución**:
```bash
git add .
git commit -m "Tu mensaje"
```

### Se subió el archivo .env por error
**Solución URGENTE**:
```bash
# 1. Remover del repositorio (pero mantener local)
git rm --cached .env.local

# 2. Agregar a .gitignore si no está
echo ".env.local" >> .gitignore

# 3. Commit y push
git add .gitignore
git commit -m "Remove .env.local from repo"
git push

# 4. IMPORTANTE: Rotar tus credenciales de Supabase
# Ve a Supabase Dashboard y genera nuevas claves
```

---

## 📊 Estructura de Commits Recomendada

Usa prefijos para organizar tus commits:

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan código)
- `refactor:` Refactorización de código
- `test:` Agregar tests
- `chore:` Tareas de mantenimiento

**Ejemplos**:
```bash
git commit -m "feat: agregar sistema de cupones"
git commit -m "fix: corregir cálculo de total en carrito"
git commit -m "docs: actualizar README con instrucciones de deploy"
```

---

## 🔐 Seguridad: Checklist Final

Antes de subir a GitHub, verifica:

- [ ] ✅ `.env.local` está en `.gitignore`
- [ ] ✅ `node_modules/` está en `.gitignore`
- [ ] ✅ `.next/` está en `.gitignore`
- [ ] ✅ No hay credenciales hardcodeadas en el código
- [ ] ✅ `env.example` tiene valores de ejemplo (no reales)
- [ ] ✅ El repositorio es privado (si contiene info sensible)

---

## 🎓 Recursos Adicionales

- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [GitHub Docs](https://docs.github.com)
- [Learn Git Branching (Interactivo)](https://learngitbranching.js.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## ✨ Siguiente Paso

Después de subir a GitHub, puedes:

1. **Agregar un badge** de build status al README
2. **Configurar GitHub Actions** para CI/CD
3. **Proteger la rama main** (Settings → Branches → Add rule)
4. **Invitar colaboradores** (Settings → Collaborators)
5. **Configurar Issues y Projects** para gestión

---

<div align="center">

**🎉 ¡Felicidades! Tu proyecto ya está en GitHub 🎉**

Ahora puedes compartirlo en tu portfolio

</div>

